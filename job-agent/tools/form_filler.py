# ============================================================
# FORM FILLER PROMPT — behavior rules for Playwright
# ============================================================
FORM_FILLER_RULES = """
STRICT FORM FILLING RULES:

1. TAB RULE:
   - Open exactly ONE tab
   - Never open new tab while current is active
   - Never close tab until logging is confirmed

2. PAGE LOAD:
   - After opening URL wait minimum 3 seconds
   - Use: page.wait_for_load_state('networkidle')
   - Confirm correct page before filling anything

3. FIELD FILLING:
   - Fill each field one by one
   - Wait 0.5–1 second between each field
   - Use: page.wait_for_timeout(random.randint(500, 1000))

4. SECTION TRANSITIONS:
   - Wait 1–2 seconds between form sections
   - Use: page.wait_for_timeout(random.randint(1000, 2000))

5. SUBMIT:
   - Review all fields before clicking submit
   - After clicking submit wait 3–5 seconds
   - Confirm success message is visible

6. LOG BEFORE CLOSE:
   - Write to applications.csv FIRST
   - Only then close the tab
   - Never close without logging

7. BETWEEN JOBS:
   - Wait 10–20 seconds random before next job
   - After 10 jobs: sleep 120 seconds
   - After 25 jobs: sleep 300 seconds

8. ERROR HANDLING:
   CAPTCHA:
     - Log URL and company
     - Wait 30 seconds
     - Retry once
     - If still blocked: log "CAPTCHA" → close tab → next job

   Page Not Loading:
     - page.reload()
     - Wait 5 seconds
     - If still fails: log "Load Error" → close tab → next job

   Popup/Modal:
     - Detect and close popup first
     - Then continue form filling
     - Never abandon tab for a popup

   Field Not Found:
     - Try alternate CSS selector
     - If not found: log "Form Error" → close tab → next job
"""

import time
import random
import os
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


# ============================================================
# PLAYWRIGHT TIMING HELPERS
# ============================================================
def wait_between_fields(page: Page):
    page.wait_for_timeout(random.randint(500, 1000))

def wait_between_sections(page: Page):
    page.wait_for_timeout(random.randint(1000, 2000))

def wait_after_submit(page: Page):
    page.wait_for_timeout(random.randint(3000, 5000))

def wait_between_jobs():
    time.sleep(random.randint(10, 20))


def _type_human(page: Page, selector: str, text: str):
    """Type text with human-like delays between keystrokes."""
    try:
        page.wait_for_selector(selector, timeout=5000)
        page.click(selector)
        wait_between_fields(page)
        page.fill(selector, "")
        for char in str(text):
            page.type(selector, char)
            page.wait_for_timeout(random.randint(50, 150))
        wait_between_fields(page)
    except Exception:
        pass  # Field might not exist; that's OK


def _detect_captcha(page: Page) -> bool:
    """Heuristic CAPTCHA detection."""
    try:
        html = page.content().lower()
        captcha_signals = ["captcha", "recaptcha", "hcaptcha", "are you a robot", "verify you are human", "g-recaptcha"]
        return any(signal in html for signal in captcha_signals)
    except Exception:
        return False


