"""
generate_inflation_pdf.py
--------------------------
Generates a comprehensive project report PDF for the Inflation Basket Tracker.
Run with:  python generate_inflation_pdf.py
Output:    Inflation_Basket_Tracker_Report.pdf
"""

from fpdf import FPDF
from fpdf.enums import XPos, YPos
import os

OUTPUT_FILE = "Inflation_Basket_Tracker_Report.pdf"

# Colour palette
DARK_BG    = (14,  17,  23)
ACCENT     = (76, 155, 232)
RED        = (180,  40,  50)
GREEN      = (80, 140,  70)
ORANGE     = (200, 110,  40)
WHITE      = (255, 255, 255)
LIGHT_GRAY = (200, 200, 200)
MID_GRAY   = (140, 140, 140)
BLACK      = (0,   0,   0)


class ReportPDF(FPDF):

    def header(self):
        self.set_fill_color(*DARK_BG)
        self.rect(0, 0, 210, 18, style="F")
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*ACCENT)
        self.set_y(5)
        self.cell(0, 8, "Inflation Basket Tracker  --  Project Report", align="C")
        self.ln(12)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MID_GRAY)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    # ── Helpers ──────────────────────────────────────────────────────

    def section_title(self, text: str):
        self.ln(3)
        self.set_fill_color(*ACCENT)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 12)
        self.cell(0, 9, f"  {text}", fill=True,
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
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

    def numbered(self, items: list):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)
        for i, item in enumerate(items, 1):
            self.set_x(self.l_margin + 8)
            self.multi_cell(0, 5.5, f"{i}.  {item}")
        self.ln(1)

    def qa_block(self, q: str, a: str):
        self.set_font("Helvetica", "B", 9.5)
        self.set_text_color(20, 60, 120)
        self.multi_cell(0, 5.5, f"Q: {q}")
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(30, 30, 30)
        self.set_x(self.l_margin + 6)
        self.multi_cell(0, 5.5, f"A: {a}")
        self.ln(1)

    def table(self, headers: list, rows: list, col_widths: list):
        self.set_fill_color(*DARK_BG)
        self.set_text_color(*ACCENT)
        self.set_font("Helvetica", "B", 9)
        for h, w in zip(headers, col_widths):
            self.cell(w, 7, h, border=1, fill=True)
        self.ln()
        self.set_font("Helvetica", "", 9)
        for i, row in enumerate(rows):
            fill = i % 2 == 0
            self.set_fill_color(240, 243, 250) if fill \
                else self.set_fill_color(*WHITE)
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


# ─── Build PDF ────────────────────────────────────────────────────────────────

