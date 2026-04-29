# Inflation Basket – Price Monitoring Dashboard

## Project Description
A Python-based system that tracks daily prices of selected grocery items from an e-commerce website, stores the data in a SQLite database, and visualizes basket cost trends and inflation rates using a Streamlit dashboard.

## Features
- **Daily Price Scraping**: Automated collection of prices for 5 essential grocery items (Milk, Eggs, Bread, Rice, Oil).
- **Data Storage**: persistent storage using SQLite.
- **Inflation Metrics**: Calculation of daily basket cost and day-over-day inflation percentage.
- **Interactive Dashboard**: Visualizes price trends and stats using Streamlit and Plotly.

## Tech Stack
- **Python**: Core logic
- **Pandas**: Data analysis and manipulation
- **SQLite**: Database setup
- **Requests & BeautifulSoup**: Web scraping
- **Streamlit**: Web dashboard
- **Plotly**: Interactive charts

## Folder Structure
```
inflation-basket/
│
├── scraper/
│   └── scrape_prices.py    # Scraping logic
│
├── database/
│   └── db.py               # Database setup and operations
│
├── analysis/
│   └── calculate_metrics.py # Data processing
│
├── dashboard/
│   └── app.py              # Streamlit dashboard
│
├── data/
│   └── prices.db           # SQLite database
│
└── requirements.txt
```

## How to Run

### Prerequisities
Install dependencies:
```bash
pip install -r requirements.txt
```

### Step 1: Run Scraper
Collect the latest prices:
```bash
python scraper/scrape_prices.py
```

### Step 2: Run Dashboard
Launch the dashboard:
```bash
streamlit run dashboard/app.py
```
