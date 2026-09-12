'use strict';

// Presentation state only. Never imports extension code or accepts page/user data.
(() => {
  const destinations = Object.freeze({
    backend: 'Existing backend · illustrative destination https://backend.example.invalid/api/v1/analyze. Keys would remain server-side. Not connected.',
    remote: 'Direct remote model · illustrative destination https://model.example.invalid/v1. Operator retention and logging unknown; approval and grounding required. Not connected.',
    local: 'Direct local model · illustrative destination http://127.0.0.1:11434/v1 (not contacted). Local is not inherently private: services may forward, log or expose data on the LAN. Retention unknown; identical redaction required. Not connected.',
    companion: 'Optional local companion · no destination configured. Not installed or connected; separate authenticated service approval required. Local is not inherently private; forwarding, logging and LAN exposure need review.',
  });
  const blocks = Object.freeze({
    blocked: 'Blocked: region coverage is unknown. Cancel or choose a supported fictional scenario; manual review cannot override failed coverage.',
    restricted: 'Restricted browser page: capture unavailable. No broader permissions requested. Cancel or use a separately reviewed non-identifying paste flow outside this mock.',
    unsupported: 'Unsupported capture surface: no capture or silent fallback. Cancel or choose a supported fictional scenario.',
  });
  // Authored examples only: deliberately not a protocol envelope or token generator.
  const boundary = 'STATIC BOUNDARY ILLUSTRATION — NOT SENT\n\napplicant name\nopaque token: [[SSP_00112233445566778899AABBCCDDEEFF]]\nfilled: true\n\ncontact email\nopaque token: [[SSP_FFEEDDCCBBAA99887766554433221100]]\nfilled: false';
  function initial(mode = 'backend', scenario = 'ready') {
    return { mode, scenario, captured: false, treatment: 'mask', category: 'long', reveal: false, reviewed: false, result: false, fillReview: false, filled: false, message: 'Not connected. Choose Capture to start the synthetic walkthrough.' };
  }
  function eligible(s) { return !blocks[s.scenario]; }
  function canAnalyze(s) { return s.captured && s.treatment !== 'unresolved' && s.reviewed && !s.result; }
  function clearReview(s) { return { ...s, reviewed: false, result: false, fillReview: false, filled: false }; }
  function transition(s, action, value) {
    if (action === 'mode' && Object.hasOwn(destinations, value)) return { ...initial(value, s.scenario), message: 'Mode changed. Mock preview, opt-in, approvals and result cleared. Not connected.' };
    if (action === 'scenario' && ['ready', 'inaccessible', ...Object.keys(blocks)].includes(value)) return { ...initial(s.mode, value), message: blocks[value] || 'Scenario changed. Capture the fictional area again; nothing collected.' };
    if (['cancel', 'stale'].includes(action)) return { ...initial(s.mode, s.scenario), message: action === 'cancel' ? 'Cancelled. Mock preview, opt-in, approvals and result cleared. Nothing sent.' : 'Page changed or session expired (simulation). All mock review state cleared. Recapture required; no automatic retry.' };
    if (action === 'capture' && eligible(s)) return { ...initial(s.mode, s.scenario), captured: true, message: 'Synthetic schematic captured. Review masks and destination before the separate Analyze simulation. Nothing sent.' };
    if (!s.captured) return s;
    if (action === 'treatment' && ['mask', 'crop', 'unresolved'].includes(value)) return { ...clearReview(s), treatment: value, message: value === 'unresolved' ? 'Blocked: cannot establish coverage. Mask or crop the entire known region, or cancel. Analyze unavailable.' : 'Preview treatment changed. Review and result cleared; review this schematic again.' };
    if (action === 'category' && ['long', 'short', 'sensitive', 'unknown'].includes(value)) return { ...clearReview(s), category: value, reveal: false, message: 'Label category changed. First/last opt-in and review cleared.' };
    if (action === 'reveal') return { ...clearReview(s), reveal: s.category === 'long' && value === true, message: 'Local display changed only. Schematic and model-boundary example remain fully protected illustrations. Review cleared.' };
    if (action === 'review') return { ...clearReview(s), reviewed: s.treatment !== 'unresolved' && value === true };
    if (action === 'analyze' && canAnalyze(s)) return { ...s, result: true, message: 'Analyze simulation complete. Authored local result displayed; no model, validation or transmission occurred.' };
    if (action === 'fill-review' && s.result && !s.filled) return { ...s, fillReview: value === true };
    if (action === 'fill' && s.result && s.fillReview && !s.filled) return { ...s, filled: true, fillReview: false, message: 'Fill simulated for the fictional applicant field only. No real page changed. Nothing submitted.' };
    return s;
  }
  function localMask(s) { return s.captured && s.category === 'long' && s.reveal ? 'P***n' : '***'; }
  // The only first/last fixture is the fictional non-sensitive label “Paper Lantern”.
  if (typeof module !== 'undefined') module.exports = { initial, transition, canAnalyze, localMask, boundary, destinations };
  if (typeof document === 'undefined') return;
  const byId = (id) => document.getElementById(id);
  let state = initial();
  function render() {
    const s = state;
    byId('destination').textContent = destinations[s.mode];
    byId('status').textContent = s.message;
    byId('capture').disabled = !eligible(s);
    byId('preview').hidden = !s.captured;
    byId('region').textContent = s.treatment === 'crop' ? 'Entire unverified region cropped out · illustration' : s.treatment === 'mask' ? 'Entire unverified region masked · illustration' : 'Coverage unknown · Analyze blocked';
    byId('treatment').value = s.treatment;
    byId('category').value = s.category;
    byId('reveal').checked = s.reveal;
    byId('reveal').disabled = !s.captured || s.category !== 'long';
    byId('reveal').setAttribute('aria-describedby', 'reveal-help');
    byId('local-mask').textContent = localMask(s);
    byId('boundary').textContent = s.captured ? boundary : 'Not captured. No example prepared.';
    byId('review').checked = s.reviewed;
    byId('review').disabled = !s.captured || s.treatment === 'unresolved' || s.result;
    byId('analyze').disabled = !canAnalyze(s);
    byId('stale').disabled = !s.captured;
    byId('cancel').disabled = false;
    byId('result').hidden = !s.result;
    byId('result-empty').hidden = s.result;
    byId('restored-name').textContent = s.result ? 'Mira Example — fictional person' : '';
    byId('fill-review').checked = s.fillReview;
    byId('fill-review').disabled = !s.result || s.filled;
    byId('fill').disabled = !s.result || !s.fillReview || s.filled;
    byId('fill-outcome').hidden = !s.filled;
    byId('fill-outcome').textContent = s.filled ? 'Simulated Fill only. No real field was written; manual submission has not happened.' : '';
  }
  for (const id of ['mode', 'scenario', 'treatment', 'category', 'reveal', 'review', 'fill-review']) {
    byId(id).addEventListener('change', (event) => {
      state = transition(state, id, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
      render();
    });
  }
  for (const id of ['capture', 'analyze', 'fill', 'cancel', 'stale']) {
    byId(id).addEventListener('click', () => {
      state = transition(state, id);
      render();
      if (id === 'analyze' && state.result) byId('result-heading').focus();
      if (id === 'cancel' || id === 'stale') byId('scenario').focus();
      if (id === 'fill' && state.filled) { byId('fill-outcome').tabIndex = -1; byId('fill-outcome').focus(); }
    });
  }
  render();
})();
