"""Baseline model training script for ScamShield AI.

Trains a TF-IDF + Logistic Regression pipeline on the EMSCAD dataset.
Applies stratified splitting and balanced class weighting for minority fraud detection.
Saves model artifact to models/baseline_model.joblib.

Usage:
    python ml/train.py [--data-path data/fake_job_postings.csv] [--output models/baseline_model.joblib]
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Ensure Windows console can print UTF-8 without charmap errors
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure project root is in sys.path when executed as a script (e.g., python ml/train.py)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Local imports
from ml.inspect_data import locate_dataset
from ml.preprocess import prepare_training_data

RANDOM_STATE = 42
DEFAULT_MODEL_DIR = Path("models")
DEFAULT_MODEL_PATH = DEFAULT_MODEL_DIR / "baseline_model.joblib"
DEFAULT_REPORT_DIR = Path("reports")


def train_baseline_model(
    data_path: Path,
    output_model_path: Path = DEFAULT_MODEL_PATH,
    test_size: float = 0.20,
) -> dict:
    """Train the TF-IDF + LogisticRegression baseline model and save artifacts."""
    try:
        import joblib
        import pandas as pd
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
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
        from sklearn.pipeline import Pipeline
    except ImportError as e:
        print(f"\n[ERROR] Missing required Python dependency: {e.name}")
        print("Please install requirements using:")
        print("    pip install -r requirements.txt\n")
        sys.exit(1)

    print("=" * 70)
    print("ScamShield AI -- Baseline Model Training Pipeline")
    print(f"Dataset: {data_path.resolve()}")
    print("=" * 70)

    # 1. Load data
    print("\n[Step 1/5] Loading dataset...")
    df = pd.read_csv(data_path)
    print(f"   Loaded {len(df):,} records.")

    # 2. Preprocess combined text
    print("\n[Step 2/5] Preprocessing and combining text features...")
    X, y = prepare_training_data(df, target_col="fraudulent")
    print(f"   Prepared {len(X):,} feature rows.")
    print(f"   Fraudulent postings: {y.sum():,} ({y.mean() * 100:.2f}%)")
    print(f"   Legitimate postings: {(y == 0).sum():,} ({(y == 0).mean() * 100:.2f}%)")

    # 3. Stratified Train/Test Split (ensures fixed ratio of fraudulent in test)
    print("\n[Step 3/5] Performing stratified train/test split (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=RANDOM_STATE,
        stratify=y,
    )
    print(f"   Training set: {len(X_train):,} samples (Fraud: {y_train.sum():,})")
    print(f"   Test set:     {len(X_test):,} samples (Fraud: {y_test.sum():,})")

    # 4. Construct Pipeline (Vectorizer fitted only on train to prevent data leakage)
    print("\n[Step 4/5] Fitting TF-IDF Vectorizer + LogisticRegression...")
    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    max_features=10000,
                    ngram_range=(1, 2),
                    stop_words="english",
                    sublinear_tf=True,
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    class_weight="balanced",  # Addresses severe class imbalance
                    C=1.0,
                    max_iter=1000,
                    random_state=RANDOM_STATE,
                    solver="liblinear",
                ),
            ),
        ]
    )

    pipeline.fit(X_train, y_train)
    print("   Model fitted successfully.")

    # 5. Evaluate on Holdout Test Set
    print("\n[Step 5/5] Evaluating on holdout test set...")
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    # Authentic metrics calculation
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()

    metrics = {
        "dataset_rows": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "test_fraud_actual": int(y_test.sum()),
        "test_legit_actual": int((y_test == 0).sum()),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "overall_accuracy": float((tp + tn) / (tp + tn + fp + fn)),
        "fraud_precision": float(precision_score(y_test, y_pred, pos_label=1, zero_division=0)),
        "fraud_recall": float(recall_score(y_test, y_pred, pos_label=1, zero_division=0)),
        "fraud_f1": float(f1_score(y_test, y_pred, pos_label=1, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_proba)),
        "pr_auc_average_precision": float(average_precision_score(y_test, y_proba)),
    }

    print("\n" + "-" * 50)
    print("HOLDOUT TEST EVALUATION RESULTS:")
    print("-" * 50)
    print(f"  * Fraud Recall (Sensitivity):  {metrics['fraud_recall']:.4f}")
    print(f"  * Fraud Precision:             {metrics['fraud_precision']:.4f}")
    print(f"  * Fraud F1-Score:              {metrics['fraud_f1']:.4f}")
    print(f"  * ROC-AUC Score:               {metrics['roc_auc']:.4f}")
    print(f"  * PR-AUC (Average Precision):  {metrics['pr_auc_average_precision']:.4f}")
    print("  * Confusion Matrix:")
    print(f"      [TN: {tn:>4}  |  FP: {fp:>4}]")
    print(f"      [FN: {fn:>4}  |  TP: {tp:>4}]")
    print("-" * 50)

    print("\nFull Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Fraudulent"]))

    # Save artifacts
    output_model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, output_model_path)
    print(f"[OK] Model pipeline saved to: {output_model_path.resolve()}")

    DEFAULT_REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report_file = DEFAULT_REPORT_DIR / "baseline_training_metrics.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"[OK] Metrics report written to: {report_file.resolve()}")

    print("\n" + "=" * 70)
    print("[OK] TRAINING COMPLETE")
    print("   You can now start the FastAPI server: uvicorn backend.main:app --reload")
    print("=" * 70 + "\n")
    return metrics


def main():
    parser = argparse.ArgumentParser(description="Train baseline model for ScamShield AI.")
    parser.add_argument(
        "--data-path",
        type=str,
        default=None,
        help="Path to EMSCAD fake_job_postings.csv.",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=str(DEFAULT_MODEL_PATH),
        help="Destination path for serialized model pipeline.",
    )
    args = parser.parse_args()

    data_path = locate_dataset(args.data_path)
    train_baseline_model(data_path, Path(args.output))


if __name__ == "__main__":
    main()
