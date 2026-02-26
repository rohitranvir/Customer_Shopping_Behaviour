"""
api_fetcher.py
--------------
Fetches the full revision history of a Wikipedia article using the
MediaWiki REST API.  Handles pagination via `rvcontinue` automatically
and respects basic rate-limit guidelines.
"""

import time
import requests
import pandas as pd
from config import (
    WIKIPEDIA_API_URL,
    REVISIONS_PER_REQUEST,
    MAX_REVISIONS,
    REQUEST_TIMEOUT,
    RATE_LIMIT_DELAY,
)


def fetch_revision_history(article_title: str) -> pd.DataFrame:
    """
    Fetch all revisions for a Wikipedia article.

    Parameters
    ----------
    article_title : str
        The exact Wikipedia article title (e.g. "Climate change").

    Returns
    -------
    pd.DataFrame
        Columns: revid, timestamp, user, comment, size
        Returns an empty DataFrame if the article is not found or an
        error occurs.

    Raises
    ------
    ValueError
        If article_title is empty.
    RuntimeError
        If the API returns an unexpected error response.
    """
    if not article_title or not article_title.strip():
        raise ValueError("Article title cannot be empty.")

    # Base parameters for the revisions query
    params = {
        "action":       "query",
        "prop":         "revisions",
        "titles":       article_title.strip(),
        "rvlimit":      REVISIONS_PER_REQUEST,
        "rvprop":       "ids|timestamp|user|comment|size",
        "rvdir":        "newer",        # oldest first → good for time-series
        "format":       "json",
        "formatversion": "2",
    }

    headers = {
        "User-Agent": "WikiEditWarAnalyzer/1.0 (educational project)"
    }

    all_revisions = []
    session = requests.Session()
    continue_token = None

    while True:
        # Attach pagination token if present
        if continue_token:
            params["rvcontinue"] = continue_token

        try:
            response = session.get(
                WIKIPEDIA_API_URL,
                params=params,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
            )
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.ConnectionError:
            raise RuntimeError(
                "Cannot reach Wikipedia API. Check your internet connection."
            )
        except requests.exceptions.Timeout:
            raise RuntimeError(
                f"Wikipedia API timed out after {REQUEST_TIMEOUT}s."
            )
        except requests.exceptions.HTTPError as exc:
            raise RuntimeError(f"HTTP error from Wikipedia API: {exc}")

        # ── Validate API response ──────────────────────────────────────
        if "error" in data:
            code = data["error"].get("code", "unknown")
            info = data["error"].get("info", "")
            raise RuntimeError(f"Wikipedia API error [{code}]: {info}")

        pages = data.get("query", {}).get("pages", [])
        if not pages:
            break

        page = pages[0]

        # Article not found
        if page.get("missing"):
            raise ValueError(
                f"Article '{article_title}' was not found on Wikipedia."
            )

        revisions = page.get("revisions", [])
        all_revisions.extend(revisions)

        # ── Check early-stop and pagination ───────────────────────────
        if MAX_REVISIONS and len(all_revisions) >= MAX_REVISIONS:
            all_revisions = all_revisions[:MAX_REVISIONS]
            break

        continue_token = data.get("continue", {}).get("rvcontinue")
        if not continue_token:
            break   # No more pages

        # Respect rate limits
        time.sleep(RATE_LIMIT_DELAY)

    if not all_revisions:
        return pd.DataFrame(
            columns=["revid", "timestamp", "user", "comment", "size"]
        )

    df = pd.DataFrame(all_revisions)

    # ── Normalise columns ──────────────────────────────────────────────
    # Keep only the columns we need (some may be missing for suppressed edits)
    for col in ["revid", "timestamp", "user", "comment", "size"]:
        if col not in df.columns:
            df[col] = None

    df = df[["revid", "timestamp", "user", "comment", "size"]].copy()

    # Fill missing user / comment (e.g. deleted revisions)
    df["user"]    = df["user"].fillna("Unknown")
    df["comment"] = df["comment"].fillna("")
    df["size"]    = pd.to_numeric(df["size"], errors="coerce").fillna(0).astype(int)

    # Parse timestamp
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
    df = df.dropna(subset=["timestamp"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    return df
