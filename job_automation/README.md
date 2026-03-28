# 📋 Job Application Automation System

Automatically send job application emails, attempt career-page applications, and track everything in a dashboard.

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd D:\Project\job_automation
pip install -r requirements.txt
```

### 2. Configure environment

```bash
# Copy the example and fill in your credentials
copy .env.example .env
```

Edit `.env` and set:
- `EMAIL_ADDRESS` — your Gmail address
- `EMAIL_PASSWORD` — a [Gmail App Password](https://myaccount.google.com/apppasswords) (NOT your regular password)
- `RESUME_PATH` — path to your resume PDF (default: `resume/resume.pdf`)

### 3. Add your data

- Place your resume PDF in `resume/resume.pdf`
- Place your jobs Excel file in `data/jobs.xlsx`  
  (or run `python create_sample_data.py` to generate sample data)

### 4. Run the automation

```bash
python main.py
```

This will:
- Read all jobs from the Excel file
- Send personalized emails with your resume attached
- Attempt to apply on career pages (if URL is provided)
- Log all results to `automation.log` and the SQLite database

### 5. View the Dashboard

```bash
streamlit run dashboard.py
```

Open [http://localhost:8501](http://localhost:8501) to see:
- Total jobs processed
- Emails sent / career pages attempted
- Filter by company, location, or status
- Bar chart of application statuses

## 📁 Project Structure

```
job_automation/
├── data/
│   └── jobs.xlsx              # Your job data
├── resume/
│   └── resume.pdf             # Your resume
├── main.py                    # Run this to start automation
├── job_reader.py              # Reads Excel data
├── email_sender.py            # Sends SMTP emails
├── career_apply.py            # Selenium career-page automation
├── database.py                # SQLite tracking
├── dashboard.py               # Streamlit dashboard
├── create_sample_data.py      # Generate sample jobs.xlsx
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variable template
└── .env                       # Your actual credentials (git-ignored)
```

## ⚠️ Gmail Setup

1. Enable **2-Step Verification** on your Google account.
2. Go to [App Passwords](https://myaccount.google.com/apppasswords).
3. Generate a new app password for "Mail".
4. Use that 16-character password as `EMAIL_PASSWORD` in `.env`.

## 📊 Excel File Format

Your `data/jobs.xlsx` must have these columns:

| Column           | Required | Description              |
|------------------|----------|--------------------------|
| Startup Name     | ✅       | Company name             |
| Sector           |          | Industry sector          |
| Position         | ✅       | Job title                |
| Job Type         |          | Full-time / Internship   |
| Experience       |          | Experience required      |
| HR Contact Email | ✅       | Email to send application|
| Careers Page     |          | URL to apply online      |
| Location         |          | Job location             |
