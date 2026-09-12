"use strict";

(function (root) {
  const BASE = "http://127.0.0.1:8000";
  const SESSION_KEY = "epfoConnection";
  let generation = 0;
  let controller = null;
  let capabilities = null;
  let loadingCapabilities = null;
  let connectionWrites = Promise.resolve();

  function requireValue(condition, message) {
    if (!condition) throw new Error(message);
  }

  function cancel() {
    generation += 1;
    controller?.abort();
    controller = null;
    return { ok: true, data: { cancelled: true } };
  }

  async function readJSON(response) {
    requireValue(response.headers.get("content-type")?.includes("application/json"), "The backend returned a non-JSON response.");
    const reader = response.body.getReader();
    const chunks = [];
    let count = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      count += value.length;
      if (count > 1024 * 1024) {
        await reader.cancel();
        throw new Error("The backend response exceeds the 1 MiB safety limit.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(count);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    try { return JSON.parse(new TextDecoder().decode(bytes)); }
    catch { throw new Error("The backend returned invalid JSON."); }
  }

  async function transport(path, body, version) {
    requireValue(["/api/v1/capabilities", "/api/v1/analyze"].includes(path), "The backend route is not allowed.");
    requireValue(version === generation, "This backend request was cancelled.");
    const requestController = new AbortController();
    controller = requestController;
    const timer = setTimeout(() => requestController.abort(), 35000);
    try {
      const response = await fetch(BASE + path, {
        method: body === undefined ? "GET" : "POST",
        ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body }),
        credentials: "omit", redirect: "error", cache: "no-store", signal: requestController.signal
      });
      const data = await readJSON(response);
      requireValue(version === generation, "This backend request was cancelled.");
      const retryHeader = response.headers.get("retry-after");
      const retryAfter = typeof retryHeader === "string" && /^[0-9]{1,4}$/.test(retryHeader)
        && Number(retryHeader) >= 1 && Number(retryHeader) <= 3600 ? Number(retryHeader) : null;
      return { data, status: response.status, success: response.ok, retryAfter };
    } catch (error) {
      if (requestController.signal.aborted) throw new Error("Backend request cancelled or timed out after 35 seconds. No automatic retry was made.");
      if (error instanceof TypeError) throw new Error("Cannot reach Saral Sahayak at http://127.0.0.1:8000. Start FastAPI, then connect again.");
      throw error;
    } finally {
      clearTimeout(timer);
      if (controller === requestController) controller = null;
    }
  }

  function validateCapabilities(data) {
    requireValue(data?.schema_version === "1.0" && Array.isArray(data.languages) && data.languages.length > 0 && data.languages.length <= 20, "The backend capabilities response is invalid.");
    const seen = new Set();
    for (const item of data.languages) {
      requireValue(typeof item.code === "string" && /^[a-z]{2,8}(?:-[A-Za-z0-9]{2,8})?$/.test(item.code) && !seen.has(item.code), "The backend language list is invalid.");
      requireValue(typeof item.name === "string" && item.name.length <= 100 && typeof item.native_name === "string" && item.native_name.length <= 100 && typeof item.quality_verified === "boolean", "The backend language metadata is invalid.");
      seen.add(item.code);
    }
    requireValue(seen.has(data.default_language) && typeof data.analysis_available === "boolean", "The backend default language or availability is invalid.");
    return {
      schema_version: "1.0",
      default_language: data.default_language,
      analysis_available: data.analysis_available,
      languages: data.languages.map(item => ({
        code: item.code, name: item.name, native_name: item.native_name, quality_verified: item.quality_verified
      }))
    };
  }

  async function clearConnection() {
    capabilities = null;
    loadingCapabilities = null;
    connectionWrites = connectionWrites.catch(() => {}).then(() => chrome.storage.session.remove(SESSION_KEY));
    await connectionWrites;
  }

  async function storeCapabilities(value) {
    const validated = validateCapabilities(value);
    connectionWrites = connectionWrites.catch(() => {}).then(() => chrome.storage.session.set({ [SESSION_KEY]: { connected: true, capabilities: validated } }));
    await connectionWrites;
    capabilities = validated;
    return validated;
  }

  async function loadCapabilities() {
    if (capabilities) return capabilities;
    if (loadingCapabilities) return loadingCapabilities;
    loadingCapabilities = (async () => {
      try {
        const stored = await chrome.storage.session.get(SESSION_KEY);
        const connection = stored?.[SESSION_KEY];
        requireValue(connection && connection.connected === true, "Connect to the backend and select one of its enabled languages first.");
        capabilities = validateCapabilities(connection.capabilities);
        return capabilities;
      } catch (error) {
        capabilities = null;
        await chrome.storage.session.remove(SESSION_KEY).catch(() => {});
        if (error?.message === "Connect to the backend and select one of its enabled languages first.") throw error;
        throw new Error("Saved backend capabilities are invalid. Connect to the backend again.");
      } finally {
        loadingCapabilities = null;
      }
    })();
    return loadingCapabilities;
  }

  function validURL(value) {
    try {
      const parsed = new URL(value);
      return ["http:", "https:"].includes(parsed.protocol) && parsed.hostname && !parsed.username && !parsed.password;
    } catch { return false; }
  }

  function validateAnalysis(data, language) {
    const fail = "The backend returned an invalid analysis envelope. No guidance is displayed.";
    requireValue(data?.schema_version === "1.0" && data.language === language && ["success", "needs_clarification", "unsupported", "error"].includes(data.status), fail);
    const limits = { explanation: 30, actions: 30, required_documents: 30, citations: 100, warnings: 30, questions: 10 };
    for (const [key, max] of Object.entries(limits)) requireValue(Array.isArray(data[key]) && data[key].length <= max, fail);
    for (const text of [...data.warnings, ...data.questions]) requireValue(typeof text === "string" && text.length <= 10000, fail);
    const ids = new Set();
    for (const citation of data.citations) {
      requireValue(citation && /^ev-[A-Za-z0-9-]+$/.test(citation.id) && !ids.has(citation.id), fail);
      requireValue(typeof citation.path === "string" && /^references\/knowledge\/epfo\/.+\.md$/.test(citation.path) && !citation.path.includes("\\") && citation.path.split("/").every(part => part && part !== "." && part !== ".."), fail);
      requireValue(citation.record_id === null || /^epfo-rr-\d{3}$/.test(citation.record_id), fail);
      requireValue(typeof citation.heading === "string" && citation.heading.length > 0 && citation.heading.length <= 300 && Number.isInteger(citation.start_line) && citation.start_line >= 1 && Number.isInteger(citation.end_line) && citation.end_line >= citation.start_line, fail);
      const hasColumns = citation.start_column != null || citation.end_column != null;
      requireValue(!hasColumns || (Number.isInteger(citation.start_column) && citation.start_column >= 0 && Number.isInteger(citation.end_column) && citation.end_column >= 0 && (citation.end_line !== citation.start_line || citation.end_column >= citation.start_column)), fail);
      requireValue(Array.isArray(citation.source_urls) && citation.source_urls.length <= 30 && citation.source_urls.every(url => typeof url === "string" && validURL(url)), fail);
      ids.add(citation.id);
    }
    function block(item, needsCitation) {
      requireValue(item && typeof item.text === "string" && item.text.length > 0 && item.text.length <= 6000 && Array.isArray(item.citation_ids) && item.citation_ids.length <= 30 && (!needsCitation || item.citation_ids.length > 0) && item.citation_ids.every(id => ids.has(id)), fail);
    }
    for (const item of [...data.explanation, ...data.actions, ...data.required_documents]) block(item, true);
    if (data.draft != null) {
      requireValue(typeof data.draft.title === "string" && data.draft.title.length > 0 && data.draft.title.length <= 200 && Array.isArray(data.draft.blocks) && data.draft.blocks.length > 0 && data.draft.blocks.length <= 50 && Array.isArray(data.draft.missing_fields) && data.draft.missing_fields.length <= 20 && data.draft.missing_fields.every(item => typeof item === "string" && item.length <= 1000), fail);
      for (const item of data.draft.blocks) {
        requireValue(["factual", "template", "user_supplied"].includes(item.kind), fail);
        block(item, item.kind === "factual");
      }
    }
    if (data.status === "success") {
      const c = data.classification;
      requireValue(c && /^epfo-rr-\d{3}$/.test(c.reason_id) && typeof c.category === "string" && c.category.length <= 100 && ["low", "medium", "high"].includes(c.confidence) && typeof c.rationale === "string" && c.rationale.length <= 1000 && data.explanation.length && ids.size && !data.error && !data.questions.length, fail);
    } else {
      requireValue(!data.classification && !data.draft && !data.explanation.length && !data.actions.length && !data.required_documents.length && !ids.size, fail);
    }
    requireValue(data.status === "needs_clarification" ? data.questions.length > 0 : data.questions.length === 0, fail);
    requireValue(data.status !== "unsupported" || data.warnings.length > 0, fail);
    if (data.status === "error") requireValue(data.error && typeof data.error.code === "string" && data.error.code.length <= 100 && typeof data.error.message === "string" && data.error.message.length <= 500, fail);
    else requireValue(!data.error, fail);
    return data;
  }

  async function detect(version) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    requireValue(version === generation, "Remark detection was cancelled.");
    requireValue(tab?.id && /^https?:\/\//i.test(tab.url || ""), "Open the EPFO claim-status page in a normal website tab first.");
    const injection = await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["epfo-content.js"] });
    requireValue(version === generation, "Remark detection was cancelled.");
    const documentId = injection[0]?.documentId;
    requireValue(documentId, "The current document could not be identified.");
    const data = await chrome.tabs.sendMessage(tab.id, { type: "SS_EPFO_DETECT" }, { documentId });
    requireValue(version === generation, "Remark detection was cancelled.");
    requireValue(Array.isArray(data?.candidates) && data.candidates.length <= 8 && Array.isArray(data.warnings), "No readable rejection detection response was returned.");
    for (const candidate of data.candidates) requireValue(typeof candidate.text === "string" && [...candidate.text].length <= 8000 && typeof candidate.source === "string", "A detected remark exceeded the safe limit.");
    return { ok: true, data };
  }

  async function handle(message) {
    if (message.type === "SS_EPFO_CANCEL") return cancel();
    cancel();
    const version = generation;
    if (message.type === "SS_EPFO_DETECT") return detect(version);
    if (message.type === "SS_EPFO_CAPABILITIES") {
      capabilities = null;
      const result = await transport("/api/v1/capabilities", undefined, version);
      requireValue(result.success, `Backend capabilities unavailable (HTTP ${result.status}).`);
      const validated = validateCapabilities(result.data);
      requireValue(version === generation, "This backend request was cancelled.");
      await storeCapabilities(validated);
      requireValue(version === generation, "This backend request was cancelled.");
      return { ok: true, data: capabilities, status: result.status };
    }
    requireValue(message.type === "SS_EPFO_ANALYZE", "Unknown EPFO request.");
    const { text, language, consent } = message.payload || {};
    requireValue(consent === true, "Approve sending the reviewed remark to the backend first.");
    requireValue(typeof text === "string" && text.trim().length > 0 && [...text].length <= 8000, "Enter a nonblank remark of at most 8,000 Unicode characters.");
    const enabled = await loadCapabilities();
    requireValue(version === generation, "This backend request was cancelled.");
    requireValue(enabled.languages.some(item => item.code === language), "Connect to the backend and select one of its enabled languages first.");
    const body = JSON.stringify({ text, language });
    requireValue(new TextEncoder().encode(body).byteLength <= 32768, "The complete request exceeds 32,768 UTF-8 bytes. Shorten the remark; nothing was sent.");
    const result = await transport("/api/v1/analyze", body, version);
    if (result.data?.schema_version === "1.0") {
      const data = validateAnalysis(result.data, language);
      requireValue(result.success || data.status === "error", "The backend HTTP status conflicts with its analysis result.");
      return { ok: true, data, status: result.status };
    }
    const errors = {
      400: "Backend could not parse the request (HTTP 400).",
      401: "Backend access denied (HTTP 401). Protected analysis requires an approved authenticated gateway. Do not enter the shared server token in this extension.",
      403: "Backend access forbidden (HTTP 403). Ask the operator to check the approved access path; do not add server credentials to the browser.",
      413: "Backend rejected the request as too large (HTTP 413).",
      422: "Backend rejected the request schema (HTTP 422).",
      429: `Backend analysis capacity is limited (HTTP 429).${result.retryAfter ? ` Wait at least ${result.retryAfter} seconds before choosing to try again.` : " Try again later only if you choose."} No automatic retry was made.`,
      504: "The backend request timed out (HTTP 504). No automatic retry was made; this is not a completed analysis."
    };
    throw new Error(errors[result.status] || `Backend returned an unexpected response (HTTP ${result.status}).`);
  }

  root.EPFOBridge = { handle, cancel, clearConnection };
})(globalThis);
