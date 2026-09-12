"use strict";

(function (root) {
  function cropPolicy(crop, viewport) {
    const keys = ["x", "y", "width", "height"];
    if (!crop || !viewport || !keys.every(key => Number.isFinite(crop[key])) ||
        ![viewport.width, viewport.height, viewport.dpr].every(value => Number.isFinite(value) && value > 0) ||
        crop.x < 0 || crop.y < 0 || crop.width < 1 || crop.height < 1 ||
        crop.x + crop.width > viewport.width || crop.y + crop.height > viewport.height) {
      throw new Error("Choose a crop inside the current visible page.");
    }
    const width = Math.ceil(crop.width * viewport.dpr);
    const height = Math.ceil(crop.height * viewport.dpr);
    if (width > 2048 || height > 2048 || width * height > 4194304) {
      throw new Error("The crop exceeds the 2,048-pixel dimension limit. Choose a smaller area.");
    }
    return { width, height };
  }

  async function opaqueRaster(crop, viewport) {
    const { width, height } = cropPolicy(crop, viewport);
    // No source pixels enter this canvas. Unverified content is entirely replaced.
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Local pixel processing is unavailable.");
    ctx.fillStyle = "#183f38";
    ctx.fillRect(0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: "image/png" });
    if (blob.size > 2 * 1024 * 1024) throw new Error("The redacted preview exceeds the image limit.");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const digestBytes = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    const digest = Array.from(digestBytes, byte => byte.toString(16).padStart(2, "0")).join("");
    const parts = [];
    for (let start = 0; start < bytes.length; start += 8192) parts.push(String.fromCharCode(...bytes.subarray(start, start + 8192)));
    const preview = "data:image/png;base64," + btoa(parts.join(""));
    bytes.fill(0);
    canvas.width = 1;
    canvas.height = 1;
    return { preview, digest, width, height, coverage: "fully-masked", transport: "disabled" };
  }

  const api = { cropPolicy, opaqueRaster };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PrivacyRaster = api;
})(globalThis);
