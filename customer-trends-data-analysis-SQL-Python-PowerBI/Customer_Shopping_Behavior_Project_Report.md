# Project Report: Customer Shopping Behavior Analysis

## Project Overview & Problem Statement
Modern retail businesses collect vast amounts of transactional data but often struggle to translate this raw data into actionable business intelligence. The objective of this project was to simulate a professional, corporate-grade data analytics workflow starting from raw data ingestion to stakeholder reporting. It aims to uncover hidden purchasing patterns, evaluate the impact of discounts or subscriptions, categorize user segments, and ultimately provide data-driven recommendations that could improve targeted marketing and customer retention.

## 30-Second Elevator Pitch
"I built an end-to-end data analytics pipeline that ingests, cleans, and analyzes over 3,900 retail transactions. Using Python for data preparation, SQL for complex querying and segmentation, and Power BI for interactive visualization, I created a comprehensive business intelligence solution that allows stakeholders to instantly identify high-value customer segments, evaluate promotional efficiency, and monitor revenue drivers."

## Tech Stack

| Layer | Technology | Why Chosen |
| :--- | :--- | :--- |
| **Data Preparation** | Python (Pandas), Jupyter | Ideal for fast exploratory data analysis (EDA), rigorous data cleaning, and handling missing values prior to database ingestion. |
| **Database / Querying** | PostgreSQL / MySQL | Industry standard for relational data analysis; allows for complex aggregations, window functions, and Common Table Expressions (CTEs). |
| **Visualization & BI** | Power BI | Seamless integration with SQL databases; powerful interactive dashboarding capabilities to present findings to non-technical stakeholders. |
| **Version Control** | Git / GitHub | Necessary for maintaining code history and showcasing professional portfolio work. |

## Project Architecture & Data Flow

```text
[ Raw CSV Data ] 
      |
      v
[ Python / Pandas ] ──> Data Cleaning, Type Casting & EDA
      |
      v
[ SQL Database ]    ──> Table Creation, Data Loading & Execution of Analytical Queries (CTEs, Aggregations)
      |                 
      v
[ Power BI ]        ──> Direct Query/Import from Database, Dashboard Design & Interactive Visuals
```

**File Structure:**
- `Customer_Shopping_Behavior_Analysis.ipynb`: Python scripts for data cleaning and DB connection.
- `customer_behavior_sql_queries.sql`: Advanced SQL queries for extracting business insights.
- `customer_behavior_dashboard.pbix`: Power BI interactive dashboard file.
- `customer_shopping_behavior.csv`: The primary dataset.

## Database / Storage Design
The data is stored in a structured relational format characterized by a single, wide fact table (`customer`) designed for analytical queries.
- **Volume:** ~3,900 records.
- **Key Columns (18 Total):** `Customer ID`, `Age`, `Gender`, `Item Purchased`, `Category`, `Purchase Amount (USD)`, `Review Rating`, `Subscription Status`, `Discount Applied`, `Previous Purchases`, `Shipping Type`.

## Key Technical Component Deep-Dive: SQL Customer Segmentation
A core requirement was transforming raw purchase counts into meaningful customer cohorts. Rather than pulling raw data into Python or BI tools, this logic was pushed down to the database layer via **SQL Common Table Expressions (CTEs) and CASE statements** to ensure maximum performance and reusability. By segmenting customers into *'New'* (1 purchase), *'Returning'* (2-10 purchases), and *'Loyal'* (>10 purchases), marketing teams can direct targeted campaigns strictly to the highest-ROI groups.

## Dashboard / UI Features
The interactive Power BI dashboard serves as the central UI for stakeholders:
- **Revenue Overview:** High-level KPIs tracking total revenue, average order value, and total customers.
- **Demographic Breakdown:** Slicers and charts displaying revenue contribution by Age Group and Gender.
- **Purchase Drivers:** Analysis of subscription statuses and discount impacts on the final purchase amounts.
- **Interactive Filtering:** Ability to drill down into specific Product Categories (e.g., Outerwear, Footwear) or Shipping Types (e.g., Express vs. Standard).

## Setup & Running Instructions

1. **Clone the repository**
   `git clone https://github.com/amlanmohanty1/customer-trends-data-analysis-SQL-Python-PowerBI.git`
   `cd customer-trends-data-analysis-SQL-Python-PowerBI`

2. **Set up the Python Environment & Clean Data**
   Open `Customer_Shopping_Behavior_Analysis.ipynb` in Jupyter. Run the cells to clean `customer_shopping_behavior.csv` and load it into your SQL Database.

3. **Execute Analytical Queries**
   Open `customer_behavior_sql_queries.sql` in your SQL GUI (pgAdmin/DBeaver). Run the queries sequentially to answer foundational business questions.

