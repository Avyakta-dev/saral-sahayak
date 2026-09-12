"use strict";

// Host-owned privacy slot grammar and one-pass local restoration helpers.
// Load only in a trusted extension context. No network, storage or page globals.
(function (root) {
  const TOKEN = /^\[\[SSP_[0-9A-F]{32}\]\]$/;
  const SLOT = /^field-[0-9]{1,10}$/;
  const LABELS = Object.freeze(["applicant name", "contact email", "contact phone", "postal address"]);
  const TEMPLATE_ID = "privacy-host-contact-v1";
  const SCHEMA = "privacy-slots-1";
  const ERROR = "SLOT_REJECTED";
  const check = (condition) => { if (!condition) throw new Error(ERROR); };

  function plainRecord(input, keys) {
    check(input !== null && typeof input === "object" && !Array.isArray(input));
    const proto = Object.getPrototypeOf(input);
    check(proto === Object.prototype || proto === null);
    const descriptors = Object.getOwnPropertyDescriptors(input);
    check(Reflect.ownKeys(descriptors).length === keys.length);
    const result = Object.create(null);
    for (const key of keys) {
      const descriptor = descriptors[key];
      check(descriptor && Object.hasOwn(descriptor, "value") && descriptor.enumerable);
      result[key] = descriptor.value;
    }
    return result;
  }

  function isToken(value) {
    return typeof value === "string" && value.length === 40 && TOKEN.test(value);
  }

  function isSlot(value) {
    return typeof value === "string" && /^field-[0-9]{1,10}$(?![\s\S])/.test(value);
  }

  function denseArray(input) {
    check(Array.isArray(input));
    const descriptors = Object.getOwnPropertyDescriptors(input);
    const length = descriptors.length.value;
    check(Number.isSafeInteger(length) && length >= 0 && length <= 20);
    check(Reflect.ownKeys(descriptors).length === length + 1);
    const result = [];
    for (let index = 0; index < length; index += 1) {
      const descriptor = descriptors[index];
      check(descriptor && Object.hasOwn(descriptor, "value") && descriptor.enumerable);
      result.push(descriptor.value);
    }
    return result;
  }

  function registrySlots(input) {
    const ids = new Set();
    const tokens = new Set();
    return denseArray(input).map(item => {
      const slot = plainRecord(item, ["slot", "label", "token", "filled", "mask"]);
      check(isSlot(slot.slot) && isSafeLabel(slot.label) && isToken(slot.token));
      check(typeof slot.filled === "boolean" && slot.mask === "***");
      check(!ids.has(slot.slot) && !tokens.has(slot.token));
      ids.add(slot.slot);
      tokens.add(slot.token);
      return slot;
    });
  }

  function isSafeLabel(value) {
    return typeof value === "string" && LABELS.includes(value);
  }

  // Model-visible outbound fragment: tokens, filled flags and constant labels only.
  function outboundEnvelope(snapshot) {
    check(snapshot && typeof snapshot === "object" && !Array.isArray(snapshot));
    const descriptors = Object.getOwnPropertyDescriptors(snapshot);
    check(descriptors.requestId && Object.hasOwn(descriptors.requestId, "value") &&
      descriptors.slots && Object.hasOwn(descriptors.slots, "value"));
    const requestId = descriptors.requestId.value;
    check(typeof requestId === "string" && requestId.length === 32 && /^[0-9A-F]{32}$/.test(requestId));
    const slots = registrySlots(descriptors.slots.value).map(slot =>
      Object.freeze({ slot: slot.slot, label: slot.label, token: slot.token, filled: slot.filled }));
    return Object.freeze({
      schema_version: SCHEMA,
      template_id: TEMPLATE_ID,
      request_id: requestId,
      slots: Object.freeze(slots)
    });
  }

  // Host template for local restore without a model round-trip.
  // Surrounding prose is fixed; private values are never part of the template text.
  function hostTemplate(snapshot) {
    const envelope = outboundEnvelope(snapshot);
    const blocks = envelope.slots.map((slot) => Object.freeze({
      kind: "slot",
      slot: slot.slot,
      label: slot.label,
      token: slot.token,
      filled: slot.filled
    }));
    return Object.freeze({
      schema_version: SCHEMA,
      template_id: TEMPLATE_ID,
      title: "Local contact placeholders (host template)",
      blocks: Object.freeze([
        Object.freeze({
          kind: "text",
          text: "Review restored contact fields locally. Nothing is submitted by the extension."
        }),
        ...blocks
      ])
    });
  }

  // Strict validation of a slot response before any restoration lookup.
  // Accepts only exact pre-issued tokens (or null for unfilled slots). Rejects extra keys,
  // forged/cross-request tokens, duplicates, misplaced labels and free prose values.
  function validateSlotResponse(response, registry) {
    check(response !== null && typeof response === "object" && !Array.isArray(response));
    const body = plainRecord(response, ["schema_version", "template_id", "slots"]);
    check(body.schema_version === SCHEMA && body.template_id === TEMPLATE_ID);
    const entries = denseArray(body.slots);
    const registered = registrySlots(registry);
    check(entries.length === registered.length);
    const expected = new Map(registered.map(item => [item.slot, item]));
    const seen = new Set();
    const tokens = new Set();
    const normalized = [];
    for (let index = 0; index < entries.length; index += 1) {
      const entry = plainRecord(entries[index], ["slot", "label", "token"]);
      check(isSlot(entry.slot) && !seen.has(entry.slot));
      seen.add(entry.slot);
      const match = expected.get(entry.slot);
      check(match && entry.label === match.label);
      if (match.filled) {
        check(entry.token === match.token && isToken(entry.token) && !tokens.has(entry.token));
        tokens.add(entry.token);
        normalized.push(Object.freeze({ slot: entry.slot, label: entry.label, token: entry.token }));
      } else {
        check(entry.token === null);
        normalized.push(Object.freeze({ slot: entry.slot, label: entry.label, token: null }));
      }
    }
    check(seen.size === expected.size);
    return Object.freeze(normalized);
  }

  // One-pass local restoration: exact token lookup only. Never recursive, never regex over free text.
  function restoreLocal(validatedSlots, valueByToken) {
    check(valueByToken instanceof Map);
    const ids = new Set();
    const tokens = new Set();
    const entries = denseArray(validatedSlots).map(item => {
      const entry = plainRecord(item, ["slot", "label", "token"]);
      check(isSlot(entry.slot) && isSafeLabel(entry.label) && !ids.has(entry.slot));
      check(entry.token === null || (isToken(entry.token) && !tokens.has(entry.token)));
      ids.add(entry.slot);
      if (entry.token !== null) tokens.add(entry.token);
      return entry;
    });
    // Validate the complete structure before consulting the private value map.
    for (const token of tokens) check(valueByToken.has(token));
    const restored = entries.map((item) => {
      if (item.token === null) {
        return Object.freeze({ slot: item.slot, label: item.label, filled: false, value: null });
      }
      check(valueByToken.has(item.token));
      const value = valueByToken.get(item.token);
      check(typeof value === "string");
      // A stored literal that looks like another token stays literal; no recursive substitution.
      return Object.freeze({ slot: item.slot, label: item.label, filled: true, value });
    });
    return Object.freeze(restored);
  }

  // Build a trusted host response that simply echoes issued tokens for filled slots.
  function hostEchoResponse(snapshot) {
    const envelope = outboundEnvelope(snapshot);
    return Object.freeze({
      schema_version: SCHEMA,
      template_id: TEMPLATE_ID,
      slots: Object.freeze(envelope.slots.map((slot) => Object.freeze({
        slot: slot.slot,
        label: slot.label,
        token: slot.filled ? slot.token : null
      })))
    });
  }

  const api = Object.freeze({
    SCHEMA, TEMPLATE_ID, TOKEN, LABELS, ERROR,
    isToken, isSafeLabel, outboundEnvelope, hostTemplate,
    validateSlotResponse, restoreLocal, hostEchoResponse
  });
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PrivacySlots = api;
})(globalThis);
