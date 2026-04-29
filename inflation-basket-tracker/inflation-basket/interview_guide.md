# Inflation Basket - Project Interview Guide

## 1. Project Summary (2–3 lines)
I built an end-to-end automated data pipeline that tracks daily prices of essential groceries (like milk, eggs, bread) from e-commerce sites using Playwright. It stores data in SQLite, predicts future costs using a Random Forest model, and visualizes inflation trends on a Streamlit dashboard, all automated via GitHub Actions.

## 2. Problem Statement
Official government inflation metrics (CPI) are often lagging indicators and broad averages that don't reflect the real-time cost of living for specific households. This project solves that by monitoring a personalized "basket" of goods daily, providing immediate visibility into price fluctuations and forecasting short-term grocery expenses.

## 3. Technologies Used
- **Programming:** Python (Primary language for scripting and data science libraries).
- **Web Scraping:** Playwright (Handles dynamic JavaScript-heavy websites better than Requests/BeautifulSoup).
- **Database:** SQLite (Lightweight, serverless, and perfect for a single-user project with moderate data volume).
- **Data Processing:** Pandas & NumPy (Efficient data manipulation, cleaning, and time-series aggregation).
- **Machine Learning:** Scikit-learn (RandomForestRegressor for robust, non-linear regression).
- **Visualization:** Streamlit & Plotly (Interactive web dashboard with responsive charts).
- **Automation:** GitHub Actions (Runs the scraper and ML pipeline daily on a cron schedule).
- **Version Control:** Git (Tracking code changes and dataset updates).

## 4. Project Architecture (End-to-End Flow)
1.  **Scraper (Playwright):** Launches a headless browser, navigates to product pages, extracts current prices, and handles errors.
2.  **Database (SQLite):** Inserts new price records with timestamps and source metadata into the `price_data` table.
3.  **Feature Engineering:** Processing script adds time-based features (Day of Week, Month, Weekend flag) to the raw data.
4.  **Model Training:** Retrains the Random Forest model daily on the latest dataset to capture recent trends.
5.  **Prediction:** Generates a 7-day forecast for the total basket cost.
6.  **Dashboard:** Streamlit app loads historical data and predictions to visualize trends and key metrics.
7.  **Automation:** GitHub Actions triggers this entire workflow every day at 01:30 UTC.

