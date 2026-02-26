"""
job_scraper.py — Scrapes job listings from Internshala, Naukri, LinkedIn, Indeed.
Uses Playwright for browser automation and BeautifulSoup for parsing.
"""
import time
import random
import asyncio
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

try:
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
except ImportError:
    BS4_AVAILABLE = False


JOB_SCHEMA = {
    "title": "",
    "company": "",
    "location": "",
    "salary": "",
    "url": "",
    "description": "",
    "platform": "",
    "date_posted": ""
}


def _human_delay(min_s=1.5, max_s=3.5):
    time.sleep(random.uniform(min_s, max_s))


def _safe_text(el) -> str:
    """Safely extract text from a BS4 element."""
    return el.get_text(strip=True) if el else ""


# ─────────────────────────────────────────────
#  INTERNSHALA
# ─────────────────────────────────────────────
def scrape_internshala(role: str, max_jobs: int = 20, headless: bool = True) -> list[dict]:
    """Scrape internships from Internshala."""
    if not PLAYWRIGHT_AVAILABLE:
        print("  [SKIP] Playwright not installed — skipping Internshala")
        return []

    jobs = []
    search_query = role.replace(" ", "+")
    url = f"https://internshala.com/internships/{search_query.lower().replace('+', '-')}-internship/"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=headless)
            page = browser.new_page()
            page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            page.goto(url, timeout=30000)
            _human_delay(2, 4)

            # Scroll to load more
            for _ in range(3):
                page.evaluate("window.scrollBy(0, window.innerHeight)")
                _human_delay(1, 2)

            html = page.content()
            browser.close()

        if not BS4_AVAILABLE:
            return []

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select(".individual_internship")[:max_jobs]

        for card in cards:
            title_el = card.select_one(".job-internship-name")
            company_el = card.select_one(".company-name")
            location_el = card.select_one(".location_link")
            stipend_el = card.select_one(".stipend")
            link_el = card.select_one("a.view_detail_button")

            job_url = "https://internshala.com" + (link_el["href"] if link_el else "")
            jobs.append({
                **JOB_SCHEMA,
                "title": _safe_text(title_el),
                "company": _safe_text(company_el),
                "location": _safe_text(location_el),
                "salary": _safe_text(stipend_el),
                "url": job_url,
                "platform": "Internshala",
                "description": ""  # fetched separately if needed
            })

    except Exception as e:
        print(f"  [ERROR] Internshala scraper: {e}")

    return [j for j in jobs if j["title"]]


# ─────────────────────────────────────────────
#  NAUKRI
# ─────────────────────────────────────────────
def scrape_naukri(role: str, location: str = "india", max_jobs: int = 20, headless: bool = True) -> list[dict]:
    """Scrape job listings from Naukri.com."""
    if not PLAYWRIGHT_AVAILABLE:
        print("  [SKIP] Playwright not installed — skipping Naukri")
        return []

    jobs = []
    role_slug = role.lower().replace(" ", "-")
    loc_slug = location.lower().replace(",", "").replace(" ", "-")
    url = f"https://www.naukri.com/{role_slug}-jobs-in-{loc_slug}"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=headless)
            page = browser.new_page()
            page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
            page.goto(url, timeout=40000)
            _human_delay(3, 5)

            for _ in range(3):
                page.evaluate("window.scrollBy(0, window.innerHeight)")
                _human_delay(1, 2)

            html = page.content()
            browser.close()

        if not BS4_AVAILABLE:
            return []

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select("article.jobTuple")[:max_jobs]

        for card in cards:
            title_el = card.select_one("a.title")
            company_el = card.select_one("a.subTitle")
            location_el = card.select_one("li.location span")
            salary_el = card.select_one("li.salary span")
            link = title_el["href"] if title_el and title_el.get("href") else ""

            jobs.append({
                **JOB_SCHEMA,
                "title": _safe_text(title_el),
                "company": _safe_text(company_el),
                "location": _safe_text(location_el),
                "salary": _safe_text(salary_el),
                "url": link,
                "platform": "Naukri",
            })

    except Exception as e:
        print(f"  [ERROR] Naukri scraper: {e}")

    return [j for j in jobs if j["title"]]


# ─────────────────────────────────────────────
#  INDEED
# ─────────────────────────────────────────────
def scrape_indeed(role: str, location: str = "India", max_jobs: int = 20, headless: bool = True) -> list[dict]:
    """Scrape jobs from Indeed India."""
    if not PLAYWRIGHT_AVAILABLE:
        print("  [SKIP] Playwright not installed — skipping Indeed")
        return []

    jobs = []
    import urllib.parse
    q = urllib.parse.quote(role)
    l = urllib.parse.quote(location)
    url = f"https://in.indeed.com/jobs?q={q}&l={l}&sort=date"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=headless)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )
            page = context.new_page()
            page.goto(url, timeout=40000)
            _human_delay(3, 5)

            for _ in range(3):
                page.evaluate("window.scrollBy(0, window.innerHeight)")
                _human_delay(1, 2)

            html = page.content()
            browser.close()

        if not BS4_AVAILABLE:
            return []

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select("div.job_seen_beacon")[:max_jobs]

        for card in cards:
            title_el = card.select_one("h2.jobTitle span")
            company_el = card.select_one("span.companyName")
            location_el = card.select_one("div.companyLocation")
            salary_el = card.select_one("div.metadata.salary-snippet-container")
            link_el = card.select_one("a[id^='job_']")
            job_url = "https://in.indeed.com" + (link_el["href"] if link_el else "")

            jobs.append({
                **JOB_SCHEMA,
                "title": _safe_text(title_el),
                "company": _safe_text(company_el),
                "location": _safe_text(location_el),
                "salary": _safe_text(salary_el),
                "url": job_url,
                "platform": "Indeed",
            })

    except Exception as e:
        print(f"  [ERROR] Indeed scraper: {e}")

    return [j for j in jobs if j["title"]]


