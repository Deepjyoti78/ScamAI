# Website stabilization and functional repair

Completed 21 November 2026. No model training, historical evaluation rerun, new dataset, manuscript edit or deployment. The previously modified canonical five-field preprocessing remains the starting contract.

## Result and release decision

Pasted-text analysis, score explanations, Trust Chain checks, optional search failure handling, result rendering and cancellation have been repaired and tested. Failed extraction, unavailable models and inference failures no longer produce a legitimate/low/zero-score sentinel.

**Arbitrary URL fetching remains disabled by default. Public deployment is blocked for the full URL-enabled service.** The replacement transport passes offline destination-pinning and adversarial tests, but that does not certify unrestricted production fetching. Do not enable `SCAMSHIELD_ENABLE_URL_FETCH=true` on a public deployment until independent transport/security qualification and deployment egress/abuse controls have been reviewed. The shipped default returns an explicit unavailable state and supports manual pasted text.

No critical arbitrary-fetch path is intentionally enabled by default. This is a fail-closed release configuration, not a claim that the application has received a production penetration test. No real-world SSRF probing was performed. Public HTTPS/reverse-proxy behavior, provider accounts, external job-board access, deployment rate limits and operational monitoring were not validated in this local repair.

## Before and after

| Scenario | Before | After, both sync and SSE |
|---|---|---|
| URL fetch blocked/timeout/empty/unsupported | `prediction:0`, `label:Legitimate`, `risk_level:low`, score `0.0` | `analysis_status:unable_to_assess`, `scoring_status:not_scored`, `risk_level:unknown`; prediction, label, model score and legacy score/confidence are null; explicit extraction code |
| Model missing or inference exception | Exception path and diverging stream behavior; exception text could reach client | `analysis_status:not_scored`, no score or safety verdict, sanitized error code; failed/skipped stages |
| Valid low score | Presented as probability and certainty | Same saved-model output and thresholds; labeled uncalibrated model score, separate classifier output and operational triage |
| Optional search fails | Potentially partial findings summarized as completed; raw exception strings | `search_unavailable`, retained partial evidence if any, explicit limitations; no fraud conclusion from failure |
| Interrupted/malformed stream | Could silently repeat the request through HTTP fallback | Reject incomplete/invalid terminal response, no automatic duplicate submission or saved success; explicit retry |
| Loading cards | Timed animation could manufacture success before response | Actual backend stage updates; failed stages preserved, dependent stages skipped |
| Old stored extraction-failure record | Could show a low/zero score | Migrated to unknown/unassessed; rerun requested |
| Example cards without scores | Invented percentages from risk tier | “Example”; no synthesized model score |

HTTP request validation remains 422; oversized request bodies return 413 and incomplete body upload 408. Ordinary assessment unavailability uses a structured HTTP 200 result whose `analysis_status` determines success. SSE `complete` means transport completion, **not** assessment success; its payload carries the same contract. Legacy clients must support nullable fields and inspect the new states. Existing score field names remain compatibility aliases, not probability/reliability claims.

## Security implementation

- HTTP/HTTPS allowlist; credential, malformed authority/port, control/ambiguous encoding and private/internal target rejection.
- All DNS answers must be acceptable, including mixed A/AAAA responses. Non-global, mapped/transition IPv6 and known metadata targets are rejected.
- Actual sockets connect directly to approved numeric sockaddr values; there is no second hostname resolution between approval and connect. Original hostname is retained for HTTP Host and default verified TLS/SNI; certificate failures are not bypassed.
- No urllib/environment proxies in job retrieval; each redirect is validated and resolved anew, with three-hop cap and HTTPS downgrade rejection. No cookies/auth headers are forwarded.
- Bounded DNS worker admission and resolver wait; one monotonic deadline across redirects, socket shutdown timer for stalled headers/body, connect timeout, 2 MiB response ceiling, explicit HTML type requirement. Compressed job pages are rejected, avoiding automatic decompression bombs. Extracted text over 15,000 characters is rejected instead of silently truncated/scored.
- API request bodies are bounded at 128 KiB before JSON parsing, with a five-second body deadline; individual fields have limits. The browser bounds SSE buffering and overall analysis wait.
- Optional search uses fixed provider endpoints, no inherited proxies or redirects, bounded compressed/decoded reads and sanitized errors. It retrieves snippets, not arbitrary result-page URLs.

Design references: [Python HTTP client documentation](https://docs.python.org/3/library/http.client.html) and [OWASP SSRF prevention guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html). Implementation behavior was checked against local Python 3.12 and offline sockets; references do not certify the implementation. OS DNS work already executing cannot be forcibly cancelled; admission is bounded and caller wait expires. That residual operational limitation is another reason to keep public URL mode off pending qualification.

## Trust Chain and score interpretation

The saved model, parameters, coefficients, canonical field ordering, classification cutoff 0.50 and operational score cutoffs 0.30/0.60 were preserved. Linear feature attribution remains a model association, not factual fraud evidence or a new explanation method. Arithmetic/score parity is covered by the existing fourteen-case reference test, now writing its software-check output only to a temporary test directory.

Empty fee/credential input yields `not_checked`. Negation handling now covers common contractions, must-not instructions and fee disclaimers; contrastive clauses are separated so a disclaimer does not automatically mask a subsequent demand. These remain heuristic checks, not comprehensive language understanding. Nonmatching recruiter/application domains can trigger review but are explicitly qualified; an unfamiliar vendor is not proof of fraud. Missing metadata remains not checked/insufficient information. The author-written 32-case benchmark was not rerun or presented as independent accuracy evidence.

## Frontend repairs

Preserved the cream/ink palette, typography, cards and page structure. Removed the confidence/certainty metric, invented demo percentages and timed fake stages. Result views separate model score, attribution, operational triage, textual indicators, domain observations and optional search. Failed states provide retry/manual-input recovery; inputs survive dismissal/cancellation. Modal focus is trapped and restored, Escape cancels, stage changes are announced, long URLs wrap, and mobile overflow was checked. Old/corrupt stored records are handled conservatively. Product-facing search status no longer instructs job seekers to configure API keys. A submission notice explains server processing, browser-session storage and optional search inputs.

## Validation

Final counts and exact commands are in [TEST_REPORT.md](D:/ScamAI/engineering/stabilization/TEST_REPORT.md). The affected Python suite, frontend contract/rendering tests, local real-browser checks, production build, scoped lint and changed-UI detector were run. Browser checks used an isolated API with provider credentials cleared and arbitrary URL fetching off; external DNS was blocked in the browser. No full research benchmark or training suite was executed.

An initial Windows pytest setup error included an environment credential in its traceback. The saved traceback was redacted, subsequent checks cleared provider credentials and dotenv loading, and no application logging of that credential was added. **Rotate the affected search-provider credential before further use or deployment; this repair did not rotate or edit credentials.** Earlier failed test attempts and browser-environment setup failures were corrected; they are not represented as passed runs.

## Integrity and limitations

See [integrity_after.json](D:/ScamAI/engineering/stabilization/evidence/integrity_after.json) for authenticated before/after counts and hashes. Frozen data, model, reports, all research/publication phases and manuscripts were preserved. The existing Phase 2B parity test previously rewrote an old evidence JSON; that write now targets pytest's temporary directory. Pre-existing source changes were captured in `evidence/preexisting_changes.patch` and retained; no Git commit/push was made.

Remaining limits: no live external fetch/provider acceptance testing, no independent transport certification, no claim of calibrated fraud probability or current-scam detection accuracy, no production deployment validation. Arbitrary URL mode is intentionally unavailable by default. Review the issue register and evidence before considering any public release.
