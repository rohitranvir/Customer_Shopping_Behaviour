"""
data_processor.py
-----------------
Processes the raw revision DataFrame to:
  - Detect reverts (keyword-based)
  - Identify bot vs. human edits
  - Detect rapid-edit frequency spikes
  - Flag conflict-related language in comments (basic NLP)
  - Compute summary statistics
"""

import re
import pandas as pd
from config import (
    REVERT_KEYWORDS,
    CONFLICT_KEYWORDS,
    SPIKE_WINDOW_DAYS,
    SPIKE_MULTIPLIER,
)


# ──────────────────────────────────────────────────────────────────────────────
# Helper utilities
# ──────────────────────────────────────────────────────────────────────────────

def _comment_contains(comment: str, keywords: list[str]) -> bool:
    """
    Return True if the lowercase comment contains any of the given keywords
    as whole-word (or partial) matches.
    """
    if not comment:
        return False
    comment_lower = comment.lower()
    return any(kw in comment_lower for kw in keywords)


# ──────────────────────────────────────────────────────────────────────────────
# Public processing functions
# ──────────────────────────────────────────────────────────────────────────────

def detect_reverts(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add a boolean column `is_revert` based on keyword matching in the
    edit comment.
    """
    df = df.copy()
    df["is_revert"] = df["comment"].apply(
        lambda c: _comment_contains(str(c), REVERT_KEYWORDS)
    )
    return df


def detect_bots(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add a boolean column `is_bot`.
    Convention: Wikipedia bot usernames contain the word "bot" (case-insensitive).
    """
    df = df.copy()
    df["is_bot"] = df["user"].str.lower().str.contains(
        r"\bbot\b", regex=True, na=False
    )
    return df


def detect_spikes(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add a boolean column `is_spike_day` to each edit.
    A day is considered a spike if its edit count is >= SPIKE_MULTIPLIER
    times the mean daily edit count across the article's history.
    """
    df = df.copy()
    df["date"] = df["timestamp"].dt.date

    # Daily edit counts
    daily_counts = df.groupby("date").size().rename("daily_edits")
    mean_daily   = daily_counts.mean()
    threshold    = mean_daily * SPIKE_MULTIPLIER

    spike_dates = set(daily_counts[daily_counts >= threshold].index)
    df["is_spike_day"] = df["date"].isin(spike_dates)
    df = df.drop(columns=["date"])
    return df


def nlp_conflict_flags(df: pd.DataFrame) -> pd.DataFrame:
    """
    For each conflict keyword category, add a boolean column
    `nlp_<category>` indicating whether the edit comment contains
    any keyword from that category.  Also add a summary column
    `nlp_any_conflict`.
    """
    df = df.copy()
    category_cols = []
    for category, keywords in CONFLICT_KEYWORDS.items():
        col = f"nlp_{category}"
        df[col] = df["comment"].apply(
            lambda c: _comment_contains(str(c), keywords)
        )
        category_cols.append(col)

    # Any conflict language detected at all?
    df["nlp_any_conflict"] = df[category_cols].any(axis=1)
    return df


def compute_edit_size_delta(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add `size_delta` column: the change in article byte-size per edit.
    Negative delta = content removed, positive = content added.
    """
    df = df.copy()
    df["size_delta"] = df["size"].astype(int).diff().fillna(0).astype(int)
    return df


def process_revisions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Master processing function.  Applies all enrichment steps and returns
    the fully annotated DataFrame.

    Parameters
    ----------
    df : pd.DataFrame
        Raw revision DataFrame from api_fetcher.fetch_revision_history().

    Returns
    -------
    pd.DataFrame
        Enriched DataFrame with revert, bot, spike, NLP, and delta columns.
    """
    if df.empty:
        return df

    df = detect_reverts(df)
    df = detect_bots(df)
    df = detect_spikes(df)
    df = nlp_conflict_flags(df)
    df = compute_edit_size_delta(df)
    return df


# ──────────────────────────────────────────────────────────────────────────────
# Summary statistics
# ──────────────────────────────────────────────────────────────────────────────

def compute_summary(df: pd.DataFrame) -> dict:
    """
    Return a dictionary of high-level statistics about the article's
    revision history.
    """
    if df.empty:
        return {}

    total_edits      = len(df)
    total_reverts    = int(df["is_revert"].sum())
    total_bots       = int(df["is_bot"].sum())
    total_humans     = total_edits - total_bots
    unique_editors   = df["user"].nunique()
    unique_humans    = df[~df["is_bot"]]["user"].nunique()
    spike_days       = int(df["is_spike_day"].sum())
    nlp_conflicts    = int(df["nlp_any_conflict"].sum())
    first_edit       = df["timestamp"].min()
    last_edit        = df["timestamp"].max()

    # Top 10 most active editors
    top_editors = (
        df.groupby("user")
        .size()
        .sort_values(ascending=False)
        .head(10)
        .to_dict()
    )

    return {
        "total_edits":      total_edits,
        "total_reverts":    total_reverts,
        "revert_rate":      round(total_reverts / total_edits * 100, 2),
        "total_bots":       total_bots,
        "total_humans":     total_humans,
        "unique_editors":   unique_editors,
        "unique_humans":    unique_humans,
        "spike_days":       spike_days,
        "nlp_conflicts":    nlp_conflicts,
        "first_edit":       str(first_edit)[:10],
        "last_edit":        str(last_edit)[:10],
        "top_editors":      top_editors,
    }
