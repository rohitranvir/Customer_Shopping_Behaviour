"""
config.py
---------
Global configuration constants for the Wikipedia Edit War Analyzer.
"""

# MediaWiki API endpoint
WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"

# Maximum revisions to fetch per API request (max allowed is 500)
REVISIONS_PER_REQUEST = 500

# Maximum total revisions to fetch (set None for unlimited)
MAX_REVISIONS = 5000

# HTTP request timeout in seconds
REQUEST_TIMEOUT = 30

# Delay (seconds) between API calls to respect rate limits
RATE_LIMIT_DELAY = 0.5

# Keywords that suggest a revert / edit conflict in an edit comment
REVERT_KEYWORDS = [
    "revert", "reverted", "rv", "undo", "undid",
    "vandalism", "vandal", "restore", "restored",
    "rollback", "reverts"
]

# Keyword groups for NLP conflict detection in comments
CONFLICT_KEYWORDS = {
    "hostility":   ["attack", "abuse", "harassment", "insult", "inappropriate"],
    "dispute":     ["dispute", "disagree", "incorrect", "wrong", "false", "inaccurate",
                    "misleading", "biased", "bias", "pov", "neutral", "neutrality"],
    "revert_lang": REVERT_KEYWORDS,
    "protection":  ["protected", "semi-protected", "fully protected", "edit request"],
}

# -------------------------------------------------------------------
# Controversy score weights  (must sum to 1.0)
# -------------------------------------------------------------------
SCORE_WEIGHT_REVERTS       = 0.40   # share driven by revert count
SCORE_WEIGHT_UNIQUE_EDITORS = 0.30  # share driven by unique editor count
SCORE_WEIGHT_SPIKES        = 0.30   # share driven by edit-frequency spikes

# Thresholds for "spike" detection
SPIKE_WINDOW_DAYS  = 1       # rolling window in days
SPIKE_MULTIPLIER   = 3.0     # a window is a spike if edits > mean * multiplier

# Logarithm base used when normalising raw counts to 0-100 scale
SCORE_LOG_BASE = 10
