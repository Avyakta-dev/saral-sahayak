"use strict";

(function (root) {
  const MAX_FILE_BYTES = 2 * 1024 * 1024;
  const PROFILE_LIMITS = { name: 200, email: 254, phone: 60, address: 1000 };
  const FILE_TYPES = new Set([
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain", "image/png", "image/jpeg"
  ]);

  function check(condition, message) {
    if (!condition) throw new Error(message);
  }

  function validateProfile(value) {
    check(value && typeof value === "object" && !Array.isArray(value), "Enter your profile first.");
    const profile = {};
    for (const [key, limit] of Object.entries(PROFILE_LIMITS)) {
      check(typeof value[key] === "string" && value[key].length <= limit, `Check your ${key} (maximum ${limit} characters).`);
      profile[key] = value[key].trim();
    }
    check(!profile.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email), "Enter a valid email address or leave it blank.");
    return profile;
  }

  function validateFile(file) {
    if (file === null) return null;
    check(file && typeof file === "object", "Choose a supported file.");
    check(typeof file.name === "string" && file.name.length > 0 && file.name.length <= 180 && file.name === file.name.trim() && !/^[.]/.test(file.name) && !/[\/\\:\x00-\x1f\x7f]/.test(file.name), "Choose a file with a simple filename (180 characters maximum).");
    const types = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", txt: "text/plain", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };
    check(FILE_TYPES.has(file.type) && types[file.name.split(".").pop().toLowerCase()] === file.type, "Supported files: PDF, DOC/DOCX, TXT, PNG or JPEG with matching file types.");
    check(Number.isInteger(file.size) && file.size > 0 && file.size <= MAX_FILE_BYTES, "The file must be nonempty and at most 2 MiB.");
    check(typeof file.data === "string" && file.data.length <= Math.ceil(MAX_FILE_BYTES / 3) * 4 && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.data), "The selected file could not be read.");
    const length = file.data.length * 3 / 4 - (file.data.endsWith("==") ? 2 : file.data.endsWith("=") ? 1 : 0);
    check(length === file.size, "File bytes do not match the selected file size.");
    return { name: file.name, type: file.type, size: file.size, data: file.data };
  }

  function normalize(text) {
    return text.normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, " ").trim();
  }

  function isGrounded(value, source, profile, file) {
    if (source === "file") return Boolean(file) && value === "__ATTACH_FILE__";
    const supplied = profile[source];
    if (!supplied || !value.trim()) return false;
    if (source === "email") return normalize(value) === normalize(supplied);
    if (source === "phone") {
      const digits = value.replace(/\D/g, "");
      return /^[\d\s()+.\-]+$/.test(value) && digits.length >= 3 && digits === supplied.replace(/\D/g, "");
    }
    if (source === "name" || source === "address") {
      const part = normalize(value);
      const whole = normalize(supplied);
      if (part === whole) return true;
      // Only literal whole-word parts may be extracted; do not infer missing cities, titles or country codes.
      const escape = part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?:^|[\\s,;])${escape}(?=$|[\\s,;])`, "u").test(whole);
    }
    return false;
  }

  function suggestFromProfile(fields, profile, file) {
    const list = Array.isArray(fields) ? fields : [];
    const mappings = [];
    const seen = new Set();
    let attached = false;
    for (const field of list) {
      if (!field || typeof field.selector !== "string" || seen.has(field.selector)) continue;
      const hay = `${field.label || ""} ${field.name || ""} ${field.id || ""} ${field.type || ""}`.toLowerCase();
      let source = null;
      let value = "";
      if (field.type === "file" && file && !attached) {
        source = "file";
        value = "__ATTACH_FILE__";
        attached = true;
      } else if (field.type === "email" || /\b(e-?mail)\b/.test(hay)) {
        source = "email";
        value = profile.email;
      } else if (field.type === "tel" || /\b(phone|mobile|tel)\b/.test(hay)) {
        source = "phone";
        value = profile.phone;
      } else if (/\b(address|street|city|pincode|postal|state)\b/.test(hay)) {
        source = "address";
        if (field.type === "select-one") {
          const match = (field.options || []).find((option) => isGrounded(option.value, "address", profile, file));
          value = match ? match.value : "";
        } else value = profile.address;
      } else if (field.type !== "file" && /\b(name|applicant|full.?name)\b/.test(hay)) {
        source = "name";
        value = profile.name;
      }
      if (!source || !value || !isGrounded(value, source, profile, file)) continue;
      if (field.type === "select-one" && !(field.options || []).some((option) => option.value === value)) continue;
      seen.add(field.selector);
      mappings.push({
        selector: field.selector,
        value,
        source,
        confidence: "high",
        reason: "Filled from your profile using the configured backend session.",
      });
    }
    return validatePlan({ mappings }, list, profile, file);
  }

  function validatePlan(data, fields, profile, file) {
    check(data && Array.isArray(data.mappings) && data.mappings.length <= 80, "The AI response is not a valid field mapping.");
    const bySelector = new Map(fields.map(field => [field.selector, field]));
    const seen = new Set();
    let attachments = 0;
    return data.mappings.map(item => {
      check(item && typeof item.selector === "string" && bySelector.has(item.selector) && !seen.has(item.selector), "The AI returned an unknown or duplicate field. Nothing was filled.");
      seen.add(item.selector);
      const field = bySelector.get(item.selector);
      check(typeof item.value === "string" && item.value.length <= 2000, "The AI returned an invalid value.");
      check(["high", "medium", "low"].includes(item.confidence), "The AI returned an invalid confidence flag.");
      check(["name", "email", "phone", "address", "file"].includes(item.source), "The AI used unsupported personal data.");
      check(typeof item.reason === "string" && item.reason.length <= 240, "The AI returned an invalid explanation.");
      check(isGrounded(item.value, item.source, profile, file), "The AI suggested information not present in your profile. Nothing was filled.");
      check((field.type === "file") === (item.source === "file"), "The AI returned an invalid file mapping.");
      if (field.type === "file") check(++attachments <= 1, "Only one file attachment is allowed per review.");
      if (field.type === "select-one") check(field.options.some(option => option.value === item.value && !option.disabled), "The AI suggested an unavailable option. Edit your profile or fill that field manually.");
      if (Number.isInteger(field.maxLength) && field.maxLength >= 0 && field.type !== "file") check(item.value.length <= field.maxLength, "A suggested value exceeds the field limit.");
      return {
        selector: field.selector, label: field.label, type: field.type,
        currentValue: field.currentValue, options: field.options || [],
        value: item.value, confidence: item.confidence, reason: item.reason,
        selected: item.confidence === "high" && !field.currentValue && field.type !== "file"
      };
    });
  }

  function validateEntries(entries, plan) {
    check(Array.isArray(entries) && entries.length > 0 && entries.length <= 80, "Select at least one suggested field to fill.");
    const known = new Map(plan.map(item => [item.selector, item]));
    const seen = new Set();
    return entries.map(entry => {
      check(entry && known.has(entry.selector) && !seen.has(entry.selector), "This review is invalid. Scan the page again.");
      check(typeof entry.value === "string" && entry.value.length <= 2000, "A reviewed value is too long or invalid.");
      const field = known.get(entry.selector);
      if (field.type === "file") check(entry.value === "__ATTACH_FILE__", "Choose the saved file attachment.");
      if (field.type === "select-one") check(field.options.some(option => option.value === entry.value && !option.disabled), "Choose an available dropdown option.");
      seen.add(entry.selector);
      return { selector: entry.selector, value: entry.value };
    });
  }

  const api = { MAX_FILE_BYTES, validateProfile, validateFile, validatePlan, validateEntries, suggestFromProfile, isGrounded, check };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FormMapping = api;
})(globalThis);
