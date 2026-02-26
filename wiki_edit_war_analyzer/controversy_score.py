"""
controversy_score.py
--------------------
Computes a single "Controversy Score" (0–100) for a Wikipedia article
based on:
  1. Revert rate           (weight: SCORE_WEIGHT_REVERTS)
  2. Unique editor density (weight: SCORE_WEIGHT_UNIQUE_EDITORS)
  3. Edit-spike frequency  (weight: SCORE_WEIGHT_SPIKES)

Each component is normalised independently using a log scale so that
the score is robust to both small and very large articles.
"""

import math
import pandas as pd
from config import (
    SCORE_WEIGHT_REVERTS,
    SCORE_WEIGHT_UNIQUE_EDITORS,
    SCORE_WEIGHT_SPIKES,
    SCORE_LOG_BASE,
)


def _log_normalise(value: float, max_value: float) -> float:
    """
    Normalise `value` to [0, 1] using a log scale relative to `max_value`.
    Returns 0 if value <= 0.
    """
    if value <= 0 or max_value <= 0:
        return 0.0
    log_val = math.log(value + 1, SCORE_LOG_BASE)
    log_max = math.log(max_value + 1, SCORE_LOG_BASE)
    if log_max == 0:
        return 0.0
    return min(log_val / log_max, 1.0)


def compute_controversy_score(df: pd.DataFrame, summary: dict) -> dict:
    """
    Compute the controversy score and return a breakdown dict.

    Parameters
    ----------
    df : pd.DataFrame
        Enriched revision DataFrame (output of data_processor.process_revisions).
    summary : dict
        Summary statistics (output of data_processor.compute_summary).

    Returns
    -------
    dict with keys:
        score          – overall controversy score 0-100
        revert_score   – revert component 0-100
        editor_score   – unique editor component 0-100
        spike_score    – spike component 0-100
        label          – "Low" / "Medium" / "High" / "Extreme"
    """
    if df.empty or not summary:
        return {
            "score": 0,
            "revert_score":  0,
            "editor_score":  0,
            "spike_score":   0,
            "label": "Low",
        }

    total_edits    = summary["total_edits"]
    total_reverts  = summary["total_reverts"]
    unique_editors = summary["unique_editors"]
    spike_days     = summary["spike_days"]

    # ── Component 1: Revert rate ──────────────────────────────────────
    # Normalised against a "very high" revert rate of 30 % = 0.30
    raw_revert_rate  = total_reverts / max(total_edits, 1)
    revert_norm      = _log_normalise(raw_revert_rate * 100, 30)

    # ── Component 2: Unique editor density per 100 edits ─────────────
    density          = (unique_editors / max(total_edits, 1)) * 100
    editor_norm      = _log_normalise(density, 60)   # ≥ 60 editors/100 edits = saturated

    # ── Component 3: Spike frequency (fraction of days that are spikes)──
    total_days       = max((df["timestamp"].max() - df["timestamp"].min()).days, 1)
    spike_fraction   = (spike_days / total_days) * 100
    spike_norm       = _log_normalise(spike_fraction, 20)   # ≥ 20 % spike days = saturated

    # ── Weighted composite ────────────────────────────────────────────
    composite = (
        revert_norm  * SCORE_WEIGHT_REVERTS        +
        editor_norm  * SCORE_WEIGHT_UNIQUE_EDITORS +
        spike_norm   * SCORE_WEIGHT_SPIKES
    )
    score = round(composite * 100, 1)

    # ── Human-readable label ──────────────────────────────────────────
    if score < 25:
        label = "Low"
    elif score < 50:
        label = "Medium"
    elif score < 75:
        label = "High"
    else:
        label = "Extreme"

    return {
        "score":        score,
        "revert_score":  round(revert_norm * 100, 1),
        "editor_score":  round(editor_norm * 100, 1),
        "spike_score":   round(spike_norm  * 100, 1),
        "label":         label,
    }
