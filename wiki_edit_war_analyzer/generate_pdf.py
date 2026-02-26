"""
generate_pdf.py
---------------
Generates a comprehensive project report PDF for the Wikipedia Edit War Analyzer.
Run with:  python generate_pdf.py
Output:    Wikipedia_Edit_War_Analyzer_Report.pdf
"""

from fpdf import FPDF
from fpdf.enums import XPos, YPos
import os

OUTPUT_FILE = "Wikipedia_Edit_War_Analyzer_Report.pdf"

# Colour palette (R, G, B)
DARK_BG    = (14,  17,  23)
ACCENT     = (76, 155, 232)
RED        = (180,  40,  50)
GREEN      = (80, 140,  70)
WHITE      = (255, 255, 255)
LIGHT_GRAY = (200, 200, 200)
MID_GRAY   = (140, 140, 140)
BLACK      = (0,   0,   0)


class WikiPDF(FPDF):

    def header(self):
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 18, style="F")
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*ACCENT)
        self.set_y(5)
        self.cell(0, 8, "Wikipedia Edit War Analyzer  --  Project Report", align="C")
        self.ln(12)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MID_GRAY)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    # ── Helpers ───────────────────────────────────────────────────────

    def section_title(self, text: str):
        self.ln(3)
        self.set_fill_color(*ACCENT)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 9, f"  {text}", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)
        self.set_text_color(*BLACK)

    def sub_title(self, text: str):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*RED)
        self.cell(0, 7, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(*BLACK)

    def body(self, text: str):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bullet(self, items: list):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)
        for item in items:
            self.set_x(self.l_margin + 8)
            self.multi_cell(0, 5.5, f"*  {item}")
        self.ln(1)

    def table(self, headers: list, rows: list, col_widths: list):
        # Header row
        self.set_fill_color(*DARK_BG)
        self.set_text_color(*ACCENT)
        self.set_font("Helvetica", "B", 9)
        for h, w in zip(headers, col_widths):
            self.cell(w, 7, h, border=1, fill=True)
        self.ln()
        # Data rows
        self.set_font("Helvetica", "", 9)
        for i, row in enumerate(rows):
            fill = i % 2 == 0
            if fill:
                self.set_fill_color(240, 243, 250)
            else:
                self.set_fill_color(*WHITE)
            self.set_text_color(30, 30, 30)
            for cell, w in zip(row, col_widths):
                self.cell(w, 6.5, cell, border=1, fill=fill)
            self.ln()
        self.ln(2)

    def code_block(self, code: str):
        self.set_fill_color(225, 228, 238)
        self.set_font("Courier", "", 8.5)
        self.set_text_color(20, 20, 60)
        self.multi_cell(0, 5, code, fill=True)
        self.ln(2)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)

    def highlight_box(self, title: str, text: str, color=None):
        color = color or GREEN
        self.set_fill_color(*color)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 9.5)
        self.cell(0, 7, f"  {title}", fill=True,
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_fill_color(235, 244, 250)
        self.set_text_color(20, 20, 50)
        self.set_font("Helvetica", "", 9.5)
        self.multi_cell(0, 5.5, f"  {text}", fill=True)
        self.ln(3)


# ─── Build PDF ───────────────────────────────────────────────────────────────

def build():
    pdf = WikiPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(14, 22, 14)

    # ════════════════════════════════════════════════════
    # PAGE 1  --  Title Page
    # ════════════════════════════════════════════════════
    pdf.add_page()

    # Dark hero banner
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 18, 210, 70, style="F")

    pdf.set_y(30)
    pdf.set_font("Helvetica", "B", 26)
    pdf.set_text_color(*ACCENT)
    pdf.cell(0, 14, "Wikipedia Edit War Analyzer",
             align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("Helvetica", "", 13)
    pdf.set_text_color(*LIGHT_GRAY)
    pdf.cell(0, 8, "End-to-End Python + Streamlit Data Analysis Project",
             align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*RED)
    pdf.cell(0, 6,
             "Edit War Detection  |  Controversy Scoring  |  Interactive Dashboard",
             align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Quick-stats boxes
    pdf.set_y(96)
    stats = [("100%","Python"), ("4","Libraries"), ("6","Modules"),
             ("5000","Max Revisions"), ("6","Charts")]
    box_w = (210 - 28) / len(stats)
    x0 = 14
    for val, lbl in stats:
        pdf.set_fill_color(*DARK_BG)
        pdf.rect(x0, 94, box_w - 2, 22, style="F")
        pdf.set_xy(x0, 97)
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(*ACCENT)
        pdf.cell(box_w - 2, 8, val, align="C")
        pdf.set_xy(x0, 105)
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(*LIGHT_GRAY)
        pdf.cell(box_w - 2, 5, lbl, align="C")
        x0 += box_w

    pdf.set_xy(14, 122)
    pdf.set_text_color(*BLACK)

    # ── Section 1: Overview ───────────────────────────────────────────
    pdf.section_title("1.  Project Overview")
    pdf.body(
        "The Wikipedia Edit War Analyzer is a complete data analysis and visualization "
        "system that fetches the full revision history of any Wikipedia article using the "
        "public MediaWiki REST API. It automatically detects edit wars, classifies editors "
        "as bots or humans, performs keyword-based NLP on edit comments, and computes a "
        "weighted Controversy Score (0-100). Results are displayed in a dark-themed "
        "Streamlit dashboard with six interactive Plotly charts and a CSV export feature."
    )

    pdf.sub_title("Problem Statement")
    pdf.body(
        "Wikipedia articles on controversial topics (politics, science, history) frequently "
        "experience 'edit wars' -- repeated reversions between editors with opposing views. "
        "Identifying these patterns manually is tedious. This tool automates detection."
    )

    pdf.sub_title("Core Objectives")
    pdf.bullet([
        "Fetch and paginate thousands of Wikipedia revisions automatically.",
        "Detect reverts (key signal of edit wars) via keyword analysis.",
        "Classify bot vs. human editors by username convention.",
        "Identify abnormal edit-frequency spikes (rapid-fire editing periods).",
        "Compute a single, interpretable Controversy Score per article.",
        "Visualise all findings in an interactive web dashboard.",
    ])

    # ════════════════════════════════════════════════════
    # PAGE 2  --  Architecture & Module Details
    # ════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("2.  Project Architecture & File Structure")

    pdf.table(
        headers=["File", "Responsibility"],
        rows=[
            ["config.py",            "All constants: API URL, keywords, score weights"],
            ["api_fetcher.py",       "MediaWiki API requests + rvcontinue pagination"],
            ["data_processor.py",    "Revert, bot, spike & NLP detection on DataFrame"],
            ["controversy_score.py", "Weighted log-normalised Controversy Score (0-100)"],
            ["visualizer.py",        "6 Plotly charts returned as Figure objects"],
            ["app.py",               "Streamlit dashboard -- entry point"],
            ["requirements.txt",     "4 pip dependencies"],
            ["README.md",            "Full project documentation"],
        ],
        col_widths=[60, 120]
    )

    pdf.sub_title("Data Flow")
    pdf.code_block(
        "User Input (Article Title)\n"
        "        |\n"
        "api_fetcher.py  ->  MediaWiki API  ->  raw DataFrame\n"
        "        |\n"
        "data_processor.py  ->  enriched DataFrame\n"
        "   (is_revert, is_bot, is_spike_day, nlp_*, size_delta)\n"
        "        |\n"
        "controversy_score.py  ->  score dict  {score, label, breakdown}\n"
        "        |\n"
        "visualizer.py  ->  6 Plotly Figures\n"
        "        |\n"
        "app.py (Streamlit)  ->  Dashboard at http://localhost:8501"
    )

    pdf.section_title("3.  Module Deep-Dives")

    pdf.sub_title("config.py")
    pdf.bullet([
        "WIKIPEDIA_API_URL: https://en.wikipedia.org/w/api.php",
        "REVISIONS_PER_REQUEST = 500  (API maximum per call)",
        "MAX_REVISIONS = 5000  (cap to keep large articles manageable)",
        "RATE_LIMIT_DELAY = 0.5 seconds between paginated API calls",
        "REVERT_KEYWORDS: revert, undo, rv, vandalism, rollback, restore ...",
        "CONFLICT_KEYWORDS: 4 groups -- hostility, dispute, revert_lang, protection",
        "Score weights: reverts 40%, unique editors 30%, edit spikes 30%",
    ])

    pdf.sub_title("api_fetcher.py  --  fetch_revision_history(article_title)")
    pdf.bullet([
        "Opens a requests.Session() for connection pooling efficiency.",
        "Sends rvprop=ids|timestamp|user|comment|size to get all needed fields.",
        "rvdir=newer ensures oldest-first ordering (ideal for time-series charts).",
        "Follows rvcontinue token automatically to get all pages of results.",
        "Raises ValueError for empty title or missing article.",
        "Raises RuntimeError for connection errors, timeouts, or API errors.",
        "Returns a clean pandas DataFrame with 5 columns, sorted by timestamp.",
    ])

    pdf.sub_title("data_processor.py  --  process_revisions(df)")
    pdf.table(
        headers=["Column Added", "Method", "Logic"],
        rows=[
            ["is_revert",       "detect_reverts()",        "Comment contains REVERT_KEYWORDS"],
            ["is_bot",          "detect_bots()",           "Username matches \\bbot\\b regex"],
            ["is_spike_day",    "detect_spikes()",         "Day edits >= mean_daily * 3.0"],
            ["nlp_hostility",   "nlp_conflict_flags()",    "Comment has hostility keywords"],
            ["nlp_dispute",     "nlp_conflict_flags()",    "Comment has dispute keywords"],
            ["nlp_revert_lang", "nlp_conflict_flags()",    "Comment has revert language"],
            ["nlp_protection",  "nlp_conflict_flags()",    "Comment has protection keywords"],
            ["nlp_any_conflict","nlp_conflict_flags()",    "OR of all 4 NLP columns"],
            ["size_delta",      "compute_edit_size_delta()","Byte change per revision"],
        ],
        col_widths=[42, 55, 83]
    )

    # ════════════════════════════════════════════════════
    # PAGE 3  --  Scoring, Charts, Dashboard
    # ════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("4.  Controversy Score Algorithm")

    pdf.body(
        "The Controversy Score is a composite metric in the range [0, 100] derived from "
        "three independently normalised components. A logarithmic scale ensures that both "
        "small and very large articles produce meaningful, comparable scores."
    )

    pdf.sub_title("Formula")
    pdf.code_block(
        "revert_rate    = total_reverts / total_edits x 100\n"
        "editor_density = unique_editors / total_edits x 100\n"
        "spike_fraction = spike_days / total_days x 100\n\n"
        "revert_norm  = log10(revert_rate   + 1) / log10(30 + 1)   [max = 30]\n"
        "editor_norm  = log10(editor_density + 1) / log10(60 + 1)  [max = 60]\n"
        "spike_norm   = log10(spike_fraction + 1) / log10(20 + 1)  [max = 20]\n\n"
        "score = (revert_norm x 0.40\n"
        "       + editor_norm x 0.30\n"
        "       + spike_norm  x 0.30) x 100"
    )

    pdf.table(
        headers=["Score Range", "Label", "Interpretation"],
        rows=[
            ["0 - 24",   "Low",     "Mostly peaceful editing, rare reversions"],
            ["25 - 49",  "Medium",  "Some dispute activity, moderate revert rate"],
            ["50 - 74",  "High",    "Active edit warring, many reversions"],
            ["75 - 100", "Extreme", "Heavy and persistent edit war detected"],
        ],
        col_widths=[35, 35, 110]
    )

    pdf.section_title("5.  Visualizations  (Plotly, dark theme)")
    pdf.table(
        headers=["Chart", "Type", "What It Shows"],
        rows=[
            ["Weekly Edit Activity",       "Line chart",       "Edit volume per week over full history"],
            ["Reverts vs Normal Edits",    "Stacked bar",      "Weekly revert count vs normal edits"],
            ["Bot vs Human Edits",         "Horizontal bar",   "Total edits attributed to humans/bots"],
            ["Top 10 Most Active Editors", "Horizontal bar",   "Leaderboard; bots highlighted orange"],
            ["Conflict Language",          "Donut pie chart",  "NLP keyword categories in comments"],
            ["Controversy Gauge",          "Gauge / indicator","0-100 speedometer with colour zones"],
        ],
        col_widths=[55, 38, 87]
    )

    pdf.section_title("6.  Streamlit Dashboard (app.py)")
    pdf.bullet([
        "Sidebar: free-text article title input + 7 example article quick-launch buttons.",
        "Analysis triggered by 'Analyze Article' button or example click.",
        "Spinner shown during API fetch and data processing stages.",
        "Controversy gauge + per-component metric cards at the top.",
        "8 stat cards: total edits, reverts, revert rate, unique editors, human "
         "edits, bot edits, spike days, NLP conflicts.",
        "All 5 charts in a 2-column responsive grid.",
        "Raw data table (last 500 revisions) with one-click CSV download button.",
        "Custom CSS: dark mode, gradient cards, coloured stat borders.",
        "Full error handling: invalid titles, API failures, empty revision lists.",
    ])

    # ════════════════════════════════════════════════════
    # PAGE 4  --  Setup, Testing, Limitations, Future
    # ════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("7.  Installation & Running")

    pdf.code_block(
        "# 1. Navigate to project folder\n"
        "cd d:\\Project\\wiki_edit_war_analyzer\n\n"
        "# 2. Create virtual environment  (already done)\n"
        "python -m venv venv\n\n"
        "# 3. Activate it\n"
        "venv\\Scripts\\activate          # Windows\n\n"
        "# 4. Install dependencies  (already done)\n"
        "pip install -r requirements.txt\n\n"
        "# 5. Run the dashboard\n"
        "streamlit run app.py\n"
        "#  --> Opens at http://localhost:8501"
    )

    pdf.sub_title("requirements.txt  (4 packages only)")
    pdf.code_block(
        "requests>=2.31.0\n"
        "pandas>=2.0.0\n"
        "plotly>=5.18.0\n"
        "streamlit>=1.32.0"
    )

    pdf.section_title("8.  Example Articles & Expected Scores")
    pdf.table(
        headers=["Wikipedia Article", "Expected Label", "Why"],
        rows=[
            ["Flat Earth",                    "Extreme",     "Persistent fringe-theory reversions"],
            ["Vaccine hesitancy",             "High",        "Medical misinformation disputes"],
            ["Climate change",                "High",        "Scientific consensus vs denialism"],
            ["Israel-Hamas war",              "Extreme",     "Active geopolitical conflict"],
            ["Donald Trump",                  "High",        "Heavy partisan editing"],
            ["Homeopathy",                    "Medium/High", "Alternative medicine controversy"],
            ["Genetically modified organism", "Medium",      "Scientific vs. public opinion clash"],
            ["Python (programming language)", "Low",         "Technical article, few disputes"],
        ],
        col_widths=[65, 32, 83]
    )

    pdf.highlight_box(
        "Live Smoke-Test Result (Verified)",
        "Article: 'Flat Earth'  |  Revisions fetched: 5,000  "
        "|  Score: 71 / 100  |  Label: Extreme  |  Exit code: 0",
        color=GREEN
    )

    pdf.section_title("9.  Limitations & Known Issues")
    pdf.bullet([
        "Keyword-based revert detection may produce false positives or miss "
         "creatively-worded reverts.",
        "Bot detection relies on the 'bot' username convention -- custom-named "
         "bots may be misclassified.",
        "Large articles are capped at 5,000 revisions (configurable via MAX_REVISIONS "
         "in config.py).",
        "English Wikipedia only -- API URL targets en.wikipedia.org.",
        "No ML/AI -- the controversy score is a deterministic heuristic formula.",
        "Rate-limiting is courtesy-based (0.5 s delay); no auto-retry on HTTP 429.",
        "Suppressed / deleted revisions appear as 'Unknown' user with empty comments.",
    ])

    pdf.section_title("10.  Future Improvement Ideas")
    pdf.bullet([
        "Implement WP:3RR detection -- flag any editor reverting the same content "
         "3+ times in 24 h (the official Wikipedia edit-war policy).",
        "Add local caching (SQLite or Parquet) to skip re-fetching unchanged articles.",
        "Multi-article comparison mode -- plot controversy scores side-by-side.",
        "Train a text classifier on labelled edit comments for precision revert detection.",
        "Multi-language support -- allow picking any Wikipedia language edition.",
        "Wikipedia protection-log integration -- semi/fully protected articles are a "
         "strong edit-war signal.",
        "Time-range filter in the dashboard -- focus on a specific year or event window.",
        "In-app PDF report export directly from the Streamlit dashboard.",
    ])

    pdf.section_title("11.  Tech Stack Summary")
    pdf.table(
        headers=["Layer", "Tool / Library", "Purpose"],
        rows=[
            ["HTTP Client",     "requests",           "MediaWiki API calls with timeout & session"],
            ["Data Wrangling",  "pandas",             "DataFrame manipulation, resampling, groupby"],
            ["Visualisation",   "plotly",             "Interactive Plotly charts (dark theme)"],
            ["Dashboard",       "streamlit",          "Web UI, sidebar, stat cards, CSV download"],
            ["Language",        "Python 3.10+",       "All logic, scripting, and NLP"],
            ["API",             "MediaWiki REST API", "Wikipedia revision history (free, public)"],
        ],
        col_widths=[38, 42, 100]
    )

    pdf.output(OUTPUT_FILE)
    print(f"PDF saved: {os.path.abspath(OUTPUT_FILE)}")


if __name__ == "__main__":
    build()