4. **View Dashboard**
   Open `customer_behavior_dashboard.pbix` in Power BI Desktop to interact with the visualizations.

## Challenges & Solutions

| Challenge | Solution |
| :--- | :--- |
| **Data Inconsistencies** | Implemented a Python/Pandas preprocessing step to handle null values, standardize text formats, and enforce rigid data types before SQL ingestion. |
| **Complex Category Rankings** | Leveraged SQL Window Functions (`ROW_NUMBER() OVER`) to accurately dynamically calculate the top 3 most purchased products within every category. |
| **Bridging SQL & BI** | Minimized the Power BI model size by conducting heavy data transformation and aggregations directly in the SQL database before importing. |

## Limitations
- **Lack of Time-Series Data:** The dataset lacks explicit transaction timestamps (only 'Season' is provided), limiting the ability to perform deep month-over-month (MoM) revenue trend analysis or precise cohort retention tracking.
- **Static Dataset:** The project currently relies on a static CSV file rather than a live, streaming transactional database.

## Future Improvements
- **Automated Airflow Pipeline:** Transition the manual Python script into an automated Apache Airflow DAG that pulls, cleans, and loads data on a daily schedule.
- **Predictive Analytics:** Implement a lightweight Machine Learning model (e.g., Logistic Regression in Scikit-Learn) to predict the likelihood of a customer purchasing a subscription based on their demographics and prior purchase history.

## Resume Bullet Points
- **Engineered an end-to-end data pipeline** processing 3,900+ retail transaction records using **Python (Pandas)** for data cleaning, strictly reducing raw data inconsistencies prior to database ingestion.
- **Designed and executed complex SQL queries** (utilizing CTEs and Window Functions) to uncover actionable business insights, successfully segmenting customers into tiered loyalty cohorts to inform marketing strategies.
- **Developed an interactive Power BI dashboard** serving as a central intelligence hub, visualizing revenue distributions, demographic trends, and the financial impact of promotional discounts.
- **Simulated a corporate data analytics workflow**, translating raw transactional data into presentation-ready reports that enable non-technical stakeholders to make data-driven inventory and marketing decisions.

## Key Interview Q&A

**Q1: Walk me through your data cleaning process for this project.**
*Answer:* "I started by loading the raw CSV into a Pandas DataFrame. I checked for missing values, duplicated rows, and inconsistent data types. For instance, ensuring that 'Purchase Amount' was strictly a float and standardizing categorical strings like 'Subscription Status'. Once the data was pristine, I used SQLAlchemy to load it directly into a relational database."

**Q2: Why did you choose to do your aggregations in SQL rather than directly in Power BI?**
*Answer:* "Pushing transformations to the database layer (Query Folding) is a best practice. It reduces the memory footprint of the Power BI model, speeds up refresh times, and ensures that the single source of truth—the SQL logic—can be reused by other departments or tools without relying on proprietary DAX formulas."

**Q3: Can you explain how you segmented customers into New, Returning, and Loyal tiers?**
*Answer:* "I used a Common Table Expression (CTE) combined with a `CASE` statement in SQL. By evaluating the 'previous_purchases' column, I assigned labels: 'New' for 1 purchase, 'Returning' for 2-10, and 'Loyal' for anything above 10. I then queried against this CTE to get the aggregate count of customers in each tier."

**Q4: How did you identify the top 3 products in each category?**
*Answer:* "I used SQL Window Functions. Specifically, I partitioned the data by 'Category' and ordered it by the count of purchases descending, assigning a `ROW_NUMBER()`. I wrapped this in a CTE and filtered the outer query for `WHERE item_rank <= 3`."

**Q5: What was the most surprising insight you found in the data?**
*Answer:* "Using SQL, I was able to quickly compare the total revenue and average spend between subscribed and non-subscribed users. Tracking how discount applications interacted with higher-than-average order values revealed exact patterns in where promotional spending yields the highest return on investment."

**Q6: If this database scaled to 10 million rows, what would you change about your architecture?**
*Answer:* "I would move away from local CSV loading. I'd set up an ETL orchestration tool like Airflow, store the raw data in a data lake (like AWS S3), and use a cloud data warehouse like Snowflake or BigQuery. I'd also ensure proper indexing on frequently filtered columns like 'Category' and 'Customer ID' in SQL."

**Q7: How did you design your Power BI dashboard with the end user in mind?**
*Answer:* "I focused on a top-down approach. The top layer has immediate, high-level KPIs like Total Revenue and User Count. The middle layer contains general demographic breakdowns (Gender/Age), and the bottom layer has granular transaction details. I included slicers globally so a stakeholder could instantly filter the entire report to look at just 'Winter' sales for 'Outerwear'."
