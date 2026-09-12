"use strict";

// Load only in a trusted extension context, never a page/content-script global.
(function (root) {
  const TTL = 120000;
  const ERROR = "VAULT_INVALIDATED";
  const BINDING_KEYS = ["origin", "tabId", "frameId", "documentId", "pageVersion"];
  const LIMITS = Object.freeze({
    "applicant name": 200, "contact email": 254,
    "contact phone": 60, "postal address": 1000
  });
  const check = condition => { if (!condition) throw new Error(ERROR); };
  const integer = value => Number.isSafeInteger(value) && value >= 0;

  // Plain data only: reject extra/symbol keys and accessors without invoking them.
  function record(input, keys) {
    check(input !== null && typeof input === "object");
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

  function bindingOf(input) {
    const binding = record(input, BINDING_KEYS);
    check(typeof binding.origin === "string" && binding.origin.length <= 2048);
    const url = new URL(binding.origin);
    check(["https:", "http:"].includes(url.protocol) && url.origin === binding.origin);
    check(integer(binding.tabId) && integer(binding.frameId));
    check(integer(binding.pageVersion) || (typeof binding.pageVersion === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(binding.pageVersion)));
    check(typeof binding.documentId === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(binding.documentId));
    return binding;
  }

  class Vault {
    #clock;
    #random;
    #last = -1;
    #state = null;
    #busy = false;
    // Bounded, non-value collision history survives cancel; never reused as recovery state.
    #issued = new Set();

    constructor(options = {}) {
      try {
        const keys = Reflect.ownKeys(options);
        check(keys.every(key => key === "clock" || key === "random"));
        const config = record(options, keys);
        this.#clock = Object.hasOwn(config, "clock") ? config.clock : () => root.performance.now();
        this.#random = Object.hasOwn(config, "random") ? config.random : bytes => root.crypto.getRandomValues(bytes);
        check(typeof this.#clock === "function" && typeof this.#random === "function");
        Object.freeze(this);
      } catch {
        throw new Error(ERROR);
      }
    }

    static create(options) { return new Vault(options); }

    #drop() {
      if (this.#state) {
        for (const entry of this.#state.entries) entry.value = null;
        this.#state.entries.length = 0;
      }
      this.#state = null;
    }

    #now() {
      const now = this.#clock();
      check(Number.isFinite(now) && now >= 0 && now >= this.#last);
      this.#last = now;
      return now;
    }

    #alive() {
      const now = this.#now();
      check(this.#state && now < this.#state.expiresAt);
      return now;
    }

    #guard(binding, stage) {
      // Deadline precedes even binding inspection, including empty-slot requests.
      this.#alive();
      const supplied = bindingOf(binding);
      check(BINDING_KEYS.every(key => supplied[key] === this.#state.binding[key]));
      if (stage) check(this.#state.stage === stage);
    }

    #run(operation) {
      if (this.#busy) {
        this.#drop();
        throw new Error(ERROR);
      }
      this.#busy = true;
      try {
        const result = operation();
        this.#alive(); // Never return success if validation/random generation consumed the TTL.
        return result;
      } catch {
        this.#drop();
        throw new Error(ERROR); // No input, callback exception, cause or cancel reason escapes.
      } finally {
        this.#busy = false;
      }
    }

    #nonce() {
      check(this.#issued.size < 4096); // Exhaustion requires a fresh isolated instance.
      const bytes = new Uint8Array(16);
      try {
        check(this.#random.call(root.crypto, bytes) === bytes && bytes.some(byte => byte !== 0));
        const nonce = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
        check(!this.#issued.has(nonce));
        this.#issued.add(nonce);
        return nonce;
      } finally {
        bytes.fill(0);
      }
    }

    #snapshot() {
      const now = this.#alive();
      return Object.freeze({
        requestId: this.#state.requestId,
        remainingMs: this.#state.expiresAt - now,
        stage: this.#state.stage,
        slots: Object.freeze(this.#state.entries.map(({ slot, label, token, value }) =>
          Object.freeze({ slot, label, token, filled: value !== "", mask: "***" })))
      });
    }

    begin(binding) {
      return this.#run(() => {
        this.#drop(); // Invalid begin also destroys the previous request.
        const startedAt = this.#now();
        const expiresAt = startedAt + TTL;
        check(Number.isFinite(expiresAt) && expiresAt - startedAt === TTL);
        this.#state = {
          binding: bindingOf(binding), expiresAt, entries: [], stage: "begun",
          requestId: null, artifact: null
        };
        this.#state.requestId = this.#nonce();
        return Object.freeze({ requestId: this.#state.requestId, expiresAt });
      });
    }

    approve(values, binding) {
      return this.#run(() => {
        this.#guard(binding, "begun");
        check(Array.isArray(values));
        const descriptors = Object.getOwnPropertyDescriptors(values);
        const length = descriptors.length.value;
        check(integer(length) && length <= 20 && Reflect.ownKeys(descriptors).length === length + 1);
        const slots = new Set();
        for (let index = 0; index < length; index++) {
          this.#alive();
          const descriptor = descriptors[index];
          check(descriptor && Object.hasOwn(descriptor, "value") && descriptor.enumerable);
          const entry = record(descriptor.value, ["slot", "label", "value"]);
          check(typeof entry.slot === "string" && /^field-[0-9]{1,10}$/.test(entry.slot));
          check(!slots.has(entry.slot));
          slots.add(entry.slot);
          check(typeof entry.label === "string" && Object.hasOwn(LIMITS, entry.label));
          const limit = LIMITS[entry.label];
          check(typeof entry.value === "string" && entry.value.length <= limit * 2);
          let count = 0;
          for (const codepoint of entry.value) { check(++count <= limit); }
          this.#alive();
          this.#state.entries.push({ ...entry, token: `[[SSP_${this.#nonce()}]]` });
        }
        this.#state.stage = "approved";
        return this.#snapshot();
      });
    }

    snapshot(binding) {
      return this.#run(() => {
        this.#guard(binding);
        return this.#snapshot();
      });
    }

    // Host computes SHA-256 over the complete immutable sanitized artifact/payload.
    // This records local equality/consent only; it does not certify sanitization or send.
    seal(artifact, binding) {
      return this.#run(() => {
        this.#guard(binding, "approved");
        const supplied = record(artifact, ["artifactDigest", "payloadRevision"]);
        check(typeof supplied.artifactDigest === "string" && /^[A-Fa-f0-9]{64}$/.test(supplied.artifactDigest));
        check(integer(supplied.payloadRevision));
        const approvalTag = this.#nonce();
        this.#state.artifact = { ...supplied, approvalTag };
        this.#state.stage = "sealed";
        return approvalTag;
      });
    }

    markReviewed(tag, binding) {
      return this.#run(() => {
        this.#guard(binding, "sealed");
        check(typeof tag === "string" && tag === this.#state.artifact.approvalTag);
        this.#state.stage = "reviewed";
        return this.#snapshot();
      });
    }

    cancel(reason) {
      // Deliberately do not inspect/stringify/retain the caller's reason.
      this.#drop();
      return Object.freeze({ stage: "invalid", error: ERROR });
    }
  }

  const api = Object.freeze({ Vault, create: options => Vault.create(options) });
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PrivacyVault = api;
})(globalThis);
