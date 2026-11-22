# ScamShield AI

A historical EMSCAD text-classification prototype with separate rule indicators, domain observations and optional search corroboration. The saved class-weighted Logistic Regression output is an **uncalibrated model score, not a verified probability of fraud**. A lower score does not authenticate a job or recruiter.

The supported verification scope is a **local, controlled pasted-text demonstration**. Arbitrary URL retrieval is disabled by default. Public deployment is not cleared; see [deployment readiness](engineering/research_evidence/DEPLOYMENT_READINESS.md) and [remaining blockers](engineering/research_evidence/REMAINING_BLOCKERS.md).

## Run the controlled demonstration

Use the existing trusted `models/baseline_model.joblib`; running the website does not require the raw CSV or another training run. Do not run the historical training/evaluation scripts to start the application.

Verified runtime: Python 3.12.10 and Node 22.20.0. The current backend uses Python 3.11+ APIs; installed Vite 8 requires Node `^20.19.0 || >=22.12.0`. Exact tested package versions are recorded in `engineering/research_evidence/evidence/runtime_python.json` and `runtime_node.json`. The Python requirements currently specify ranges rather than a locked model-serving environment; do not assume a fresh arbitrary environment is artifact-compatible.

With repository dependencies already available, open two terminals in the repository root:

```powershell
# Terminal 1: loopback-only API; ignores .env, clears provider keys,
# disables URL fetching and blocks external network connections/model fitting.
.\.venv\Scripts\python.exe -X utf8 engineering/research_evidence/serve_demo.py --port 8177
```

```powershell
# Terminal 2: the API address is public frontend configuration, not a secret.
$env:VITE_API_BASE_URL = 'http://127.0.0.1:8177'
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open [the website](http://127.0.0.1:5173/investigate) or [local API documentation](http://127.0.0.1:8177/docs). Paste a description, optionally add metadata and run an investigation. The URL tab reports server capability before submission and offers pasted-text analysis. Press Escape or Cancel to abort the browser request; input is preserved for retry. Browser cancellation does not forcibly stop a Python worker already executing.

If dependencies need installation in a separately approved environment, use the checked-in Node lockfile and a model-compatible Python environment. Installing or upgrading packages was not part of this verification.

## API behavior

| Endpoint | Actual purpose |
|---|---|
| `GET /health` | Process liveness and `url_fetch_enabled`; not a guarantee inference will succeed |
| `GET /model/status` | Artifact file availability; not a comprehensive readiness check or new evaluation |
| `POST /api/investigations/analyze` | JSON assessment |
| `POST /api/investigations/analyze/stream` | SSE stage updates and terminal assessment; no `/api/investigations/stream` alias |

Successful scoring returns `analysis_status=completed`, `scoring_status=scored`, a model score, classifier output and a separate operational tier. Extraction failure returns `unable_to_assess`; model/inference failure returns `not_scored`. Both non-completed states contain null scores/prediction/label and `risk_level=unknown`, never a fabricated 0%/safe verdict. Ordinary unavailable assessments use HTTP 200; clients must inspect the payload. Malformed input uses 422, oversized body 413 and incomplete upload 408. Unexpected route exceptions can still use 500.

SSE `complete` means the transport finished delivering an assessment, not that the assessment succeeded. A disconnected or malformed stream cannot be silently treated as success. No automatic second analysis request is made. See the [API contract](engineering/research_evidence/API_CONTRACT.md) for fields, limits and examples.

## Configuration, privacy and deployment

See [.env.example](.env.example), [environment documentation](engineering/research_evidence/ENVIRONMENT.md) and [deployment guidance](engineering/research_evidence/DEPLOYMENT_GUIDANCE.md). Do not overwrite an existing private `.env` with the example. Normal `uvicorn backend.main:app` startup may load the root `.env`; the controlled-demo launcher deliberately does not.

- `VITE_API_BASE_URL` is compiled into the browser bundle. Do not put secrets in any `VITE_` variable. Changing a served API URL requires rebuilding the frontend.
- `MODEL_PATH` points only to a trusted, compatible local artifact. Do not accept uploaded/untrusted pickle/joblib models.
- Keep `SCAMSHIELD_ENABLE_URL_FETCH=false`. The transport is not cleared for public opt-in despite prior offline tests.
- Tavily/Brave keys are backend-only. Without them, search is `not_configured`. No live provider verification was performed. A previously exposed provider credential still requires owner rotation; no external credentials were changed.
- No analysis database is implemented. The frontend keeps results, including supplied text/metadata, in browser `sessionStorage`; this is not encrypted storage or a server-wide deletion guarantee. Do not use real applicant passwords, OTPs or other personal secrets in demonstrations.
- No application-level rate limiter, authentication gateway or production error-monitoring service is configured. Body/time limits and CORS are not substitutes for these protections. Do not publish this API unchanged as a public production service.

`vercel.json` configures a static Vite SPA fallback to `index.html`. It does not provision the FastAPI process, model file, production API origin or SSE reverse-proxy behavior. A static page build succeeding is not an end-to-end deployment test.

## Evidence and checks

Current verification artifacts are under [engineering/research_evidence](engineering/research_evidence): functional matrix, actual results, genuine desktop/mobile screenshots and verified architecture/workflow diagrams. Authored software fixtures are not a new recruitment dataset, independent accuracy validation or calibration study.

```powershell
# Narrow documentation/API checks; no training or external traffic
.\.venv\Scripts\python.exe -X utf8 -m pytest engineering/research_evidence/test_contract_docs.py -q

# Static source checks
npx oxlint src
$env:VITE_API_BASE_URL = 'http://127.0.0.1:8177'
npm run build

# Windows/local Chrome E2E evidence harness; see ACTUAL_TEST_RESULTS.md
node engineering/research_evidence/capture_evidence.mjs
```

The historical experiments and scientific conclusions remain frozen. Raw data redistribution rights remain unresolved; no raw dataset is bundled by this evidence phase. Dataset/model/manuscript hashes and before/after integrity checks are saved with the new evidence. No automatic commit, push or deployment is performed.
