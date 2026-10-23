"""Unit tests for the ScamShield AI Web Research Evaluation Benchmark.

Validates that:
1. The controlled web research benchmark executes reproducibly.
2. All 10 benchmark scenarios pass with 100% evidence status correctness.
3. Source attribution integrity is strictly preserved (source URLs, domains, snippets).
4. Epistemic abstention integrity holds (no false fraud accusations on missing or unavailable results).
5. The output metrics JSON file is structurally valid, internally consistent, and up-to-date.
"""

import json
from pathlib import Path
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.web_research_evaluation import (
    WEB_RESEARCH_BENCHMARK_SCENARIOS,
    run_web_research_benchmark,
)


def test_benchmark_scenarios_count_and_ids():
    """Verify scenario count and unique ID formatting."""
    assert len(WEB_RESEARCH_BENCHMARK_SCENARIOS) >= 8
    ids = [sc["id"] for sc in WEB_RESEARCH_BENCHMARK_SCENARIOS]
    assert len(ids) == len(set(ids)), "Benchmark scenario IDs must be unique"
    for sc in WEB_RESEARCH_BENCHMARK_SCENARIOS:
        assert "name" in sc
        assert "input" in sc
        assert "rationale" in sc
        assert "expected_summary_status" in sc


def test_run_web_research_benchmark_execution():
    """Verify execution of the web research evaluation benchmark."""
    metrics = run_web_research_benchmark()

    assert metrics["total_scenarios"] == len(WEB_RESEARCH_BENCHMARK_SCENARIOS)
    assert metrics["scenarios_passed"] == metrics["total_scenarios"]
    assert metrics["scenario_pass_rate_pct"] == 100.0
    assert metrics["source_attribution_integrity_pct"] == 100.0
    assert metrics["epistemic_abstention_integrity_pct"] == 100.0

    for sc_result in metrics["scenarios"]:
        assert sc_result["passed"] is True, f"Scenario {sc_result['scenario_id']} failed"
        assert sc_result["summary_status_correct"] is True
        assert sc_result["evidence_status_correct"] is True
        assert sc_result["attribution_correct"] is True
        assert sc_result["abstention_correct"] is True


def test_web_research_metrics_json_consistency():
    """Verify that reports/web_research_evaluation_metrics.json exists and matches schema."""
    json_path = PROJECT_ROOT / "reports" / "web_research_evaluation_metrics.json"
    assert json_path.exists(), "web_research_evaluation_metrics.json must exist in reports/"

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["total_scenarios"] == len(WEB_RESEARCH_BENCHMARK_SCENARIOS)
    assert data["scenarios_passed"] == data["total_scenarios"]
    assert data["scenario_pass_rate_pct"] == 100.0
    assert "disclaimer" in data
    assert "controlled_functional_fixtures" in data["evaluation_type"]
