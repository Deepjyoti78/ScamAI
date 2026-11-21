# Stabilization issue register

Initial inspection: 21 November 2026. Existing source changes from Phase 2B are preserved as the starting point. Research/model/data hashes were captured before editing.

| Severity | Files | Evidence | Proposed repair |
|---|---|---|---|
| Critical | backend/services/url_extractor.py | getaddrinfo validation followed by urllib opener resolving the hostname again; opener inherits proxy environment | Pin numeric socket destinations, retain original Host/SNI/certificate verification, per-hop validation, bounded DNS/deadline/bytes; fail closed by default pending transport qualification |
| Critical | prediction.py, schemas.py, investigationService.ts | extraction failure returns prediction 0, Legitimate, low risk, score 0.0; frontend expects numeric score | Nullable missing output, explicit assessment/scoring statuses and common sync/stream execution |
| High | InvestigatePage.tsx, investigationService.ts | timed UI stages invent successful extraction/completion; broken streams trigger another request | Use actual stage events, require valid terminal response, no automatic resubmission; abort/timeouts |
| High | prediction.py, result page, modal | raw class-weighted output presented as fraud probability and confidence/certainty | Model score disclaimer; separate classifier, triage, attribution and rule evidence |
| High | trust_chain.py | empty text produces negative fee/credential findings; sentence-wide disclaimer can mask a subsequent demand | Not-checked empty states; clause-aware negation and direct-demand regressions |
| High | web_research.py | unbounded read/decompression, inherited proxies/redirects and exception-string exposure | Fixed provider endpoint, bounded transport, sanitized errors, explicit partial/search unavailable state |
| Medium | modal/result/form/storage | no focus trap/return; long URL handling and legacy stored failed-score migration incomplete | Keyboard/focus/live regions, recovery actions, overflow wrapping, old response normalization |
| Medium | test_model_input_contract.py | parity test writes a frozen Phase 2B evidence JSON | Redirect software-test output to pytest temporary directory; preserve frozen research |

Actual fixes, tests and remaining release limitations are recorded in the final stabilization report; this initial register is not a security certification.