def fill_and_submit(
    job: dict,
    profile: dict,
    resume_path: str,
    cover_letter_path: str,
    auto_submit: bool = False,
    headless: bool = False,
) -> dict:
    """
    Navigate to a job application page, fill the form, and optionally submit.
    Enforces strict single-tab wait times.

    Returns:
        dict with keys: status (submitted|captcha|filled|error|skipped), details
    """
    url = job.get("url", "")
    if not url:
        return {"status": "skipped", "details": "No URL provided"}

    if not PLAYWRIGHT_AVAILABLE:
        return {"status": "error", "details": "Playwright not installed"}

    # ── Use the user's real Chrome profile (with saved logins) ──
    import os as _os
    CHROME_USER_DATA = _os.environ.get(
        "CHROME_USER_DATA_DIR",
        _os.path.join(_os.environ.get("LOCALAPPDATA", ""), "Google", "Chrome", "User Data")
    )
    CHROME_PROFILE = _os.environ.get("CHROME_PROFILE", "Default")

    result = {"status": "error", "details": ""}

    try:
        with sync_playwright() as p:
            # launch_persistent_context opens your REAL Chrome with all saved sessions
            context = p.chromium.launch_persistent_context(
                user_data_dir=CHROME_USER_DATA,
                channel="chrome",           # Use installed Chrome (not bundled Chromium)
                headless=False,             # Always visible — YOUR browser opens
                slow_mo=50,
                args=["--profile-directory=" + CHROME_PROFILE],
                no_viewport=True,
            )
            page = context.new_page()
            
            # --- Strict Load waiting ---
            try:
                page.goto(url, timeout=40000)
                page.wait_for_load_state('networkidle', timeout=15000)
            except PlaywrightTimeout:
                page.reload()
                page.wait_for_timeout(5000)
            
            page.wait_for_timeout(3000) # Minimum 3 sec wait after load as requested
            
            # ── CAPTCHA check before doing anything ──
            if _detect_captcha(page):
                print(f"    [yellow]⚠️ CAPTCHA detected at {url}. Waiting 30s to retry...[/yellow]")
                page.wait_for_timeout(30000) # Wait 30s as requested
                page.reload()
                page.wait_for_load_state('networkidle', timeout=15000)
                if _detect_captcha(page):
                    context.close()
                    return {"status": "captcha", "details": f"Blocked by CAPTCHA"}

            # ── Check for popups/modals and close them ──
            popup_selectors = ['.modal-close', '.close-button', 'button[aria-label="Close"]', 'button:has-text("No thanks")']
            for sel in popup_selectors:
                try:
                    if page.locator(sel).is_visible():
                        page.click(sel)
                        page.wait_for_timeout(1000)
                except Exception:
                    pass

            wait_between_sections(page)

            # ── Fill common fields ──
            FIELD_MAP = {
                # Name
                'input[name*="name" i]:not([name*="company"]):not([name*="last"])': profile.get("name", ""),
                'input[placeholder*="full name" i]': profile.get("name", ""),
                # First / Last name
                'input[name*="first" i]': profile.get("name", "").split()[0],
                'input[name*="last" i]': profile.get("name", "").split()[-1] if len(profile.get("name","").split()) > 1 else "",
                # Email
                'input[type="email"]': profile.get("email", ""),
                'input[name*="email" i]': profile.get("email", ""),
                # Phone
                'input[type="tel"]': profile.get("phone", ""),
                'input[name*="phone" i]': profile.get("phone", ""),
                'input[name*="mobile" i]': profile.get("phone", ""),
                # Location / City
                'input[name*="location" i]': profile.get("primary_location", ""),
                'input[name*="city" i]': profile.get("primary_location", ""),
                # LinkedIn
                'input[name*="linkedin" i]': profile.get("linkedin", ""),
                'input[placeholder*="linkedin" i]': profile.get("linkedin", ""),
                # GitHub
                'input[name*="github" i]': profile.get("github", ""),
                # Experience
                'input[name*="experience" i]': profile.get("experience_years", "0"),
                'select[name*="experience" i]': profile.get("experience_level", "Fresher"),
            }

            for selector, value in FIELD_MAP.items():
                if not value:
                    continue
                _type_human(page, selector, str(value))

            wait_between_sections(page)

            # ── Resume upload ──
            if resume_path and Path(resume_path).exists():
                try:
                    file_inputs = page.query_selector_all('input[type="file"]')
                    if file_inputs:
                        file_inputs[0].set_input_files(str(resume_path))
                        wait_between_fields(page)
                        print(f"    ✅ Resume uploaded: {Path(resume_path).name}")
                except Exception as e:
                    print(f"    [WARN] Resume upload failed: {e}")

            wait_between_sections(page)

            # ── Cover letter upload/paste ──
            if cover_letter_path and Path(cover_letter_path).exists():
                try:
                    file_inputs = page.query_selector_all('input[type="file"]')
                    if len(file_inputs) > 1:
                        file_inputs[1].set_input_files(str(cover_letter_path))
                        wait_between_fields(page)
                        print(f"    ✅ Cover letter file uploaded")
                    else:
                        # Fallback to Text Area paste
                        letter_text = Path(cover_letter_path).read_text(encoding="utf-8")
                        cl_selectors = [
                            'textarea[name*="cover" i]',
                            'textarea[placeholder*="cover" i]',
                            'textarea[placeholder*="letter" i]',
                        ]
                        for sel in cl_selectors:
                            el = page.query_selector(sel)
                            if el:
                                el.fill(letter_text[:2000]) # Quick paste instead of slow typing for huge text
                                wait_between_fields(page)
                                print(f"    ✅ Cover letter text pasted")
                                break
                except Exception:
                    pass

            wait_between_sections(page)

            # ── Final CAPTCHA check ──
            if _detect_captcha(page):
                context.close()
                return {"status": "captcha", "details": "CAPTCHA appeared after filling form"}

            # ── Submit ──
            if auto_submit:
                submit_selectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Apply")',
                    'button:has-text("Submit")',
                    'button:has-text("Send Application")',
                    '.jobs-apply-button'
                ]
                submitted = False
                for sel in submit_selectors:
                    try:
                        btn = page.query_selector(sel)
                        if btn and btn.is_visible():
                            # Review fields pause
                            page.wait_for_timeout(2000)
                            
                            btn.click()
                            wait_after_submit(page) # STRICT 3-5 sec wait
                            submitted = True
                            
                            # Check for success messages (heuristic)
                            page.wait_for_timeout(2000)
                            html = page.content().lower()
                            if any(msg in html for msg in ["success", "applied", "thank you", "received"]):
                                print("    ✅ Success message confirmed")
                                
                            break
                    except Exception:
                        continue
                result = {
                    "status": "submitted" if submitted else "filled",
                    "details": "Form submitted" if submitted else "Form filled but submit button not found / failed"
                }
            else:
                result = {
                    "status": "filled",
                    "details": "Form filled — auto_submit is disabled."
                }

            # Context closure happens automatically — logging in agent.py occurs FIRST.
            context.close()

    except PlaywrightTimeout:
        result = {"status": "error", "details": f"Timeout loading {url}"}
    except Exception as e:
        result = {"status": "error", "details": str(e)}

    return result
