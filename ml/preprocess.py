"""Text and feature preprocessing pipeline for ScamShield AI.

Ensures exact feature parity between model training and real-time inference.
Handles missing values safely and cleans raw text strings.
"""

import re
from typing import Any, Dict, Mapping, Union
import pandas as pd


# Core text fields in EMSCAD dataset
TEXT_COLUMNS = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits",
]

# Legacy metadata list for callers; these fields are excluded from this model.
METADATA_COLUMNS = [
    "employment_type",
    "required_experience",
    "required_education",
    "industry",
    "function",
]


def clean_text(text: Union[str, float, None]) -> str:
    """Handle scalar nulls, remove basic HTML tags, normalize spaces and lowercase."""
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


def build_model_input(sample: Mapping[str, Any]) -> str:
    """Build the existing model's five-field input for both training and inference.

    Preserve training order, cleanup, prefixes and fallback. Metadata, identifiers
    and labels remain outside this representation. Prefixes provide limited
    boundary context; they do not namespace every word by its source field.
    """
    parts = []
    # Fixed order is part of the trained feature contract.
    for col in TEXT_COLUMNS:
        val = sample.get(col)
        cleaned = clean_text(val)
        if cleaned:
            # Preserve original training formatting.
            parts.append(f"{col}: {cleaned}")

    combined = " ".join(parts)
    return combined if combined else "unspecified job opportunity"


def extract_combined_text_from_dict(sample: Dict[str, Any]) -> str:
    """Compatibility wrapper for the canonical five-field input builder."""
    return build_model_input(sample)


def extract_combined_text_from_df(df: pd.DataFrame) -> pd.Series:
    """Use the same builder for training, preserving row indices and field values."""
    records = df.reindex(columns=TEXT_COLUMNS).to_dict(orient="records")
    return pd.Series([build_model_input(row) for row in records], index=df.index, dtype=str)


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
