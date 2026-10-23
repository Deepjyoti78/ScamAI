# ScamShield AI — Dataset Instructions

This directory is designated for the **EMSCAD (Employment Scam Aegean Dataset) / Real or Fake Job Posting Prediction** dataset.

---

## 1. Expected File Placement

Place your downloaded CSV directly in this `data/` folder:

```
college project/
└── data/
    └── fake_job_postings.csv
```

- **Default Expected Filename:** `fake_job_postings.csv`
- **Expected Relative Path:** `data/fake_job_postings.csv`

---

## 2. Using a Different Filename or Path

If your CSV file has a different name (for example, `emscad_v1.csv` or `job_postings.csv`), you do **not** need to rename it. You can specify the custom path in two ways:

### Option A: Command-line Argument `--path` or `--data-path`

```powershell
# Inspect dataset
python ml/inspect_data.py --path data/your_custom_filename.csv

# Train model
python ml/train.py --data-path data/your_custom_filename.csv
```

### Option B: Environment Variable `DATA_PATH`

```powershell
$env:DATA_PATH = "data/your_custom_filename.csv"
python ml/inspect_data.py
```

If neither is provided, the scripts automatically look for `data/fake_job_postings.csv` or auto-detect any single `.csv` file placed inside `data/`.

---

## 3. Important Rules

1. **Do Not Commit Raw Data to Git**:
   Large CSV files, personal identifiable information (PII), or raw dataset archives must **never** be committed to version control. The `.gitignore` file is configured to exclude `data/*.csv` automatically.

2. **No Fabricated Data**:
   Do **not** generate synthetic fake rows to train on. The ML pipeline is designed to be trained strictly on your authentic downloaded EMSCAD dataset.

---

## 4. Next Step

Once you copy your CSV file here, run the inspection script:

```powershell
python ml/inspect_data.py
```
