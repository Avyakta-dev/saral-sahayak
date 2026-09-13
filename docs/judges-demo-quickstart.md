# Judges' demo — final local rehearsal

## Open

- Web app: http://127.0.0.1:5173/
- API docs: http://127.0.0.1:8000/docs

Use API mode and English output for the first demonstration. Interface language can be changed independently. Use fictional text only; do not enter personal identifiers.

## Suggested sequence

1. Show the live readiness status. Explain that this checks configuration and corpus structure, not correctness.
2. Paste the synthetic text below, review it, then explicitly approve analysis.
3. Show actual file/section reads in the activity panel.
4. If a supported answer is returned, open Source and show exact headings/line ranges, then Next steps and Draft.
5. If the response clarifies, abstains or errors, explain that unsupported guidance is withheld. Do not present a sample as a live answer.
6. Optionally show the clearly labelled examples to demonstrate UI behavior independently of model availability.

### Supported synthetic case

Synthetic example: my Form 19 remark says the name does not match Aadhaar. My UAN profile uses an initial for my middle name, while Aadhaar spells that same middle name out. Aadhaar has the correct name. Why might this fail?

### Clarification case

Synthetic example: my claim says only 'KYC not verified'. I uploaded the details, so I do not know what is pending. What should I fix?

## Latest local verification

After adding explicit root-relative tool-input paths alongside unchanged canonical citation paths, the synthetic supported English case returned success in **11.38 seconds**, using two provider calls and three citations. Its action preserved the verification prerequisite and same-day resubmission restriction. This is a single successful rehearsal, not a latency or policy-accuracy guarantee. Full Python regression: **1,451 passed**. Frontend format/build/unit validation: **917 passed**. Live image controls are disabled when capabilities advertise text only; examples still allow local image previews.

## Say clearly

- Recommendations come from bounded reads of the public EPFO Markdown corpus; this is not a live government integration.
- Citations expose provenance, not independent policy verification.
- The six-language interface exists; native translation and generated-answer quality are not certified.
- Image analysis is unavailable in the current local configuration. The correct R2 S3 endpoint and verified bucket lifecycle/CORS/privacy are still required. Do not enable the lifecycle flag to bypass this gate.
- Provider latency and model choices vary. Current-model evidence and failures are recorded in [demo-acceptance-status.md](demo-acceptance-status.md).

## Local restart if required

From the repository root:

```sh
LLM_STREAM=true ANALYSIS_REQUEST_SECONDS=60 LLM_TIMEOUT_SECONDS=45 \
  uv run --no-sync uvicorn backend.main:create_app --factory --host 127.0.0.1 --port 8000
```

In another terminal:

```sh
npm --prefix frontend run dev
```

Do not start a second server over an occupied port or terminate unrelated processes. No public tunnel or deployment is necessary for a laptop demonstration.
