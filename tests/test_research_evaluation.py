"""Tests for the Research Evaluation Suite and Multi-Source Evidence Benchmark.

Verifies:
  1. Exact confusion matrix formulas (Accuracy, Precision, Recall, F1, FPR, FNR).
  2. Consistency between confusion matrix counts and reported metrics in JSON & Markdown artifacts.
  3. Strict zero-leakage duplicate-group separation between train and test splits.
  4. Reproducibility of duplicate-aware and random splits.
  5. Deterministic text normalization and explicit audit of conflicting duplicate labels.
  6. Architectural progression of Configurations A, B, and C across functional test categories.
  7. Clear separation of curated functional benchmarks from real-world generalization claims.
"""

import json
from pathlib import Path
import pytest

from ml.research_evaluation import (
    audit_experimental_setup,
    compute_binary_metrics,
    create_duplicate_aware_split,
    evaluate_labelled_evidence_benchmark,
    normalize_and_group_postings,
)

DATA_PATH = Path("data") / "fake_job_postings.csv"
EVAL_SET_PATH = Path("data") / "labelled_evidence_eval_set.json"
MODEL_PATH = Path("models") / "baseline_model.joblib"
METRICS_JSON_PATH = Path("reports") / "research_evaluation_metrics.json"
REPORT_MD_PATH = Path("reports") / "RESEARCH_EVALUATION_REPORT.md"

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


# =====================================================================
# 1. Metric Formula & Confusion Matrix Derivation Verification
# =====================================================================

def test_confusion_matrix_accuracy_derivation():
    """Verify that Accuracy = (TN + TP) / Total across all benchmark configurations."""
    # Historical EMSCAD Random Split - Config A
    # TN=3341, FP=62, FN=15, TP=158, Total=3576
    y_true_a = [0] * 3341 + [0] * 62 + [1] * 15 + [1] * 158
    y_pred_a = [0] * 3341 + [1] * 62 + [0] * 15 + [1] * 158
    m_a = compute_binary_metrics(y_true_a, y_pred_a)
    assert m_a["sample_count"] == 3576
    assert m_a["confusion_matrix"]["true_negatives"] == 3341
    assert m_a["confusion_matrix"]["false_positives"] == 62
    assert m_a["confusion_matrix"]["false_negatives"] == 15
    assert m_a["confusion_matrix"]["true_positives"] == 158
    # 3499 / 3576 = 0.97846756... (~97.85%)
    assert pytest.approx(m_a["accuracy"], 1e-6) == 3499 / 3576
    assert round(m_a["accuracy"] * 100, 2) == 97.85

    # Historical EMSCAD Random Split - Config B
    # TN=3332, FP=71, FN=15, TP=158, Total=3576
    y_true_b = [0] * 3332 + [0] * 71 + [1] * 15 + [1] * 158
    y_pred_b = [0] * 3332 + [1] * 71 + [0] * 15 + [1] * 158
    m_b = compute_binary_metrics(y_true_b, y_pred_b)
    # 3490 / 3576 = 0.97595078... (~97.60%)
    assert pytest.approx(m_b["accuracy"], 1e-6) == 3490 / 3576
    assert round(m_b["accuracy"] * 100, 2) == 97.60

    # Duplicate-Aware Grouped Split - Config A
    # TN=3326, FP=77, FN=26, TP=147, Total=3576
    y_true_ga = [0] * 3326 + [0] * 77 + [1] * 26 + [1] * 147
    y_pred_ga = [0] * 3326 + [1] * 77 + [0] * 26 + [1] * 147
    m_ga = compute_binary_metrics(y_true_ga, y_pred_ga)
    # 3473 / 3576 = 0.9711968... (~97.12%)
    assert pytest.approx(m_ga["accuracy"], 1e-6) == 3473 / 3576
    assert round(m_ga["accuracy"] * 100, 2) == 97.12

    # Duplicate-Aware Grouped Split - Config B
    # TN=3315, FP=88, FN=25, TP=148, Total=3576
    y_true_gb = [0] * 3315 + [0] * 88 + [1] * 25 + [1] * 148
    y_pred_gb = [0] * 3315 + [1] * 88 + [0] * 25 + [1] * 148
    m_gb = compute_binary_metrics(y_true_gb, y_pred_gb)
    # 3463 / 3576 = 0.9684004... (~96.84%)
    assert pytest.approx(m_gb["accuracy"], 1e-6) == 3463 / 3576
    assert round(m_gb["accuracy"] * 100, 2) == 96.84


