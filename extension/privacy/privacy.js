'use strict';

(() => {
  const TTL_MS = 120_000;
  let ui = Object.fromEntries([
    'status', 'expiry', 'inspect', 'fields', 'crop-form', 'crop-controls',
    'crop-x', 'crop-y', 'crop-width', 'crop-height', 'crop-limits', 'capture',
    'preview-section', 'preview-image', 'slots', 'first-last', 'review-check', 'confirm',
    'outbound-section', 'outbound-slots', 'outbound-meta',
    'restore-section', 'restore', 'restore-title-text', 'local-restore-banner', 'restored-slots',
    'fill-section', 'fill-fields', 'select-filled', 'clear-filled',
    'fill-confirmation', 'fill', 'fill-outcomes',
    'provider-mode', 'analyze-consent',
    'cancel', 'close',
  ].map((id) => [id, document.getElementById(id)]));
  let port = null;
  let state = 'connecting';
  let limits = null;
  let fields = [];
  let fillChoices = [];
  let approvalTag = null;
  let imageReady = false;
  let deadline = 0;
  let timer = null;

  function end(message, notify = true) {
    if (state === 'ended') return;
    if (state === 'filling') message += ' Fill may have partially changed the page. Review it yourself; the extension never clicks Submit.';
    state = 'ended';
    clearInterval(timer);
    timer = null;
    deadline = 0;
    approvalTag = null;
    limits = null;
    imageReady = false;
    fields.length = 0;
    fillChoices.length = 0;

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

    ui['preview-image'].onload = null;
    ui['preview-image'].onerror = null;
    ui['preview-image'].removeAttribute('src');
    ui['review-check'].checked = false;
    ui['fill-confirmation'].checked = false;
    ui['first-last'].checked = false;
    ui['analyze-consent'].checked = false;
    ui['provider-mode'].value = '';
    ui['provider-mode'].disabled = true;
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
    status.id = 'terminal-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    status.textContent = message;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.setAttribute('aria-describedby', 'terminal-status');
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
    const label = ['inspecting', 'inspected'].includes(state) ? 'Inspection' : 'Preview';
    ui.expiry.textContent = `${label} expires in ${seconds} seconds. Activity does not extend this deadline.`;
  }

  function startDeadline() {
    deadline = performance.now() + TTL_MS;
    clearInterval(timer);
    timer = setInterval(tick, 250);
    tick();
  }

  function selectedFillSlots() {
    return fillChoices.filter((item) => item.checkbox.checked).map((item) => item.slot);
  }

  function controls() {
    if (state === 'ended') return;
    const active = document.activeElement;
    const busy = ['connecting', 'inspecting', 'capturing', 'reviewing', 'restoring', 'filling'].includes(state);
    ui.inspect.disabled = state !== 'ready';
    ui.fields.disabled = state !== 'inspected';
    ui['crop-controls'].disabled = state !== 'inspected';
    ui.capture.disabled = state !== 'inspected';
    ui['review-check'].disabled = state !== 'preview' || !imageReady;
    ui.confirm.disabled = state !== 'preview' || !imageReady || !ui['review-check'].checked;
    ui['outbound-section'].hidden = !['preview', 'reviewing', 'reviewed', 'restoring', 'restored', 'filling', 'filled'].includes(state);
    ui['restore-section'].hidden = !['reviewed', 'restoring', 'restored', 'filling'].includes(state) && state !== 'filled';
    ui.restore.disabled = state !== 'reviewed';
    ui['fill-section'].hidden = !['restored', 'filling', 'filled'].includes(state);
    ui['fill-fields'].disabled = state !== 'restored';
    ui['select-filled'].disabled = state !== 'restored' || !fillChoices.length;
    ui['clear-filled'].disabled = state !== 'restored' || !fillChoices.length;
    ui['fill-confirmation'].disabled = state !== 'restored' || !fillChoices.length;
    ui.fill.disabled = state !== 'restored' || !ui['fill-confirmation'].checked || !selectedFillSlots().length;
    // Dependencies not ready: stay visibly disabled. Never enable Analyze/upload/provider/first-last here.
    ui['first-last'].checked = false;
    ui['first-last'].disabled = true;
    ui['provider-mode'].disabled = true;
    ui['analyze-consent'].checked = false;
    ui['analyze-consent'].disabled = true;
    ui.cancel.disabled = false;
    ui['crop-form'].setAttribute('aria-busy', String(busy));
    // Disabling the activated button otherwise drops keyboard focus to the body.
    // Only focus host-authored status, never a restored value or its container.
    if (active?.disabled) ui.status.focus();
  }

  function focusStep(id) {
    // Do not steal focus if the user moved elsewhere while the worker was busy.
    if (document.activeElement !== ui.status) return;
    const heading = document.getElementById(id);
    heading.setAttribute('tabindex', '-1');
    heading.focus();
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
    fields = [];
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
    focusStep('inspect-title');
    tick();
  }


  function renderOutbound(slots) {
    ui['outbound-meta'].textContent = 'Schema: privacy-slots-1 · transport: disabled · tokens issued in vault (not rendered in DOM)';
    ui['outbound-slots'].replaceChildren();
    for (const slot of slots) {
      const item = document.createElement('li');
      // Safe labels + filled + fixed mask only. Never copy token/value/id/mask metadata into DOM.
      item.textContent = `${slot.label || 'Unlabelled field'} — Filled: ${slot.filled ? 'yes' : 'no'} — Mask: *** — token: [vault-held, not shown]`;
      ui['outbound-slots'].append(item);
    }
    ui['outbound-section'].hidden = false;
  }

  function clearLocalApprovals(reason) {
    if (!alive() || !ui) return;
    ui['review-check'].checked = false;
    ui['fill-confirmation'].checked = false;
    ui['analyze-consent'].checked = false;
    ui['first-last'].checked = false;
    if (reason) ui.status.textContent = reason;
    controls();
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
    deadline = Math.min(deadline, performance.now() + message.remainingMs);
    if (!alive()) return;
    approvalTag = message.approvalTag;
    ui.slots.replaceChildren();
    for (const slot of message.slots) {
      const item = document.createElement('li');
      item.textContent = `${slot.label || 'Unlabelled field'} — Filled: ${slot.filled ? 'yes' : 'no'} — Mask: ***`;
      ui.slots.append(item);
    }
    renderOutbound(message.slots);
    ui['preview-section'].hidden = false;
    ui['review-check'].checked = false;
    ui['first-last'].checked = false;
    ui['analyze-consent'].checked = false;
    imageReady = false;
    state = 'preview';
    ui['preview-image'].onload = () => {
      if (!alive() || state !== 'preview') return;
      imageReady = true;
      ui.status.textContent = 'Fully opaque local preview ready. Review it before confirming.';
      controls();
      focusStep('preview-title');
    };
    ui['preview-image'].onerror = () => end('The local PNG could not be displayed. All session data have been cleared.');
    ui.status.textContent = 'Loading the locally generated opaque preview…';
    ui['preview-image'].src = message.preview;
    controls();
    tick();
  }

  function restoredResult(message) {
    if (!Array.isArray(message.slots) || typeof message.title !== 'string' ||
        !Number.isFinite(message.remainingMs) || message.remainingMs <= 0 ||
        message.slots.some((slot) => !slot || typeof slot.slot !== 'string' ||
          typeof slot.label !== 'string' || typeof slot.filled !== 'boolean')) {
      end('Invalid local restoration payload. The session has been cleared.');
      return;
    }
    deadline = Math.min(deadline, performance.now() + message.remainingMs);
    if (!alive()) return;
    ui['restore-title-text'].hidden = false;
    ui['restore-title-text'].textContent = message.title;
    ui['local-restore-banner'].hidden = false;
    ui['restored-slots'].replaceChildren();
    ui['fill-fields'].replaceChildren();
    const legend = document.createElement('legend');
    legend.textContent = 'Fields to fill on the page';
    ui['fill-fields'].append(legend);
    fillChoices = [];
    for (const slot of message.slots) {
      const item = document.createElement('li');
      if (slot.filled && typeof slot.value === 'string') {
        item.textContent = `${slot.label}: ${slot.value}`;
      } else {
        item.textContent = `${slot.label}: unresolved (not filled)`;
      }
      ui['restored-slots'].append(item);
      if (slot.filled && typeof slot.value === 'string' && slot.value) {
        const label = document.createElement('label');
        label.className = 'check-row';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = false;
        checkbox.addEventListener('change', () => {
          if (!alive()) return;
          ui['fill-confirmation'].checked = false;
          controls();
        });
        const text = document.createElement('span');
        // Values are available for deliberate reading in the local result above,
        // not repeated in checkbox names announced during keyboard navigation.
        text.textContent = slot.label;
        label.append(checkbox, text);
        ui['fill-fields'].append(label);
        fillChoices.push({ slot: slot.slot, checkbox });
      }
    }
    if (!fillChoices.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No filled placeholders to write. Unresolved fields stay manual.';
      ui['fill-fields'].append(empty);
    }
    ui['fill-confirmation'].checked = false;
    ui['fill-outcomes'].hidden = true;
    ui['fill-outcomes'].textContent = '';
    state = 'restored';
    ui.status.textContent = 'Local restoration complete. No analysis was performed. Select fields and approve Fill separately. Submit remains manual.';
    controls();
    focusStep('fill-title');
    tick();
  }

  function filledResult(message) {
    if (!Array.isArray(message.results)) {
      end('Invalid Fill result. The session has been cleared.');
      return;
    }
    // Terminal announcements contain only host wording and status counts, never
    // arbitrary adapter IDs/messages/warnings that could repeat a private value.
    const counts = { filled: 0, failed: 0, skipped: 0, unknown: 0 };
    for (const result of message.results) {
      const status = ['filled', 'failed', 'skipped'].includes(result?.status) ? result.status : 'unknown';
      counts[status] += 1;
    }
    ui['fill-outcomes'].hidden = false;
    ui['fill-outcomes'].textContent = `Fill attempt finished: ${counts.filled} filled, ${counts.failed} failed, ${counts.skipped} skipped, ${counts.unknown} unknown. Local preview and field data cleared. No analysis was performed. Sites may autosave. Review the page yourself; the extension never clicks Submit.`;
    state = 'filled';
    ui.status.textContent = 'Fill attempt finished. Review the page yourself; the extension never submits.';
    controls();
    // Session values are already cleared worker-side; close local UI after reporting.
    end(ui['fill-outcomes'].textContent, false);
  }

  function onMessage(message) {
    if (!alive()) return;
    if (!message || typeof message.type !== 'string') {
      end('Invalid local worker response. The session has been cleared.');
      return;
    }
    if (message.type === 'expired') {
      const expired = !message.message || [
        'Privacy window expired. Reopen from the source tab.',
        'The 120-second request expired. Recapture is required.',
      ].includes(message.message);
      end(expired
        ? 'The local session expired. All preview and field data have been cleared. No automatic restart.'
        : 'Local operation blocked or source changed. Access may be unavailable or denied. All preview and field data have been cleared. Reopen from the source tab to inspect again.', false);
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
      ui['restore-section'].hidden = false;
      ui.status.textContent = 'Local preview review confirmed. Restore is available; Analyze/upload/Submit stay disabled.';
      controls();
      focusStep('restore-title');
    } else if (message.type === 'restored' && state === 'restoring') {
      restoredResult(message);
    } else if (message.type === 'filled' && state === 'filling') {
      filledResult(message);
    } else {
      end('The worker could not complete this local step. All session data have been cleared.');
    }
  }

  function onDisconnect() {
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
  ui.restore.addEventListener('click', () => {
    if (!alive() || state !== 'reviewed') return;
    state = 'restoring';
    ui.status.textContent = 'Restoring approved placeholders locally from the host template…';
    controls();
    send({ type: 'restore' });
  });
  ui['select-filled'].addEventListener('click', () => {
    if (!alive() || state !== 'restored') return;
    for (const item of fillChoices) item.checkbox.checked = true;
    ui['fill-confirmation'].checked = false;
    controls();
  });
  ui['clear-filled'].addEventListener('click', () => {
    if (!alive() || state !== 'restored') return;
    for (const item of fillChoices) item.checkbox.checked = false;
    ui['fill-confirmation'].checked = false;
    controls();
  });
  ui['fill-confirmation'].addEventListener('change', () => {
    if (alive()) controls();
  });
  ui.fill.addEventListener('click', () => {
    if (!alive() || state !== 'restored' || !ui['fill-confirmation'].checked) return;
    const slots = selectedFillSlots();
    if (!slots.length) return;
    state = 'filling';
    ui.status.textContent = 'Filling only your selected fields. Submission remains manual…';
    controls();
    send({ type: 'fill', confirmed: true, slots });
  });
  ui['first-last'].addEventListener('change', () => {
    // Contract: first/last stays off for the personal registry set. Any toggle clears approvals.
    if (!alive()) return;
    ui['first-last'].checked = false;
    clearLocalApprovals('First/last preview is unavailable for the current personal safe-label set. Prior review approvals were cleared.');
  });
  ui['provider-mode'].addEventListener('change', () => {
    if (!alive()) return;
    // Mode/destination changes invalidate approvals even while the control stays disabled for users.
    ui['provider-mode'].value = '';
    clearLocalApprovals('Provider/mode or destination change cleared prior Analyze/Fill approvals. Recapture when a destination is available.');
  });
  ui['analyze-consent'].addEventListener('change', () => {
    if (!alive()) return;
    // Analyze path is not enabled; consent cannot stick.
    ui['analyze-consent'].checked = false;
    controls();
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
    end('Could not connect to the local privacy worker.', false);
  }
})();
