"use strict";

(() => {
  const el = (name) => document.getElementById(`epfo-${name}`);
  const runtime = globalThis.chrome && globalThis.chrome.runtime;
  const live = Boolean(runtime && runtime.id && typeof runtime.sendMessage === "function");
  const list = (value) => Array.isArray(value) ? value : [];
  const text = (value, max = 8000) => {
    const string = typeof value === "string" ? value : "";
    return string.length > max ? `${string.slice(0, max)} [truncated]` : string;
  };
  const node = (tag, content, className = "") => {
    const item = document.createElement(tag);
    item.textContent = text(content);
    if (className) item.className = className;
    return item;
  };
  let epoch = 0;
  let busy = false;
  let cancelling = false;
  let candidates = [];
  let languages = [];

  function status(message) { el("status").textContent = text(message); }
  function showError(message) {
    el("error").textContent = text(message);
    el("error").hidden = !message;
  }
  function clearResults() {
    el("results").replaceChildren();
    el("results").hidden = true;
  }
  function updateControls() {
    const waiting = busy || cancelling;
    el("remark").disabled = !live; // Review remains editable, including during analysis.
    el("candidates").disabled = !live || !candidates.length;
    el("language").disabled = !live || !languages.length;
    el("detect").disabled = !live || waiting;
    el("connect").disabled = !live || waiting;
    el("consent").disabled = !live || waiting || !el("remark").value.trim() || !el("language").value;
    el("analyze").disabled = !live || waiting || !el("consent").checked ||
      !el("remark").value.trim() || !languages.some((language) => language.code === el("language").value);
    el("cancel").disabled = !live || !busy || cancelling;
    el("panel").setAttribute("aria-busy", String(waiting));
  }
  async function request(type, payload) {
    if (!live) throw new Error("Load this folder as an unpacked Chrome or Brave extension. No runtime is available.");
    let response;
    try {
      response = await runtime.sendMessage(payload === undefined ? { type } : { type, payload });
    } catch (_) {
      throw new Error("The extension worker is unavailable. Reload the extension and try again explicitly.");
    }
    if (!response || response.ok !== true) {
      const error = response && response.error;
      throw new Error(text(typeof error === "string" ? error : error && error.message) || "The worker could not complete this EPFO action. Check that it supports the EPFO protocol.");
    }
    return response;
  }
  function cancelPending(force = false) {
    const active = busy;
    ++epoch;
    busy = false;
    if (live && !cancelling && (active || force)) {
      cancelling = true;
      // Block a new action until cancellation is acknowledged, so it cannot cancel a newer request.
      request("SS_EPFO_CANCEL").catch((error) => {
        showError(`${error.message} Cancellation could not be confirmed; already sent data cannot be recalled.`);
      }).finally(() => {
        cancelling = false;
        updateControls();
      });
    }
  }
  function invalidate(message) {
    cancelPending();
    clearResults();
    el("consent").checked = false;
    showError("");
    status(message);
    updateControls();
  }
  async function run(message, task) {
    if (!live || busy || cancelling) return;
    invalidate(message);
    const token = ++epoch;
    busy = true;
    updateControls();
    try {
      await task(token);
    } catch (error) {
      if (token === epoch) {
        clearResults();
        showError(error.message || "The EPFO action failed.");
        status("Action stopped. No guidance is available from this request.");
      }
    } finally {
      if (token === epoch) {
        busy = false;
        updateControls();
      }
    }
  }
  function strings(parent, title, values) {
    const items = list(values).slice(0, 30);
    if (!items.length) return;
    parent.append(node("h3", title));
    const ul = node("ul");
    items.forEach((value) => ul.append(node("li", value)));
    parent.append(ul);
  }
  function resetCandidates(label = "No candidates detected") {
    candidates = [];
    const option = node("option", label);
    option.value = "";
    el("candidates").replaceChildren(option);
  }
  function safePath(value) {
    return typeof value === "string" && value.length <= 1000 &&
      /^references\/knowledge\/epfo\/[A-Za-z0-9_./-]+\.md$/.test(value) &&
      value.split("/").every((part) => part && part !== "." && part !== "..");
  }
  function safeURL(value) {
    if (typeof value !== "string" || value.length > 4096 || !/^https?:\/\//i.test(value) || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password) return null;
      return url.href;
    } catch (_) { return null; }
  }
  function cite(parent, ids, citations) {
    list(ids).slice(0, 30).forEach((id) => {
      const citation = citations.get(id);
      if (!citation || !safePath(citation.path)) {
        parent.append(node("p", "Citation unavailable or outside the public EPFO knowledge root.", "notice warning"));
        return;
      }
      const evidence = node("div", undefined, "disclosure");
      evidence.append(node("p", `${text(citation.id)} · ${citation.path}`, "field-meta"));
      evidence.append(node("p", `Record: ${text(citation.record_id) || "Supporting document"} · Heading: ${text(citation.heading)}`, "current-value"));
      if (Number.isInteger(citation.start_line) && citation.start_line > 0 && Number.isInteger(citation.end_line) && citation.end_line >= citation.start_line) {
        let location = `Lines ${citation.start_line}–${citation.end_line}`;
        if (Number.isInteger(citation.start_column) && citation.start_column >= 0 && Number.isInteger(citation.end_column) && citation.end_column >= 0) {
          location += ` · Columns ${citation.start_column}–${citation.end_column} (zero-based)`;
        }
        evidence.append(node("p", location, "field-meta"));
      }
      const urls = list(citation.source_urls).slice(0, 30);
      if (!urls.length) evidence.append(node("p", "No original source URL supplied for this section.", "hint"));
      urls.forEach((value) => {
        const href = safeURL(value);
        if (!href) {
          evidence.append(node("p", "Unsafe original source URL omitted.", "hint"));
          return;
        }
        const link = node("a", value);
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.referrerPolicy = "no-referrer";
        const line = node("p", undefined, "field-meta");
        line.append(link);
        evidence.append(line);
      });
      parent.append(evidence);
    });
  }
  function blocks(parent, title, values, citations, ordered = false) {
    const items = list(values).slice(0, 50);
    if (!items.length) return;
    parent.append(node("h3", title));
    const container = node(ordered ? "ol" : "div", undefined, "field-list");
    items.forEach((block) => {
      const card = node(ordered ? "li" : "article", undefined, "field-card");
      if (block.kind) card.append(node("p", `Draft block: ${text(block.kind)}`, "field-meta"));
      card.append(node("p", block.text, "current-value"));
      cite(card, block.citation_ids, citations);
      container.append(card);
    });
    parent.append(container);
  }
  function renderAnalysis(response, language) {
    clearResults();
    const data = response.data;
    if (!data || data.schema_version !== "1.0" || data.language !== language ||
        !["success", "needs_clarification", "unsupported", "error"].includes(data.status)) {
      throw new Error("The worker returned an invalid analysis envelope or a different language.");
    }
    const http = Number.isInteger(response.status) ? response.status : null;
    if (data.status === "success" && (!http || http < 200 || http >= 300)) {
      throw new Error("The backend did not return a successful HTTP status. Guidance was withheld.");
    }
    const output = el("results");
    output.append(node("h3", `Result: ${data.status}${http ? ` · HTTP ${http}` : ""}`));
    strings(output, "Warnings", data.warnings);
    if (data.status !== "success") {
      // Never render classification, advice, citations or draft from a non-success envelope.
      strings(output, "Questions", data.questions);
      if (data.error) showError(`${text(data.error.code)}: ${text(data.error.message)}`);
      status(data.status === "needs_clarification" ? "More information is needed. Edit the remark and approve it again." : "No supported guidance was returned. Review the warnings or error.");
      output.hidden = false;
      return;
    }
    const classification = data.classification;
    if (!classification) throw new Error("The success response is missing its classification.");
    output.append(node("h3", "Classification"));
    output.append(node("p", `${text(classification.reason_id)} · ${text(classification.category)} · ${text(classification.confidence)} confidence`, "current-value"));
    output.append(node("h3", "Classification reasoning"), node("p", classification.rationale, "current-value"));
    const citations = new Map(list(data.citations).slice(0, 100).map((item) => [item.id, item]));
    blocks(output, "Explanation", data.explanation, citations);
    blocks(output, "Actions", data.actions, citations, true);
    blocks(output, "Required documents", data.required_documents, citations);
    if (data.draft) {
      blocks(output, `Draft: ${text(data.draft.title)}`, data.draft.blocks, citations);
      strings(output, "Missing draft fields", data.draft.missing_fields);
    }
    output.append(node("p", "Educational assistance, not official EPFO guidance or legal advice. Review sources and draft placeholders; source presence does not verify policy accuracy.", "notice warning"));
    output.hidden = false;
    status("Analysis received. Review the cited guidance and any missing fields.");
  }

  el("detect").addEventListener("click", () => run("Detecting rejection remarks locally; no screenshot or backend request…", async (token) => {
    const hasPreview = Boolean(el("remark").value);
    resetCandidates();
    el("detection-warnings").replaceChildren();
    el("detection-warnings").hidden = true;
    const response = await request("SS_EPFO_DETECT");
    if (token !== epoch) return;
    if (!response.data || !Array.isArray(response.data.candidates)) throw new Error("The worker returned an invalid detection response.");
    candidates = response.data.candidates.slice(0, 30).filter((item) => item && typeof item.text === "string" && item.text.trim() && [...item.text].length <= 8000);
    const placeholder = node("option", candidates.length ? "Choose a candidate" : "No candidates detected — paste a remark");
    placeholder.value = "";
    el("candidates").replaceChildren(placeholder);
    candidates.forEach((candidate, index) => {
      const option = node("option", `${index + 1}. ${text(candidate.source, 100)} — ${text(candidate.text, 180)}`);
      option.value = String(index);
      el("candidates").append(option);
    });
    if (candidates.length === 1 && !hasPreview) {
      el("candidates").value = "0";
      el("remark").value = candidates[0].text;
    }
    strings(el("detection-warnings"), "Detection warnings", response.data.warnings);
    el("detection-warnings").hidden = !el("detection-warnings").childElementCount;
    status(hasPreview
      ? candidates.length ? "Your existing remark was kept. Choose a detected candidate only if you want to replace it, then review and approve again." : "No usable remark detected. Your existing remark was kept; review it before approval."
      : candidates.length === 1 ? "One remark detected. Review and edit it before approval." : candidates.length ? "Choose a candidate explicitly, or paste your own remark." : "No usable remark detected. Paste the rejection remark yourself.");
  }));
  el("connect").addEventListener("click", () => run("Loading backend capabilities; no remark is sent…", async (token) => {
    languages = [];
    el("language").replaceChildren();
    el("readiness").hidden = true;
    updateControls();
    const response = await request("SS_EPFO_CAPABILITIES");
    if (token !== epoch) return;
    const data = response.data;
    if (!data || data.schema_version !== "1.0" || !Array.isArray(data.languages) || typeof data.analysis_available !== "boolean") {
      throw new Error("The worker returned invalid backend capabilities.");
    }
    languages = data.languages.filter((language) => language && typeof language.code === "string" && language.code && typeof language.name === "string" && typeof language.native_name === "string").slice(0, 30);
    if (!languages.length) throw new Error("The backend returned no enabled languages.");
    languages.forEach((language) => {
      const option = node("option", `${text(language.name, 100)} · ${text(language.native_name, 100)} (${text(language.code, 20)})`);
      option.value = language.code;
      el("language").append(option);
    });
    if (languages.some((language) => language.code === data.default_language)) el("language").value = data.default_language;
    el("readiness").textContent = data.analysis_available
      ? "Backend reports configuration/structural readiness only, not verified model connectivity, policy accuracy or translation quality."
      : "Backend reports analysis_available: false. Model configuration or knowledge dependencies are not ready. Analyze remains available to show the real backend error; no fallback advice is used.";
    el("readiness").hidden = false;
    status("Backend languages loaded. Review the remark, choose a language and approve before analysis.");
  }));
  el("remark").addEventListener("input", () => {
    el("candidates").value = "";
    invalidate("Remark changed. Review it and approve again; previous work is invalidated.");
  });
  el("language").addEventListener("change", () => invalidate("Language changed. Review the remark and approve again."));
  el("candidates").addEventListener("change", () => {
    const value = el("candidates").value;
    const candidate = value === "" ? null : candidates[Number(value)];
    if (candidate) el("remark").value = candidate.text;
    invalidate(candidate
      ? "Candidate changed. Review and edit the remark, then approve again."
      : "No candidate selected. Your existing remark was kept; review it and approve again.");
  });
  el("consent").addEventListener("change", () => {
    if (!el("consent").checked) invalidate("Approval removed. Pending work is cancelled; already sent data cannot be recalled.");
    else updateControls();
  });
  el("analyze").addEventListener("click", () => {
    if (el("analyze").disabled || !el("consent").checked) return;
    const remark = el("remark").value;
    const language = el("language").value;
    if (!remark.trim() || [...remark].length > 8000) {
      showError("Enter a nonblank rejection remark of at most 8,000 characters.");
      return;
    }
    if (new TextEncoder().encode(JSON.stringify({ text: remark, language })).length > 32768) {
      showError("The UTF-8 request exceeds 32 KiB. Shorten the remark before approving it again.");
      el("consent").checked = false;
      updateControls();
      return;
    }
    run("Analyzing only the reviewed remark with the selected backend language…", async (token) => {
      const response = await request("SS_EPFO_ANALYZE", { text: remark, language, consent: true });
      if (token !== epoch) return;
      renderAnalysis(response, language);
    });
  });
  el("cancel").addEventListener("click", () => invalidate("Cancellation requested. Results and approval cleared; already sent data cannot be recalled."));
  document.addEventListener("ss-session-clearing", () => {
    cancelPending(true);
    clearResults();
    resetCandidates();
    languages = [];
    el("language").replaceChildren();
    el("remark").value = "";
    el("consent").checked = false;
    el("readiness").textContent = "";
    el("readiness").hidden = true;
    el("detection-warnings").replaceChildren();
    el("detection-warnings").hidden = true;
    showError("");
    status("EPFO popup cleared. Session clearance is handled by the form assistant; already sent data cannot be recalled.");
    updateControls();
  });

  if (!live) status("Extension runtime unavailable. Load this folder as an unpacked Chrome or Brave extension. EPFO controls are disabled; no preview fixtures or backend requests are used.");
  updateControls(); // No detection, capabilities request or analysis on popup open.
})();