def test_metric_formulas_precision_recall_f1_fpr_fnr():
    """Verify precision, recall, F1, FPR, and FNR exact formulas under various test matrices."""
    # TN=80, FP=20, FN=10, TP=90, Total=200
    y_true = [0] * 100 + [1] * 100
    y_pred = [0] * 80 + [1] * 20 + [0] * 10 + [1] * 90
    m = compute_binary_metrics(y_true, y_pred)

    cm = m["confusion_matrix"]
    tn, fp, fn, tp = cm["true_negatives"], cm["false_positives"], cm["false_negatives"], cm["true_positives"]
    assert tn == 80 and fp == 20 and fn == 10 and tp == 90

    # Accuracy = (80 + 90) / 200 = 0.85
    assert m["accuracy"] == 0.85
    # Precision = 90 / (90 + 20) = 90 / 110 = 0.818181...
    assert pytest.approx(m["precision"], 1e-6) == 90 / 110
    # Recall = 90 / (90 + 10) = 0.90
    assert m["recall_sensitivity"] == 0.90
    # F1 = 2 * (90/110 * 0.90) / (90/110 + 0.90) = 0.8571428...
    expected_f1 = 2 * (m["precision"] * m["recall_sensitivity"]) / (m["precision"] + m["recall_sensitivity"])
    assert pytest.approx(m["f1_score"], 1e-6) == expected_f1
    # FPR = FP / (FP + TN) = 20 / 100 = 0.20
    assert m["false_positive_rate"] == 0.20
    # FNR = FN / (FN + TP) = 10 / 100 = 0.10
    assert m["false_negative_rate"] == 0.10


def test_metric_formulas_zero_division_resilience():
    """Verify that zero division cases (e.g. no positives predicted or no actual fraud) return 0.0."""
    # All negatives, model predicts all negatives
    y_true = [0, 0, 0]
    y_pred = [0, 0, 0]
    m = compute_binary_metrics(y_true, y_pred)
    assert m["accuracy"] == 1.0
    assert m["precision"] == 0.0
    assert m["recall_sensitivity"] == 0.0
    assert m["f1_score"] == 0.0
    assert m["false_positive_rate"] == 0.0
    assert m["false_negative_rate"] == 0.0


# =====================================================================
# 2. Metric / Report Consistency Across Artifacts
# =====================================================================

