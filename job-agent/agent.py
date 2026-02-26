"""
agent.py — Main Job Application Agent orchestrator.

Usage:
  python agent.py                  # full run
  python agent.py --dry-run        # scrape + score + tailor only, no submissions
  python agent.py --max 10         # limit to 10 applications
  python agent.py --platform naukri  # only one platform
"""
import os
import sys
import json
import time
import random
import argparse
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box

# ============================================================
# AGENT SYSTEM PROMPT
# ============================================================
SYSTEM_PROMPT = """
You are an autonomous Job Application Agent for ROHIT RANVIR.
You must follow 3 strict phases in order. Never mix phases.

PHASE 1 — SEARCH:
- Search LinkedIn, Naukri, Indeed, Internshala for these roles:
  "Data Analyst fresher", "Junior Data Analyst", 
  "Data Analyst Intern", "Power BI Analyst", "SQL Analyst"
- Search in: Hyderabad, Bangalore, Pune, Mumbai, Remote
- For each job collect: title, company, location, 
  salary, apply_url, job_description
- Save all results to jobs_queue.json
- Remove duplicates and already-applied jobs
- DO NOT open any apply URL during this phase
- When done: print "PHASE 1 COMPLETE — X jobs collected"

PHASE 2 — TAILOR (no browser, offline only):
- Load jobs_queue.json
- For each job:
  * Score match vs Rohit's skills (0–100)
  * If score < 50 → mark status: "Low Match" → skip
  * If score >= 50:
    - Rewrite Professional Summary (3-4 lines, 
      mention company name + role + JD keywords)
    - Reorder skills by JD relevance
    - Rewrite experience bullets using JD keywords
    - Pick top 2 relevant projects, rewrite bullets
    - Write 200-word cover letter for this job
    - Save resume as: Resume_[Company]_[Role]_[Date].pdf
    - Save cover letter as: CL_[Company]_[Role]_[Date].txt
    - Mark status: "Ready to Apply"
- When done: print "PHASE 2 COMPLETE — X resumes tailored"

PHASE 3 — APPLY (one job at a time, strict single tab):
- Load jobs_queue.json, filter status = "Ready to Apply"
- For each job:
  OPEN:
    * Open apply_url in browser
    * Wait minimum 3 seconds for full page load
    * Confirm you are on correct page before anything

  FILL (wait 1 sec between each field):
    * Full Name     → Rohit Santosh Ranvir
    * Email         → rohitranveer358@gmail.com
    * Phone         → +91-9158000676
    * Location      → [job city]
    * LinkedIn      → https://www.linkedin.com/in/rohit-ranveer/
    * GitHub        → https://github.com/rohitranvir
    * Experience    → Fresher / 0-1 years
    * Resume        → upload tailored PDF
    * Cover Letter  → paste or upload

  SUBMIT:
    * Review all fields
    * Click submit
    * Wait 3–5 seconds for confirmation
    * Confirm success message appeared

  LOG (do this BEFORE closing tab):
    * Write to applications.csv:
      Date | Company | Role | City | Platform | Score | Status

  CLOSE tab only after logging is confirmed
  WAIT 10–20 seconds (random) before next job

  ERROR HANDLING:
    * CAPTCHA → wait 30s → retry once → log "CAPTCHA" → next
    * Page not load → refresh → wait 5s → log "Error" → next
    * Popup → close it → continue → never abandon tab
    * Form error → try alternate selector → log "Form Error" → next

  SPEED RULES:
    * Between fields: 0.5–1 sec
    * Between sections: 1–2 sec  
    * After submit: 3–5 sec
    * Between jobs: 10–20 sec random
    * After 10 apps: 2 min break
    * After 25 apps: 5 min break
    * Daily max: 50 applications then stop

AFTER ALL PHASES — PRINT THIS EXACT REPORT:
╔══════════════════════════════════════════╗
║      JOB APPLICATION AGENT REPORT       ║
╠══════════════════════════════════════════╣
║ Date         : {date}                   ║
║ Duration     : {duration} minutes       ║
╠══════════════════════════════════════════╣
║ Jobs Found   : {found}                  ║
║ ✅ Applied    : {applied}                ║
║ ⚠️  Skipped   : {skipped}  low match    ║
║ ❌ Failed     : {failed}   error/captcha║
║ 📬 Responses  : {responses} check email ║
╠══════════════════════════════════════════╣
║ TOP APPLIED:                            ║
║  1. {company1} | {role1} | {score1}%   ║
║  2. {company2} | {role2} | {score2}%   ║
║  3. {company3} | {role3} | {score3}%   ║
╠══════════════════════════════════════════╣
║ Next Run: Tomorrow 9:00 AM              ║
╚══════════════════════════════════════════╝

ABSOLUTE RULES — NEVER BREAK:
- SEARCH fully → TAILOR fully → APPLY one by one → REPORT
- One tab at a time. Complete task. Log it. Close. Next.
- Never apply without tailored resume
- Never close tab before logging
- Never apply to same job twice
- Never send generic resume
"""

