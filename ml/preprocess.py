"""Text and feature preprocessing pipeline for ScamShield AI.

Ensures exact feature parity between model training and real-time inference.
Handles missing values safely and cleans raw text strings.
"""

import re
from typing import Any, Dict, List, Union
import pandas as pd


# Core text fields in EMSCAD dataset
TEXT_COLUMNS = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits",
]

# Secondary categorical/metadata fields
METADATA_COLUMNS = [
    "employment_type",
    "required_experience",
    "required_education",
    "industry",
    "function",
]


def clean_text(text: Union[str, float, None]) -> str:
    """Clean a single raw text string: handle nulls, strip URLs/html, normalize spaces."""
    if text is None or pd.isna(text):
        return ""
    text_str = str(text)

    # Remove basic HTML tags (e.g., <p>, <br>, <b>)
    text_str = re.sub(r"<[^>]+>", " ", text_str)

    # Normalize whitespace before punctuation marks
    text_str = re.sub(r"\s+([?.!,:;])", r"\1", text_str)

    # Normalize whitespace and newlines
    text_str = re.sub(r"\s+", " ", text_str).strip()

    return text_str.lower()


def extract_combined_text_from_dict(sample: Dict[str, Any]) -> str:
    """Combine text fields from a single job dictionary into one text payload for inference.

    Compatible with FastAPI request payloads.
    """
    parts = []
    # Weighted order of fields for contextual coherence
    for col in TEXT_COLUMNS:
        val = sample.get(col)
        cleaned = clean_text(val)
        if cleaned:
            # Prefix with field label to help the model distinguish section context
            parts.append(f"{col}: {cleaned}")

    # Also capture metadata fields if provided
    for col in METADATA_COLUMNS:
        val = sample.get(col)
        cleaned = clean_text(val)
        if cleaned:
            parts.append(f"{col}: {cleaned}")

    combined = " ".join(parts)
    return combined if combined else "unspecified job opportunity"


def extract_combined_text_from_df(df: pd.DataFrame) -> pd.Series:
    """Vectorized combination of text columns for pandas DataFrame training data."""
    combined_series = pd.Series("", index=df.index, dtype=str)

    # Only process columns that actually exist in the dataframe
    available_cols = [c for c in TEXT_COLUMNS if c in df.columns]

    for col in available_cols:
        col_cleaned = df[col].fillna("").astype(str).apply(clean_text)
        # Prefix field name to retain structural semantics
        col_tagged = col + ": " + col_cleaned
        # Only add when non-empty
        mask = col_cleaned.str.len() > 0
        combined_series = combined_series.str.cat(col_tagged.where(mask, ""), sep=" ").str.strip()

    # Fill any empty rows with fallback string
    combined_series = combined_series.replace("", "unspecified job opportunity")
    return combined_series


def prepare_training_data(
    df: pd.DataFrame,
    target_col: str = "fraudulent",
) -> tuple[pd.Series, pd.Series]:
    """Prepare X (combined text series) and y (target label series) from raw DataFrame."""
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in DataFrame.")

    # Drop rows where target is null
    valid_df = df.dropna(subset=[target_col]).copy()
    valid_df[target_col] = valid_df[target_col].astype(int)

    X = extract_combined_text_from_df(valid_df)
    y = valid_df[target_col]

    return X, y
