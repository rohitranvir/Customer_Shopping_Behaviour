"""
tracker.py — Logs every job application to a CSV file and prevents duplicates.
"""
import os
import csv
import json
from datetime import datetime
from pathlib import Path


COLUMNS = [
    "date", "company", "role", "platform", "match_score",
    "status", "resume_path", "cover_letter_path", "url", "notes"
]

CSV_PATH = Path(__file__).parent.parent / "output" / "applications.csv"


class Tracker:
    def __init__(self, csv_path: str = None):
        self.csv_path = Path(csv_path) if csv_path else CSV_PATH
        self.csv_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_csv()

    def _init_csv(self):
        """Create the CSV with headers if it doesn't exist."""
        if not self.csv_path.exists():
            with open(self.csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=COLUMNS)
                writer.writeheader()

    def _load_all(self) -> list[dict]:
        """Load all logged applications."""
        with open(self.csv_path, "r", encoding="utf-8") as f:
            return list(csv.DictReader(f))

    def already_applied(self, url: str = None, company: str = None, role: str = None) -> bool:
        """Returns True if this job has already been logged."""
        rows = self._load_all()
        for row in rows:
            if url and row.get("url", "").strip() == url.strip():
                return True
            if company and role:
                if (row.get("company", "").lower() == company.lower() and
                        row.get("role", "").lower() == role.lower()):
                    return True
        return False

    def log(
        self,
        company: str,
        role: str,
        platform: str,
        match_score: float,
        status: str,
        resume_path: str = "",
        cover_letter_path: str = "",
        url: str = "",
        notes: str = ""
    ):
        """Append a new application row."""
        row = {
            "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "company": company,
            "role": role,
            "platform": platform,
            "match_score": round(match_score, 1),
            "status": status,
            "resume_path": str(resume_path),
            "cover_letter_path": str(cover_letter_path),
            "url": url,
            "notes": notes
        }
        with open(self.csv_path, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=COLUMNS)
            writer.writerow(row)

    def get_stats(self) -> dict:
        """Return summary counts for the dashboard."""
        rows = self._load_all()
        stats = {
            "total": len(rows),
            "applied": sum(1 for r in rows if r["status"] == "applied"),
            "skipped": sum(1 for r in rows if r["status"] == "skipped"),
            "failed": sum(1 for r in rows if r["status"] == "failed"),
            "captcha": sum(1 for r in rows if r["status"] == "captcha"),
            "dry_run": sum(1 for r in rows if r["status"] == "dry_run"),
        }
        return stats

    def get_all(self) -> list[dict]:
        return self._load_all()
