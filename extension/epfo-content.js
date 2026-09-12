(() => {
  'use strict';

  // Inject in Chrome's ISOLATED world only, on the worker's user-click path.
  // Registration does not read the page. No page events, storage or transport.
  const runtime = globalThis.chrome?.runtime;
  const GUARD = '__saralSahayakEpfoDetectorV1__';
  if (!runtime?.id || !runtime.onMessage || globalThis[GUARD] || window.top !== window) return;

  const LIMITS = Object.freeze({ nodes: 1500, text: 1000, selection: 8000, candidates: 8, milliseconds: 250 });
  const TARGETS = '[role="alert"],td,th,dt,label,p,li,div,span';
  const EXCLUDED = new Set([
    'script', 'style', 'noscript', 'iframe', 'template', 'object', 'embed',
    'input', 'textarea', 'select', 'option', 'button'
  ]);
  const BLOCKS = new Set(['div', 'p', 'li', 'dt', 'dd', 'tr', 'td', 'th']);
  const LABEL = /^(?:rejection\s+(?:remarks?|reasons?)|reasons?\s+for\s+rejection|epfo\s+rejection(?:\s+(?:remarks?|reasons?))?)\b/i;
  const GENERIC_LABEL = /^(?:remarks?|reasons?)\b/i;
  const REJECTION = /\b(?:rejection\s+(?:remarks?|reasons?)|reasons?\s+for\s+rejection|claim\s+(?:is\s+|was\s+)?rejected|rejected\s+due\s+to|epfo\s+rejection|claim\s+status\s*[:：\-–—]?\s*rejected)\b/i;
  const CONTEXT = /\b(?:epfo|rejection|rejected)\b/i;
  const REVIEW = 'Review the candidate before Analyze and remove personal information, including Aadhaar, UAN, PAN, bank details and credentials. Detection is not policy analysis or identifier redaction.';
  const FALLBACK = 'No safe rejection remark was found. Select only the visible rejection remark and detect again, or paste it into the editable preview.';

  function validSender(sender) {
    if (!sender || sender.id !== runtime.id || sender.tab !== undefined) return false;
    // Worker senders may omit these fields. Validate both when supplied;
    // URL.origin is not reliable for the chrome-extension scheme.
    for (const key of ['url', 'origin']) {
      if (sender[key] === undefined) continue;
      if (typeof sender[key] !== 'string' || !sender[key]) return false;
      try {
        const url = new URL(sender[key]);
        if (url.protocol !== 'chrome-extension:' || url.hostname !== runtime.id ||
            url.port || url.username || url.password) return false;
        if (key === 'origin' && ((url.pathname && url.pathname !== '/') || url.search || url.hash)) return false;
      } catch { return false; }
    }
    return true;
  }

  function hasIdentifier(text) {
    // Reject the entire candidate, never silently redact or rewrite policy text.
    // Labels alone (e.g. "Aadhaar mismatch") remain useful rejection evidence.
    return /\b\d(?:[ \t-]?\d){9,}\b/.test(text) ||
      /\b[A-Z]{5}\d{4}[A-Z]\b/i.test(text) ||
      /\b[A-Z]{4}0[A-Z0-9]{6}\b/i.test(text) ||
      /\b(?:aadhaar|aadhar|uan|pan|bank\s+account|account\s*(?:no\.?|number)|claim\s*(?:id|number))\b[^\n\r]{0,30}\d(?:[ \t-]?\d){5,}/i.test(text) ||
      /\b(?:otp|password|passcode|pin|api\s*key|access\s*token)\s*[:=]\s*\S+/i.test(text);
  }

  // Synchronous, request-local capture; the message listener below keeps the
  // response channel open without retaining any captured text between requests.
  function detect() {
    const candidates = [];
    const warnings = [];
    const seen = new Set();
    const visibility = new WeakMap();
    const started = performance.now();
    const exhausted = {};
    const warn = message => { if (!warnings.includes(message)) warnings.push(message); };
    const deadline = () => { if (performance.now() - started > LIMITS.milliseconds) throw exhausted; };

    function allowed(element, depth = 0) {
      deadline();
      if (!element || depth > 64 || element.ownerDocument !== document || !element.isConnected) return false;
      if (visibility.has(element)) return visibility.get(element);
      const role = element.getAttribute('role');
      let safe = element.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
        !EXCLUDED.has(element.localName) && !element.hidden && !element.inert &&
        element.getAttribute('aria-hidden') !== 'true' && !element.isContentEditable &&
        !['textbox', 'searchbox', 'combobox', 'spinbutton'].includes(role);
      if (safe) {
        const style = getComputedStyle(element);
        safe = style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse' &&
          style.contentVisibility !== 'hidden' && Number(style.opacity) !== 0;
      }
      if (safe && element.parentElement) safe = allowed(element.parentElement, depth + 1);
      visibility.set(element, safe);
      return safe;
    }

    function visible(element) {
      return allowed(element) && element.getClientRects().length > 0;
    }

    function add(text, source, limit = LIMITS.text) {
      text = text.trim();
      if (!text || text.length > limit || !/\p{L}/u.test(text)) return;
      if (/^(?:remarks?|reasons?|rejection\s+(?:remarks?|reasons?)|reasons?\s+for\s+rejection|claim\s+(?:id|number|status)|aadhaar|aadhar|uan|pan|bank\s+(?:details|account))\s*[:：\-–—]?\s*$/i.test(text)) return;
      if (hasIdentifier(text)) {
        warn('A candidate containing possible identifiers or credentials was skipped, not redacted. Select or paste only the rejection wording without personal information.');
        return;
      }
      if (seen.has(text)) return;
      seen.add(text);
      candidates.push({ text, source });
    }

    // Read only small visible static containers. Never use body.innerText,
    // subtree textContent, form values, hidden text, attributes or URL metadata.
    function smallText(element, row = false) {
      if (!element || element === document.body || element === document.documentElement || !visible(element)) return null;
      let text = '';
      let visited = 0;
      let failed = false;
      const append = value => {
        if (text.length + value.length > LIMITS.text) failed = true;
        else text += value;
      };
      function walk(node, depth) {
        deadline();
        if (failed || ++visited > 64 || depth > 6) { failed = true; return; }
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.length > LIMITS.text - text.length) failed = true;
          else append(node.data);
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE || !allowed(node)) return;
        // A wrapper around a table/list/form is not itself a remark. Row text
        // is allowed only for bounded context checks, never as returned data.
        if ((!row && ['table', 'thead', 'tbody', 'tfoot', 'tr'].includes(node.localName)) ||
            ['form', 'fieldset', 'dl', 'ul', 'ol'].includes(node.localName)) {
          failed = true;
          return;
        }
        if (node.childElementCount > (row && node === element ? 16 : 8) || node.childNodes.length > 32) {
          failed = true;
          return;
        }
        if (node.localName === 'br') { append('\n'); return; }
        const block = node !== element && BLOCKS.has(node.localName);
        if (block && text && !/\s$/.test(text)) append('\n');
        for (let child = node.firstChild; child && !failed; child = child.nextSibling) walk(child, depth + 1);
        if (block && text && !/\s$/.test(text)) append('\n');
      }
      walk(element, 0);
      return failed ? null : text.trim();
    }

    function selectedText() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
      if (selection.rangeCount !== 1) {
        warn('Select one contiguous rejection remark, not multiple ranges.');
        return null;
      }
      const range = selection.getRangeAt(0);
      const root = range.commonAncestorContainer;
      if (root.getRootNode() !== document || !range.getClientRects().length) return null;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL);
      let node = root;
      let visited = 0;
      let length = 0;
      // Preflight before toString: an enormous or hidden selection must not
      // become an unbounded page dump. No input/textarea selection is accessed.
      do {
        deadline();
        if (++visited > LIMITS.nodes) {
          warn('The selection spans too many nodes. Select a smaller rejection remark.');
          return null;
        }
        if (!range.intersectsNode(node)) continue;
        const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        if (!element || !allowed(element)) {
          warn('The selection includes hidden, editable or unsupported content and was skipped. Select visible static rejection text only.');
          return null;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          const start = node === range.startContainer ? range.startOffset : 0;
          const end = node === range.endContainer ? range.endOffset : node.length;
          length += Math.max(0, end - start);
          if (length > LIMITS.selection) {
            warn('Selected text exceeds 8,000 characters. Select a shorter remark; nothing was truncated.');
            return null;
          }
        }
      } while ((node = walker.nextNode()));
      const text = range.toString().trim();
      if (text.length > LIMITS.selection) {
        warn('Selected text exceeds 8,000 characters. Select a shorter remark; nothing was truncated.');
        return null;
      }
      return text || null;
    }

    function contextual(element) {
      const row = element.closest('tr');
      // Generic "remarks"/"reason" needs local evidence, never page-wide text.
      const context = smallText(row || element.parentElement, Boolean(row));
      return context !== null && CONTEXT.test(context);
    }

    function labelParts(text, element) {
      const match = text.match(LABEL) || (GENERIC_LABEL.test(text) && contextual(element) ? text.match(GENERIC_LABEL) : null);
      if (!match) return null;
      return { rest: text.slice(match[0].length).replace(/^\s*[:：\-–—]?\s*/, '') };
    }

    function adjacentRemark(element) {
      const cell = element.closest('td,th');
      if (cell) {
        // Only a label-only cell's adjacent value in this very row; never
        // concatenate a claim row or infer values from another table row.
        const labelText = smallText(cell);
        if (labelText === null || labelParts(labelText, cell)?.rest !== '') return null;
        const next = cell.nextElementSibling;
        return next?.localName === 'td' && next.parentElement === cell.parentElement ? next : null;
      }
      if (element.localName === 'dt') {
        const next = element.nextElementSibling;
        return next?.localName === 'dd' ? next : null;
      }
      if (element.localName === 'label' && element.hasAttribute('for')) {
        warn('Form field values, including read-only rejection fields, are not captured. Paste the remark into the preview if it is only shown in a form control.');
        return null;
      }
      // Small label/value layouts, not arbitrary descendants of a large panel.
      const parent = element.parentElement;
      if (!parent || parent === document.body || parent.childElementCount > 4 || smallText(parent) === null) return null;
      const next = element.nextElementSibling;
      return next && ['div', 'span', 'p'].includes(next.localName) ? next : null;
    }

    try {
      if (!/^https?:$/.test(location.protocol) || !document.body) {
        warn('Only a loaded top-level HTTP(S) page supports rejection detection.');
      } else {
        const selected = selectedText();
        if (selected) add(selected, 'Selected text (user reviewed)', LIMITS.selection);
        if (!candidates.length) {
          let visited = 0;
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
            acceptNode(element) {
              deadline();
              if (++visited > LIMITS.nodes) throw exhausted;
              return allowed(element) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
          });
          let element;
          while (candidates.length < LIMITS.candidates && (element = walker.nextNode())) {
            if (!element.matches(TARGETS)) continue;
            const text = smallText(element);
            if (!text) continue;
            const label = labelParts(text, element);
            if (label) {
              if (label.rest) add(label.rest, 'Detected rejection remark');
              else {
                const value = adjacentRemark(element);
                const remark = smallText(value);
                if (remark) {
                  const nestedLabel = labelParts(remark, value);
                  // Another label is not a rejection reason.
                  if (!nestedLabel || nestedLabel.rest) add(nestedLabel ? nestedLabel.rest : remark, 'Detected labelled rejection remark');
                }
              }
            } else if (REJECTION.test(text)) {
              add(text, 'Detected rejection text');
              if (/^(?:claim\s+(?:is\s+|was\s+)?rejected|claim\s+status\s*[:：\-–—]?\s*rejected)[.!\s]*$/i.test(text)) {
                warn('A rejected status alone does not explain the reason. Select the detailed remark if available.');
              }
            }
          }
          if (candidates.length === LIMITS.candidates) warn('Showing at most eight distinct candidates. Other page content was not scanned; select the intended remark if needed.');
        }
      }
    } catch (error) {
      warn(error === exhausted ? 'Detection reached its 1,500-node or time limit. Results may be incomplete; select the remark manually if needed.' :
        'Some page content could not be read safely. Review any candidates or select the remark manually.');
    }
    if (!candidates.length) warn(FALLBACK);
    if (candidates.length > 1) warn('Multiple possible rejection texts were found. Choose and review the intended candidate; nothing was automatically analyzed.');
    warn(REVIEW);
    return { candidates, warnings };
  }

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!validSender(sender) || !message || message.type !== 'SS_EPFO_DETECT') return false;
    Promise.resolve().then(detect).then(sendResponse, () => {
      // Never forward exceptions that might contain page text or URLs.
      sendResponse({ candidates: [], warnings: ['Rejection detection failed safely.', FALLBACK, REVIEW] });
    });
    return true;
  });
  Object.defineProperty(globalThis, GUARD, { value: true, writable: false, configurable: false });
})();
