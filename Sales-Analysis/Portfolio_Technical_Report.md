# USA Regional Sales Analysis: Technical Portfolio Report

## 1. Project Overview & Problem Statement
Acme Co. requires actionable insights from its 2014-2018 USA sales data to identify key revenue drivers across products, channels, and regions. The core problem is a lack of consolidated visibility into seasonal trends, pricing anomalies, and margin profitability, which impedes the executive team's ability to optimize pricing and formulate effective market-expansion strategies.

## 2. 30-Second Elevator Pitch
"The USA Regional Sales Analysis project is an end-to-end business intelligence solution that transformed four years of raw, disconnected Excel sales data into an interactive Power BI dashboard. By leveraging Python for rigorous data wrangling and exploratory data analysis, the project uncovered a highly profitable but underutilized export channel and quantified a \$150M regional performance gap, directly empowering stakeholders to optimize promotional strategies and drive data-backed growth."

## 3. Tech Stack
| Layer | Technology | Why Chosen |
| :--- | :--- | :--- |
| **Data Source** | Excel (.xlsx) | Ubiquitous format representing the client's initial raw business data storage. |
| **Data Wrangling** | Python (Pandas, NumPy) | Extremely efficient for cleaning, joining relational tables, and feature engineering. |
| **Exploratory Analysis** | Python (Matplotlib, Seaborn, Plotly) | Enables deep-dive statistical visualizations, correlation mapping, and temporal trend analysis. |
| **Business Intelligence** | Microsoft Power BI | Industry standard for creating interactive, dynamic, and executive-facing visual dashboards. |

## 4. Project Architecture & File Structure
```text
Sales-Analysis/
├── Regional Sales Dataset.xlsx          # Raw data input (Orders, Customers, Regions)
├── EDA_Regional_Sales_Analysis.ipynb    # Python data pipeline & exploratory analysis
├── Sales_data(EDA Exported).csv         # Cleaned, feature-engineered output dataset
├── Background/                          # UI/UX elements for BI dashboard
├── SALES REPORT.pbix                    # Interactive Power BI dashboard
└── PPT --- Regional Sales Analysis.pptx # Stakeholder presentation deck
```

### End-to-End Data Flow Diagram
```text
[Raw Excel Data] --> [Python/Jupyter (Wrangling & Feature Eng.)] --> [Denormalized CSV Export] --> [Power BI (Modeling & DAX)] --> [Interactive Executive Dashboard]
```

## 5. Storage Design
The project utilizes a static, flat-file ELT (Extract, Load, Transform) approach. Raw data resides in a multi-sheet Excel file representing isolated domains (Sales, Customers, Regions). This is extracted, joined into a unified denormalized schema using Pandas, and exported to a flat CSV file, which serves as the optimized data source for the BI visualization layer.

## 6. Core Logic / Data Processing Details
*   **Data Cleaning:** Null values and irregular data types were rectified. Column headers were systematically lowered for standardized syntax access.
*   **Targeted Masking:** Budgets were explicitly masked (`pd.NA`) for non-2017 data points upon discovering that the company only maintained accurate budget tracking for that specific year, preventing skewed historical averages.
*   **Feature Engineering:** Engineered critical business metrics including `total_cost` (Quantity * Unit Cost), `profit` (Revenue - Total Cost), and `profit_margin_pct` to enable analysis independent of volume.

## 7. Key Technical Deep-Dive: Exploratory Data Analysis (EDA)
The Python EDA phase was critical for uncovering insights obscured by raw numbers. Extensive univariate, bivariate, and temporal analyses were conducted. 
*   **Outlier Detection:** Boxplots isolated extreme structural anomalies: high-end bulk orders and low-end promotional giveaways (\$0-\$100 SKUs).
*   **Correlation Mapping:** Heatmaps revealed a near-perfect positive correlation (0.91) between Unit Price and Revenue, while order 'Quantity' showed zero correlation, proving that revenue growth is driven by *item value* rather than *volume*.

## 8. Automation / Deployment
The data pipeline was executed sequentially. The resulting Power BI dashboard (`SALES REPORT.pbix`) is designed for desktop interaction or immediate deployment to Power BI Service for organizational, role-based sharing securely.

## 9. Dashboard / UI Features
*   **Tailored UI:** Utilized custom high-fidelity background templates for a professional executive look.
*   **Key Metrics Displayed:** Total Revenue, Order Volume, Profit Margins.
*   **Interactive Drill-Downs:** Visuals tracking Regional Market Dominance (West coast driving ~35% of sales) and Channel Profitability (Exports leading at 37.9%).

