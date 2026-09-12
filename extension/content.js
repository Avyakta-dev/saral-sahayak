(function (root) {
  'use strict';

  const LIMITS = Object.freeze({ fields: 80, options: 100, value: 2000, metadata: 1024, file: 2 * 1024 * 1024 });
  const SAFE_INPUTS = new Set(['text', 'email', 'tel', 'url', 'search', 'file']);
  const NOTICE = 'Only ordinary visible top-level HTML fields are supported. Frames, shadow roots and custom widgets are not read. Sensitive and unsupported fields are skipped.';
  const FILL_NOTICE = 'Sites may autosave or upload when fields change. Events are synthetic, not trusted; review the page manually. Nothing is submitted by this script, and changes are not undone or retried.';
  const MIME_EXTENSIONS = Object.freeze({
    'application/pdf': ['pdf'], 'image/png': ['png'], 'image/jpeg': ['jpg', 'jpeg'],
    'image/webp': ['webp'], 'text/plain': ['txt'], 'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
  });

  function bounded(value, limit = LIMITS.metadata) {
    const text = String(value == null ? '' : value);
    if (text.length > limit) throw new Error('Limit exceeded');
    return text;
  }

  function display(value, limit) { return value.replace(/\s+/g, ' ').trim().slice(0, limit); }

  function isSensitive(parts) {
    const text = parts.join(' ').normalize('NFKC').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    const words = text.replace(/[^\p{L}\p{N}]+/gu, ' ');
    const compact = words.replace(/\s/g, '');
    return /\b(password|passwd|passphrase|credential|otp|captcha|recaptcha|hcaptcha|cvv|cvc|csc|ssn|uan|aadhaar|aadhar|adhar|bank|banking|iban|ifsc|swift|routing|payment|credit|debit|card|pin|username|login|signin|consent|terms|agree|agreement|pan)\b/.test(words) ||
      /password|passwd|credential|captcha|otp|cvv|cvc|ssn|bank|payment|onetimecode|onetimepassword|securitycode|verificationcode|authcode|authenticator|accesstoken|secretkey|apikey|socialsecurity|aadhaar|aadhar|universalaccountnumber|accountnumber|accountno|acctno|creditcard|debitcard|cardnumber|cardholder|cardexpiry|cardexpiration|ccnumber|ccname|ccexp|cccsc|transactionamount|transactioncurrency|deleteaccount|accountdelete|closeaccount|accountclose|accountclosure|removeaccount|deactivateaccount|acceptterms|termsofservice|termsandconditions|acceptpolicy|privacypolicy|agreeto/.test(compact) ||
      /^(?:epf|member)?uan(?:number|no|id)?$/.test(compact) ||
      /आधार|पासवर्ड|ओटीपी|बैंक|यू\s*ए\s*एन|यूनिवर्सल\s*अकाउंट\s*नंबर|सार्वभौमिक\s*खाता\s*संख्या/.test(text);
  }

  function validSender(sender, extensionId) {
    if (!sender || !extensionId || sender.id !== extensionId || sender.tab) return false;
    for (const key of ['url', 'origin']) {
      if (sender[key] === undefined) continue; // Some service-worker senders have neither.
      if (typeof sender[key] !== 'string' || !sender[key]) return false;
      try {
        const url = new URL(sender[key]);
        if (url.protocol !== 'chrome-extension:' || url.hostname !== extensionId || url.port || url.username || url.password) return false;
        if (key === 'origin' && ((url.pathname && url.pathname !== '/') || url.search || url.hash)) return false;
      } catch (_) { return false; }
    }
    return true;
  }

  function cssPath(element, document, css) {
    if (!css || typeof css.escape !== 'function') throw new Error('CSS escaping unavailable');
    const id = bounded(element.id);
    if (id) {
      const selector = '#' + css.escape(id);
      if (document.querySelectorAll(selector).length === 1 && document.querySelector(selector) === element) return selector;
    }
    const parts = [];
    let node = element;
    while (node && node.nodeType === 1) {
      if (parts.length >= 64) throw new Error('Path too deep');
      let position = 1;
      for (let sibling = node.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        if (sibling.localName === node.localName && sibling.namespaceURI === node.namespaceURI) position += 1;
      }
      parts.unshift(css.escape(node.localName) + ':nth-of-type(' + position + ')');
      node = node.parentElement;
    }
    const selector = bounded(parts.join(' > '), 8192);
    if (!selector || document.querySelectorAll(selector).length !== 1 || document.querySelector(selector) !== element) throw new Error('No unique selector');
    return selector;
  }

  function fileMatchesAccept(file, accept) {
    if (!accept.trim()) return true;
    const tokens = accept.toLowerCase().split(',').map(part => part.trim());
    if (tokens.length > 30 || tokens.some(part => !/^(\.[a-z0-9]+|[a-z0-9!#$&^_.+-]+\/(?:[a-z0-9!#$&^_.+-]+|\*))$/.test(part))) return false;
    return tokens.some(part => part.startsWith('.') ? file.name.toLowerCase().endsWith(part) :
      part.endsWith('/*') ? file.type.startsWith(part.slice(0, -1)) : file.type === part);
  }

  function decodeFile(payload, env) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid attachment');
    const { name, type, size, data } = payload;
    if (typeof name !== 'string' || !name || name.length > 180 || name !== name.trim() || /^[.]/.test(name) || /[\\/:\x00-\x1f\x7f]/.test(name)) throw new Error('Invalid attachment');
    const extensions = MIME_EXTENSIONS[type];
    if (typeof type !== 'string' || !Object.hasOwn(MIME_EXTENSIONS, type) || !extensions.includes(name.split('.').pop().toLowerCase())) throw new Error('Invalid attachment');
    if (!Number.isSafeInteger(size) || size <= 0 || size > LIMITS.file || typeof data !== 'string' || data.length !== 4 * Math.ceil(size / 3) ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) throw new Error('Invalid attachment');
    const binary = env.atob(data);
    if (binary.length !== size || env.btoa(binary) !== data) throw new Error('Invalid attachment');
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return new env.File([bytes], name, { type, lastModified: 0 });
  }

  function fileSignature(files) {
    if (files.length > 10) throw new Error('Too many attachments');
    return JSON.stringify(Array.from(files, file => [bounded(file.name, 2000), file.size, bounded(file.type), file.lastModified]));
  }

  function nativeSetter(env, tag, property) {
    const constructor = tag === 'textarea' ? env.HTMLTextAreaElement : tag === 'select' ? env.HTMLSelectElement : env.HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(constructor.prototype, property)?.set;
    if (typeof setter !== 'function') throw new Error('Native setter unavailable');
    return setter;
  }

  // Build the transfer during preflight, before any field has been changed.
  function attachmentTransfer(file, env) {
    const transfer = new env.DataTransfer();
    transfer.items.add(file);
    if (transfer.files.length !== 1 || fileSignature(transfer.files) !== fileSignature([file])) throw new Error('Attachment unavailable');
    return transfer;
  }

  function dispatchChanges(element, env) {
    element.dispatchEvent(new env.Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new env.Event('change', { bubbles: true, composed: true }));
  }

  function createController(env) {
    const document = env.document;
    let scanState = null;
    const setters = {
      input: nativeSetter(env, 'input', 'value'), textarea: nativeSetter(env, 'textarea', 'value'),
      select: nativeSetter(env, 'select', 'value'), files: nativeSetter(env, 'input', 'files')
    };
    const attr = (element, name) => bounded(element.getAttribute(name));
    const currentUrl = () => String(env.location.href);
    const supportedPage = () => env.top === env && /^https?:\/\//i.test(currentUrl());

    function visible(element) {
      if (!element.getClientRects().length) return false;
      let depth = 0;
      for (let node = element; node; node = node.parentElement) {
        if (++depth > 128 || node.hidden || node.inert || node.getAttribute('aria-hidden') === 'true' ||
            node.getAttribute('aria-disabled') === 'true' || node.getAttribute('aria-readonly') === 'true') return false;
        const style = env.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || style.contentVisibility === 'hidden' || style.opacity === '0') return false;
      }
      return true;
    }

    function describe(element, selector) {
      // Ineligible fields' values/files are never accessed.
      if (element.ownerDocument !== document || !element.isConnected || element.getRootNode() !== document ||
          element.namespaceURI !== 'http://www.w3.org/1999/xhtml' || element.disabled || element.matches(':disabled') ||
          element.readOnly || element.hasAttribute('readonly') || !visible(element)) return null;
      const tag = element.localName;
      const type = tag === 'textarea' ? 'textarea' : element.type;
      if (!(tag === 'input' && SAFE_INPUTS.has(type)) && !(tag === 'textarea') && !(tag === 'select' && type === 'select-one')) return null;
      const raw = {};
      for (const key of ['name', 'id', 'autocomplete', 'aria-label', 'aria-labelledby', 'placeholder', 'accept', 'pattern', 'minlength', 'maxlength', 'form', 'title', 'type', 'required', 'multiple', 'dir']) raw[key] = attr(element, key);
      const labels = [];
      if (element.labels && element.labels.length > 8) return null;
      for (const label of element.labels || []) labels.push(bounded(label.textContent));
      const references = raw['aria-labelledby'].trim().split(/\s+/).filter(Boolean);
      if (references.length > 8) return null;
      const ariaLabels = references.map(id => bounded(document.getElementById(id)?.textContent));
      const label = labels.join(' ').trim() || raw['aria-label'].trim() || ariaLabels.join(' ').trim() || raw.placeholder.trim() || raw.name || raw.id;
      const signals = [...Object.values(raw), ...labels, ...ariaLabels];
      if (isSensitive(signals)) return null;
      const options = [];
      const optionFingerprint = [];
      const optionElements = [];
      if (tag === 'select') {
        // Do not offer a partial choice set or fingerprint an unbounded list.
        if (element.options.length > LIMITS.options) return null;
        for (const option of element.options) {
          const value = bounded(option.value, LIMITS.value);
          const optionLabel = bounded(option.label);
          const disabled = Boolean(option.disabled || option.matches(':disabled') || (option.parentElement?.localName === 'optgroup' && option.parentElement.disabled));
          const hidden = Boolean(option.hidden || option.parentElement?.hidden);
          optionFingerprint.push([value, optionLabel, disabled, hidden]);
          optionElements.push(option);
          if (!disabled && !hidden) options.push({ value, label: display(optionLabel, 240) });
        }
      }
      const accept = bounded(raw.accept, 512);
      const maxLength = Number.isInteger(element.maxLength) && element.maxLength >= 0 ? element.maxLength : -1;
      const form = element.form || null;
      const formMetadata = form ? ['id', 'name', 'action', 'method', 'target', 'enctype'].map(key => attr(form, key)) : [];
      if (isSensitive(formMetadata)) return null;
      const value = type === 'file' ? '' : bounded(element.value, LIMITS.value);
      const files = type === 'file' ? Array.from(element.files || []) : [];
      const signature = fileSignature(files);
      const fingerprint = JSON.stringify([tag, type, raw, labels, ariaLabels, Boolean(element.required), maxLength, optionFingerprint, formMetadata]);
      return {
        field: { selector, label: display(label, 240), type, name: display(raw.name, 128), id: display(raw.id, 128), currentValue: value,
          required: Boolean(element.required), options, accept, maxLength },
        fingerprint, value, files, signature, form, optionElements, selectedIndex: tag === 'select' ? element.selectedIndex : null
      };
    }

    function scan() {
      scanState = null;
      const warnings = [NOTICE];
      const url = currentUrl();
      if (!supportedPage()) return { token: null, fields: [], warnings: [...warnings, 'Only top-level HTTP(S) pages can be scanned.'], url };
      const fields = [];
      const allowlist = new Map();
      let skipped = 0;
      for (const element of document.querySelectorAll('input, select, textarea')) {
        try {
          const snapshot = describe(element, '');
          if (!snapshot) { skipped += 1; continue; }
          if (fields.length === LIMITS.fields) {
            warnings.push('Only the first 80 eligible fields are included. Other fields were not captured.');
            break;
          }
          const selector = cssPath(element, document, env.CSS);
          snapshot.field.selector = selector;
          fields.push(snapshot.field);
          allowlist.set(selector, { element, snapshot });
        } catch (_) { skipped += 1; }
      }
      if (skipped) warnings.push('Some fields were skipped because they are sensitive, unsupported, unavailable or exceed safety limits (including 100 select options and 2,000 value characters).');
      const bytes = new Uint8Array(24);
      env.crypto.getRandomValues(bytes);
      const token = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
      scanState = { token, url, allowlist };
      return { token, fields, warnings, url };
    }

    function same(snapshot, live) {
      return live && snapshot.fingerprint === live.fingerprint && snapshot.value === live.value && snapshot.form === live.form &&
        snapshot.signature === live.signature && snapshot.selectedIndex === live.selectedIndex &&
        snapshot.files.length === live.files.length && snapshot.files.every((file, index) => file === live.files[index]) &&
        snapshot.optionElements.length === live.optionElements.length && snapshot.optionElements.every((option, index) => option === live.optionElements[index]);
    }

    function liveSnapshot(record, selector) {
      if (!record.element.isConnected || document.querySelector(selector) !== record.element || document.querySelectorAll(selector).length !== 1) return null;
      return describe(record.element, selector);
    }

    function validateValue(record, value) {
      if (typeof value !== 'string' || value.length > LIMITS.value) return false;
      const { field } = record.snapshot;
      if (field.required && !value) return false;
      if (field.type === 'file') return true; // File name, bytes and accept are checked together below.
      if (field.maxLength >= 0 && value.length > field.maxLength) return false;
      const minLength = record.element.minLength;
      if (value && Number.isInteger(minLength) && minLength >= 0 && value.length < minLength) return false;
      if (field.type === 'select-one') {
        const matches = Array.from(record.element.options).filter(option => option.value === value);
        return matches.length === 1 && field.options.some(option => option.value === value);
      }
      // Detached native controls validate format/pattern without invalid events on the page.
      const probe = document.createElement(record.element.localName);
      for (const key of ['type', 'required', 'pattern', 'minlength', 'maxlength', 'multiple']) {
        if (record.element.hasAttribute(key)) probe.setAttribute(key, record.element.getAttribute(key));
      }
      setters[record.element.localName].call(probe, value);
      return probe.value === value && probe.validity.valid;
    }

    function fill(message) {
      const state = scanState;
      scanState = null; // Every authorized attempt consumes approval, including failed preflight.
      const warnings = [FILL_NOTICE];
      const entries = Array.isArray(message.entries) ? message.entries.slice(0, LIMITS.fields) : [];
      const results = entries.map(entry => ({ selector: typeof entry?.selector === 'string' ? entry.selector.slice(0, 8192) : '', status: 'skipped', message: 'Not changed.' }));
      const refuse = reason => {
        warnings.push(reason);
        results.forEach(result => { result.message = 'No fields changed: preflight failed. Scan and review again.'; });
        return { results, warnings };
      };
      if (!state || message.token !== state.token || message.url !== state.url || currentUrl() !== state.url || !supportedPage()) return refuse('The scan is missing or stale. Scan and review again.');
      if (!Array.isArray(message.entries) || !entries.length || message.entries.length > LIMITS.fields) return refuse('The approved entries are invalid or exceed the 80-field limit.');
      const prepared = [];
      const seen = new Set();
      let fileCount = 0;
      try {
        // ALL entries, duplicate selectors, values and file bytes are checked before the first write.
        for (const entry of entries) {
          if (!entry || typeof entry.selector !== 'string' || entry.selector.length > 8192 || seen.has(entry.selector)) throw new Error('Invalid entry');
          seen.add(entry.selector);
          const record = state.allowlist.get(entry.selector);
          if (!record || !same(record.snapshot, liveSnapshot(record, entry.selector)) || !validateValue(record, entry.value)) throw new Error('Stale or invalid field');
          const item = { entry, record, transfer: null, expected: null };
          if (record.snapshot.field.type === 'file') {
            if (++fileCount > 1) throw new Error('Only one file target is supported');
            const file = decodeFile(message.file, env);
            if (entry.value !== file.name || !fileMatchesAccept(file, record.snapshot.field.accept)) throw new Error('Invalid attachment target');
            item.transfer = attachmentTransfer(file, env);
          }
          prepared.push(item);
        }
        if (message.file != null && !fileCount) throw new Error('Unapproved attachment');
      } catch (_) { return refuse('A field changed, an entry is invalid, or the attachment is unsupported. No fields were changed.'); }

      for (let index = 0; index < prepared.length; index += 1) {
        const item = prepared[index];
        const { record, entry } = item;
        const result = results[index];
        if (currentUrl() !== state.url || !supportedPage()) {
          result.message = 'Skipped because the page URL changed.';
          continue;
        }
        try {
          if (!same(record.snapshot, liveSnapshot(record, entry.selector))) {
            result.message = 'Skipped because the site changed this field after preflight.';
            continue;
          }
          if (item.transfer) setters.files.call(record.element, item.transfer.files);
          else setters[record.element.localName].call(record.element, entry.value);
          item.expected = describe(record.element, entry.selector);
          if (!item.expected || (item.transfer ? item.expected.signature !== fileSignature(item.transfer.files) : item.expected.value !== entry.value)) throw new Error('Value rejected');
          dispatchChanges(record.element, env);
          result.status = 'filled';
          result.message = 'Applied; review on the page. Later site changes cannot be guaranteed.';
        } catch (_) {
          result.status = 'failed';
          result.message = 'The site or browser rejected this change. Review the page; no undo or retry was attempted.';
        }
      }
      // A later field's handler can change an earlier field. Check the whole applied set again.
      prepared.forEach((item, index) => {
        if (results[index].status !== 'filled') return;
        try {
          if (currentUrl() !== state.url || !same(item.expected, liveSnapshot(item.record, item.entry.selector))) throw new Error('Site changed value');
        } catch (_) {
          results[index].status = 'failed';
          results[index].message = 'The site changed or rejected the applied field. Review the page; no undo or retry was attempted.';
        }
      });
      return { results, warnings };
    }

    function reset() { scanState = null; return { reset: true }; }
    return { scan, fill, reset };
  }

  const api = Object.freeze({ LIMITS, isSensitive, validSender, cssPath, fileMatchesAccept, decodeFile, attachmentTransfer, dispatchChanges, createController });
  if (typeof module === 'object' && module.exports && !root.document) { module.exports = api; return; }
  if (!root.document || !root.chrome?.runtime?.onMessage || root.top !== root) return;
  const guard = '__saralSahayakFormContentV1__';
  if (root[guard]) return;
  const controller = createController(root);
  Object.defineProperty(root, guard, { value: true, configurable: false, writable: false });
  root.addEventListener?.('pagehide', controller.reset);
  root.chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!validSender(sender, root.chrome.runtime.id) || !message || !['SS_SCAN', 'SS_FILL', 'SS_RESET'].includes(message.type)) return false;
    Promise.resolve().then(() => message.type === 'SS_SCAN' ? controller.scan() : message.type === 'SS_RESET' ? controller.reset() : controller.fill(message)).then(sendResponse, () => {
      // Never expose exception text, page content, file bytes or user data.
      sendResponse(message.type === 'SS_SCAN' ? { token: null, fields: [], warnings: ['The page could not be scanned safely.'], url: String(root.location.href) } :
        { results: [], warnings: ['The fill attempt failed. Review the page and scan again; no automatic retry was attempted.'] });
    });
    return true;
  });
})(globalThis);
