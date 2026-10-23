"""Tests for the Research Evaluation Suite and Multi-Source Evidence Benchmark.

Verifies:
  1. The labelled evidence evaluation dataset adheres to the schema across all 8 required categories.
  2. The metric calculation utilities produce correct precision, recall, F1, and rate outputs.
  3. Experimental audit functions accurately inspect dataset splitting and duplicates.
  4. The three configurations (A: ML alone, B: ML + text rules, C: Combined Trust Chain)
     execute cleanly and deliver expected relative improvements.
"""

import json
from pathlib import Path
import pytest

from ml.research_evaluation import (
    audit_experimental_setup,
    compute_binary_metrics,
    evaluate_labelled_evidence_benchmark,
)

DATA_PATH = Path("data") / "fake_job_postings.csv"
EVAL_SET_PATH = Path("data") / "labelled_evidence_eval_set.json"
MODEL_PATH = Path("models") / "baseline_model.joblib"

EXPECTED_CATEGORIES = {
    "explicit_fee_request",
    "credential_or_otp_request",
    "matching_supplied_domains",
    "mismatched_supplied_domains",
    "legitimate_third_party_recruitment",
    "missing_or_malformed_information",
    "benign_anti_scam_warnings",
    "ambiguous_postings",
}


def test_labelled_evidence_dataset_structure():
    """Verify that the labelled evidence dataset covers all 8 categories with valid ground truth."""
    assert EVAL_SET_PATH.exists(), f"Evaluation set missing at {EVAL_SET_PATH.resolve()}"

    with open(EVAL_SET_PATH, "r", encoding="utf-8") as f:
        cases = json.load(f)

    assert len(cases) >= 24, f"Expected at least 24 cases, found {len(cases)}"

    found_categories = set()
    for case in cases:
        assert "case_id" in case
        assert "category" in case
        assert "ground_truth" in case
        assert case["ground_truth"] in (0, 1)
        assert "description" in case
        assert "scenario_rationale" in case

        found_categories.add(case["category"])

    assert found_categories == EXPECTED_CATEGORIES, (
        f"Missing categories: {EXPECTED_CATEGORIES - found_categories}"
    )


def test_compute_binary_metrics_known_values():
    """Verify metric calculations against hand-calculated values."""
    # 2 TP, 1 FP, 2 TN, 0 FN
    y_true = [1, 1, 0, 0, 0]
    y_pred = [1, 1, 1, 0, 0]

    metrics = compute_binary_metrics(y_true, y_pred)

    assert metrics["sample_count"] == 5
    assert metrics["actual_fraud_count"] == 2
    assert metrics["actual_legit_count"] == 3
    assert metrics["confusion_matrix"]["true_positives"] == 2
    assert metrics["confusion_matrix"]["false_positives"] == 1
    assert metrics["confusion_matrix"]["true_negatives"] == 2
    assert metrics["confusion_matrix"]["false_negatives"] == 0

    # Precision = 2 / (2 + 1) = 0.6667
    assert pytest.approx(metrics["precision"], 0.001) == 2 / 3
    # Recall = 2 / (2 + 0) = 1.0
    assert metrics["recall_sensitivity"] == 1.0
    # F1 = 2 * (2/3 * 1) / (2/3 + 1) = 0.8
    assert pytest.approx(metrics["f1_score"], 0.001) == 0.8
    # FPR = 1 / 3 = 0.3333
    assert pytest.approx(metrics["false_positive_rate"], 0.001) == 1 / 3
    # FNR = 0 / 2 = 0.0
    assert metrics["false_negative_rate"] == 0.0


def test_audit_experimental_setup_execution():
    """Verify that dataset audit returns structured integrity data without error."""
    if not DATA_PATH.exists():
        pytest.skip("EMSCAD dataset CSV not available in data/")

    audit_data, (X_test, y_test) = audit_experimental_setup(DATA_PATH)

    assert audit_data["total_records"] == 17880
    assert audit_data["class_distribution"]["fraudulent_count"] == 866
    assert audit_data["class_distribution"]["legitimate_count"] == 17014
    assert audit_data["duplicate_statistics"]["duplicate_descriptions"] > 0
    assert len(X_test) == 3576
    assert len(y_test) == 3576
    assert len(audit_data["limitations"]) >= 3


def test_labelled_benchmark_three_configurations():
    """Verify that Configurations A, B, and C execute and show expected architectural progression."""
    if not MODEL_PATH.exists():
        pytest.skip("Trained baseline model artifact missing in models/")

    import joblib
    pipeline = joblib.load(MODEL_PATH)

    results = evaluate_labelled_evidence_benchmark(pipeline, EVAL_SET_PATH)

    assert results["case_count"] == 32
    comp = results["comparative_metrics"]
    m_a = comp["configuration_a_ml_alone"]
    m_b = comp["configuration_b_ml_plus_warning_rules"]
    m_c = comp["configuration_c_full_trust_chain"]

    # 1. Config B (with text rules) must detect more or equal fraud than Config A
    assert m_b["recall_sensitivity"] >= m_a["recall_sensitivity"]
    assert m_b["f1_score"] >= m_a["f1_score"]

    # 2. Config C (with domain cross-checks) must detect domain spoofing that A and B miss
    assert m_c["recall_sensitivity"] >= m_b["recall_sensitivity"]
    assert m_c["f1_score"] >= m_b["f1_score"]
    assert m_c["confusion_matrix"]["true_positives"] >= m_b["confusion_matrix"]["true_positives"]

    # 3. Check categories breakdown
    cats = results["category_breakdown"]
    assert "explicit_fee_request" in cats
    assert "mismatched_supplied_domains" in cats
    # Config C must catch 100% of mismatched domains
    assert cats["mismatched_supplied_domains"]["config_c_accuracy"] == 1.0
    # Config A should fail on mismatched domains with copied legit text
    assert cats["mismatched_supplied_domains"]["config_a_accuracy"] < 1.0


def test_generated_reports_exist_and_non_empty():
    """Verify that the JSON metrics and Markdown research report exist and contain valid data."""
    json_path = Path("reports") / "research_evaluation_metrics.json"
    md_path = Path("reports") / "RESEARCH_EVALUATION_REPORT.md"

    assert json_path.exists(), "research_evaluation_metrics.json was not created"
    assert md_path.exists(), "RESEARCH_EVALUATION_REPORT.md was not created"

    with open(json_path, "r", encoding="utf-8") as f:
        metrics = json.load(f)

    assert "audit_data" in metrics
    assert "emscad_test_split_results" in metrics
    assert "labelled_evidence_benchmark_results" in metrics

    with open(md_path, "r", encoding="utf-8") as f:
        text = f.read()

    assert len(text) > 2000
    assert "Configuration A" in text
    assert "Configuration B" in text
    assert "Configuration C" in text
    assert "Confusion Matrix" in text
