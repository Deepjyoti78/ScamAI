# Stabilization test report

Final software checks on 21 November 2026; no fitting or research benchmark rerun.

| Check | Final result | Evidence |
|---|---|---|
| Affected Python regression suite | 163 passed, 0 failed, 0 skipped | `evidence/backend_tests.xml`, `backend_tests.log` |
| Frontend contract/rendered-route tests | 8 passed, 0 failed, 0 skipped | `evidence/frontend_tests.log` |
| Real Chromium browser checks | 5 passed, 0 failed; 0 runtime exceptions | `evidence/browser_tests.json`, mobile PNGs |
| Production TypeScript/Vite build | Passed | `evidence/build.log` |
| Scoped source lint | Passed, no source diagnostics | `evidence/lint_src.log` |
| Mechanical changed-UI detector | No findings (`[]`) | `evidence/ui_detector.json` |
| Protected-artifact integrity | See final hash verification | `evidence/integrity_after.json` |

## Commands

```powershell
.venv/Scripts/python.exe -X utf8 engineering/stabilization/run_checks.py tests/test_stabilization.py tests/test_model_input_contract.py tests/test_stream_endpoint.py tests/test_url_extraction.py tests/test_evidence_checks.py tests/test_web_research.py tests/test_cors.py -q --tb=short --junitxml=engineering/stabilization/evidence/backend_tests.xml
node --test engineering/stabilization/frontend_checks.mjs
npx oxlint src
npm run build
node engineering/stabilization/browser_checks.mjs
git diff --check
```

The local browser build used `VITE_API_BASE_URL=http://127.0.0.1:8127`, an isolated test API; no environment file was changed. This build is **not a production deployment configuration**. Configure a reviewed HTTPS API endpoint for any later deployment. Chrome needed execution outside the managed sandbox after its sandboxed crash helper failed. The browser harness hosts the built bundle locally, clears provider credentials, disables URL fetching and blocks external DNS. Generated browser profiles and frontend test transpilation are excluded from version control.

## Coverage and practical limits

Python: DNS rebinding across redirects, numeric connection pinning, IPv4/IPv6 mixed-answer rejection, Host/SNI/certificate behavior, proxies, unsafe schemes/credentials/encodings/ports, redirects/downgrades/hop cap, DNS/body deadlines, response/extraction/compression limits, API upload size, missing/failed model, extraction failure/empty success, sync/SSE parity, canonical input and fourteen-case saved-score/attribution reference parity, negations, missing evidence and optional provider failure. The test runner blocks model fits and unmocked external transports; local asyncio socketpair traffic is allowed.

Frontend: strict assessment-state validation, fragmented CRLF/UTF-8 SSE parsing, missing/error/malformed terminal events, no automatic duplicate request, abort, legacy failed-record migration, accessible unavailable-result alert/recovery and model-score versus triage rendering. Tests use the existing TypeScript compiler and Node test runner; no new test dependency was installed.

Browser: real pasted-text model inference, modal keyboard focus trap, 375 px mobile result without horizontal overflow, long-URL unavailable state with no zero/safe verdict, Escape recovery preserving input, and cancellation of an intercepted active SSE request restoring the form. The first item combines model inference and focus checks; five cases total. Desktop viewport was also exercised. Screenshots were visually inspected. This is not a full assistive-technology audit or a remote production test.

Existing fixtures were updated where the transport boundary or truthful result contract intentionally changed: old urllib-opener mocks no longer represented actual job fetching, search mocks now target the fixed-provider transport helper, and failed extraction assertions require null/unknown rather than legacy 0.0. Low-level adversarial socket tests independently exercise the replacement transport.

Initial setup and intermediate test failures were resolved. A generated 2 MiB parameter name exceeded Windows environment limits; explicit short IDs fixed it. That initial traceback was sanitized because it included environment values. No failed or skipped final test is concealed by these counts. The frozen research evidence was not used as a writable test-output directory.

Source-only GitHub checkouts intentionally omit the private dataset and archived research reference files. Dataset-dependent archived parity tests skip with an explicit reason when those inputs are absent; ordinary preprocessing and stabilization tests remain available. The local post-packaging focused check passed 76 tests without skips.
