'use strict';

(() => {
  const TTL_MS = 120_000;
  let ui = Object.fromEntries([
    'status', 'expiry', 'inspect', 'fields', 'crop-form', 'crop-controls',
    'crop-x', 'crop-y', 'crop-width', 'crop-height', 'crop-limits', 'capture',
    'preview-section', 'preview-image', 'slots', 'review-check', 'confirm',
    'cancel', 'close',
  ].map((id) => [id, document.getElementById(id)]));
  let port = null;
  let state = 'connecting';
  let limits = null;
  let fields = [];
  let approvalTag = null;
  let imageReady = false;
  let deadline = 0;
  let timer = null;

  function end(message, notify = true) {
    if (state === 'ended') return;
    state = 'ended';
    clearInterval(timer);
    timer = null;
    deadline = 0;
    approvalTag = null;
    limits = null;
    imageReady = false;
    fields.length = 0;

    const connection = port;
    port = null;
    if (connection) {
      connection.onMessage.removeListener(onMessage);
      connection.onDisconnect.removeListener(onDisconnect);
      if (notify) {
        try { connection.postMessage({ type: 'cancel' }); } catch { /* Already closed. */ }
      }
      try { connection.disconnect(); } catch { /* Already closed. */ }
    }

    // Remove the raster source, form values, field nodes, and all session DOM.
    ui['preview-image'].onload = null;
    ui['preview-image'].onerror = null;
    ui['preview-image'].removeAttribute('src');
    ui['review-check'].checked = false;
    for (const input of document.querySelectorAll('input')) {
      input.value = '';
      input.checked = false;
      input.disabled = true;
    }
    ui = null;
    document.body.replaceChildren();
    const main = document.createElement('main');
    const title = document.createElement('h1');
    title.textContent = 'Local privacy session closed';
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.textContent = message;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.addEventListener('click', () => window.close());
    main.append(title, status, close);
    document.body.append(main);
    close.focus();
  }

  function alive() {
    if (state === 'ended') return false;
    if (deadline && performance.now() >= deadline) {
      end('The local session expired. All preview and field data have been cleared. No automatic restart.');
      return false;
    }
    return true;
  }

  function tick() {
    if (!alive()) return;
    const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
    ui.expiry.textContent = `${state === 'inspecting' || state === 'inspected' ? 'Inspection' : 'Preview'} expires in ${seconds} seconds. Activity does not extend this deadline.`;
  }

  function startDeadline() {
    deadline = performance.now() + TTL_MS;
    clearInterval(timer);
    timer = setInterval(tick, 250);
    tick();
  }

  function controls() {
    if (state === 'ended') return;
    const busy = ['connecting', 'inspecting', 'capturing', 'reviewing'].includes(state);
    ui.inspect.disabled = state !== 'ready';
    ui.fields.disabled = state !== 'inspected';
    ui['crop-controls'].disabled = state !== 'inspected';
    ui.capture.disabled = state !== 'inspected';
    ui['review-check'].disabled = state !== 'preview' || !imageReady;
    ui.confirm.disabled = state !== 'preview' || !imageReady || !ui['review-check'].checked;
    ui.cancel.disabled = false;
    ui['crop-form'].setAttribute('aria-busy', String(busy));
  }

  function send(message) {
    if (!alive()) return false;
    try {
      if (!port) throw new Error('No local port');
      port.postMessage(message);
      return true;
    } catch {
      end('The local worker is unavailable. All session data have been cleared.', false);
      return false;
    }
  }

  function updateCropBounds() {
    if (!limits || !ui) return;
    const x = ui['crop-x'].valueAsNumber;
    const y = ui['crop-y'].valueAsNumber;
    const physicalCap = Math.floor(2048 / limits.dpr);
    ui['crop-x'].max = String(limits.width - 1);
    ui['crop-y'].max = String(limits.height - 1);
    ui['crop-width'].max = String(Math.max(1, Math.min(physicalCap, limits.width - (Number.isInteger(x) ? x : 0))));
    ui['crop-height'].max = String(Math.max(1, Math.min(physicalCap, limits.height - (Number.isInteger(y) ? y : 0))));
    for (const name of ['x', 'y', 'width', 'height']) {
      const input = ui[`crop-${name}`];
      input.setCustomValidity(Number.isInteger(input.valueAsNumber) ? '' : 'Enter a whole number of CSS pixels.');
    }
  }

  function inspectResult(message) {
    const crop = message.cropLimits;
    if (!Array.isArray(message.candidates) || !crop ||
        !Number.isFinite(crop.width) || !Number.isFinite(crop.height) ||
        !Number.isFinite(crop.dpr) || crop.width < 1 || crop.height < 1 ||
        crop.dpr <= 0 || Math.floor(2048 / crop.dpr) < 1 ||
        message.candidates.some((item) => !item || typeof item.id !== 'string' ||
          !item.id || typeof item.label !== 'string') ||
        new Set(message.candidates.map((item) => item.id)).size !== message.candidates.length) {
      end('Invalid inspection metadata. The local session has been cleared.');
      return;
    }
    limits = { width: Math.floor(crop.width), height: Math.floor(crop.height), dpr: crop.dpr };
    ui.fields.replaceChildren();
    const legend = document.createElement('legend');
    legend.textContent = 'Fields to represent with placeholders (optional)';
    ui.fields.append(legend);
    for (const candidate of message.candidates) {
      const label = document.createElement('label');
      label.className = 'check-row';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = false;
      const text = document.createElement('span');
      text.textContent = candidate.label || 'Unlabelled field';
      label.append(checkbox, text);
      ui.fields.append(label);
      fields.push({ id: candidate.id, checkbox });
    }
    if (!fields.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No candidate fields. You may still preview an opaque crop.';
      ui.fields.append(empty);
    }
    ui['crop-x'].value = '0';
    ui['crop-y'].value = '0';
    ui['crop-width'].value = String(Math.min(limits.width, Math.floor(2048 / limits.dpr)));
    ui['crop-height'].value = String(Math.min(limits.height, Math.floor(2048 / limits.dpr)));
    ui['crop-limits'].textContent = `Viewport: ${limits.width} × ${limits.height} CSS pixels; device pixel ratio: ${limits.dpr}. Maximum crop side: ${Math.floor(2048 / limits.dpr)} CSS pixels, also bounded by the viewport.`;
    updateCropBounds();
    state = 'inspected';
    ui.status.textContent = 'Inspection complete. Select fields if wanted, check the crop, then explicitly Capture.';
    controls();
    tick();
  }

  function previewResult(message) {
    if (typeof message.preview !== 'string' || !/^data:image\/png;base64,/.test(message.preview) ||
        message.coverage !== 'fully-masked' || typeof message.approvalTag !== 'string' ||
        !message.approvalTag || !Number.isFinite(message.remainingMs) || message.remainingMs <= 0 ||
        !Array.isArray(message.slots) || message.slots.some((slot) => !slot ||
          typeof slot.label !== 'string' || typeof slot.filled !== 'boolean')) {
      end('Invalid or expired opaque preview. The local session has been cleared.');
      return;
    }
    // A worker response can shorten the capture deadline, never renew it.
    deadline = Math.min(deadline, performance.now() + message.remainingMs);
    if (!alive()) return;
    approvalTag = message.approvalTag;
    ui.slots.replaceChildren();
    for (const slot of message.slots) {
      const item = document.createElement('li');
      // Never display worker-provided masks, tokens, identifiers, or values.
      item.textContent = `${slot.label || 'Unlabelled field'} — Filled: ${slot.filled ? 'yes' : 'no'} — Mask: ***`;
      ui.slots.append(item);
    }
    ui['preview-section'].hidden = false;
    ui['review-check'].checked = false;
    imageReady = false;
    state = 'preview';
    ui['preview-image'].onload = () => {
      if (!alive() || state !== 'preview') return;
      imageReady = true;
      ui.status.textContent = 'Fully opaque local preview ready. Review it before confirming.';
      controls();
    };
    ui['preview-image'].onerror = () => end('The local PNG could not be displayed. All session data have been cleared.');
    ui.status.textContent = 'Loading the locally generated opaque preview…';
    ui['preview-image'].src = message.preview;
    controls();
    tick();
  }

  function onMessage(message) {
    if (!alive()) return;
    if (!message || typeof message.type !== 'string') {
      end('Invalid local worker response. The session has been cleared.');
      return;
    }
    if (message.type === 'expired') {
      end('The local session expired. All preview and field data have been cleared. No automatic restart.', false);
    } else if (message.type === 'ready' && state === 'connecting') {
      state = 'ready';
      ui.status.textContent = 'Local worker ready. Choose Inspect to request safe field metadata.';
      controls();
    } else if (message.type === 'inspected' && state === 'inspecting') {
      inspectResult(message);
    } else if (message.type === 'preview' && state === 'capturing') {
      previewResult(message);
    } else if (message.type === 'reviewed' && state === 'reviewing') {
      state = 'reviewed';
      approvalTag = null;
      ui.status.textContent = 'Local preview review confirmed. Nothing was transmitted, restored, or filled. The original expiry still applies.';
      controls();
    } else {
      // Do not surface arbitrary worker error text or attempt an automatic retry.
      end('The worker could not complete this local step. All session data have been cleared.');
    }
  }

  function onDisconnect() {
    // Read and discard Chrome's transport error; never log response contents.
    void chrome.runtime.lastError;
    end('The local worker disconnected. All preview and field data have been cleared. No automatic restart.', false);
  }

  ui.inspect.addEventListener('click', () => {
    if (!alive() || state !== 'ready') return;
    state = 'inspecting';
    ui.status.textContent = 'Inspecting safe field metadata locally…';
    controls();
    startDeadline();
    send({ type: 'inspect' });
  });

  for (const name of ['x', 'y', 'width', 'height']) {
    ui[`crop-${name}`].addEventListener('input', updateCropBounds);
  }

  ui['crop-form'].addEventListener('submit', (event) => {
    event.preventDefault();
    if (!alive() || state !== 'inspected') return;
    updateCropBounds();
    if (!ui['crop-form'].reportValidity()) return;
    const crop = Object.fromEntries(['x', 'y', 'width', 'height'].map((name) => [name, ui[`crop-${name}`].valueAsNumber]));
    const ids = fields.filter((field) => field.checkbox.checked).map((field) => field.id);
    state = 'capturing';
    ui.status.textContent = 'Generating an entirely opaque crop locally. No original screenshot is taken…';
    controls();
    // Keep the earlier inspection deadline: source monitoring can expire before the vault.
    tick();
    send({ type: 'capture', ids, crop });
  });

  ui['review-check'].addEventListener('change', () => {
    if (alive()) controls();
  });
  ui.confirm.addEventListener('click', () => {
    if (!alive() || state !== 'preview' || !imageReady || !ui['review-check'].checked || !approvalTag) return;
    state = 'reviewing';
    ui.status.textContent = 'Confirming local review…';
    controls();
    send({ type: 'review', approvalTag });
  });
  ui.cancel.addEventListener('click', () => {
    if (!alive() || ui.cancel.disabled) return;
    end('Cancelled. All local preview and field data have been cleared.');
  });
  ui.close.addEventListener('click', () => {
    end('Closed. All local preview and field data have been cleared.');
    window.close();
  });
  window.addEventListener('pagehide', () => end('The page was left. All local session data have been cleared.'));

  try {
    port = chrome.runtime.connect({ name: 'privacy-local' });
    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener(onDisconnect);
  } catch {
    end('Could not connect to the local privacy worker. All session data have been cleared.', false);
  }
})();