def test_metrics_json_internal_consistency():
    """Verify that every metric in research_evaluation_metrics.json mathematically agrees with its confusion matrix."""
    assert METRICS_JSON_PATH.exists(), f"Metrics JSON missing at {METRICS_JSON_PATH.resolve()}"

    with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Helper to check consistency of any metric block
    def assert_block_consistency(block, block_name):
        cm = block["confusion_matrix"]
        tn = cm["true_negatives"]
        fp = cm["false_positives"]
        fn = cm["false_negatives"]
        tp = cm["true_positives"]
        total = tn + fp + fn + tp

        assert block["sample_count"] == total, f"{block_name}: total mismatch"
        assert block["actual_fraud_count"] == tp + fn, f"{block_name}: fraud count mismatch"
        assert block["actual_legit_count"] == tn + fp, f"{block_name}: legit count mismatch"

        expected_acc = (tp + tn) / total if total > 0 else 0.0
        assert pytest.approx(block["accuracy"], 1e-5) == expected_acc, f"{block_name}: accuracy mismatch"

        expected_prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        assert pytest.approx(block["precision"], 1e-5) == expected_prec, f"{block_name}: precision mismatch"

        expected_rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        assert pytest.approx(block["recall_sensitivity"], 1e-5) == expected_rec, f"{block_name}: recall mismatch"

        if expected_prec + expected_rec > 0:
            expected_f1 = 2 * (expected_prec * expected_rec) / (expected_prec + expected_rec)
            assert pytest.approx(block["f1_score"], 1e-5) == expected_f1, f"{block_name}: F1 mismatch"

        expected_fpr = fp / (tn + fp) if (tn + fp) > 0 else 0.0
        assert pytest.approx(block["false_positive_rate"], 1e-5) == expected_fpr, f"{block_name}: FPR mismatch"

        expected_fnr = fn / (tp + fn) if (tp + fn) > 0 else 0.0
        assert pytest.approx(block["false_negative_rate"], 1e-5) == expected_fnr, f"{block_name}: FNR mismatch"

    # 1. Random split
    r_res = data["emscad_random_split_results"]
    assert_block_consistency(r_res["configuration_a_ml_alone"], "Random Split Config A")
    assert_block_consistency(r_res["configuration_b_ml_plus_warning_rules"], "Random Split Config B")

    # 2. Duplicate-aware grouped split
    g_res = data["emscad_duplicate_aware_split_results"]
    assert_block_consistency(g_res["configuration_a_ml_alone"], "Grouped Split Config A")
    assert_block_consistency(g_res["configuration_b_ml_plus_warning_rules"], "Grouped Split Config B")

    # 3. Functional benchmark
    c_res = data["curated_functional_benchmark_results"]["comparative_metrics"]
    assert_block_consistency(c_res["configuration_a_ml_alone"], "Functional Config A")
    assert_block_consistency(c_res["configuration_b_ml_plus_warning_rules"], "Functional Config B")
    assert_block_consistency(c_res["configuration_c_full_trust_chain"], "Functional Config C")


def test_markdown_report_numbers_match_json():
    """Verify that numbers cited in RESEARCH_EVALUATION_REPORT.md match the JSON metrics."""
    assert REPORT_MD_PATH.exists(), f"Markdown report missing at {REPORT_MD_PATH.resolve()}"

    with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)

    with open(REPORT_MD_PATH, "r", encoding="utf-8") as f:
        report_text = f.read()

    r_a = metrics["emscad_random_split_results"]["configuration_a_ml_alone"]
    r_b = metrics["emscad_random_split_results"]["configuration_b_ml_plus_warning_rules"]
    g_a = metrics["emscad_duplicate_aware_split_results"]["configuration_a_ml_alone"]
    g_b = metrics["emscad_duplicate_aware_split_results"]["configuration_b_ml_plus_warning_rules"]

    # Verify expected formatted percentage strings are in the report
    assert f"{r_a['accuracy'] * 100:.2f}%" in report_text  # "97.85%"
    assert f"{r_b['accuracy'] * 100:.2f}%" in report_text  # "97.60%"
    assert f"{g_a['accuracy'] * 100:.2f}%" in report_text  # "97.12%"
    assert f"{g_b['accuracy'] * 100:.2f}%" in report_text  # "96.84%"

    # Verify exact confusion matrix numbers appear
    assert str(r_a["confusion_matrix"]["true_negatives"]) in report_text
    assert str(r_a["confusion_matrix"]["false_positives"]) in report_text
    assert str(r_a["confusion_matrix"]["true_positives"]) in report_text


# =====================================================================
# 3. Duplicate-Aware Evaluation & Group Separation
# =====================================================================

