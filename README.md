# ScamShield AI — Recruitment Fraud Investigation Platform

ScamShield AI is an end-to-end platform for detecting, analyzing, and explaining fraudulent employment postings. It pairs a minimalist editorial-style React frontend with an explainable machine learning pipeline and a FastAPI inference backend.

---

## 1. Project Architecture

```
college project/
├── src/                         # React 19 + TypeScript + Tailwind v4 Frontend
│   ├── components/              # UI components (Header, Hero, Mockup, Workflow)
│   ├── pages/                   # Pages (HomePage, InvestigatePage, Results)
│   └── data/                    # Demo scenarios and simulated endpoints
├── public/                      # Static web assets
├── data/                        # Dataset storage directory
│   ├── fake_job_postings.csv    # Place EMSCAD CSV dataset here (ignored by git)
│   └── README.md                # Dataset placement instructions
├── ml/                          # Machine Learning Pipeline
│   ├── inspect_data.py          # Dataset reconnaissance & validation
│   ├── preprocess.py            # Text combination & cleaning (train & inference)
│   ├── train.py                 # TF-IDF + Logistic Regression training
│   ├── evaluate.py              # Minority-class evaluation, PR-AUC, confusion matrix
│   └── explain.py               # Linear feature attribution & signal ranking
├── backend/                     # FastAPI Backend Application
│   ├── main.py                  # API endpoints (/health, /model/status, /api/investigations/analyze, streaming SSE)
│   ├── schemas.py               # Pydantic request and response schemas
│   └── services/
│       ├── prediction.py        # Model loading, inference, and attribution service
│       ├── trust_chain.py       # Deterministic rule checks and cross-domain alignment
│       ├── url_extractor.py     # Safe SSR-resistant public job URL text extraction
│       └── web_research.py      # Brave Search API live external corroboration service
├── models/                      # Trained model artifacts (.joblib)
│   └── .gitkeep
├── reports/                     # Model evaluation reports and metrics
│   └── .gitkeep
├── tests/                       # Unit tests
│   └── test_data.py             # Preprocessing, schema, and error handling tests
├── requirements.txt             # Python dependencies
├── package.json                 # Node dependencies
└── README.md                    # Project documentation
```

---

## 2. Prerequisites

- **Node.js**: v18+ (tested on Node v20+)
- **Python**: v3.10+ (tested on Python 3.12 / 3.14 on Windows)

---

## 3. Python Environment Setup (Windows PowerShell)

Open PowerShell in the project root directory:

```powershell
# 1. Create a virtual environment using Python 3.12 (or standard py launcher)
py -3.12 -m venv .venv

# 2. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# (If PowerShell restricts scripts, enable execution for the current session:)
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 3. Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 4. Dataset Placement & Inspection

1. **Obtain Dataset**: Download the EMSCAD (*Real or Fake Job Posting*) dataset CSV.
2. **Place CSV**: Copy the CSV file into the `data/` folder:
   ```
   data/fake_job_postings.csv
   ```
3. **Inspect Dataset**: Run the validation script to check row counts, missing values, and class imbalance:
   ```powershell
   python ml/inspect_data.py
   ```
   *(If your file has a different name: `python ml/inspect_data.py --path data/your_file.csv`)*

---

## 5. Model Training & Evaluation

Once the dataset has been verified by the inspection script:

### Step 1: Train the Baseline Classifier
```powershell
python ml/train.py
```
- Fits TF-IDF on training split only (prevents data leakage).
- Trains a balanced Logistic Regression classifier to handle minority fraud class.
- Saves model artifact to `models/baseline_model.joblib`.
- Saves training metrics to `reports/baseline_training_metrics.json`.

### Step 2: Evaluate the Model
```powershell
python ml/evaluate.py
```
- Computes Precision, Recall, F1-score, ROC-AUC, and PR-AUC on the holdout test set.
- Outputs confusion matrix and classification report.
- Saves results to `reports/model_evaluation_report.json`.

---

## 6. Running the Applications

### Start the FastAPI Backend
```powershell
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **Model Status**: [http://127.0.0.1:8000/model/status](http://127.0.0.1:8000/model/status)

### Start the React Frontend
In a separate terminal window:
```powershell
npm run dev
```
- **Frontend URL**: [http://localhost:5173/](http://localhost:5173/)

---

## 7. Running Unit Tests

```powershell
pytest -v
```

---

## 8. Live Web Research & Employer Evidence Enrichment (Brave Search API)

ScamShield AI enriches investigation reports with external web evidence corroboration using the Brave Search API:
- **Official Documentation**: [https://api-dashboard.search.brave.com/documentation](https://api-dashboard.search.brave.com/documentation)
- **API Endpoint**: `https://api.search.brave.com/res/v1/web/search`
- **Backend Service**: `backend/services/web_research.py`
- **Search Strategy**: Executes targeted, length-clamped queries (<=120 characters) targeting official employer careers pages (`"<employer>" "<title>" careers`, `site:<domain> careers`).
- **Epistemic Restraint & Ethics**:
  - Vacancy matches on an employer website corroborate that a role was publicly advertised; they do *not* verify recruiter identity, message authenticity, or deposit safety.
  - Absence of a search result is *not* proof of fraud.
  - Search evidence is maintained in a dedicated evidence section and is *never* averaged into the ML model's text fraud probability.
  - ScamShield AI never invents, simulates, or fabricates search results when external research is unconfigured or unavailable.

### Configuring `BRAVE_SEARCH_API_KEY`

#### Local Development
1. Obtain an API key from the [Brave Search API Dashboard](https://api-dashboard.search.brave.com/).
2. Set the key in your local PowerShell session or backend `.env`:
   ```powershell
   $env:BRAVE_SEARCH_API_KEY="your-brave-search-key"
   ```
3. If omitted or empty, the backend operates normally with web research marked as `not_configured`.

#### Render Production Deployment
1. Navigate to your Web Service on [Render](https://dashboard.render.com).
2. Go to **Environment** > **Environment Variables**.
3. Add a secret:
   - Key: `BRAVE_SEARCH_API_KEY`
   - Value: `your-brave-search-key`
4. Click **Save Changes**. Render redeploys the service automatically.

> **Security Reminder**: Never expose `BRAVE_SEARCH_API_KEY` in Vite frontend environments, client-side bundles, or git repositories. The React frontend interacts with the backend solely via `/api/investigations/analyze` or `/api/investigations/stream`.

---

## 9. Current Scope & Intentional Limitations

- **No Synthetic Data**: The system does not fabricate artificial model weights or mock training data. Model inference requires training on the genuine EMSCAD dataset.
- **Explainability**: Explanations use exact linear feature attribution ($x_i \cdot w_i$) from the TF-IDF and Logistic Regression weights.
- **Search Scope**: Web research uses search result snippets and titles to corroborate public vacancy presence; it does not crawl entire corporate networks or execute client-side scripts. Absence of search results is explicitly disclaimed as insufficient evidence of fraud.
