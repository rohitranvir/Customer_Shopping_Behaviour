# ⚔️ Wikipedia Edit War Analyzer

A Streamlit dashboard that fetches Wikipedia article revision history via the MediaWiki API and analyses edit wars, controversial topics, and editing behaviour.

---

## 📁 Project Structure

```
wiki_edit_war_analyzer/
├── app.py                  # Streamlit dashboard (entry point)
├── config.py               # Constants, weights, keywords
├── api_fetcher.py          # MediaWiki API + pagination
├── data_processor.py       # Revert detection, bot tagging, NLP, stats
├── controversy_score.py    # Weighted controversy score (0–100)
├── visualizer.py           # All Plotly charts
└── requirements.txt        # Python dependencies
```

---

## ⚙️ Installation

```bash
# 1. Create and activate a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 2. Navigate to the project folder
cd wiki_edit_war_analyzer

# 3. Install dependencies
pip install -r requirements.txt
```

---

## ▶️ Running Locally

```bash
streamlit run app.py
```

The dashboard opens automatically at **http://localhost:8501**.

---

## 🧪 Example Articles to Test

| Article | Expected Controversy |
|---|---|
| `Flat Earth` | High / Extreme |
| `Vaccine hesitancy` | High |
| `Climate change` | High |
| `Israel–Hamas war` | Extreme |
| `Donald Trump` | High |
| `Homeopathy` | Medium / High |
| `Python (programming language)` | Low |
| `Genetically modified organism` | Medium |

---

## 🔬 How It Works

1. **Fetch** – `api_fetcher.py` fetches paginated revisions using `rvlimit=500` and follows `rvcontinue` tokens.
2. **Process** – `data_processor.py` enriches each revision:
   - **`is_revert`** – comment contains revert keywords
   - **`is_bot`** – username contains `"bot"` (case-insensitive)
   - **`is_spike_day`** – day's edit count ≥ 3× the mean daily count
   - **`nlp_*`** – conflict language categories detected in comments
3. **Score** – `controversy_score.py` produces a 0–100 score from three log-normalised components (reverts, unique editors, spike frequency).
4. **Visualise** – `visualizer.py` returns Plotly figures embedded in the Streamlit dashboard.

---

## ⚠️ Limitations & Known Issues

- **Keyword-based revert detection** may produce false positives or miss reverts with unusual phrasing.
- **Bot detection** relies on the username convention — bots not following this convention will be misclassified.
- **Fetching very large articles** (e.g. Donald Trump, > 50 000 revisions) is capped at 5 000 revisions by default (`MAX_REVISIONS` in `config.py`).
- **No ML** — the controversy score is a rule-based heuristic, not a trained model.
- **English Wikipedia only** — the API URL targets `en.wikipedia.org`.

---

## 🚀 Future Improvement Ideas

- [ ] Add multi-language Wikipedia support (configurable API URL)
- [ ] Train a classifier on labelled edit comments for better revert detection
- [ ] Detect edit-war patterns using the [WP:3RR rule](https://en.wikipedia.org/wiki/Wikipedia:Three-revert_rule) (same editor reverting 3+ times in 24 h)
- [ ] Compare controversy scores across multiple articles side by side
- [ ] Cache API responses locally (SQLite / Parquet) to avoid re-fetching
- [ ] Add user-blocking / protection-log analysis
- [ ] Export full report as PDF
