"""Model explanation module for ScamShield AI.

Provides transparent, feature-level attribution for Logistic Regression predictions.
Identifies influential words and phrases that push predictions toward 'Fraudulent' or 'Legitimate'.
"""

from typing import Any, Dict, List, Optional
import numpy as np


def explain_prediction(
    pipeline: Any,
    raw_text: str,
    top_k: int = 5,
) -> Dict[str, Any]:
    """Explain an individual prediction by computing feature-level contributions.

    For Logistic Regression:
        log_odds = intercept + sum(x_i * w_i)
        Where x_i is the TF-IDF weight and w_i is the learned feature coefficient.
    """
    try:
        tfidf: Any = pipeline.named_steps["tfidf"]
        clf: Any = pipeline.named_steps["classifier"]
    except (KeyError, AttributeError):
        return {
            "error": "Pipeline must have 'tfidf' and 'classifier' named steps.",
            "top_suspicious_features": [],
            "top_legitimate_features": [],
        }

    # Transform input text into TF-IDF vector
    vec = tfidf.transform([raw_text])
    feature_names = tfidf.get_feature_names_out()
    coefs = clf.coef_[0]  # Positive coef = drives prediction toward fraudulent (class 1)

    # Find non-zero indices for this specific document
    _, col_indices = vec.nonzero()

    contributions = []
    for col_idx in col_indices:
        tfidf_val = vec[0, col_idx]
        feature_name = feature_names[col_idx]
        weight = coefs[col_idx]
        impact = tfidf_val * weight

        contributions.append({
            "term": feature_name,
            "impact": float(impact),
            "tfidf_score": float(tfidf_val),
            "coefficient": float(weight),
        })

    # Sort: positive impacts push toward Fraud, negative impacts push toward Legit
    suspicious = [c for c in contributions if c["impact"] > 0]
    suspicious.sort(key=lambda x: x["impact"], reverse=True)

    legitimate = [c for c in contributions if c["impact"] < 0]
    legitimate.sort(key=lambda x: x["impact"])

    return {
        "top_suspicious_features": suspicious[:top_k],
        "top_legitimate_features": legitimate[:top_k],
        "active_terms_count": len(contributions),
    }


def get_global_top_features(pipeline: Any, top_k: int = 20) -> Dict[str, List[Dict[str, Any]]]:
    """Extract global top predictive words for fraud vs. legitimate postings."""
    tfidf = pipeline.named_steps["tfidf"]
    clf = pipeline.named_steps["classifier"]

    feature_names = tfidf.get_feature_names_out()
    coefs = clf.coef_[0]

    top_fraud_idx = np.argsort(coefs)[-top_k:][::-1]
    top_legit_idx = np.argsort(coefs)[:top_k]

    top_fraud = [
        {"term": feature_names[i], "coefficient": float(coefs[i])}
        for i in top_fraud_idx
    ]
    top_legit = [
        {"term": feature_names[i], "coefficient": float(coefs[i])}
        for i in top_legit_idx
    ]

    return {
        "top_fraud_indicators": top_fraud,
        "top_legit_indicators": top_legit,
    }