load_dotenv()

BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))

from tools.tracker import Tracker
from tools.job_scraper import search_jobs, fetch_job_description
from tools.resume_tailor import tailor_resume
from tools.cover_letter import generate_cover_letter
from tools.form_filler import fill_and_submit

console = Console()
QUEUE_FILE = BASE_DIR / "jobs_queue.json"


def load_profile() -> dict:
    profile_path = BASE_DIR / "profile.json"
    if not profile_path.exists():
        console.print("[red]❌ profile.json not found![/red]")
        sys.exit(1)
    with open(profile_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_queue() -> list[dict]:
    if QUEUE_FILE.exists():
        with open(QUEUE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_queue(jobs: list[dict]):
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=4)


# ============================================================
# PHASE 1 — SEARCH
# ============================================================
def phase_1_search(profile: dict, tracker: Tracker, max_apps: int, forced_platforms: list=None):
    """Run search phase — collect all jobs, save to queue"""
    console.print(Panel("▶ [bold cyan]PHASE 1 STARTING — Searching jobs...[/bold cyan]"))
    
    platforms = forced_platforms or profile.get("preferred_platforms", [])
    console.print(f"[bold]🔎 Searching on:[/bold] {', '.join(platforms)}")
    console.print(f"[bold]🎯 Target roles:[/bold] {', '.join(profile['target_roles'][:3])}…\n")

    all_jobs = search_jobs(
        roles=profile.get("target_roles", []),
        platforms=platforms,
        location=profile.get("primary_location", "India"),
        max_per_platform=min(20, max_apps),
        linkedin_email=os.getenv("LINKEDIN_EMAIL", ""),
        linkedin_password=os.getenv("LINKEDIN_PASSWORD", ""),
        headless=True,  # Usually okay to run headless during search
    )
    
    # Filter immediately
    filtered = []
    skipped_reasons = []
    avoid_companies = [c.lower() for c in profile.get("avoid_companies", [])]
    
    for job in all_jobs:
        company = job.get("company", "")
        url = job.get("url", "")
        role = job.get("title", "")
        
        if tracker.already_applied(url=url, company=company, role=role):
            skipped_reasons.append(f"Already applied: {company} — {role}")
            continue
        if company.lower() in avoid_companies:
            skipped_reasons.append(f"Avoided company: {company}")
            continue
            
        filtered.append(job)
        
    save_queue(filtered)
    console.print(f"\n[bold green]✅ PHASE 1 COMPLETE — {len(filtered)} jobs saved to jobs_queue.json[/bold green]")


# ============================================================
# PHASE 2 — TAILOR
# ============================================================
def phase_2_tailor(profile: dict):
    """Run tailor phase — score and tailor all resumes offline"""
    console.print(Panel("▶ [bold cyan]PHASE 2 STARTING — Tailoring resumes offline...[/bold cyan]"))
    
    master_resume_path = BASE_DIR / profile.get("master_resume_path", "master_resume.docx")
    if not master_resume_path.exists():
        console.print(f"[yellow]⚠️  Warning: Master resume not found at {master_resume_path}[/yellow]")
    
    jobs = load_queue()
    if not jobs:
        console.print("[dim]No jobs in queue to process.[/dim]")
        return

    threshold = profile.get("match_score_threshold", 50)
    tailored_count = 0
    
    for idx, job in enumerate(jobs):
        # Skip if already processed in queue
        if job.get("status") in ["Ready to Apply", "Low Match"]:
            continue
            
        company = job.get("company", "Unknown")
        role = job.get("title", "Unknown")
        console.print(f"\n  [bold]🔧 Processing:[/bold] {role} @ {company}")
        
        description = job.get("description", "")
        if not description and job.get("url"):
            # Fetch if missing
            console.print("    [dim]Fetching description...[/dim]")
            description = fetch_job_description(job["url"], headless=True)
            job["description"] = description
            
        try:
            match_score, resume_path = tailor_resume(
                company=company,
                role=role,
                job_description=description or f"{role} position at {company}",
                profile=profile,
                master_resume_path=master_resume_path,
            )
            job["match_score"] = match_score
            
            if match_score < threshold:
                console.print(f"    [yellow]Score: {match_score:.0f}% < {threshold}%. Marking as Low Match.[/yellow]")
                job["status"] = "Low Match"
            else:
                cover_letter_path = generate_cover_letter(
                    company=company, role=role,
                    job_description=description, profile=profile,
                    tone=profile.get("cover_letter_tone", "professional")
                )
                job["status"] = "Ready to Apply"
                job["resume_tailored_path"] = str(resume_path)
                job["cover_letter_path"] = str(cover_letter_path)
                console.print(f"    [green]Score: {match_score:.0f}%. Tailored resume & cover letter saved.[/green]")
                tailored_count += 1
                
        except Exception as e:
            console.print(f"    [red]Error tailoring: {e}[/red]")
            job["status"] = "Error"
            
        # Re-save queue after every job in case of crash
        save_queue(jobs)
        
    console.print(f"\n[bold green]✅ PHASE 2 COMPLETE — {tailored_count} resumes tailored[/bold green]")


# ============================================================
# PHASE 3 — APPLY
# ============================================================
def phase_3_apply(profile: dict, tracker: Tracker, max_apps: int):
    """Run apply phase — one job at a time with strict rules"""
    console.print(Panel("▶ [bold cyan]PHASE 3 STARTING — Applying to jobs (Strict Mode)...[/bold cyan]"))
    
    jobs = load_queue()
    ready_jobs = [j for j in jobs if j.get("status") == "Ready to Apply"]
    
    if not ready_jobs:
        console.print("[dim]No jobs are Ready to Apply.[/dim]")
        return
        
    applied_this_session = 0
    
    for job in ready_jobs:
        if applied_this_session >= max_apps:
            console.print(f"\n[yellow]Reached session max ({max_apps}). Stopping Phase 3.[/yellow]")
            break
            
        company = job.get("company", "Unknown")
        role = job.get("title", "Unknown")
        url = job.get("url", "")
        platform = job.get("platform", "")
        score = job.get("match_score", 0)
        
        console.rule(f"[dim]Job {applied_this_session+1} / {len(ready_jobs)}[/dim]")
        console.print(f"  [bold cyan]📤 Applying:[/bold cyan] {role} @ {company}")
        
        # Enforce auto_submit always since it's an automated runner now
        result = fill_and_submit(
            job=job,
            profile=profile,
            resume_path=job.get("resume_tailored_path", ""),
            cover_letter_path=job.get("cover_letter_path", ""),
            auto_submit=True, 
            headless=False # Visible browser for apply phase
        )
        
        status = result.get("status", "error")
        details = result.get("details", "")
        
        # LOGGING BEOFRE NEXT TASK
        tracker.log(
            company=company, role=role, platform=platform,
            match_score=score, status=status,
            resume_path=job.get("resume_tailored_path", ""), 
            cover_letter_path=job.get("cover_letter_path", ""),
            url=url, notes=details[:200]
        )
        
        job["status"] = status
        save_queue(jobs)
        applied_this_session += 1
        
        console.print(f"    Result: [bold]{status}[/bold] — {details[:80]}")
        
    console.print("\n[bold green]✅ PHASE 3 COMPLETE[/bold green]")


# ============================================================
# REPORTING
# ============================================================
def print_final_report(start_time: float, tracker: Tracker):
    elapsed = time.time() - start_time
    mins = int(elapsed // 60)
    stats = tracker.get_stats()
    
    # Grab top 3 applied from logs
    top_applied = []
    # Sort top matches from jobs queue or tracker
    jobs = load_queue()
    submitted_jobs = sorted([j for j in jobs if j.get("status") in ["submitted", "applied"]], 
                            key=lambda x: x.get("match_score", 0), reverse=True)
                            
    def get_job_info(index):
        if index < len(submitted_jobs):
            j = submitted_jobs[index]
            c = j.get("company", "Unknown")[:15]
            r = j.get("title", "Role")[:15]
            s = int(j.get("match_score", 0))
            return c, r, s
        return "---", "---", 0
        
    c1, r1, s1 = get_job_info(0)
    c2, r2, s2 = get_job_info(1)
    c3, r3, s3 = get_job_info(2)

    report = f"""
╔══════════════════════════════════════════╗
║      JOB APPLICATION AGENT REPORT       ║
╠══════════════════════════════════════════╣
║ Date         : {datetime.now().strftime('%Y-%m-%d %H:%M')}
║ Duration     : {mins} minutes       
╠══════════════════════════════════════════╣
║ Jobs Found   : {len(jobs)}                  
║ ✅ Applied   : {sum(1 for j in jobs if j.get('status') in ['submitted', 'applied'])}                
║ ⚠️  Skipped  : {sum(1 for j in jobs if j.get('status') == 'Low Match')}  low match    
║ ❌ Failed    : {sum(1 for j in jobs if j.get('status') in ['error', 'captcha'])}   error/captcha
║ 📬 Responses : Check your email 
╠══════════════════════════════════════════╣
║ TOP APPLIED:                            
║  1. {c1:<12} | {r1:<12} | {s1}%   
║  2. {c2:<12} | {r2:<12} | {s2}%   
║  3. {c3:<12} | {r3:<12} | {s3}%   
╠══════════════════════════════════════════╣
║ Next Run: Tomorrow 9:00 AM              
╚══════════════════════════════════════════╝
"""
    console.print(report)


# ============================================================
# RUNNER
# ============================================================
def run_agent(dry_run=False, max_apps=None, forced_platform=None):
    start_time = time.time()
    profile = load_profile()
    tracker = Tracker()
    max_count = max_apps or profile.get("max_daily_applications", 50)
    
    platforms = None
    if forced_platform:
        platform_map = {"linkedin": "LinkedIn", "naukri": "Naukri", "indeed": "Indeed", "internshala": "Internshala"}
        platforms = [platform_map.get(forced_platform.lower(), forced_platform)]

    phase_1_search(profile, tracker, max_count, platforms)
    phase_2_tailor(profile)
    
    if not dry_run:
        phase_3_apply(profile, tracker, max_count)
    else:
        console.print("\n[yellow]⚡ DRY RUN MODE — skipping Phase 3 apply[/yellow]")
        
    print_final_report(start_time, tracker)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Job Application Agent")
    parser.add_argument("--dry-run", action="store_true", help="Scrape and tailor but do NOT submit")
    parser.add_argument("--max", type=int, default=None, help="Max number of applications to process")
    parser.add_argument("--platform", type=str, default=None, help="Limit to one platform")
    args = parser.parse_args()

    run_agent(dry_run=args.dry_run, max_apps=args.max, forced_platform=args.platform)

