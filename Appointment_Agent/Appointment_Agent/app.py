import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import uuid
import sqlite3
import base64
import asyncio
import sys
import io
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv 

# --- AUDIO LIBRARY ---
from gtts import gTTS 
import json
from groq import Groq

load_dotenv() 

# --- CONFIGURATION ---
MODEL_NAME = 'llama-3.3-70b-versatile'
DB_NAME = "appointments_poc.db"

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

GROQ_CLIENT: Groq | None = None

# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE IF NOT EXISTS doctors (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, specialty TEXT)""")
    cursor.execute("""CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY, patient_name TEXT, doctor_name TEXT, appointment_time TIMESTAMP, patient_email TEXT, status TEXT, UNIQUE(doctor_name, appointment_time))""")
    try:
        doctors = [("Dr. Meera Patel", "Cardiology"), ("Dr. Arjun Rao", "Neurology")]
        for name, spec in doctors:
            cursor.execute("INSERT OR IGNORE INTO doctors (name, specialty) VALUES (?, ?)", (name, spec))
        conn.commit()
    except: pass
    conn.close()

init_db()

# --- EMAIL CONFIGURATION ---
SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))

def send_confirmation_email(patient_name: str, patient_email: str, doctor_name: str, appointment_time: str) -> bool:
    """Send appointment confirmation email to patient"""
    try:
        if not all([SMTP_EMAIL, SMTP_PASSWORD]):
            print("⚠️  Email credentials not configured in .env")
            return False
            
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Appointment Confirmation - City Hospital"
        msg["From"] = SMTP_EMAIL
        msg["To"] = patient_email
        
        # HTML email template
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4f46e5; margin-bottom: 20px;">Appointment Confirmation</h2>
                    
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    
                    <p>Your appointment has been successfully booked! Here are the details:</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> {doctor_name}</p>
                        <p><strong>Date & Time:</strong> {appointment_time}</p>
                        <p><strong>Hospital:</strong> City Hospital</p>
                    </div>
                    
                    <p>Please arrive 15 minutes before your scheduled appointment time.</p>
                    
                    <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                    
                    <p><strong>Thank you for choosing City Hospital!</strong></p>
                    
                    <hr style="margin-top: 30px; color: #ddd;">
                    <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
                </div>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, "html"))
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
            
        print(f"Confirmation email sent to {patient_email}")
        return True
        
    except Exception as e:
        print(f"Email Error: {e}")
        return False

# --- FASTAPI APP INITIALIZATION (FIXED) ---
app = FastAPI()

# --- TOOLS ---
def list_doctors_tool() -> dict:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT name, specialty FROM doctors")
    res = [{"name": r[0], "specialty": r[1]} for r in cursor.fetchall()]
    conn.close()
    return {"doctors": res}

def check_slot_tool(doctor_name: str, appointment_time: str) -> dict:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM appointments WHERE doctor_name=? AND appointment_time=?", (doctor_name, appointment_time))
    booked = cursor.fetchone()
    conn.close()
    return {"status": "booked" if booked else "available"}

def book_appointment_tool(doctor_name: str, appointment_time: str, patient_name: str, patient_email: str) -> dict:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO appointments (patient_name, doctor_name, appointment_time, patient_email, status) VALUES (?,?,?,?,?)", (patient_name, doctor_name, appointment_time, patient_email, "CONFIRMED"))
        conn.commit()
        
        # Send confirmation email
        email_sent = send_confirmation_email(patient_name, patient_email, doctor_name, appointment_time)
        
        return {"status": "success", "email_sent": email_sent}
    except Exception as e:
        print(f"Booking error: {e}")
        return {"status": "conflict"}
    finally: 
        conn.close()

TOOL_FUNCTIONS = {
    "list_doctors": list_doctors_tool,
    "check_slot": check_slot_tool,
    "book_appointment": book_appointment_tool
}

GROQ_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "list_doctors",
            "description": "List all available doctors and their specialties",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_slot",
            "description": "Check if a specific time slot is available for a doctor",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_name": {"type": "string", "description": "Name of the doctor"},
                    "appointment_time": {"type": "string", "description": "Time of the appointment (e.g. 10:00 AM)"}
                },
                "required": ["doctor_name", "appointment_time"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "book_appointment",
            "description": "Book an appointment with a doctor for a patient",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_name": {"type": "string"},
                    "appointment_time": {"type": "string"},
                    "patient_name": {"type": "string"},
                    "patient_email": {"type": "string"}
                },
                "required": ["doctor_name", "appointment_time", "patient_name", "patient_email"]
            }
        }
    }
]

# --- TEXT SANITIZATION ---
def clean_text_for_audio(text: str) -> str:
    # 1. Remove Markdown asterisks and hashes
    text = re.sub(r'[*_#]', '', text)
    # 2. REMOVE English translations in parentheses (e.g., "(Hello)") 
    # This prevents the agent from speaking both languages.
    text = re.sub(r'\([^)]*\)', '', text)
    return " ".join(text.split())