# ─────────────────────────────────────────────
#  LINKEDIN  (requires login)
# ─────────────────────────────────────────────
def scrape_linkedin(
    role: str,
    location: str = "India",
    email: str = "",
    password: str = "",
    max_jobs: int = 20,
    headless: bool = False
) -> list[dict]:
    """Scrape LinkedIn job listings (requires valid credentials)."""
    if not PLAYWRIGHT_AVAILABLE:
        print("  [SKIP] Playwright not installed — skipping LinkedIn")
        return []

    jobs = []
    import urllib.parse

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=headless)
            context = browser.new_context()
            page = context.new_page()

            # Login
            page.goto("https://www.linkedin.com/login", timeout=30000)
            _human_delay(2, 3)
            if email and password:
                page.fill("#username", email)
                _human_delay(0.5, 1)
                page.fill("#password", password)
                _human_delay(0.5, 1)
                page.click('button[type="submit"]')
                _human_delay(3, 5)

            # Search jobs
            q = urllib.parse.quote(role)
            l = urllib.parse.quote(location)
            page.goto(
                f"https://www.linkedin.com/jobs/search/?keywords={q}&location={l}&sortBy=DD",
                timeout=30000
            )
            _human_delay(3, 5)

            for _ in range(3):
                page.evaluate("window.scrollBy(0, window.innerHeight)")
                _human_delay(1, 2)

            html = page.content()
            browser.close()

        if not BS4_AVAILABLE:
            return []

        soup = BeautifulSoup(html, "html.parser")
        cards = soup.select("li.jobs-search-results__list-item")[:max_jobs]

        for card in cards:
            title_el = card.select_one("a.job-card-list__title")
            company_el = card.select_one("span.job-card-container__primary-description")
            location_el = card.select_one("li.job-card-container__metadata-item")
            link_el = card.select_one("a.job-card-list__title")
            job_url = link_el["href"] if link_el else ""
            if job_url and not job_url.startswith("http"):
                job_url = "https://www.linkedin.com" + job_url

            jobs.append({
                **JOB_SCHEMA,
                "title": _safe_text(title_el),
                "company": _safe_text(company_el),
                "location": _safe_text(location_el),
                "url": job_url,
                "platform": "LinkedIn",
            })

    except Exception as e:
        print(f"  [ERROR] LinkedIn scraper: {e}")

    return [j for j in jobs if j["title"]]


# ─────────────────────────────────────────────
#  FETCH JOB DESCRIPTION
# ─────────────────────────────────────────────
def fetch_job_description(url: str, headless: bool = True) -> str:
    """Visit a job URL and extract the full job description text."""
    if not PLAYWRIGHT_AVAILABLE or not url:
        return ""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=headless)
            page = browser.new_page()
            page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            page.goto(url, timeout=30000)
            _human_delay(2, 4)
            html = page.content()
            browser.close()

        if BS4_AVAILABLE:
            soup = BeautifulSoup(html, "html.parser")
            # Remove script / style
            for tag in soup(["script", "style", "nav", "header", "footer"]):
                tag.decompose()
            return soup.get_text(separator="\n", strip=True)[:5000]
        return ""
    except Exception as e:
        print(f"  [WARN] Could not fetch description from {url}: {e}")
        return ""


# ─────────────────────────────────────────────
#  MAIN ENTRY
# ─────────────────────────────────────────────
def search_jobs(
    roles: list[str],
    platforms: list[str],
    location: str,
    max_per_platform: int = 20,
    linkedin_email: str = "",
    linkedin_password: str = "",
    headless: bool = True,
) -> list[dict]:
    """
    Search for jobs across all enabled platforms.
    Returns a combined, deduplicated list of job dicts.
    """
    all_jobs = []
    seen_urls = set()

    for role in roles:
        print(f"\n  🔍 Searching for: {role}")

        if "Internshala" in platforms:
            jobs = scrape_internshala(role, max_per_platform, headless)
            print(f"    Internshala: {len(jobs)} found")
            all_jobs.extend(jobs)

        if "Naukri" in platforms:
            jobs = scrape_naukri(role, location, max_per_platform, headless)
            print(f"    Naukri: {len(jobs)} found")
            all_jobs.extend(jobs)

        if "Indeed" in platforms:
            jobs = scrape_indeed(role, location, max_per_platform, headless)
            print(f"    Indeed: {len(jobs)} found")
            all_jobs.extend(jobs)

        if "LinkedIn" in platforms:
            jobs = scrape_linkedin(
                role, location, linkedin_email, linkedin_password,
                max_per_platform, headless
            )
            print(f"    LinkedIn: {len(jobs)} found")
            all_jobs.extend(jobs)

    # Deduplicate by URL
    unique_jobs = []
    for job in all_jobs:
        if job["url"] and job["url"] not in seen_urls:
            seen_urls.add(job["url"])
            unique_jobs.append(job)
        elif not job["url"]:
            unique_jobs.append(job)

    return unique_jobs