def build():
    pdf = ReportPDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(14, 22, 14)

    # ════════════════════════════════════════════════════
    # PAGE 1  --  Title Page
    # ════════════════════════════════════════════════════
    pdf.add_page()

    # Hero banner
    pdf.set_fill_color(*DARK_BG)
    pdf.rect(0, 18, 210, 70, style="F")

    pdf.set_y(30)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(*ACCENT)
    pdf.cell(0, 13, "Inflation Basket Tracker",
             align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(*LIGHT_GRAY)
    pdf.cell(0, 7,
             "Automated Price Monitoring | ML Forecasting | Streamlit Dashboard",
             align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*RED)
    pdf.cell(0, 6,
             "Playwright  |  SQLite  |  Random Forest  |  GitHub Actions  |  Plotly",
             align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # Quick-stats boxes
    stats = [("5", "Items Tracked"), ("7", "Day Forecast"),
             ("~76%", "Model R2"), ("Daily", "Auto Run"), ("6", "Modules")]
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
        "The Inflation Basket Tracker is an end-to-end automated data pipeline that "
        "monitors daily prices of 5 essential grocery items (Milk, Eggs, Bread, Rice, Oil) "
        "scraped from an e-commerce website using Playwright. Prices are stored in a SQLite "
        "database, processed with Pandas, and fed into a Random Forest model to forecast "
        "the weekly grocery basket cost. The entire pipeline runs automatically every "
        "morning via GitHub Actions, and results are displayed on an interactive Streamlit "
        "dashboard."
    )

    pdf.sub_title("Problem Statement")
    pdf.body(
        "Official government inflation metrics (CPI) are lagging indicators and "
        "broad averages that don't reflect the real-time cost of living for specific "
        "households. This project solves that by monitoring a personalised 'basket' of "
        "goods daily, providing immediate visibility into price fluctuations and "
        "forecasting short-term grocery expenses -- a personalised, real-time inflation monitor."
    )

    pdf.highlight_box(
        "30-Second Elevator Pitch",
        "An automated pipeline that scrapes daily grocery prices using Playwright, stores "
        "them in a database, uses a Random Forest ML model to forecast the weekly grocery "
        "bill, and displays everything on a custom Streamlit dashboard -- running "
        "automatically every morning via GitHub Actions.",
        color=ORANGE
    )

    # ── Section 2: Tech Stack ─────────────────────────────────────────
    pdf.section_title("2.  Tech Stack")
    pdf.table(
        headers=["Layer", "Technology", "Why Chosen"],
        rows=[
            ["Web Scraping",    "Playwright (Python)",       "Handles JS-heavy SPAs; faster than Selenium"],
            ["Database",        "SQLite",                    "Zero config, file-based, native Python support"],
            ["Data Processing", "Pandas & NumPy",            "Efficient time-series aggregation & cleaning"],
            ["Machine Learning","Scikit-learn (RF)",         "Non-linear, robust, minimal hyperparameter tuning"],
            ["Dashboard",       "Streamlit & Plotly",        "Interactive charts, rapid development"],
            ["Automation",      "GitHub Actions (cron)",     "Daily pipeline trigger at 01:30 UTC"],
            ["Version Control", "Git",                       "Code + dataset versioning in one repo"],
            ["Language",        "Python 3.10+",              "Primary language for all layers"],
        ],
        col_widths=[38, 42, 100]
    )

    # ════════════════════════════════════════════════════
    # PAGE 2  --  Architecture & File Structure
    # ════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("3.  Project Architecture & File Structure")

    pdf.table(
        headers=["Module / File", "Purpose"],
        rows=[
            ["scraper/scrape_prices.py",      "Playwright headless browser -- extracts item prices"],
            ["database/db.py",                "SQLite schema setup, insert & query operations"],
            ["processing/",                   "Feature engineering: date_ordinal, day_of_week, is_weekend"],
            ["ml/train_model.py",             "Trains RandomForestRegressor on latest DB data"],
            ["ml/predict.py",                 "Generates 7-day basket cost forecast CSV"],
            ["dashboard/app.py",              "Streamlit dashboard -- visualises history + predictions"],
            ["pipeline/run_pipeline.py",      "Orchestrates all stages in sequence"],
            [".github/workflows/",            "GitHub Actions YAML -- daily cron job definition"],
            ["config/",                       "Settings (items list, URLs, thresholds)"],
            ["data/prices.db",                "SQLite database file (versioned in Git)"],
        ],
        col_widths=[68, 112]
    )

    pdf.sub_title("End-to-End Data Flow")
    pdf.code_block(
        "GitHub Actions (cron: 01:30 UTC daily)\n"
        "        |\n"
        "scraper/scrape_prices.py  (Playwright)  ->  Raw prices\n"
        "        |\n"
        "database/db.py  ->  INSERT into price_data table (SQLite)\n"
        "        |\n"
        "processing/  ->  Feature Engineering\n"
        "   Add: date_ordinal, day_of_week, day_of_year, is_weekend\n"
        "        |\n"
        "ml/train_model.py  ->  Retrain RandomForestRegressor\n"
        "        |\n"
        "ml/predict.py  ->  7-day forecast CSV\n"
        "        |\n"
        "GitHub Actions commits updated DB + CSV back to repo\n"
        "        |\n"
        "dashboard/app.py (Streamlit)  ->  http://localhost:8501"
    )

    pdf.section_title("4.  Database Design")
    pdf.sub_title("Table: price_data")
    pdf.table(
        headers=["Column", "Type", "Description"],
        rows=[
            ["id",        "INTEGER PK",  "Auto-incrementing unique identifier"],
            ["date",      "TEXT",        "ISO 8601 date string (YYYY-MM-DD)"],
            ["item_name", "TEXT",        "Product name (Milk, Eggs, Bread, Rice, Oil)"],
            ["price",     "REAL",        "Item price scraped from website"],
            ["website",   "TEXT",        "Source domain (e.g. BigBasket)"],
        ],
        col_widths=[28, 30, 122]
    )
    pdf.bullet([
        "Why SQLite: Zero configuration, file-based (version-controlled via Git), "
         "native Python support -- ideal for single-user analytics at this scale.",
        "Data Integrity: Schema enforced via CREATE TABLE with column types.",
        "Duplicates managed by application logic (could be a UNIQUE constraint on date+item).",
        "Adding 'website' column required a migration (drop/recreate table) -- "
         "a key lesson in schema evolution.",
    ])

    # ════════════════════════════════════════════════════
    # PAGE 3  --  ML, Scraping, Automation, Dashboard
    # ════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("5.  Machine Learning Details")

    pdf.sub_title("Model: Random Forest Regressor (scikit-learn)")
    pdf.table(
        headers=["Property", "Detail"],
        rows=[
            ["Model Type",        "RandomForestRegressor (ensemble of decision trees)"],
            ["Target Variable",   "Total daily basket cost (sum of all 5 items)"],
            ["Features",          "date_ordinal, day_of_week, day_of_year, is_weekend"],
            ["Accuracy (R2)",     "~0.76 on synthetic data"],
            ["Prediction Output", "7-day forward forecast as a CSV file"],
            ["Retraining",        "Daily -- pipeline retrains on the full latest dataset"],
        ],
        col_widths=[45, 135]
    )

    pdf.sub_title("Why Random Forest over Linear Regression?")
    pdf.bullet([
        "Linear Regression assumes a straight-line relationship -- rarely true for "
         "volatile grocery prices.",
        "Random Forest captures non-linear patterns and interactions (e.g. weekend price hikes).",
        "Robust to outliers (voting across many trees reduces overfitting).",
        "Requires minimal hyperparameter tuning compared to Gradient Boosting.",
        "Limitation: Does not extrapolate well outside training range (tree-based models "
         "plateau at the max/min seen in training).",
    ])

    pdf.sub_title("Feature Engineering")
    pdf.table(
        headers=["Feature", "Type", "Captures"],
        rows=[
            ["date_ordinal",  "Integer (days since epoch)", "Long-term price trend"],
            ["day_of_week",   "0-6 integer",                "Weekly pricing cycles"],
            ["day_of_year",   "1-365 integer",              "Seasonal patterns"],
            ["is_weekend",    "0 or 1 binary flag",         "Weekend price surges"],
        ],
        col_widths=[38, 55, 87]
    )

    pdf.section_title("6.  Web Scraping Details")
    pdf.bullet([
        "Tool: Playwright (Python sync API) -- chosen because BigBasket and similar "
         "e-commerce sites are Single Page Applications (SPAs) that load via JavaScript. "
         "requests/BeautifulSoup only gets the initial HTML shell.",
        "Pattern: Launches a headless Chromium browser, navigates to each product page, "
         "waits for the price element to appear, then extracts and returns the value.",
        "Challenge: Anti-bot measures (WAF/Cloudflare) frequently block headless browsers "
         "with 'Access Denied' errors.",
        "Error Handling: Every navigation and extraction wrapped in try-except; if a "
         "selector fails or times out, None is returned and the pipeline logs the error "
         "but continues without crashing.",
        "Explicit waits used for async-loaded price elements.",
    ])

    pdf.section_title("7.  Automation  --  GitHub Actions")
    pdf.code_block(
        "# .github/workflows/daily_pipeline.yml\n"
        "on:\n"
        "  schedule:\n"
        "    - cron: '30 1 * * *'   # Daily at 01:30 UTC = 07:00 AM IST\n\n"
        "jobs:\n"
        "  run-pipeline:\n"
        "    runs-on: ubuntu-latest\n"
        "    steps:\n"
        "      - Checkout code\n"
        "      - Set up Python\n"
        "      - pip install -r requirements.txt\n"
        "      - playwright install chromium\n"
        "      - python scraper/scrape_prices.py\n"
        "      - python ml/train_model.py\n"
        "      - python ml/predict.py\n"
        "      - git commit & push (updated DB + predictions CSV)"
    )

    pdf.section_title("8.  Dashboard Features")
    pdf.sub_title("Key Metric Cards (Top of Dashboard)")
    pdf.bullet([
        "Latest Basket Cost  --  today's total grocery spend",
        "Daily Inflation Rate (%)  --  day-over-day percentage change",
        "Forecasted Cost (7 days)  --  model's prediction",
    ])
    pdf.sub_title("Charts")
    pdf.table(
        headers=["Chart", "Type", "What It Shows"],
        rows=[
            ["Historical Price Trends",     "Multi-line chart", "Per-item price over time"],
            ["Total Basket Cost",           "Line chart",       "Historical vs. 7-day predicted cost"],
            ["Daily Inflation Rate",        "Bar chart",        "Day-over-day % fluctuations"],
        ],
        col_widths=[55, 38, 87]
    )
    pdf.body(
        "Dashboard reads directly from the SQLite DB and predictions CSV. "
        "It refreshes automatically whenever files are updated by the pipeline "
        "(e.g. after a git pull following an overnight GitHub Actions run)."
    )

    # ════════════════════════════════════════════════════
    # PAGE 4  --  Challenges, Limitations, Future, Q&A
    # ════════════════════════════════════════════════════
    pdf.add_page()
    pdf.section_title("9.  Setup & Running")
    pdf.code_block(
        "# 1. Navigate to project\n"
        "cd d:\\Project\\inflation-basket-tracker\\inflation-basket\n\n"
        "# 2. Install dependencies\n"
        "pip install -r requirements.txt\n"
        "playwright install chromium\n\n"
        "# 3. Run the full pipeline manually\n"
        "python pipeline/run_pipeline.py\n\n"
        "# 4. Launch dashboard\n"
        "streamlit run dashboard/app.py\n"
        "#  --> http://localhost:8501"
    )
    pdf.sub_title("requirements.txt")
    pdf.code_block(
        "pandas\nnumpy\nscikit-learn\nstreamlit\nplotly\nplaywright\njoblib"
    )

    pdf.section_title("10.  Challenges & Solutions")
    pdf.table(
        headers=["Challenge", "Solution / Workaround"],
        rows=[
            ["Anti-bot / WAF blocking Playwright",
             "Experimented with custom headers; proxies/stealth plugin as future fix"],
            ["Dynamic/async price loading",
             "Used Playwright explicit waits for CSS selectors"],
            ["Cold-start (too little data for ML)",
             "Generated synthetic mock data to test pipeline robustness"],
            ["Schema evolution (adding 'website' column)",
             "Drop and recreate table migration strategy"],
            ["Scraper failure cascades to dashboard",
             "Error logging + pipeline continues on partial failure"],
        ],
        col_widths=[68, 112]
    )

    pdf.section_title("11.  Limitations")
    pdf.bullet([
        "Data Reliability: Dependent on website DOM structure -- UI updates break the scraper.",
        "Scalability: SQLite locks during writes -- not suitable for high-concurrency environments.",
        "Model Simplicity: Features like 'Day of Week' miss complex economic drivers "
         "(supply chain shocks, fuel prices).",
        "Local Execution: Dashboard runs locally -- cloud deployment needs DB persistence solution.",
        "Extrapolation: Tree-based RF model plateaus outside training min/max range.",
    ])

    pdf.section_title("12.  Future Improvements")
    pdf.bullet([
        "Robust Scraping: Rotating proxies + User-Agent rotation to bypass bot detection.",
        "Advanced ML: Facebook Prophet or ARIMA for better seasonality + confidence intervals.",
        "Cloud Deployment: Streamlit Cloud or AWS; PostgreSQL/Supabase for the DB.",
        "Alerting: Email/Slack notification if price spikes >X% or scraping fails.",
        "Async Scraper: asyncio + Playwright async API to scale to 1000+ items efficiently.",
        "Data Quality Layer: Reject prices that deviate >50% from the rolling average.",
    ])

    pdf.section_title("13.  Resume Bullet Points")
    pdf.bullet([
        "Engineered an end-to-end automated data pipeline extracting daily pricing data "
         "for 5+ SKUs using Python and Playwright.",
        "Developed a Random Forest forecasting model (scikit-learn) achieving ~76% R2 "
         "accuracy to predict weekly grocery basket costs.",
        "Architected a serverless system using SQLite and GitHub Actions to automate "
         "ETL jobs, reducing manual tracking effort by 100%.",
        "Built an interactive Streamlit dashboard visualizing real-time inflation metrics "
         "and price trends for data-driven personal finance.",
    ])

    pdf.section_title("14.  Key Interview Q&A")
    pdf.qa_block(
        "Explain your project in one sentence.",
        "An automated pipeline that scrapes daily grocery prices to visualize real-time "
        "personal inflation trends and forecast future basket costs."
    )
    pdf.qa_block(
        "Why Random Forest over Linear Regression?",
        "Linear Regression assumes a straight-line relationship which rarely exists in "
        "volatile prices. Random Forest captures non-linear patterns and feature "
        "interactions (e.g. weekend price hikes) better."
    )
    pdf.qa_block(
        "Why SQLite instead of MySQL/PostgreSQL?",
        "For a single-user analytics project where data volume is small (<1 GB), SQLite "
        "creates zero overhead and simplifies CI/CD since the DB is just a file in Git."
    )
    pdf.qa_block(
        "How does the automation work?",
        "A GitHub Actions workflow triggers daily. It spins up a runner, installs "
        "dependencies, executes the pipeline scripts sequentially, and commits the new "
        "data back to the repo automatically."
    )
    pdf.qa_block(
        "Why Playwright and not Selenium?",
        "Playwright is faster, more reliable for modern SPAs, and has better native "
        "handling of waiting for network events and selectors."
    )
    pdf.qa_block(
        "How do you handle scraper failures?",
        "try-except blocks log errors without crashing. In production, I would add a "
        "retry mechanism with exponential backoff and alert notifications."
    )
    pdf.qa_block(
        "How is this different from a Kaggle project?",
        "This is an end-to-end system: I built data ingestion (scraper), storage (DB), "
        "automation (CI/CD), ML forecasting, and a user interface (dashboard) -- not "
        "just a model trained on a static CSV."
    )
    pdf.qa_block(
        "What did you learn from this?",
        "The complexity of maintaining a data pipeline -- a small scraper failure cascades "
        "to the model and dashboard, emphasizing the need for robust error handling."
    )

    pdf.output(OUTPUT_FILE)
    print(f"PDF saved: {os.path.abspath(OUTPUT_FILE)}")


if __name__ == "__main__":
    build()