# --- AUDIO GENERATOR ---
async def generate_audio_gtts(text: str, lang_code: str) -> str:
    if not text: return None
    
    clean_text = clean_text_for_audio(text)
    
    try:
        lang = 'en'
        tld = 'co.in' 

        if 'hi' in lang_code: 
            lang = 'hi'
            tld = 'com' 
        elif 'te' in lang_code: 
            lang = 'te'
            tld = 'com' 
            
        def _run_gtts():
            fp = io.BytesIO()
            # slow=False creates a more natural, conversational speed
            tts = gTTS(text=clean_text, lang=lang, tld=tld, slow=False) 
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.getvalue()

        mp3_data = await asyncio.to_thread(_run_gtts)
        return base64.b64encode(mp3_data).decode('utf-8')
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

# --- SYSTEM PROMPT ---
BASE_PROMPT = """
You are Sarah, a warm and caring receptionist at Apollo Hospital.

STRICT BOOKING PROTOCOL:
1. NEVER invent details (like "Dr. Smith"). If the user wants to book an appointment, first use the `list_doctors` tool and present the available doctors.
2. You MUST explicitly ask the user for the following details before booking:
   - The name of the doctor they choose from the available list.
   - The date and time they prefer.
   - The patient's full name.
   - The patient's email address (for confirmation).
3. Ask for these details conversationally, step-by-step. Do not overwhelm the user with all questions at once.
4. Use `check_slot` to verify availability before booking.
5. Only use `book_appointment` when you have ALL the required details.

STRICT LANGUAGE POLICY:
1. Speak ONLY in the language requested by the user.
2. If the user selects Telugu, your response must be 100% Telugu script. 
3. DO NOT provide English translations or bracketed text. 
4. Avoid technical formatting like bolding (**) or bullet points.

IMPORTANT: Do NOT output raw <function> tags or XML in your response. Always use the proper JSON tool calling format.
"""

class AgentMessageRequest(BaseModel):
    session_id: str | None = None
    text: str
    language_code: str | None = "en-IN"

AGENT_SESSIONS = {}

def get_chat_session(session_id=None):
    global GROQ_CLIENT
    if not GROQ_CLIENT:
        GROQ_CLIENT = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    if not session_id or session_id not in AGENT_SESSIONS:
        session_id = str(uuid.uuid4())
        AGENT_SESSIONS[session_id] = [
            {"role": "system", "content": BASE_PROMPT}
        ]
    return session_id, AGENT_SESSIONS[session_id]

@app.get("/")
def read_root():
    return FileResponse("frontend.html", media_type="text/html")

@app.post("/agent/new_session")
def new_session():
    sid, _ = get_chat_session()
    return {"session_id": sid}

@app.post("/agent/message")
async def agent_message(req: AgentMessageRequest):
    global GROQ_CLIENT
    sid, messages = get_chat_session(req.session_id)
    
    lang_map = {
        "te-IN": "STRICT: Respond in Telugu script only. No English.",
        "hi-IN": "STRICT: Respond in Hindi script only. No English.",
        "en-IN": "Respond in English."
    }
    instruction = lang_map.get(req.language_code, "Respond in English.")
    
    try:
        user_message = f"{req.text}\n\n[Instruction: {instruction}]"
        messages.append({"role": "user", "content": user_message})
        
        while True:
            response = await asyncio.to_thread(
                GROQ_CLIENT.chat.completions.create,
                model=MODEL_NAME,
                messages=messages,
                tools=GROQ_TOOLS,
                tool_choice="auto"
            )
            
            response_message = response.choices[0].message
            # Groq returns a specialized object, we need to convert it back to a dict for the messages array
            message_dict = {"role": response_message.role}
            if response_message.content is not None:
                message_dict["content"] = response_message.content
            if response_message.tool_calls:
                message_dict["tool_calls"] = [
                    {
                        "id": tool_call.id,
                        "type": "function",
                        "function": {
                            "name": tool_call.function.name,
                            "arguments": tool_call.function.arguments
                        }
                    }
                    for tool_call in response_message.tool_calls
                ]
            
            messages.append(message_dict)
            
            tool_calls = response_message.tool_calls
            if tool_calls:
                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
                    if not isinstance(function_args, dict):
                        function_args = {}
                    result = TOOL_FUNCTIONS[function_name](**function_args)
                    messages.append(
                        {
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": function_name,
                            "content": json.dumps({"result": result}),
                        }
                    )
            else:
                final_text = response_message.content or ""
                # Strip leaked Llama-3 function tags and any XML tags from the visible response
                final_text = re.sub(r'<function=[^>]+>.*?</function>', '', final_text)
                final_text = re.sub(r'<[^>]+>', '', final_text)
                break
            
        audio_b64 = await generate_audio_gtts(final_text, req.language_code)
        
        return { "session_id": sid, "text": final_text, "audio": audio_b64 }

    except Exception as e:
        print(f"Error in agent_message: {e}")
        return {"session_id": sid, "text": "I apologize, I am having a technical issue.", "audio": None}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)