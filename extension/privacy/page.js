(function (root) {
  'use strict';

  // Inject in the isolated world, top frame only, on an explicit worker capture action.
  // This adapter has no vault, screenshot, fill, storage or provider interface.
  const LIMITS = Object.freeze({ candidates: 20, examined: 1000, metadata: 1024, labels: 8, lifetime: 120000 });
  const VALUE_LIMITS = Object.freeze({ 'applicant name': 200, 'contact email': 254, 'contact phone': 60, 'postal address': 1000 });
  const AUTOCOMPLETE = Object.freeze({ name: 'applicant name', email: 'contact email', tel: 'contact phone', 'street-address': 'postal address' });
  const LABELS = Object.freeze({
    name: 'applicant name', 'full name': 'applicant name', 'applicant name': 'applicant name',
    email: 'contact email', 'email address': 'contact email', 'contact email': 'contact email',
    phone: 'contact phone', telephone: 'contact phone', 'phone number': 'contact phone', 'contact phone': 'contact phone',
    address: 'postal address', 'street address': 'postal address', 'postal address': 'postal address'
  });
  const ERRORS = Object.freeze({ invalid: 'PRIVACY_INVALID_REQUEST', stale: 'PRIVACY_STALE', unavailable: 'PRIVACY_UNAVAILABLE', value: 'PRIVACY_VALUE_REJECTED' });
  const TYPES = new Set(['PRIVACY_INSPECT', 'PRIVACY_READ', 'PRIVACY_CHECK', 'PRIVACY_RESET']);
  const ATTRIBUTES = ['type', 'autocomplete', 'name', 'id', 'aria-label', 'placeholder', 'title', 'aria-labelledby', 'aria-describedby', 'role', 'inputmode', 'form'];
  const normalize = text => text.trim().replace(/\s+/g, ' ').toLowerCase();
  const lookup = (registry, key) => Object.hasOwn(registry, key) ? registry[key] : null;

  function isSensitive(parts) {
    return parts.some(part => {
      const text = part.normalize('NFKC').toLowerCase();
      const compact = text.replace(/[^\p{L}\p{N}]/gu, '');
      // Deliberately conservative substring matching, including camelCase/concatenated IDs.
      return /password|passwd|passphrase|credential|otp|captcha|uan|aadhaar|aadhar|adhar|pan|passport|government|nationalid|ssn|socialsecurity|bank|iban|ifsc|swift|routing|account|acct|member|claim|birth|dob|date|card|credit|debit|payment|cvv|cvc|csc|pin|login|signin|username|auth|token|cookie|session|secret|apikey|recovery|security|verification|onetime|ccnumber|ccname|ccexp|cccsc|health|medical|insurance/.test(compact) ||
        /आधार|पासवर्ड|ओटीपी|बैंक|यू\s*ए\s*एन|यूनिवर्सल|खाता/.test(text);
    });
  }

  // Inputs are bounded non-value metadata only. Unknown or conflicting evidence denies.
  function classify(metadata) {
    if (!metadata || !Array.isArray(metadata.labels)) return null;
    const parts = [...Object.values(metadata.attributes), ...metadata.labels, ...(metadata.formMetadata || [])];
    if (parts.some(part => typeof part !== 'string' || part.length > LIMITS.metadata) || isSensitive(parts)) return null;
    const attrs = metadata.attributes;
    if (attrs['aria-labelledby'] || attrs['aria-describedby'] || attrs.role) return null;
    const autocomplete = normalize(attrs.autocomplete || '');
    const autoLabel = lookup(AUTOCOMPLETE, autocomplete);
    if (autocomplete && !autoLabel) return null; // No token lists, suffix matching or "off" fallback.
    const evidence = [...metadata.labels, attrs['aria-label'], attrs.name, attrs.id].filter(Boolean)
      .map(normalize).map(text => lookup(LABELS, text)).filter(Boolean);
    if (autoLabel) evidence.push(autoLabel);
    if (!evidence.length || evidence.some(label => label !== evidence[0])) return null;
    if (metadata.type === 'email' && evidence[0] !== 'contact email') return null;
    if (metadata.type === 'tel' && evidence[0] !== 'contact phone') return null;
    return evidence[0];
  }

  function validSender(sender, extensionId) {
    // An extension ID alone cannot distinguish the worker from a popup/options page.
    return Boolean(sender && typeof extensionId === 'string' && extensionId && sender.id === extensionId &&
      sender.tab === undefined && sender.url === `chrome-extension://${extensionId}/background.js` &&
      (sender.origin === undefined || sender.origin === `chrome-extension://${extensionId}`));
  }

  function createController(env) {
    const document = env.document;
    const seed = Array.from(env.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    const getters = {
      input: Object.getOwnPropertyDescriptor(env.HTMLInputElement.prototype, 'value').get,
      textarea: Object.getOwnPropertyDescriptor(env.HTMLTextAreaElement.prototype, 'value').get
    };
    let revision = 0;
    let generation = `${seed}-${revision}`;
    let state = null;
    let observer = null;
    let timer = null;
    let removers = [];
    const fail = code => { throw new Error(code); };
    const attr = (node, key) => {
      const value = node.getAttribute(key) || '';
      if (value.length > LIMITS.metadata) fail(ERRORS.unavailable);
      return value;
    };
    const nextGeneration = () => { generation = `${seed}-${++revision}`; };

    function notify() {
      try {
        const pending = env.chrome.runtime.sendMessage({ type: 'PRIVACY_INVALIDATED' }, () => { void env.chrome.runtime.lastError; });
        pending?.catch?.(() => {});
      } catch (_) { /* Losing the worker never retains or restores the session. */ }
    }

    function cleanup() {
      observer?.disconnect();
      observer = null;
      if (timer !== null) env.clearTimeout(timer);
      timer = null;
      for (const remove of removers) remove();
      removers = [];
      state?.fields.clear();
      state = null;
    }

    function invalidate() {
      const hadState = state !== null;
      cleanup();
      nextGeneration();
      if (hadState) notify();
    }

    function geometry() {
      const values = [env.innerWidth, env.innerHeight, env.devicePixelRatio, env.scrollX, env.scrollY];
      if (env.visualViewport) values.push(env.visualViewport.width, env.visualViewport.height, env.visualViewport.scale,
        env.visualViewport.offsetLeft, env.visualViewport.offsetTop);
      if (values.some(value => !Number.isFinite(value)) || values[0] <= 0 || values[1] <= 0 || values[2] <= 0) fail(ERRORS.unavailable);
      return JSON.stringify(values);
    }

    function pageUrl() {
      if (env.top !== env || document !== env.document || !document.documentElement || !/^https?:$/.test(env.location.protocol)) fail(ERRORS.unavailable);
      return env.location.href; // Local navigation binding only; never returned or logged.
    }

    function listen(target, type) {
      target.addEventListener(type, invalidate, true);
      removers.push(() => target.removeEventListener(type, invalidate, true));
    }

    function monitor() {
      observer = new env.MutationObserver(records => { if (records.length) invalidate(); });
      observer.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
      for (const type of ['pageshow', 'pagehide', 'scroll', 'resize', 'input', 'change', 'popstate', 'hashchange']) listen(env, type);
      if (env.visualViewport) for (const type of ['scroll', 'resize']) listen(env.visualViewport, type);
      if (env.navigation) for (const type of ['navigate', 'currententrychange']) listen(env.navigation, type);
      // One absolute cleanup timer: never polls/reads a page or renews a request.
      timer = env.setTimeout(invalidate, LIMITS.lifetime);
    }

    function current(expected) {
      if (observer?.takeRecords().length) invalidate(); // Drain mutations even before their callback runs.
      if (state && (env.performance.now() >= state.deadline || env.performance.now() < state.started ||
          pageUrl() !== state.url || geometry() !== state.geometry)) invalidate();
      return Boolean(state && expected === generation);
    }

    function visible(element) {
      const rect = element.getBoundingClientRect();
      if (!element.getClientRects().length || ![rect.left, rect.top, rect.right, rect.bottom, rect.width, rect.height].every(Number.isFinite) ||
          rect.width <= 0 || rect.height <= 0 || rect.right <= 0 || rect.bottom <= 0 || rect.left >= env.innerWidth || rect.top >= env.innerHeight) return false;
      let depth = 0;
      for (let node = element; node; node = node.parentElement) {
        if (++depth > 128 || node.hidden || node.inert || node.hasAttribute('hidden') || node.hasAttribute('inert') ||
            ['aria-hidden', 'aria-disabled', 'aria-readonly'].some(key => attr(node, key).toLowerCase() === 'true')) return false;
        const style = env.getComputedStyle(node);
        if (style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility) || style.contentVisibility === 'hidden' || Number(style.opacity) === 0) return false;
      }
      return true;
    }

    function plainLabel(label, element) {
      // Never textContent on a subtree: a wrapping label can contain a textarea's
      // initial private value, options, hidden text or unrelated nested controls.
      let text = '';
      for (const node of label.childNodes) {
        if (node === element || node.nodeType === 8) continue;
        if (node.nodeType !== 3) fail(ERRORS.unavailable);
        text += node.nodeValue;
        if (text.length > LIMITS.metadata) fail(ERRORS.unavailable);
      }
      return text;
    }

    async function describe(element) {
      const tag = element.localName;
      if (!(tag === 'input' && element instanceof env.HTMLInputElement) && !(tag === 'textarea' && element instanceof env.HTMLTextAreaElement)) return null;
      if (element.ownerDocument !== document || !element.isConnected || element.getRootNode() !== document ||
          element.namespaceURI !== 'http://www.w3.org/1999/xhtml') return null;
      const type = tag === 'textarea' ? 'textarea' : element.type;
      if (!['text', 'email', 'tel', 'textarea'].includes(type) || element.disabled || element.matches(':disabled') || element.readOnly ||
          element.hasAttribute('readonly') || element.isContentEditable || !visible(element)) return null;
      const attributes = {};
      for (const key of ATTRIBUTES) attributes[key] = attr(element, key);
      const labels = [];
      if (element.labels.length > LIMITS.labels) return null;
      for (const label of element.labels) labels.push(plainLabel(label, element));
      const form = element.form;
      const formMetadata = form ? ['id', 'name', 'autocomplete', 'aria-label'].map(key => attr(form, key)) : [];
      const metadata = { tag, type, attributes, labels, formMetadata };
      const label = classify(metadata);
      if (!label) return null;
      // Only a non-value digest and exact node references survive inspection.
      const bytes = new env.TextEncoder().encode(JSON.stringify(metadata));
      const digest = await env.crypto.subtle.digest('SHA-256', bytes);
      const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      return { element, form, label, fingerprint };
    }

    async function validateBindings(expected) {
      if (!current(expected)) return false;
      const active = state;
      for (const record of active.fields.values()) {
        const live = await describe(record.element);
        if (!current(expected)) return false;
        if (!live || live.element !== record.element || live.form !== record.form || live.label !== record.label || live.fingerprint !== record.fingerprint) {
          invalidate();
          return false;
        }
      }
      return current(expected);
    }

    async function inspect() {
      invalidate(); // Superseding inspection revokes any previous session.
      const started = env.performance.now();
      state = { fields: new Map(), started, deadline: started + LIMITS.lifetime, url: pageUrl(), geometry: geometry(), read: false };
      const expected = generation;
      const active = state;
      monitor();
      const candidates = [];
      let examined = 0;
      for (const element of document.querySelectorAll('input, textarea')) {
        if (++examined > LIMITS.examined || candidates.length === LIMITS.candidates) break;
        let record;
        try { record = await describe(element); } catch (_) { record = null; }
        if (!current(expected)) fail(ERRORS.stale);
        if (!record) continue;
        const id = `field-${candidates.length + 1}`;
        active.fields.set(id, record);
        candidates.push({ id, label: record.label });
      }
      if (!await validateBindings(expected)) fail(ERRORS.stale);
      return { generation: expected, candidates, cropLimits: { width: env.innerWidth, height: env.innerHeight, dpr: env.devicePixelRatio }, policy: 'opaque-only' };
    }

    async function read(message) {
      if (!current(message.generation) || state.read) fail(ERRORS.stale);
      state.read = true; // Every authorized read attempt is single-use, including failure.
      if (!Array.isArray(message.ids) || message.ids.length > LIMITS.candidates ||
          message.ids.some(id => typeof id !== 'string' || !state.fields.has(id)) || new Set(message.ids).size !== message.ids.length) fail(ERRORS.invalid);
      if (!await validateBindings(message.generation)) fail(ERRORS.stale);
      const selected = message.ids.map(id => ({ id, record: state.fields.get(id) }));
      const result = [];
      for (const { id, record } of selected) {
        if (!current(message.generation)) fail(ERRORS.stale);
        // Native getter avoids a page-defined own accessor; values exist only in
        // this response, never the map, fingerprint, observer or future CHECK.
        const value = getters[record.element.localName].call(record.element);
        const limit = VALUE_LIMITS[record.label];
        if (typeof value !== 'string' || value.length > 2 * limit) fail(ERRORS.value);
        let count = 0;
        for (const character of value) { if (++count > limit) fail(ERRORS.value); }
        result.push({ slot: id, label: record.label, value });
      }
      if (!await validateBindings(message.generation)) fail(ERRORS.stale);
      return result;
    }

    async function handle(message) {
      try {
        if (!message || typeof message !== 'object' || Array.isArray(message) || !TYPES.has(message.type)) fail(ERRORS.invalid);
        const keys = message.type === 'PRIVACY_READ' ? ['type', 'generation', 'ids'] : message.type === 'PRIVACY_CHECK' ? ['type', 'generation'] : ['type'];
        if (Object.keys(message).length !== keys.length || keys.some(key => !Object.hasOwn(message, key)) ||
            (keys.includes('generation') && (typeof message.generation !== 'string' || message.generation.length > 96))) fail(ERRORS.invalid);
        if (message.type === 'PRIVACY_INSPECT') return await inspect();
        if (message.type === 'PRIVACY_READ') return await read(message);
        if (message.type === 'PRIVACY_CHECK') return { valid: await validateBindings(message.generation), generation };
        invalidate();
        return { reset: true };
      } catch (error) {
        invalidate();
        return { error: Object.values(ERRORS).includes(error?.message) ? error.message : ERRORS.unavailable };
      }
    }
    return Object.freeze({ handle });
  }

  const api = Object.freeze({ LIMITS, VALUE_LIMITS, ERRORS, classify, isSensitive, validSender, createController });
  if (typeof module === 'object' && module.exports && !root.document) { module.exports = api; return; }
  if (!root.document || root.top !== root || !root.chrome?.runtime?.onMessage) return;
  const guard = '__saralSahayakPrivacyPageV1__';
  if (root[guard]) return;
  const controller = createController(root);
  Object.defineProperty(root, guard, { value: true, writable: false, configurable: false });
  // No DOM scan/observer/timer until the trusted worker explicitly inspects.
  root.chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!validSender(sender, root.chrome.runtime.id) || !TYPES.has(message?.type)) return false;
    controller.handle(message).then(sendResponse);
    return true;
  });
})(globalThis);
