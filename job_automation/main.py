"""
Cold Email Sender — Sends personalised job-application emails to HR contacts.

Reads target companies from data/jobs.xlsx, composes a natural-sounding cold
email for each, attaches your resume, sends it via Gmail SMTP, and records
every result in a SQLite database for the dashboard to display.
"""

import os
import sys
import random
import logging
import sqlite3
import smtplib
import imaplib
import email as email_lib
from datetime import datetime
import pandas as pd
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv

# ── Setup ───────────────────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("email_log.txt", encoding="utf-8"),
    ],
)
log = logging.getLogger(__name__)

# ── Config from .env ────────────────────────────────────────────────
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT   = int(os.getenv("SMTP_PORT", 587))
IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
EMAIL_ADDR  = os.getenv("EMAIL_ADDRESS", "")
EMAIL_PASS  = os.getenv("EMAIL_PASSWORD", "")

FULL_NAME   = os.getenv("FULL_NAME", "Rohit Ranvir")
PHONE       = os.getenv("PHONE", "9158000676")
GITHUB      = os.getenv("GITHUB_URL", "https://github.com/rohitranvir")
LINKEDIN    = os.getenv("LINKEDIN_URL", "https://www.linkedin.com/in/rohit-ranveer")
RESUME_FULLSTACK   = os.getenv("RESUME_FULLSTACK", "resume/Rohit_Ranvir_FullStack_Resume.docx")
RESUME_DATA_ANALYST = os.getenv("RESUME_DATA_ANALYST", "resume/Rohit_Ranvir_DataAnalyst_Resume.docx")

DB_PATH = "data/email_results.db"

# Keywords that indicate a data/analytics role
_DATA_KEYWORDS = [
    "data analyst", "data engineer", "data science", "data scientist",
    "analytics", "ml engineer", "machine learning", "bi analyst",
    "business analyst", "business intelligence", "python / ml",
    "python/ml",
]


def _pick_resume(position: str) -> str:
    """Pick the right resume based on the job position."""
    pos_lower = position.lower()
    for kw in _DATA_KEYWORDS:
        if kw in pos_lower:
            return RESUME_DATA_ANALYST
    return RESUME_FULLSTACK


# ══════════════════════════════════════════════════════════════════════
#  DATABASE
# ══════════════════════════════════════════════════════════════════════

def _get_db():
    """Return a connection to the SQLite results database."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS emails (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            company     TEXT,
            position    TEXT,
            hr_email    TEXT,
            status      TEXT DEFAULT 'pending',
            error_msg   TEXT DEFAULT '',
            responded   INTEGER DEFAULT 0,
            sent_at     TEXT,
            responded_at TEXT DEFAULT ''
        )
    """)
    conn.commit()
    return conn