## 10. Setup & Running Instructions
```bash
# 1. Clone the repository
git clone [repository_link]
cd Sales-Analysis

# 2. Install required Python data science dependencies
pip install pandas numpy matplotlib seaborn plotly jupyter

# 3. Execute the Data Pipeline
# Open and run all cells in the Jupyter Notebook to process raw data
jupyter notebook EDA_Regional_Sales_Analysis.ipynb
# > Output: 'Sales_data(EDA Exported).csv' will be generated.

# 4. View Dashboard
# Open 'SALES REPORT.pbix' using Microsoft Power BI Desktop.
# Refresh data connections if prompted.
```

## 11. Challenges & Solutions
| Challenge | Solution |
| :--- | :--- |
| **Disjointed Data Entities** | Utilized Pandas `merge()` functions to join distinct Orders, Customers, and Regional datasets into a single, unified analytical dataframe. |
| **Inconsistent Budget Tracking** | Identified that budgets were solely tracked for 2017. Used conditional masking (`df.loc`) to blank out non-2017 budget fields, preventing skewed historical baselines. |
| **Skewed Margin Calculations** | Used programmatic thresholding and boxplots to isolate massive bulk orders and cheap test SKUs, logically separating them to accurately calculate standard profitability. |

## 12. Limitations
*   The data source is static, limiting insights strictly to the 2014-2018 timeframe.
*   The flat-file architecture lacks a live database connection, requiring manual pipeline reruns to accommodate any new raw data drops.

## 13. Future Improvements
1.  **Database Migration:** Migrate raw Excel storage into a robust relational database (e.g., PostgreSQL).
2.  **Pipeline Automation:** Implement a workflow orchestrator like Apache Airflow to automate the daily ETL ingestion script.
3.  **Predictive Analytics:** Integrate time-series forecasting (e.g., Prophet or ARIMA models) to predict future sales cycles based on historical seasonality.

## 14. Resume Bullet Points
*   Spearheaded an end-to-end sales analytics ETL pipeline using Python (Pandas, NumPy) to process and join a 4-year regional dataset, engineering critical profit and cost features.
*   Executed comprehensive Exploratory Data Analysis (EDA) across multi-dimensional tiers, uncovering a highly profitable export channel (37.9% margin) and a \$150M regional gap.
*   Designed an interactive executive dashboard in Power BI visualizing \$1B+ in total sales, highlighting market dominance (West region driving 35% of revenue).
*   Formulated actionable, data-driven business recommendations by isolating a critical 2017 revenue anomaly (drop to \$21.2M) and defining optimal pricing strategies.

## 15. Key Interview Q&A

**Q: Why did you choose Python over doing everything natively in Power Query?**
A: Python’s Pandas library offers significantly more programmatic flexibility and transparency for complex data cleaning, programmatic missing value handling, and deep statistical EDA (such as generating correlation heatmaps and boxplots for outlier detection) before the data ever hit the visualization layer.

**Q: How did you handle the messy budget data?**
A: During EDA, I discovered budgets were only consistently recorded for 2017. I used Pandas to logically mask non-2017 budget values as `pd.NA` to ensure historical and predictive averages were not mathematically skewed by zeros.

**Q: What was the most surprising insight you found?**
A: Despite the Wholesale channel dominating 54% of the pure volume, the Export channel (only 15% volume) maintained the highest overall profit margins at ~37.9%. This insight became a primary recommendation for targeted market expansion.

**Q: How did you calculate profit margins, and what did that reveal about their pricing?**
A: I engineered a `profit` feature (Revenue - Total Cost) and calculated the margin percentage. My scatter plot analyses showed dense, consistent margin bands (18%-60%) regardless of the unit price, proving their baseline wholesale pricing multiplier was highly standardized across the entire product catalog.

**Q: How would you scale this project to handle live, real-time data?**
A: I would migrate the flat-file storage to a relational SQL database like PostgreSQL. I'd then build an automated Python ETL script orchestrated via Airflow to ingest daily transactions, and connect Power BI directly to the database using DirectQuery.

**Q: Explain your data flow architecture.**
A: It is a flat-file ETL pipeline: Raw multi-sheet Excel data was ingested into a Jupyter Notebook environment, transformed, cleaned, and joined using Pandas, and exported as a denormalized CSV. This clean CSV acts as the singular semantic model feeding the Power BI dashboard.

**Q: What challenges did outliers present to your analysis?**
A: Extremely low-priced items (promotional giveaways) and high-priced massive bulk orders severely skewed average unit prices and margin generalizations. I utilized boxplots to identify these distinct thresholds and grouped them logically so they wouldn't dilute the core statistical metrics.
