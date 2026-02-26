"""
cover_letter.py — Generates personalized cover letters using Claude AI.
"""
import os
import re
import json
from pathlib import Path
from dotenv import load_dotenv

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

load_dotenv()

OUTPUT_DIR = Path(__file__).parent.parent / "output" / "cover_letters"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def _safe_filename(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_\-]", "_", text)[:40]


def _call_claude(prompt: str) -> str:
    if not ANTHROPIC_AVAILABLE:
        raise RuntimeError("anthropic package not installed.")
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key or api_key.startswith("your_"):
        raise RuntimeError("ANTHROPIC_API_KEY not set in .env file")
    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text


def generate_cover_letter(
    company: str,
    role: str,
    job_description: str,
    profile: dict,
    tone: str = "professional"
) -> str:
    """
    Generate a tailored cover letter and save to output/cover_letters/.

    Returns:
        Path to the saved cover letter (.txt file)
    """
    prompt = f"""Write a {tone} cover letter for the following job application.

CANDIDATE:
Name: {profile['name']}
Email: {profile['email']}
Phone: {profile['phone']}
LinkedIn: {profile.get('linkedin', '')}
GitHub: {profile.get('github', '')}
Skills: {', '.join(profile['skills'])}
Experience: {profile['experience_level']}
Location: {profile['primary_location']}

JOB:
Company: {company}
Role: {role}
Job Description (excerpt):
{job_description[:2000]}

INSTRUCTIONS:
- Keep it to 3 paragraphs (Opening, Why I'm a fit, Closing with CTA)
- Be specific about the company and role — do NOT use generic filler
- Mention 2-3 specific skills that match the job requirements
- Tone: {tone}
- Do NOT include "Dear Hiring Manager" — use "Dear {company} Hiring Team,"
- End with: "Warm regards," followed by the candidate's name

Write only the cover letter body, no extra commentary."""

    try:
        letter_text = _call_claude(prompt)
    except Exception as e:
        # Fallback cover letter
        letter_text = f"""Dear {company} Hiring Team,

I am writing to express my strong interest in the {role} position at {company}. As a fresher with a solid foundation in {', '.join(profile['skills'][:3])}, I am eager to contribute to your team and grow my career in data analytics.

My academic projects have given me hands-on experience with {profile['skills'][0]} and {profile['skills'][1] if len(profile['skills']) > 1 else 'data analysis'}, which align closely with the requirements outlined in your job posting. I am a quick learner who thrives in collaborative environments.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to {company}. Thank you for considering my application.

Warm regards,
{profile['name']}
{profile['email']} | {profile['phone']}"""
        print(f"  [WARN] Cover letter fallback used: {e}")

    # Save the letter
    safe_company = _safe_filename(company)
    safe_role = _safe_filename(role)
    output_path = OUTPUT_DIR / f"{safe_company}_{safe_role}.txt"
    output_path.write_text(letter_text, encoding="utf-8")

    return str(output_path)
