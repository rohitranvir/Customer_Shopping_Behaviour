# Inflation Basket Tracker

## Project Overview
A Python-based automated ETL pipeline and dashboard that tracks daily prices of essential grocery items. It scrapes data, trains machine learning models to forecast future costs, and visualizes inflation metrics via an interactive Streamlit dashboard.

## How It Works (Pipeline Flow)
1. **Scraping**: A Playwright script scrapes daily prices for 5 grocery SKUs from BigBasket.
2. **Storage**: Data is processed and upserted into a local SQLite database and CSV files in the `data/` directory.
3. **Quality Check & Feature Engineering**: Data is validated for variation, and time-series features (lags, rolling means, date ordinals) are generated.
4. **Machine Learning**: A Scikit-learn Gradient Boosting Regressor (not Random Forest) evaluates if retraining is needed (every 7 days) and generates a 7-day price forecast.
5. **Automation**: A GitHub Actions cron job runs this entire pipeline daily and commits the updated data directly back to the GitHub repository.
6. **Visualization**: A Streamlit app reads the local data and models to display historical trends, daily inflation rates, and future price predictions.

## Features
- **Automated Web Scraping**: Headless browser extraction of product prices using Playwright.
- **Time-Series ML Forecasting**: 7-day price predictions using Gradient Boosting Regressor with cross-validation.
- **Data Quality Diagnostics**: Automated reporting on low price variations and missing data.
- **Interactive Dashboard**: Streamlit UI with Plotly charts for total basket cost, daily inflation percentage, and per-item trends.
- **CI/CD Automation**: Fully hands-off daily execution using GitHub Actions.

## Tech Stack
- **Language**: Python 3.10
- **Web Scraping**: Playwright
- **Database**: SQLite
- **Data Processing**: Pandas, NumPy
- **Machine Learning**: Scikit-learn, Joblib
- **Frontend / Dashboard**: Streamlit, Plotly
- **Automation**: GitHub Actions

## Folder Structure
```text
inflation-basket/
├── .github/workflows/   # GitHub Actions automation (cron jobs)
├── analysis/            # Calculation logic for dashboard metrics
├── config/              # Configuration variables
├── dashboard/           # Streamlit app (app.py)
├── data/                # SQLite DB, predictions, metrics, and models
├── database/            # Database connection & queries
├── logs/                # Application logs
├── ml/                  # ML training (train_model.py) and prediction scripts
├── pipeline/            # Orchestration script (run_pipeline.py)
├── processing/          # Feature engineering and data quality checks
├── scraper/             # Playwright scraping logic
├── utils/               # Helper utilities (logger)
└── requirements.txt     # Python dependencies
```

## Setup and Installation
1. Clone the repository.
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Install the Playwright Chromium browser binary:
   ```bash
   playwright install chromium
   ```

## How to Run Locally

### Run the Full Pipeline
To run the scraper, data quality checks, model training, and predictions in one go:
```bash
python pipeline/run_pipeline.py
```

### Run the Dashboard
To view the Streamlit dashboard:
```bash
streamlit run dashboard/app.py
```

## Automation Pipeline
The project uses GitHub Actions (`.github/workflows/automation.yml`) to schedule daily runs.
- **Trigger**: Runs daily at 7:00 AM IST.
- **Execution**: Checks out the repo, sets up Python, installs dependencies and Playwright.
- **Pipeline steps**: Sequentially executes `scraper/scrape_prices.py`, `ml/train_model.py`, and `ml/predict.py`.
- **Storage**: Commits the updated SQLite database and generated CSV data directly back to the GitHub `data/` directory. *(Note: AWS S3 integration is not currently implemented in the codebase).*

## Dashboard Screenshots
*(Placeholder for dashboard screenshots. Add images here showing the Price Trends, Total Basket Cost, and Model Diagnostics tabs).*
```markdown
![Dashboard Overview](path/to/screenshot1.png)
![Model Metrics](path/to/screenshot2.png)
```

## Future Improvements
- **Cloud Storage Migration**: Transition data storage from GitHub commits to AWS S3 to prevent repository bloat from database files.
- **Cloud Hosting**: Deploy the Streamlit dashboard to AWS EC2 (currently runs locally).
- **Model Refinement**: Migrate from Gradient Boosting to Random Forest (as originally planned) or compare models dynamically.
- **Scraper Resiliency**: Enhance Playwright selectors, as relying on `<title>` tag regex is prone to breaking if the target website updates its structure.

## License
MIT License
"# inflation-basket" 
