from playwright.sync_api import sync_playwright
import sqlite3
import datetime
import os
import sys
import re

# Add project root to path to import database module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import upsert_price, get_last_price, fetch_all_data
import pandas as pd
import random
import time

# Product URLs (BigBasket)
PRODUCTS = [
    {"name": "Milk (1L)", "url": "https://www.bigbasket.com/pd/306926/amul-taaza-toned-milk-1-l-pouch/", "website": "BigBasket"},
    {"name": "Eggs (12)", "url": "https://www.bigbasket.com/pd/40348875/fresho-premium-white-eggs-12-pcs/?nc=as", "website": "BigBasket"},
    {"name": "Bread", "url": "https://www.bigbasket.com/pd/40162924/britannia-100-whole-wheat-bread-450-g-pouch/?nc=cl-prod-list&t_pos_sec=1&t_pos_item=1&t_s=Whole+Wheat+Bread", "website": "BigBasket"},
    {"name": "Rice (1kg)", "url": "https://www.bigbasket.com/pd/10000455/bb-royal-basmati-rice-premium-1-kg/", "website": "BigBasket"},
    {"name": "Cooking Oil (1L)", "url": "https://www.bigbasket.com/pd/10000207/freedom-refined-sunflower-oil-1-l-pouch/", "website": "BigBasket"}
]

VARIATION_REPORT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'scrape_variation_report.csv')

def get_price_from_page(page, url):
    """
    Extracts price from BigBasket product page using Playwright.
    """
    try:
        page.goto(url, timeout=60000)
        # Wait for title to load
        page.wait_for_load_state("domcontentloaded")
        
        title = page.title().strip()
        
        # Look for "Rs" or "Price of Rs" in title
        match = re.search(r'Rs\s*([\d\.]+)', title)
        if match:
            return float(match.group(1))
        
        # Fallback: Try to find price element if title fails (BigBasket specific selectors could be added here)
        # For now, stick to title as it was working before, but Playwright renders JS so it might be more reliable.
        
        print(f"Price not found in title: {title}")
        return None
        
    except Exception as e:
        print(f"Exception scraping {url}: {e}")
        return None

def check_freshness(item_name, current_price):
    last_record = get_last_price(item_name)
    if last_record:
        last_date, last_price = last_record
        if last_price == current_price:
            #Ideally we'd check consecutive days, but for now simple check
            pass
        else:
            print(f"Price change detected for {item_name}: {last_price} -> {current_price}")

def generate_variation_report():
    print("Generating variation report...")
    df = fetch_all_data()
    if df.empty:
        print("No data for report.")
        return

    df['date'] = pd.to_datetime(df['date'])
    cutoff_date = pd.to_datetime(datetime.date.today()) - datetime.timedelta(days=30)
    df_recent = df[df['date'] >= cutoff_date]
    
    report_data = []
    for item, item_df in df_recent.groupby('item_name'):
        unique_prices = item_df['price'].nunique()
        count = len(item_df)
        
        status = "OK"
        if unique_prices <= 2:
            status = "Low Variation"
            print(f"Warning: Low price variation detected for {item}. Unique prices: {unique_prices}")
            
        report_data.append({
            'item': item,
            'last_30_days_records': count,
            'unique_prices': unique_prices,
            'status': status
        })
        
    pd.DataFrame(report_data).to_csv(VARIATION_REPORT_PATH, index=False)
    print(f"Variation report saved to {VARIATION_REPORT_PATH}")

def main():
    today = datetime.date.today().strftime("%Y-%m-%d")
    print(f"Starting scrape for {today}...")
    
    with sync_playwright() as p:
        # Launch with arguments to look more like a real browser
        browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
        
        # Create context with meaningful user agent and viewport
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()

        for product in PRODUCTS:
            print(f"Scraping {product['name']}...")
            
            # Random delay to behave more human-like
            time.sleep(random.uniform(2, 5))
            
            price = get_price_from_page(page, product['url'])
            
            if price is not None:
                print(f"Found price: {price}")
                
                # Check freshness
                check_freshness(product['name'], price)
                
                # Upsert
                upsert_price(today, product['name'], price, product['website'])
            else:
                print(f"Failed to scrape {product['name']}")
        
        browser.close()

    # Generate Report
    generate_variation_report()

if __name__ == "__main__":
    main()