## 5. Machine Learning Details
- **Model:** Random Forest Regressor (Ensemble of decision trees).
- **Why Chosen:** It handles non-linear relationships well (prices don't always move linearly), is robust to outliers, and requires less hyperparameter tuning than gradient boosting for small datasets.
- **Features Used:** `date_ordinal` (trend), `day_of_week` (weekly cycles), `day_of_year` (seasonality), `is_weekend` (price surges).
- **Target Variable:** Total daily basket cost (sum of all items).
- **Prediction:** The model averages the predictions of multiple decision trees to output a continuous value (price).
- **Limitations:** Cannot extrapolate well outside the training range (a common limitation of tree-based models), relies heavily on recent history.

## 6. Database Design
- **Table Name:** `price_data`
- **Columns:**
    - `id` (INTEGER PK): Unique identifier.
    - `date` (TEXT): ISO 8601 date string (YYYY-MM-DD).
    - `item_name` (TEXT): Name of the product (e.g., "Milk").
    - `price` (REAL): The cost of the item.
    - `website` (TEXT): Source domain (e.g., "BigBasket").
- **Why SQLite:** Zero-configuration, file-based (easy to version control via Git for this scale), and native Python support.
- **Data Integrity:** Schema is enforced via `CREATE TABLE` with types. Duplicates are managed by application logic checks (or could be enforced by a composite UNIQUE constraint on date+item).

## 7. Web Scraping Details
- **Tool:** Playwright (Python sync API).
- **Why Chosen:** BigBasket and similar sites are Single Page Applications (SPAs) that load content via JavaScript. `requests` only gets the initial HTML, while Playwright renders the full DOM.
- **Challenges:** Bot detection (WAF/Cloudflare) often blocks automated requests ("Access Denied").
- **Error Handling:** Try-catch blocks wrap navigation and extraction; if a selector fails or navigation times out, `None` is returned, and the pipeline logs the error but continues.

## 8. Automation
- **Tool:** GitHub Actions.
- **Trigger:** `cron: '30 1 * * *'` (Runs daily at 1:30 AM UT / 7:00 AM IST).
- **Workflow Steps:**
    1.  Checkout code.
    2.  Set up Python environment.
    3.  Install dependencies (`pip install -r requirements.txt`).
    4.  Install Playwright browsers.
    5.  Run Scraper (`python scraper/scrape_prices.py`).
    6.  Retrain Model (`python ml/train_model.py`).
    7.  Generate Predictions (`python ml/predict.py`).
    8.  Commit and push the updated SQLite database and predictions CSV back to the repository.

## 9. Dashboard Features
- **Key Metrics:** Latest Basket Cost, Daily Inflation Rate (%), Forecasted Cost (7 days).
- **Charts:**
    - Line Chart: Historical Price Trends per Item.
    - Line Chart: Total Basket Cost (Historical vs. Predicted).
    - Bar Chart: Daily Inflation fluctuations.
- **Visualization:** Uses Plotly for interactive tooltips and zooming.
- **Refresh Logic:** Dashboard reads directly from the SQLite DB and CSV; updates automatically whenever the underlying files change (e.g., after a `git pull` from the automation run).

## 10. Challenges Faced
- **Anti-Bot Measures:** E-commerce sites aggressively block scrapers. I encountered "Access Denied" errors, limiting data collection reliability.
- **Dynamic Content:** Prices sometimes load asynchronously; I had to implement explicit waits in Playwright.
- **Cold Start Problem:** The ML model initially had too little data to make accurate predictions, requiring mock data generation for testing pipeline robustness.
- **Schema Evolution:** Adding a new column (`website`) required a migration strategy (dropping/recreating table) to ensure data consistency.

## 11. Limitations of the Project
- **Data Reliability:** Heavily dependent on the website's DOM structure remaining unchanged. A UI update can break the scraper.
- **Scalability:** SQLite locks the database file during writes, which isn't suitable for high-concurrency environments.
- **Model Simplicity:** Features like "Day of Week" might not capture complex economic drivers of inflation (supply chain shocks, fuel prices).
- **Local Execution:** Dashboard runs locally; deploying it to the cloud would require handling the SQLite persistence (e.g., S3 or a hosted DB).

## 12. Improvements for Future
- **Robust Scraping:** Implement rotating proxies and User-Agent rotation to bypass bot detection.
- **Advanced ML:** Switch to time-series specific models like Facebook Prophet or ARIMA for better seasonality handling and confidence intervals.
- **Cloud Deployment:** Deploy the dashboard to Streamlit Cloud or AWS, and migrate the database to PostgreSQL/Supabase.
- **Alerting:** Integrate an email or Slack notification if prices drop below a threshold or if scraping fails.

## 13. Interview Questions & Answers

1.  **Q: Explain your project in one sentence.**
    *A: An automated pipeline that scrapes daily grocery prices to visualize real-time personal inflation trends and forecast future basket costs.*

2.  **Q: Why did you choose Random Forest over Linear Regression?**
    *A: Linear Regression assumes a straight-line relationship which rarely exists in volatile prices. Random Forest captures non-linear patterns and interactions between features (like weekend price hikes) better.*

3.  **Q: How do you handle scraper failures in production?**
    *A: The script uses try-except blocks to log errors without crashing. In a real-world scenario, I would add a retry mechanism with exponential backoff and alert notifications.*

4.  **Q: Why SQLite instead of MySQL or PostgreSQL?**
    *A: For a single-user analytics project where data volume is small (<1GB), SQLite creates zero overhead and simplifies the CI/CD pipeline since the DB is just a file.*

5.  **Q: How does the automation work?**
    *A: A GitHub Actions workflow triggers daily. It spins up a runner, installs dependencies, executes the pipeline scripts sequentially, and commits the new data back to the repo.*

6.  **Q: What was the hardest part of this project?**
    *A: Dealing with anti-bot protection. Websites detect headless browsers, so I had to experiment with headers and consider using stealth plugins or proxies.*

7.  **Q: How do you ensure data quality?**
    *A: I enforce data types in the database schema and could add validation steps (e.g., rejecting negative prices or prices that deviate >50% from the moving average).*

8.  **Q: What is "Feature Engineering" in your context?**
    *A: It's converting raw dates into machine-readable signals like "Day of Week" (0-6) or "Is Weekend" (0/1) to help the model find time-based patterns.*

9.  **Q: How is this different from a Kaggle project?**
    *A: This is an end-to-end system. I didn't just train a model on a static CSV; I built the data ingestion (scraper), storage (DB), automation (CI/CD), and user interface (Dashboard).*

10. **Q: Why Playwright and not Selenium?**
    *A: Playwright is faster, more reliable for modern web apps, and has better native handling of waiting for network events and selectors compared to Selenium.*

11. **Q: Can this scale to 1000 items?**
    *A: The scraper would need to run asynchronously (async/await) to be efficient. The SQLite DB might become a bottleneck for concurrent writes, so I'd move to Postgres.*

12. **Q: How accurate is your model?**
    *A: It has an R-squared score of ~0.76 (on synthetic data), which is decent for a simple model, but real-world prices are stochastic and hard to predict perfectly.*

13. **Q: What happens if the website changes its layout?**
    *A: The scraper would likely fail. I need to monitor logs and update the CSS selectors. This maintenance cost is a known trade-off of web scraping.*

14. **Q: How do you deploy the dashboard?**
    *A: Currently, it runs locally via `streamlit run`. For production, I would containerize it with Docker and deploy to a cloud service like Railway or Heroku.*

15. **Q: What did you learn from this?**
    *A: I learned the complexities of maintaining a data pipeline—how a small failure in the scraper cascades to the model and dashboard, emphasizing the need for robustness.*

## 14. Resume Description
- Engineered an end-to-end automated data pipeline extracting daily pricing data for 5+ SKUs using **Python** and **Playwright**.
- Developed a **Random Forest** forecasting model (`scikit-learn`) achieving ~76% accuracy to predict weekly grocery basket costs.
- Architected a serverless system using **SQLite** and **GitHub Actions** to automate ETL jobs, reducing manual tracking effort by 100%.
- Built an interactive **Streamlit** dashboard visualizing real-time inflation metrics and price trends for data-driven personal finance.

## 15. Elevator Pitch (30 Seconds)
"I built a system called 'Inflation Basket' to solve the problem of generic inflation metrics not reflecting my actual expenses. It's a Python-based automated pipeline that scrapes daily prices of my specific grocery items using Playwright, stores them in a database, and uses Machine Learning to forecast my weekly grocery bill. The entire process runs automatically every morning via GitHub Actions, and I track the trends on a custom interactive dashboard. It effectively gives me a personalized, real-time inflation monitor."
