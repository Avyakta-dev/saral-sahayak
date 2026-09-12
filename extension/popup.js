"use strict";

(() => {
  const byId = (id) => document.getElementById(id);
  const profileNames = ["name", "email", "phone", "address"];
  const runtime = globalThis.chrome && globalThis.chrome.runtime;
  const live = Boolean(runtime && runtime.id && typeof runtime.sendMessage === "function");
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const JPEG = /^data:image\/jpeg;base64,/;
  const blankState = () => ({ stage: "profile", profile: {}, file: null, model: "gpt-4o-mini", hasKey: false, scan: null, plan: [], results: [], warnings: [] });
  let state = blankState();
  let view = "profile";
  let selectedFile; // undefined preserves the session file; null explicitly removes it.
  let reviewEntries = [];
  let busy = false;
  let epoch = 0;
  let fillAttempted = false;
  let connected = false;

  const text = (value) => value == null ? "" : String(value);
  const list = (value) => Array.isArray(value) ? value : [];
  const displayValue = (value) => text(value) === "" ? "Empty" : text(value);
  const node = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = text(content);
    return element;
  };
  function showError(message) {
    byId("error").textContent = message;
    byId("error").hidden = !message;
  }
  function status(message) { byId("status").textContent = message; }
  function fileDescription(file) {
    return file ? `${text(file.name)} · ${(Number(file.size || 0) / 1024).toFixed(1)} KiB` : "No attachment selected";
  }
  function currentFile() { return selectedFile === undefined ? state.file : selectedFile; }
  function updateFile() {
    byId("file-summary").textContent = fileDescription(currentFile()) + (selectedFile !== undefined ? " · unsaved change" : "");
    byId("remove-file").hidden = !currentFile();
  }
  function updateControls() {
    [...document.querySelectorAll("button, input, textarea, select")]
      .filter((control) => !control.closest("#epfo-panel")).forEach((control) => {
      control.disabled = !live || !connected || busy || control.dataset.locked === "true";
    });
    // Clearing is also available during a request, including initial connection.
    byId("clear-session").disabled = !live;
    byId("workspace").setAttribute("aria-busy", String(busy));
    const validScreenshot = state.scan && typeof state.scan.screenshot === "string" && JPEG.test(state.scan.screenshot);
    byId("include-screenshot").disabled = !live || !connected || busy || !validScreenshot;
    byId("analyze").disabled = !live || !connected || busy || !byId("analysis-consent").checked || !state.scan || !list(state.scan.fields).length;
    const count = reviewEntries.filter((entry) => entry.include.checked && entry.include.dataset.locked !== "true").length;
    byId("selection-count").textContent = `${count} of ${reviewEntries.length} suggested fields selected`;
    byId("fill").disabled = !live || !connected || busy || fillAttempted || state.stage === "done" || !count || !byId("fill-confirmation").checked;
  }
  function setView(next, focus = false) {
    view = next;
    ["profile", "captured", "review"].forEach((name) => { byId(`${name}-view`).hidden = name !== next; });
    const active = next === "profile" ? 0 : state.stage === "done" ? 2 : 1;
    ["profile", "review", "fill"].forEach((name, index) => {
      const step = byId(`step-${name}`);
      if (index === active) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
      step.classList.toggle("completed", index < active);
    });
    if (focus) byId(`${next}-title`).focus();
    updateControls();
  }
  function renderProfile() {
    profileNames.forEach((name) => { byId(`profile-${name}`).value = text(state.profile[name]); });
    byId("model").value = text(state.model) || "gpt-4o-mini";
    byId("api-key").value = "";
    byId("api-key").placeholder = state.hasKey ? "Saved for this session" : "Enter your API key";
    byId("key-state").textContent = state.hasKey ? "Key saved for session" : "Your OpenAI key";
    updateFile();
  }
  function renderWarnings() {
    const warnings = [...list(state.scan && state.scan.warnings), ...list(state.warnings)];
    byId("warnings").replaceChildren();
    [...new Set(warnings.map((warning) => typeof warning === "string" ? warning : text(warning && warning.message)))].filter(Boolean).forEach((warning) => {
      byId("warnings").append(node("li", "", warning));
    });
    byId("warnings-box").hidden = !byId("warnings").childElementCount;
  }
  function renderCaptured() {
    const scan = state.scan;
    byId("profile-disclosure").replaceChildren();
    profileNames.forEach((name) => {
      byId("profile-disclosure").append(node("dt", "", name.charAt(0).toUpperCase() + name.slice(1)), node("dd", "", text(state.profile[name]) || "Not supplied"));
    });
    byId("attachment-disclosure").textContent = state.file
      ? `Local attachment: ${fileDescription(state.file)}. File metadata may help matching; file contents are not sent to AI.`
      : "No local attachment. File contents are never sent to AI.";
    byId("capture-site").textContent = scan ? text(scan.site) : "No page captured";
    const fields = list(scan && scan.fields);
    byId("captured-count").textContent = String(fields.length);
    byId("captured-fields").replaceChildren();
    fields.forEach((field) => {
      const card = node("article", "field-card");
      card.append(node("h3", "", field.label || field.name || field.id || "Unlabelled field"));
      card.append(node("p", "field-meta", `${text(field.type) || "text"}${field.required ? " · Required" : ""}`));
      card.append(node("span", "value-label", "Current value"), node("p", "current-value", displayValue(field.currentValue)));
      const metadata = node("details", "field-metadata");
      metadata.append(node("summary", "", "Field metadata shared with AI"));
      const details = node("dl", "key-values");
      [["Selector", field.selector], ["Name", field.name], ["ID", field.id], ["Accepts", field.accept], ["Max length", field.maxLength]].forEach(([label, value]) => {
        if (value !== null && value !== undefined && value !== "") details.append(node("dt", "", label), node("dd", "", value));
      });
      list(field.options).forEach((option) => { details.append(node("dt", "", "Choice"), node("dd", "", `${text(option.label)} [${text(option.value)}]`)); });
      metadata.append(details);
      card.append(metadata);
      byId("captured-fields").append(card);
    });
    if (!fields.length) byId("captured-fields").append(node("p", "notice", "No supported fields were captured. Return to your profile and scan a page with an ordinary web form."));
    byId("screenshot").removeAttribute("src");
    const screenshot = scan && scan.screenshot;
    const safe = typeof screenshot === "string" && JPEG.test(screenshot);
    byId("screenshot-preview").hidden = !safe;
    byId("screenshot-preview").open = false;
    byId("screenshot-unavailable").hidden = Boolean(safe);
    if (safe) byId("screenshot").src = screenshot;
    byId("include-screenshot").checked = false;
    byId("analysis-consent").checked = false;
  }
  function renderReview() {
    reviewEntries = [];
    byId("suggested-fields").replaceChildren();
    byId("review-site").textContent = text(state.scan && state.scan.site);
    const done = state.stage === "done";
    byId("review-title").textContent = done ? "Filled? Let’s check." : "A final look. Your call.";
    byId("review-intro").textContent = done ? "The fill attempt is complete. Review each reported outcome and check the page yourself." : "Check every suggestion. Edit values and choose which fields to fill.";
    byId("fill-actions").hidden = done;
    byId("selection-rule").hidden = done;
    byId("outcomes").hidden = !done;
    byId("fill-confirmation").checked = false;
    list(state.plan).forEach((field, index) => {
      const card = node("article", "field-card");
      const heading = node("div", "section-heading");
      const label = text(field.label) || `Field ${index + 1}`;
      const confidence = ["high", "medium", "low"].includes(field.confidence) ? field.confidence : "low";
      heading.append(node("h3", "", label), node("span", `confidence ${confidence}`, `${confidence} confidence`));
      card.append(heading, node("p", "field-meta", text(field.type) || "text"));
      card.append(node("span", "value-label", "Current value"), node("p", "current-value", displayValue(field.currentValue)));
      const include = node("input");
      include.type = "checkbox";
      const isFile = field.type === "file";
      const captured = list(state.scan && state.scan.fields).find((item) => item.selector === field.selector);
      let editor;
      const proposedLabel = node("label", "value-label", isFile ? "Local attachment" : "Proposed value · editable");
      const editorId = `proposed-${index}`;
      if (isFile) {
        editor = node("p", "proposed-value", fileDescription(state.file));
        editor.id = editorId;
        card.append(proposedLabel, editor);
        card.append(node("p", "hint", `AI proposal: ${text(field.value) || "No value suggested"}. Select below to attach your local file. The site may upload it immediately.`));
      } else {
        const options = list(field.options).length ? list(field.options) : list(captured && captured.options);
        const selectField = text(field.type).startsWith("select") || options.length > 0;
        if (selectField) {
          editor = node("select");
          options.forEach((option) => {
            const item = node("option", "", text(option.label) || text(option.value) || "Empty option");
            item.value = text(option.value);
            editor.append(item);
          });
          if (!options.some((option) => text(option.value) === text(field.value))) {
            const missing = node("option", "", `Not an available choice: ${displayValue(field.value)}`);
            missing.value = text(field.value);
            missing.disabled = true;
            missing.dataset.invalid = "true";
            editor.prepend(missing);
          }
        } else {
          // Text editing avoids executing or interpreting page/model-provided content.
          editor = node("textarea");
          editor.rows = 2;
          editor.spellcheck = false;
          if (captured && Number.isInteger(captured.maxLength) && captured.maxLength >= 0) editor.maxLength = captured.maxLength;
        }
        editor.id = editorId;
        editor.value = text(field.value);
        editor.dataset.locked = String(done);
        proposedLabel.htmlFor = editorId;
        card.append(proposedLabel, editor);
      }
      if (field.reason) card.append(node("p", "hint", field.reason));
      include.dataset.locked = String(done || (isFile && !state.file));
      const selectableValue = isFile ? Boolean(state.file) : editor.tagName !== "SELECT" || !editor.selectedOptions[0]?.dataset.invalid;
      include.checked = !done && !isFile && field.selected !== false && confidence === "high" && text(field.currentValue) === "" && text(field.value) !== "" && selectableValue;
      const choice = node("label", "check-row");
      choice.append(include, node("span", "", isFile ? (state.file ? "Include this local attachment" : "Add an attachment in your profile first") : "Include this field"));
      card.append(choice);
      card.classList.toggle("selected", include.checked);
      const onChange = () => {
        byId("fill-confirmation").checked = false;
        card.classList.toggle("selected", include.checked);
        updateControls();
      };
      include.addEventListener("change", onChange);
      if (!isFile) editor.addEventListener("input", onChange);
      reviewEntries.push({ selector: text(field.selector), isFile, include, editor });
      byId("suggested-fields").append(card);
    });
    if (!reviewEntries.length) byId("suggested-fields").append(node("p", "notice", "No field suggestions were returned. Nothing will be filled. Edit your profile or scan again."));
    byId("results").replaceChildren();
    list(state.results).forEach((result, index) => {
      const card = node("article", "field-card");
      const matching = list(state.plan).find((field) => field.selector === result.selector);
      card.append(node("h3", "", result.label || (matching && matching.label) || result.selector || `Field ${index + 1}`));
      const outcome = result.status || (result.ok === true ? "Filled" : result.ok === false ? "Not filled" : "Outcome not specified");
      card.append(node("p", "outcome-status", outcome));
      const detail = result.message || result.reason || result.error;
      if (detail) card.append(node("p", "hint", typeof detail === "string" ? detail : text(detail.message)));
      byId("results").append(card);
    });
    if (done && !list(state.results).length) byId("results").append(node("p", "notice", "The worker returned no individual outcomes. Check the page; no success is assumed."));
  }
  function applyState(next, focus = false) {
    if (!next || !["profile", "captured", "review", "done"].includes(next.stage) || !next.profile || typeof next.profile !== "object") {
      throw new Error("The extension returned an invalid session state. Clear the session or reopen the popup.");
    }
    state = next;
    connected = true;
    renderProfile();
    renderCaptured();
    renderReview();
    renderWarnings();
    setView(state.stage === "captured" ? "captured" : ["review", "done"].includes(state.stage) ? "review" : "profile", focus);
  }
  async function request(type, payload) {
    if (!live) throw new Error("Preview only — load unpacked in Chrome to use the form assistant.");
    let response;
    try {
      response = await runtime.sendMessage(payload === undefined ? { type } : { type, payload });
    } catch (_) {
      throw new Error("The extension worker is unavailable. Reopen the popup or reload the unpacked extension. Nothing will be retried automatically.");
    }
    if (!response || response.ok !== true) {
      const error = response && response.error;
      throw new Error(typeof error === "string" ? error : text(error && error.message) || "The extension could not complete this action. Nothing will be retried automatically.");
    }
    return response.state;
  }
  async function run(message, task) {
    if (busy || !live) return;
    const token = ++epoch;
    busy = true;
    showError("");
    status(message);
    updateControls();
    try { await task(token); }
    catch (error) {
      if (token === epoch) {
        status("Action stopped. Review the message below.");
        showError(error.message || "The action could not be completed.");
      }
    } finally {
      if (token === epoch) { busy = false; updateControls(); }
    }
  }
  function validateProfile() {
    for (const name of profileNames) if (!byId(`profile-${name}`).reportValidity()) return false;
    for (const id of ["api-key", "model"]) {
      const input = byId(id);
      if (!input.checkValidity()) {
        byId("setup").open = true;
        input.reportValidity();
        return false;
      }
    }
    return true;
  }
  async function savePayload() {
    const payload = {
      profile: Object.fromEntries(profileNames.map((name) => [name, byId(`profile-${name}`).value.trim()])),
      model: byId("model").value.trim()
    };
    const key = byId("api-key").value.trim();
    if (key) payload.key = key;
    if (selectedFile === null) payload.file = null;
    else if (selectedFile !== undefined) {
      const file = selectedFile;
      if (file.size > MAX_FILE_SIZE || !/\.(pdf|doc|docx|txt|png|jpe?g)$/i.test(file.name)) throw new Error("Choose a supported file no larger than 2 MiB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const chunks = [];
      for (let offset = 0; offset < bytes.length; offset += 8192) chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 8192)));
      payload.file = { name: file.name, type: file.type, size: file.size, data: btoa(chunks.join("")) };
    }
    return payload;
  }
  function saveAndMaybeScan(scan) {
    if (busy || !validateProfile()) return;
    run(scan ? "Saving your details, then capturing the page…" : "Saving profile and settings to this session…", async (token) => {
      const payload = await savePayload();
      if (token !== epoch) return;
      const saved = await request("SS_SAVE", payload);
      if (token !== epoch) return;
      selectedFile = undefined;
      byId("profile-file").value = "";
      fillAttempted = false;
      applyState(saved);
      if (!scan) { status("Profile and settings saved for this session. Any previous suggestions were cleared."); return; }
      const captured = await request("SS_SCAN");
      if (token !== epoch) return;
      applyState(captured, true);
      status("Page captured. Review the snapshot before sharing with OpenAI.");
    });
  }
  byId("privacy-local").addEventListener("click", () => run("Opening a local-only privacy window…", async () => {
    const response = await runtime.sendMessage({ type: "PRIVACY_OPEN" });
    if (!response?.ok) throw new Error(response?.error || "Privacy capture could not open.");
    window.close();
  }));
  byId("scan").addEventListener("click", () => saveAndMaybeScan(true));
  byId("save-settings").addEventListener("click", () => saveAndMaybeScan(false));
  byId("profile-file").addEventListener("change", () => {
    const file = byId("profile-file").files[0];
    if (!file) return;
    if (!/\.(pdf|doc|docx|txt|png|jpe?g)$/i.test(file.name) || file.size > MAX_FILE_SIZE) {
      byId("profile-file").value = "";
      showError("Choose one PDF, DOC/DOCX, TXT, PNG or JPG file, no larger than 2 MiB. Your previous attachment is unchanged.");
      return;
    }
    selectedFile = file;
    showError("");
    updateFile();
  });
  byId("remove-file").addEventListener("click", () => {
    selectedFile = null;
    byId("profile-file").value = "";
    updateFile();
    status("Attachment removal is pending. Save your profile or scan to apply it.");
  });
  function editProfile() {
    if (busy) return;
    byId("analysis-consent").checked = false;
    byId("include-screenshot").checked = false;
    byId("fill-confirmation").checked = false;
    setView("profile", true);
    status("Edit your details, then save or scan again. Saving invalidates previous suggestions.");
  }
  ["edit-captured", "edit-review", "start-again"].forEach((id) => byId(id).addEventListener("click", editProfile));
  ["analysis-consent", "include-screenshot", "fill-confirmation"].forEach((id) => byId(id).addEventListener("change", updateControls));
  byId("analyze").addEventListener("click", () => {
    if (busy || view !== "captured" || !byId("analysis-consent").checked) return;
    if (!state.hasKey) {
      editProfile();
      byId("setup").open = true;
      byId("api-key").required = true;
      byId("api-key").reportValidity();
      byId("api-key").required = false;
      showError("Add and save your OpenAI API key, then scan again to review the data before analysis.");
      return;
    }
    const includeScreenshot = byId("include-screenshot").checked && !byId("include-screenshot").disabled;
    run("Asking OpenAI for suggestions. The page is not being changed…", async (token) => {
      const next = await request("SS_ANALYZE", { consent: true, includeScreenshot });
      if (token !== epoch) return;
      fillAttempted = false;
      applyState(next, true);
      status("Suggestions received. Review every value before approving a fill.");
    });
  });
  byId("fill").addEventListener("click", () => {
    if (busy || view !== "review" || fillAttempted || state.stage !== "review" || !byId("fill-confirmation").checked) return;
    const entries = [];
    for (const entry of reviewEntries) {
      if (!entry.include.checked || entry.include.dataset.locked === "true") continue;
      if (!entry.isFile) {
        if (entry.editor.tagName === "SELECT" && entry.editor.selectedOptions[0]?.dataset.invalid) {
          showError("Choose an available option for every selected dropdown field.");
          entry.editor.focus();
          return;
        }
        if (!entry.editor.reportValidity()) return;
      }
      entries.push({ selector: entry.selector, value: entry.isFile ? "__ATTACH_FILE__" : entry.editor.value });
    }
    if (!entries.length) return;
    fillAttempted = true;
    run("Filling only your selected fields. Submission remains manual…", async (token) => {
      try {
        const next = await request("SS_FILL", { confirmed: true, entries });
        if (token !== epoch) return;
        applyState(next, true);
        status("Fill attempt finished. Check the individual outcomes and the page.");
      } catch (error) {
        if (token === epoch) byId("fill-confirmation").checked = false;
        throw new Error(`${error.message} Check the page before scanning again; some changes may already have been applied. This fill will not be retried.`);
      }
    });
  });
  byId("clear-session").addEventListener("click", async () => {
    if (!live) return;
    const token = ++epoch; // Invalidate every older UI completion, even while busy.
    document.dispatchEvent(new Event("ss-session-clearing"));
    busy = true;
    connected = false;
    state = blankState();
    selectedFile = undefined;
    fillAttempted = false;
    byId("profile-file").value = "";
    byId("setup").open = false;
    renderProfile();
    renderCaptured();
    renderReview();
    renderWarnings();
    setView("profile");
    showError("");
    status("Clearing this session and cancelling pending work…");
    try {
      const next = await request("SS_CLEAR");
      if (token !== epoch) return;
      applyState(next);
      status("Session cleared. This does not undo page changes or recall data already sent to OpenAI.");
    } catch (error) {
      if (token === epoch) {
        status("Popup cleared; worker session clearance could not be confirmed.");
        showError(`${error.message} Reload the extension before entering new data.`);
      }
    } finally {
      if (token === epoch) { busy = false; updateControls(); }
    }
  });

  if (!live) {
    byId("status").classList.add("preview");
    status("Preview only — load unpacked in Chrome to connect the form assistant. No page is read and no data is sent here.");
    updateControls();
  } else {
    run("Restoring your extension session…", async (token) => {
      const next = await request("SS_GET");
      if (token !== epoch) return;
      applyState(next);
      status(state.stage === "profile" ? "Ready when you are. Nothing is captured until you scan." : "Session restored. Review the captured page before continuing.");
    });
  }
})();
