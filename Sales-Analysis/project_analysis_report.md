# USA Regional Sales Analysis - Project Report

## Overview
This project involves a comprehensive data analytics pipeline focused on Acme Co.'s 2014–2018 USA sales dataset. The objective is to identify key revenue and profit drivers, uncover seasonal trends and anomalies, and provide actionable insights for pricing, promotions, and market expansion.

## Project Structure & Data Pipeline
- **Raw Data Source:** Data is centrally located in `Regional Sales Dataset.xlsx`.
- **Data Exploration & Processing:** The notebook `EDA_Regional_Sales_Analysis.ipynb` handles data ingestion, profiling, cleaning, feature engineering, and extensive univariate/multivariate analysis.
- **Data Output:** Processed data is exported as `Sales_data(EDA Exported).csv`.
- **Visualization:** A comprehensive dashboard is in `SALES REPORT.pbix`, supported by background templates in the `Background/` directory. Presentations are supplemented with `PPT --- Regional Sales Analysis.pptx`.

## Key Exploratory Data Analysis (EDA) Insights

### 1. Revenue & Profitability
- **Channels:** Sales are dominated by Wholesale (54%), followed by Distributors (31%) and Exports (15%). Despite the volume differences, profit margins are consistently strong and similar across all channels (~37%–38%).
- **Products:** Products 26 and 25 lead with \$118M and \$110M respectively. Margins concentrate around 18%-60%, and there is no strong correlation between unit price and profit margin percentage, indicating standardized pricing strategies.
- **Customers:** Revenue is highly concentrated. Top 10 clients generate roughly \$10M–\$12.5M each, while the bottom 10 are around \$4M–\$5M.

### 2. Geographic Performance
- **National Level:** The West region dominates with approximately \$360M (~35%), while the Northeast trails at \$210M (~20%).
- **State Level:** California single-handedly leads with ~\230M and over 7,500 orders. Illinois, Florida, and Texas form a strong second tier (\$85–\$110M).

### 3. Trends & Seasonality
- **Anomalies:** Revenue typically holds steady between \$23M and \$26.5M. However, there is a distinct, sharp revenue drop in early 2017 (down to ~\$21.2M) that is flagged as an outlier requiring business investigation.
- **Annual Cycle:** Strong post-New Year surges, followed by a spring dip (April) and a summer rebound (May & August).

## Strategic Recommendations Extracted
1. **Outlier Strategy:** Outlier transactions on the high-end (bulk/special editions) and low-end (promotional giveaways) should be separated for more accurate margin analysis moving forward.
2. **Growth & Expansion:** Capitalize on the solid 37.9% margins in Export by expanding international marketing. In the U.S., focus promotional investments on the lagging Northeast region to close the gap with the West.
3. **Product & Customer Focus:** Apply margin optimization strategies from top products to the middle and lower tiers. Likewise, launch targeted campaigns to grow the base of lower-tier customers towards the \$10M benchmark.
