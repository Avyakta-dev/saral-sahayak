"use strict";

(function (root) {
  let session = null;
  let serial = 0;
  let opening = false;

  function check(condition, message) {
    if (!condition) throw new Error(message);
  }
  function notify(s, message) {
    try { s.port?.postMessage(message); } catch { /* A closed preview cannot receive state. */ }
  }
  function dispose(reason = "Privacy session cleared. Reopen from the source tab.", options = {}) {
    const silent = options && options.silent === true;
    serial += 1;
    const previous = session;
    session = null;
    if (!previous) return;
    clearTimeout(previous.timer);
    previous.vault?.cancel();
    previous.preview = null;
    previous.inspection = null;
    previous.binding = null;
    previous.restored = null;
    for (const entry of previous.pendingFillEntries || []) entry.value = "";
    previous.pendingFillEntries = null;
    if (previous.documentId) chrome.tabs.sendMessage(previous.tabId, { type: "PRIVACY_RESET" }, { documentId: previous.documentId }).catch(() => {});
    if (!silent) notify(previous, { type: "expired", message: reason });
  }
  async function open() {
    check(!opening, "A privacy window is already opening.");
    opening = true;
    try {
      dispose();
      const generation = serial;
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      check(generation === serial, "Privacy opening was cancelled.");
      check(tab?.id && /^https?:\/\//.test(tab.url || ""), "Open privacy capture from a normal HTTP(S) source tab.");
      const s = { tabId: tab.id, sourceWindowId: tab.windowId, url: tab.url, windowId: null, port: null, timer: null, vault: null, documentId: null, inspection: null, busy: false, generation, preview: null, binding: null, restored: null };
      session = s;
      s.windowReady = chrome.windows.create({ url: chrome.runtime.getURL("privacy/privacy.html"), type: "popup", width: 500, height: 760 });
      const window = await s.windowReady;
      if (session !== s || generation !== serial) {
        if (window.id) await chrome.windows.remove(window.id);
        throw new Error("Privacy capture was cancelled.");
      }
      s.windowId = window.id;
      s.timer = setTimeout(() => dispose("Privacy window expired. Reopen from the source tab."), 120000);
      return { ok: true };
    } finally { opening = false; }
  }

  async function inspect(s) {
    const tab = await chrome.tabs.get(s.tabId);
    check(session === s, "Privacy inspection was cancelled.");
    check(tab.url === s.url && tab.active && tab.windowId === s.sourceWindowId, "The source page changed. Reopen privacy capture.");
    const result = await chrome.scripting.executeScript({ target: { tabId: s.tabId }, files: ["privacy/page.js"] });
    check(session === s, "Privacy capture was cancelled.");
    const documentId = result[0]?.documentId;
    check(documentId, "The page document could not be bound.");
    s.documentId = documentId;
    const data = await chrome.tabs.sendMessage(s.tabId, { type: "PRIVACY_INSPECT" }, { documentId });
    check(session === s && data && !data.error && typeof data.generation === "string" && Array.isArray(data.candidates), "The page cannot be inspected safely.");
    s.documentId = documentId;
    s.inspection = data;
    s.binding = { origin: new URL(s.url).origin, tabId: s.tabId, frameId: 0, documentId, pageVersion: data.generation };
    // A mutation can invalidate the returned snapshot before its message arrives.
    await verify(s);
    return { type: "inspected", candidates: data.candidates, cropLimits: data.cropLimits };
  }

  async function verify(s) {
    check(session === s && s.inspection, "The privacy context was lost. Reopen it.");
    const tab = await chrome.tabs.get(s.tabId);
    check(session === s, "Privacy operation was cancelled.");
    check(tab.active && tab.url === s.url && tab.windowId === s.sourceWindowId, "Source tab changed. Reopen privacy capture.");
    const result = await chrome.tabs.sendMessage(s.tabId, { type: "PRIVACY_CHECK", generation: s.inspection.generation }, { documentId: s.documentId });
    check(session === s && result?.valid === true, "The page changed. Reopen privacy capture.");
  }

  async function capture(s, message) {
    check(!s.vault && Array.isArray(message.ids) && message.ids.length <= 20, "Inspect once and select at most 20 fields before capture.");
    PrivacyRaster.cropPolicy(message.crop, s.inspection?.cropLimits);
    s.vault = new PrivacyVault.Vault();
    s.vault.begin(s.binding);
    clearTimeout(s.timer);
    s.timer = setTimeout(() => dispose("The 120-second request expired. Recapture is required."), 120000);
    await verify(s);
    check(new Set(message.ids).size === message.ids.length && message.ids.every(id => s.inspection.candidates.some(candidate => candidate.id === id)), "Only listed selected fields can be read.");
    let values = await chrome.tabs.sendMessage(s.tabId, { type: "PRIVACY_READ", generation: s.inspection.generation, ids: message.ids }, { documentId: s.documentId });
    try {
      check(session === s, "Privacy capture was cancelled.");
      check(Array.isArray(values), "Approved field values could not be read safely.");
      s.vault.approve(values, s.binding);
    } finally {
      if (Array.isArray(values)) {
        for (const item of values) if (item && typeof item === "object") item.value = "";
      }
      values = null;
    }
    await verify(s);
    // All source pixels are denied in this first slice. Avoid capturing secret-bearing originals entirely.
    const artifact = await PrivacyRaster.opaqueRaster(message.crop, s.inspection.cropLimits);
    await verify(s);
    const approvalTag = s.vault.seal({ artifactDigest: artifact.digest, payloadRevision: 1 }, s.binding);
    s.preview = { digest: artifact.digest, approvalTag };
    const snapshot = s.vault.snapshot(s.binding);
    return { type: "preview", preview: artifact.preview, slots: snapshot.slots, approvalTag, remainingMs: snapshot.remainingMs, coverage: artifact.coverage };
  }

  async function review(s, message) {
    await verify(s);
    check(s.preview && message.approvalTag === s.preview.approvalTag, "The reviewed preview is no longer current.");
    s.vault.markReviewed(message.approvalTag, s.binding);
    return {
      type: "reviewed",
      message: "Local preview reviewed. Restore uses a host template only; Analyze/upload stay disabled. Fill requires a separate explicit approval and never submits."
    };
  }

  async function restore(s) {
    await verify(s);
    check(s.vault && s.preview, "Confirm the local preview before restoration.");
    const snapshot = s.vault.snapshot(s.binding);
    check(snapshot.stage === "reviewed", "Restoration requires a reviewed local preview.");
    const template = PrivacySlots.hostTemplate(snapshot);
    const echo = PrivacySlots.hostEchoResponse(snapshot);
    const validated = PrivacySlots.validateSlotResponse(echo, snapshot.slots);
    const released = s.vault.restoreLocal(s.binding);
    const valueByToken = new Map(released.slots.filter(item => item.filled).map(item => [item.token, item.value]));
    const restored = PrivacySlots.restoreLocal(validated, valueByToken);
    // Trusted privacy window may display restored values for local review only.
    s.restored = restored;
    return {
      type: "restored",
      templateId: template.template_id,
      title: template.title,
      notice: template.blocks[0].text,
      slots: restored.map(item => Object.freeze({
        slot: item.slot,
        label: item.label,
        filled: item.filled,
        value: item.filled ? item.value : null,
        unresolved: !item.filled
      })),
      remainingMs: released.remainingMs
    };
  }

  async function fill(s, message) {
    await verify(s);
    check(message.confirmed === true, "Approve filling selected fields before Fill.");
    check(Array.isArray(message.slots) && message.slots.length > 0, "Select at least one restored field to fill.");
    check(s.restored && s.vault && s.inspection, "Restore locally before Fill.");
    const allowed = new Set(s.restored.filter(item => item.filled).map(item => item.slot));
    check(message.slots.every(slot => typeof slot === "string" && allowed.has(slot)), "Only restored filled fields can be selected for Fill.");
    check(new Set(message.slots).size === message.slots.length, "Duplicate Fill selections are not allowed.");
    let released = s.vault.consumeFill(message.slots, s.binding);
    s.vault = null;
    s.restored = null;
    const entries = released.map(item => ({ id: item.slot, label: item.label, value: item.value }));
    released = null;
    s.pendingFillEntries = entries;
    let response;
    s.filling = true;
    try {
      response = await chrome.tabs.sendMessage(s.tabId, {
        type: "PRIVACY_FILL",
        generation: s.inspection.generation,
        entries
      }, { documentId: s.documentId });
    } catch {
      if (session === s) dispose("The page stopped responding during Fill. Inspect it for partial changes. The extension did not click Submit.");
      return null;
    } finally {
      s.filling = false;
      for (const entry of entries) entry.value = "";
      s.pendingFillEntries = null;
    }
    if (session !== s) return null;
    check(response && !response.error && Array.isArray(response.results), "Fill was rejected by the page adapter.");
    const result = {
      type: "filled",
      results: response.results,
      warnings: response.warnings || [],
      message: "Fill attempt finished. The extension never clicks Submit. Review the page yourself."
    };
    notify(s, result);
    dispose("Fill finished. Local privacy state was cleared. Submission remains manual.", { silent: true });
    return null;
  }

  chrome.runtime.onConnect.addListener(port => {
    if (port.name !== "privacy-local") return;
    acceptPort(port).catch(() => { try { port.disconnect(); } catch {} });
  });
  async function acceptPort(port) {
    const s = session;
    const sender = port.sender;
    if (!s || s.port || sender?.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL("privacy/privacy.html")) {
      port.disconnect();
      return;
    }
    let disconnected = false;
    port.onDisconnect.addListener(() => {
      disconnected = true;
      if (session === s && s.port === port) dispose("Preview closed. All local privacy state was discarded.");
    });
    const opened = await s.windowReady;
    let matches = sender.tab?.windowId === opened.id;
    if (!sender.tab && sender.documentId && chrome.runtime.getContexts) {
      const contexts = await chrome.runtime.getContexts({ documentIds: [sender.documentId], windowIds: [opened.id] });
      matches = contexts.length === 1 && contexts[0].documentUrl === chrome.runtime.getURL("privacy/privacy.html");
    }
    if (session !== s || s.port || disconnected || !matches) { port.disconnect(); return; }
    s.port = port;
    port.onMessage.addListener(message => {
      if (session !== s) return;
      if (message?.type === "cancel") { dispose(); return; }
      if (s.busy) return;
      s.busy = true;
      (async () => {
        check(session === s && message && typeof message.type === "string", "Invalid privacy action.");
        switch (message.type) {
          case "inspect": check(!s.inspection, "Reopen before inspecting a different page."); return inspect(s);
          case "capture": return capture(s, message);
          case "review": return review(s, message);
          case "restore": return restore(s);
          case "fill": return fill(s, message);
          case "analyze":
          case "upload":
          case "submit":
            throw new Error("Analyze, upload and Submit remain disabled. Fill is separate and never submits.");
          default: throw new Error("This action is not available in local-only privacy mode.");
        }
      })().then(result => { if (session === s) notify(s, result); }).catch(() => {
        if (session === s) dispose("Privacy operation blocked or source changed. No data was transmitted. Reopen to inspect again.");
      }).finally(() => { s.busy = false; });
    });
    notify(s, { type: "ready" });
  }
  function invalidated(message, sender) {
    if (message?.type === "PRIVACY_INVALIDATED" && session?.inspection &&
        typeof message.generation === "string" && message.generation === session.inspection.generation &&
        sender.id === chrome.runtime.id && sender.tab?.id === session.tabId && sender.documentId === session.documentId) {
      // The page consumes its one-shot session at Fill completion. Keep only the
      // in-flight outcome channel; page-side validation stops any further writes.
      if (session.filling) { session.fillInvalidated = true; return; }
      dispose("The source page changed. Privacy state and preview were discarded.");
    }
  }
  chrome.windows.onRemoved.addListener(windowId => { if (session?.windowId === windowId) dispose("Privacy window closed."); });
  chrome.tabs.onRemoved.addListener(tabId => { if (session?.tabId === tabId) dispose("Source tab closed."); });
  chrome.tabs.onUpdated.addListener((tabId, change) => {
    if (session?.tabId === tabId && (change.status === "loading" || change.url)) dispose("Source navigation invalidated privacy capture.");
  });
  chrome.tabs.onActivated.addListener(info => {
    if (session && info.windowId === session.sourceWindowId && info.tabId !== session.tabId) dispose("Source tab changed.");
  });
  root.LocalPrivacy = { open, cancel: dispose, invalidated };
})(globalThis);
