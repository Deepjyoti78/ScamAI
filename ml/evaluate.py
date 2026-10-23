"""Comprehensive model evaluation script for ScamShield AI.

Evaluates the trained baseline model on the test split, focusing heavily on
minority class (fraudulent) detection metrics, precision-recall trade-offs,
and error diagnostics.

Usage:
    python ml/evaluate.py [--model-path models/baseline_model.joblib] [--data-path data/fake_job_postings.csv]
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Ensure Windows consoles don't crash on cp1252 stdout encoding
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Ensure project root is in sys.path when executed as a script (e.g., python ml/evaluate.py)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Local imports
from ml.inspect_data import locate_dataset
from ml.preprocess import prepare_training_data


RANDOM_STATE = 42
DEFAULT_MODEL_PATH = Path("models") / "baseline_model.joblib"
DEFAULT_REPORT_DIR = Path("reports")


def evaluate_model(
    model_path: Path = DEFAULT_MODEL_PATH,
    data_path: Path = None,
) -> dict:
    """Load trained model and evaluate comprehensively on holdout test data."""
    if not model_path.exists():
        print("\n" + "=" * 65)
        print("[ERROR] NO TRAINED MODEL FOUND")
        print("=" * 65)
        print(f"Looked for model at: {model_path.resolve()}")
        print("\nPlease train the model first by running:")
        print("    python ml/train.py")
        print("=" * 65 + "\n")
        sys.exit(1)

    try:
        import joblib
        import pandas as pd
        from sklearn.metrics import (
            average_precision_score,
            classification_report,
            confusion_matrix,
            f1_score,
            precision_score,
            recall_score,
            roc_auc_score,
        )
        from sklearn.model_selection import train_test_split
    except ImportError as e:
        print(f"\n[ERROR] Missing required Python dependency: {e.name}")
        print("Please install requirements using:")
        print("    pip install -r requirements.txt\n")
        sys.exit(1)

    print("=" * 70)
    print("ScamShield AI -- Model Evaluation & Diagnostics")
    print(f"Model:   {model_path.resolve()}")
    print("=" * 70)

    # 1. Load pipeline
    print("\n[Step 1/4] Loading trained pipeline artifact...")
    pipeline = joblib.load(model_path)
    print("   Pipeline successfully loaded into memory.")

    # 2. Load dataset
    print("\n[Step 2/4] Loading dataset and reconstructing holdout test set...")
    df = pd.read_csv(data_path)
    X, y = prepare_training_data(df, target_col="fraudulent")

    # Reconstruct the exact same test split using fixed seed
    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y,
    )
    print(f"   Test set size: {len(X_test):,} postings")
    print(f"   Actual Fraud:  {y_test.sum():,} | Actual Legit: {(y_test == 0).sum():,}")

    # 3. Compute Predictions & Probabilities
    print("\n[Step 3/4] Generating predictions and probabilistic risk scores...")
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    # Confusion matrix breakdown
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    # Detailed metrics
    fraud_precision = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
    fraud_recall = recall_score(y_test, y_pred, pos_label=1, zero_division=0)
    fraud_f1 = f1_score(y_test, y_pred, pos_label=1, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_proba)
    pr_auc = average_precision_score(y_test, y_proba)
    class_report_dict = classification_report(
        y_test,
        y_pred,
        target_names=["Legitimate", "Fraudulent"],
        output_dict=True,
    )

    results = {
        "model_file": str(model_path.resolve()),
        "test_sample_count": len(X_test),
        "minority_class_fraud_metrics": {
            "recall_sensitivity": float(fraud_recall),
            "precision": float(fraud_precision),
            "f1_score": float(fraud_f1),
        },
        "overall_metrics": {
            "roc_auc": float(roc_auc),
            "pr_auc_average_precision": float(pr_auc),
            "accuracy": float((tp + tn) / len(y_test)),
        },
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "classification_report": class_report_dict,
    }

    # Print summary
    print("\n" + "=" * 55)
    print("PERFORMANCE SUMMARY (MINORITY FRAUD DETECTION):")
    print("=" * 55)
    print(f"  - Fraud Recall (Catch Rate):  {fraud_recall * 100:.2f}%  (TP={tp} caught, FN={fn} missed)")
    print(f"  - Fraud Precision:            {fraud_precision * 100:.2f}%  (FP={fp} false alarms)")
    print(f"  - Fraud F1-Score:             {fraud_f1:.4f}")
    print(f"  - PR-AUC (Average Precision): {pr_auc:.4f}")
    print(f"  - ROC-AUC Score:              {roc_auc:.4f}")
    print("-" * 55)
    print(f"  Confusion Matrix:")
    print(f"     Actual Legit (0)  -> [ TN: {tn:>4} | FP: {fp:>4} ]")
    print(f"     Actual Fraud (1)  -> [ FN: {fn:>4} | TP: {tp:>4} ]")
    print("=" * 55)

    # 4. Save evaluation report
    print("\n[Step 4/4] Writing evaluation report to disk...")
    DEFAULT_REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report_json_path = DEFAULT_REPORT_DIR / "model_evaluation_report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
    print(f"   [OK] Saved JSON metrics report: {report_json_path.resolve()}")

    return results


def main():
    parser = argparse.ArgumentParser(description="Evaluate ScamShield AI model.")
    parser.add_argument(
        "--model-path",
        type=str,
        default=str(DEFAULT_MODEL_PATH),
        help="Path to trained model .joblib file.",
    )
    parser.add_argument(
        "--data-path",
        type=str,
        default=None,
        help="Path to EMSCAD fake_job_postings.csv.",
    )
    args = parser.parse_args()

    model_path = Path(args.model_path)
    if not model_path.exists():
        print("\n" + "=" * 65)
        print("[ERROR] NO TRAINED MODEL FOUND")
        print("=" * 65)
        print(f"Looked for model at: {model_path.resolve()}")
        print("\nPlease train the model first by running:")
        print("    python ml/train.py")
        print("=" * 65 + "\n")
        sys.exit(1)

    data_path = locate_dataset(args.data_path)
    evaluate_model(model_path, data_path)


if __name__ == "__main__":
    main()
