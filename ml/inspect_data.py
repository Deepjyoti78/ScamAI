"""Dataset inspection and validation script for ScamShield AI.

Validates the EMSCAD (Real or Fake Job Posting) dataset before training.
Usage:
    python ml/inspect_data.py [--path data/fake_job_postings.csv]
"""

import argparse
import os
import sys
from pathlib import Path
from typing import Optional


# Expected standard EMSCAD dataset fields
EXPECTED_TARGET = "fraudulent"
EXPECTED_FIELDS = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits",
    "employment_type",
    "required_experience",
    "required_education",
    "industry",
    "function",
]

# Ensure Windows console can print UTF-8 without charmap errors
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

DEFAULT_PATH = Path("data") / "fake_job_postings.csv"


def locate_dataset(provided_path: Optional[str] = None) -> Path:
    """Resolve the dataset path using CLI args, env vars, defaults, or auto-discovery."""
    if provided_path:
        p = Path(provided_path)
        if p.exists():
            return p
        print(f"[ERROR] Specified dataset file not found at: {p.resolve()}")
        sys.exit(1)

    env_path = os.getenv("DATA_PATH")
    if env_path:
        p = Path(env_path)
        if p.exists():
            return p
        print(f"[ERROR] Environment variable DATA_PATH points to non-existent file: {p.resolve()}")
        sys.exit(1)

    if DEFAULT_PATH.exists():
        return DEFAULT_PATH

    # Check data/ directory for any .csv files
    data_dir = Path("data")
    if data_dir.exists():
        csv_files = list(data_dir.glob("*.csv"))
        if len(csv_files) == 1:
            print(f"[INFO] Auto-detected CSV file in data/: {csv_files[0].name}")
            return csv_files[0]
        elif len(csv_files) > 1:
            print("[WARNING] Multiple CSV files found in data/:")
            for f in csv_files:
                print(f"   - {f.name}")
            print("\nPlease specify which one to inspect using --path <filename>")
            sys.exit(1)

    print("\n" + "=" * 65)
    print("[ERROR] EMSCAD DATASET NOT FOUND")
    print("=" * 65)
    print(f"Expected default location: {DEFAULT_PATH.resolve()}")
    print("\nPlease follow these steps to place your dataset:")
    print("  1. Download the 'Real or Fake Job Posting' (EMSCAD) dataset.")
    print("  2. Copy the CSV file into the 'data/' directory.")
    print("  3. Name it 'fake_job_postings.csv' (or pass --path data/your_file.csv).")
    print("  4. Re-run this inspection script:")
    print("     python ml/inspect_data.py\n")
    print("See data/README.md for more details.")
    print("=" * 65 + "\n")
    sys.exit(1)


def inspect_dataset(file_path: Path) -> bool:
    """Inspect and display summary statistics of the dataset."""
    try:
        import pandas as pd
    except ImportError:
        print("[ERROR] 'pandas' is not installed. Run: pip install -r requirements.txt")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("ScamShield AI -- Dataset Inspection Report")
    print(f"Source: {file_path.resolve()}")
    print("=" * 70)

    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"[ERROR] Reading CSV file: {e}")
        return False

    num_rows, num_cols = df.shape
    print("\n[1] DATASET DIMENSIONS")
    print(f"    * Total Rows (Postings): {num_rows:,}")
    print(f"    * Total Columns:         {num_cols:,}")

    # Check duplicate rows
    duplicates = df.duplicated().sum()
    print(f"    * Exact Duplicate Rows:  {duplicates:,} ({duplicates / num_rows * 100:.2f}%)")

    # Target Column Validation
    print(f"\n[2] TARGET COLUMN VALIDATION ('{EXPECTED_TARGET}')")
    if EXPECTED_TARGET not in df.columns:
        print(f"    [ERROR] Critical Error: Target column '{EXPECTED_TARGET}' was NOT found in dataset!")
        print(f"    Available columns: {list(df.columns)}")
        return False

    target_counts = df[EXPECTED_TARGET].value_counts(dropna=False)
    print("    * Target column found: [OK]")
    print("    * Class Distribution:")
    for label, count in target_counts.items():
        label_str = "Fraudulent (1)" if label == 1 else "Legitimate (0)" if label == 0 else f"Other ({label})"
        pct = count / num_rows * 100
        print(f"      - {label_str:<18}: {count:>6,} rows ({pct:>5.2f}%)")

    fraud_ratio = (df[EXPECTED_TARGET] == 1).mean()
    if fraud_ratio < 0.15:
        print(f"    [INFO] High class imbalance detected (~{fraud_ratio * 100:.1f}% fraudulent).")
        print("      Stratified splitting and class weighting will be applied during training.")

    # Expected Feature Presence
    print("\n[3] FEATURE RECONNAISSANCE")
    present_fields = []
    missing_fields = []
    for field in EXPECTED_FIELDS:
        if field in df.columns:
            present_fields.append(field)
        else:
            missing_fields.append(field)

    print(f"    * Expected Core Fields Present: {len(present_fields)} / {len(EXPECTED_FIELDS)}")
    for f in present_fields:
        missing_count = df[f].isna().sum()
        missing_pct = missing_count / num_rows * 100
        dtype = str(df[f].dtype)
        print(f"      [OK] {f:<22} (type: {dtype:<8} | missing: {missing_count:>6,} ({missing_pct:>5.1f}%))")

    if missing_fields:
        print(f"    * Optional / Absent Expected Fields: {len(missing_fields)}")
        for f in missing_fields:
            print(f"      [WARN] {f:<22} (not present in CSV -- preprocessing will handle gracefully)")

    # Other columns present
    extra_cols = [c for c in df.columns if c not in EXPECTED_FIELDS and c != EXPECTED_TARGET]
    if extra_cols:
        print(f"\n    * Additional Available Columns ({len(extra_cols)}):")
        for c in extra_cols:
            missing_count = df[c].isna().sum()
            missing_pct = missing_count / num_rows * 100
            print(f"      * {c:<22} (type: {str(df[c].dtype):<8} | missing: {missing_pct:>5.1f}%)")

    print("\n" + "=" * 70)
    print("[OK] DATASET VALIDATION COMPLETE")
    print("   Dataset is structurally ready for baseline model training.")
    print("   Next step: python ml/train.py")
    print("=" * 70 + "\n")
    return True


def main():
    parser = argparse.ArgumentParser(description="Inspect EMSCAD dataset for ScamShield AI.")
    parser.add_argument(
        "--path",
        type=str,
        default=None,
        help="Path to the EMSCAD fake_job_postings.csv file.",
    )
    args = parser.parse_args()

    dataset_path = locate_dataset(args.path)
    success = inspect_dataset(dataset_path)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