def _record(conn, company, position, hr_email, status, error_msg=""):
    """Insert one email result row."""
    conn.execute(
        """INSERT INTO emails (company, position, hr_email, status, error_msg, sent_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (company, position, hr_email, status, error_msg,
         datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
    )
    conn.commit()


# ══════════════════════════════════════════════════════════════════════
#  HUMAN-SOUNDING EMAIL TEMPLATES
# ══════════════════════════════════════════════════════════════════════

def _signature():
    return (
        f"\n\nWarm regards,\n"
        f"{FULL_NAME}\n"
        f"{EMAIL_ADDR}  |  {PHONE}\n"
        f"GitHub: {GITHUB}\n"
        f"LinkedIn: {LINKEDIN}"
    )


_TEMPLATES = [
    # Template 1 — conversational & warm
    lambda pos, co: (
        f"Hi there,\n\n"
        f"I recently came across {co} and was genuinely excited to see you're looking "
        f"for a {pos}. The work your team is doing really resonates with me, and I'd "
        f"love the chance to be a part of it.\n\n"
        f"A little about me — I'm a recent Engineering graduate with a strong foundation "
        f"in Python, Java, SQL, and full-stack development. I've built several end-to-end "
        f"projects (you can check them out on my GitHub) and I'm eager to bring that energy "
        f"to a fast-paced team like yours.\n\n"
        f"I've attached my resume for a quick look. Would love to chat if you think there "
        f"could be a fit!\n\n"
        f"Thanks for your time — really appreciate it."
        + _signature()
    ),

    # Template 2 — direct & confident
    lambda pos, co: (
        f"Hello,\n\n"
        f"I'm reaching out because I saw the opening for {pos} at {co}, and honestly, "
        f"it feels like a great match for my skill set.\n\n"
        f"I graduated in Engineering, and since then I've been heads-down building projects "
        f"in Python, databases, and web development. I enjoy solving real problems with clean "
        f"code, and I think that's exactly what a role like this needs.\n\n"
        f"My resume is attached — it has the full picture, but happy to walk you through "
        f"anything over a quick call.\n\n"
        f"Looking forward to hearing back!"
        + _signature()
    ),

    # Template 3 — story-driven
    lambda pos, co: (
        f"Hey,\n\n"
        f"I hope you don't mind the cold email — I just couldn't pass up the {pos} "
        f"opportunity at {co} without reaching out.\n\n"
        f"I've spent the last year building real-world projects after finishing my B.E. — "
        f"everything from data pipelines in Python to full-stack web apps. What I enjoy "
        f"most is taking a messy problem and turning it into something that actually works "
        f"well.\n\n"
        f"I'd love to bring that mindset to your team. My resume is attached — feel free "
        f"to take a look whenever you get a chance.\n\n"
        f"Thanks a lot, and hope to connect soon!"
        + _signature()
    ),

    # Template 4 — friendly & brief
    lambda pos, co: (
        f"Hi,\n\n"
        f"I noticed {co} has an opening for {pos} and wanted to throw my hat in the ring.\n\n"
        f"Quick intro — I'm Rohit, a fresh Engineering grad who loves writing Python, "
        f"building web apps, and digging into data. I've put together a few solid projects "
        f"(happy to demo them!) and I'm looking for a team where I can keep growing.\n\n"
        f"Resume's attached. Even a brief look would mean a lot.\n\n"
        f"Cheers, and thanks for considering!"
        + _signature()
    ),

    # Template 5 — enthusiastic & specific
    lambda pos, co: (
        f"Hello!\n\n"
        f"I came across the {pos} role at {co} and it immediately caught my eye. "
        f"I've been following what your team is building, and I'd love the opportunity "
        f"to contribute.\n\n"
        f"I recently completed my Engineering degree and have been actively working on "
        f"projects involving Python automation, REST APIs, and database design. I'm a "
        f"fast learner who genuinely enjoys writing code that makes a difference.\n\n"
        f"I've attached my resume — would really appreciate it if you could take a quick "
        f"look. Happy to hop on a call at your convenience.\n\n"
        f"Thank you so much!"
        + _signature()
    ),
]


def _subject_lines(position):
    """Return a randomly-chosen subject line."""
    options = [
        f"Application for {position} – {FULL_NAME}",
        f"Interested in the {position} role – {FULL_NAME}",
        f"{FULL_NAME} | Application for {position}",
        f"Keen on the {position} opening – resume attached",
    ]
    return random.choice(options)


# ══════════════════════════════════════════════════════════════════════
#  BUILD & SEND
# ══════════════════════════════════════════════════════════════════════

def _build_email(position: str, company: str, to_email: str) -> MIMEMultipart:
    """Compose a natural cold email with resume attached."""
    msg = MIMEMultipart()
    msg["From"]    = f"{FULL_NAME} <{EMAIL_ADDR}>"
    msg["To"]      = to_email
    msg["Subject"] = _subject_lines(position)

    # Pick the right resume for this role
    resume_path = _pick_resume(position)

    # Pick a random template so each email feels unique
    body = random.choice(_TEMPLATES)(position, company)
    msg.attach(MIMEText(body, "plain"))

    # Attach resume
    if os.path.isfile(resume_path):
        with open(resume_path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f'attachment; filename="{os.path.basename(resume_path)}"',
        )
        msg.attach(part)
        resume_type = "Data Analyst" if resume_path == RESUME_DATA_ANALYST else "FullStack"
        log.info(f"  📎 {resume_type} resume attached")
    else:
        log.warning(f"  ⚠  Resume not found at {resume_path}")

    return msg


def send_cold_email(position: str, company: str, to_email: str) -> tuple[bool, str]:
    """Send one cold email. Returns (success, error_message)."""
    try:
        msg = _build_email(position, company, to_email)
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(EMAIL_ADDR, EMAIL_PASS)
            server.send_message(msg)
        log.info(f"  ✅ Email sent to {to_email}")
        return True, ""
    except smtplib.SMTPAuthenticationError:
        err = "SMTP auth failed — use a Gmail App Password"
        log.error(f"  ❌ {err}")
        return False, err
    except Exception as e:
        err = str(e)
        log.error(f"  ❌ Failed: {err}")
        return False, err


# ══════════════════════════════════════════════════════════════════════
#  RESPONSE CHECKER (IMAP)
# ══════════════════════════════════════════════════════════════════════

def check_responses():
    """
    Scan Gmail inbox for replies from HR emails we've contacted.
    Updates the database when a response is found.
    """
    if not EMAIL_ADDR or not EMAIL_PASS:
        log.warning("Credentials not set — skipping response check.")
        return 0

    conn = _get_db()
    # Get all sent emails that haven't had a response yet
    rows = conn.execute(
        "SELECT id, hr_email FROM emails WHERE status='sent' AND responded=0"
    ).fetchall()

    if not rows:
        log.info("No pending emails to check for responses.")
        conn.close()
        return 0

    hr_lookup = {row[1].lower(): row[0] for row in rows}
    new_responses = 0

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER)
        mail.login(EMAIL_ADDR, EMAIL_PASS)
        mail.select("INBOX")

        for hr_email, record_id in hr_lookup.items():
            _, data = mail.search(None, f'FROM "{hr_email}"')
            if data[0]:
                conn.execute(
                    "UPDATE emails SET responded=1, responded_at=? WHERE id=?",
                    (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), record_id),
                )
                new_responses += 1
                log.info(f"  📩 Response found from {hr_email}")

        conn.commit()
        mail.logout()
    except Exception as e:
        log.error(f"IMAP check failed: {e}")
    finally:
        conn.close()

    log.info(f"  Response check done — {new_responses} new response(s) found.")
    return new_responses


# ══════════════════════════════════════════════════════════════════════
#  MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════

def main(excel_path: str = "data/jobs.xlsx"):
    # Validate credentials
    if not EMAIL_ADDR or not EMAIL_PASS:
        log.error("EMAIL_ADDRESS or EMAIL_PASSWORD not set in .env — exiting.")
        sys.exit(1)

    # Read jobs
    try:
        df = pd.read_excel(excel_path)
    except FileNotFoundError:
        log.error(f"Excel file not found: {excel_path}")
        sys.exit(1)

    required_cols = {"Company", "Position", "HR Contact Email"}
    if not required_cols.issubset(df.columns):
        log.error(f"Excel must have columns: {required_cols}. Found: {list(df.columns)}")
        sys.exit(1)

    conn = _get_db()
    total = len(df)
    sent, failed = 0, 0
    log.info(f"Found {total} job(s) in {excel_path}\n")

    for idx, row in df.iterrows():
        company  = str(row.get("Company", "")).strip()
        position = str(row.get("Position", "")).strip()
        hr_email = str(row.get("HR Contact Email", "")).strip()

        log.info(f"[{idx + 1}/{total}]  {company}  —  {position}")

        if not hr_email or hr_email.lower() in ("nan", "none", ""):
            log.warning(f"  ⏭  No HR email for {company}, skipping.")
            _record(conn, company, position, "", "skipped", "No HR email provided")
            failed += 1
            continue

        success, err = send_cold_email(position, company, hr_email)
        status = "sent" if success else "failed"
        _record(conn, company, position, hr_email, status, err)

        if success:
            sent += 1
        else:
            failed += 1

    conn.close()

    log.info(f"\n{'='*50}")
    log.info(f"Done!  ✅ Sent: {sent}  |  ❌ Failed/Skipped: {failed}  |  Total: {total}")
    log.info(f"{'='*50}")
    log.info("Run:  streamlit run dashboard.py")


if __name__ == "__main__":
    main()