def test_duplicate_aware_split_zero_leakage():
    """Verify that create_duplicate_aware_split guarantees zero overlapping groups across splits."""
    if not DATA_PATH.exists():
        pytest.skip("EMSCAD dataset not found")

    import pandas as pd
    from ml.preprocess import prepare_training_data

    df = pd.read_csv(DATA_PATH)
    groups, _ = normalize_and_group_postings(df)
    X, y = prepare_training_data(df, target_col="fraudulent")

    train_idx, test_idx, stats = create_duplicate_aware_split(X, y, groups, random_state=42)

    train_groups = set(groups.iloc[train_idx])
    test_groups = set(groups.iloc[test_idx])
    overlap = train_groups.intersection(test_groups)

    assert len(overlap) == 0, f"Found {len(overlap)} overlapping groups across splits"
    assert stats["cross_split_overlapping_groups"] == 0
    assert len(train_idx) + len(test_idx) == len(df)
    # Check that fraud rate is preserved closely (~4.84%)
    assert abs(stats["train_fraud_prevalence_pct"] - stats["test_fraud_prevalence_pct"]) < 0.5


def test_split_reproducibility():
    """Verify that split indices are 100% identical when using the same random seed."""
    if not DATA_PATH.exists():
        pytest.skip("EMSCAD dataset not found")

    import pandas as pd
    from ml.preprocess import prepare_training_data

    df = pd.read_csv(DATA_PATH)
    groups, _ = normalize_and_group_postings(df)
    X, y = prepare_training_data(df, target_col="fraudulent")

    train_1, test_1, _ = create_duplicate_aware_split(X, y, groups, random_state=42)
    train_2, test_2, _ = create_duplicate_aware_split(X, y, groups, random_state=42)

    assert train_1 == train_2
    assert test_1 == test_2


# =====================================================================
# 4. Conflicting Duplicate Label Detection
# =====================================================================

def test_conflicting_duplicate_label_detection():
    """Verify that conflicting label groups are explicitly identified and recorded."""
    if not DATA_PATH.exists():
        pytest.skip("EMSCAD dataset not found")

    import pandas as pd
    df = pd.read_csv(DATA_PATH)

    _, audit_info = normalize_and_group_postings(df)

    assert audit_info["conflicting_groups_count"] == 1
    conflict = audit_info["conflicting_groups"][0]
    assert conflict["total_occurrences"] == 3
    assert conflict["fraud_occurrences"] == 1
    assert conflict["legit_occurrences"] == 2

    # Check the specific conflicting job IDs
    sample_ids = {r["job_id"] for r in conflict["sample_records"]}
    assert sample_ids == {9139, 11890, 15237}

    # Verify that job 9139 is fraud and 11890, 15237 are legit
    job_labels = {r["job_id"]: r["fraudulent"] for r in conflict["sample_records"]}
    assert job_labels[9139] == 1
    assert job_labels[11890] == 0
    assert job_labels[15237] == 0


# =====================================================================
# 5. Separation of Curated Functional Tests & Real-World Claims
# =====================================================================

def test_functional_benchmark_separation_and_disclaimer():
    """Verify that the 32-case functional benchmark is strictly documented as a curated fixture suite."""
    with open(METRICS_JSON_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)

    curated = metrics["curated_functional_benchmark_results"]
    assert curated["benchmark_type"] == "manually_curated_functional_benchmark"
    assert "disclaimer" in curated["benchmark_disclaimer"].lower()
    assert curated["case_count"] == 32

    # Check that Config C on EMSCAD is marked as not feasible due to missing domain fields
    r_split = metrics["emscad_random_split_results"]
    assert "configuration_c_dataset_feasibility_note" in r_split
    assert "cannot be evaluated" in r_split["configuration_c_dataset_feasibility_note"].lower()


def test_labelled_evidence_benchmark_execution():
    """Verify functional progression of Configurations A, B, and C on the 32-case suite."""
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

    # Config B must detect more or equal fraud than Config A on the designed cases
    assert m_b["recall_sensitivity"] >= m_a["recall_sensitivity"]
    # Config C must catch lookalike domains that A and B cannot detect
    assert m_c["recall_sensitivity"] >= m_b["recall_sensitivity"]
    assert m_c["confusion_matrix"]["true_positives"] >= m_b["confusion_matrix"]["true_positives"]

    # Categories breakdown check
    cats = results["category_breakdown"]
    assert cats["mismatched_supplied_domains"]["config_c_accuracy"] == 1.0
    assert cats["mismatched_supplied_domains"]["config_a_accuracy"] < 1.0
