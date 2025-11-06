from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import pytesseract
import io
import os
from dotenv import load_dotenv
from google import genai  # ✅ Correct import for Gemini SDK

# ---------- Setup ----------
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ---------- Tesseract setup ----------
pytesseract.pytesseract.tesseract_cmd = "C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Request Schema ----------
class SymptomInput(BaseModel):
    message: str

# ---------- Chat-Based Prediction Endpoint ----------
@app.post("/chat-predict")
async def chat_predict(symptom_input: SymptomInput):
    prompt = f"""
    You are SmartMediGen — an AI-powered clinical assistant trained in medical triage and symptom assessment.
    Your goal is to interpret the user's symptom and respond like a qualified healthcare assistant,
    using medically sound reasoning and professional tone.

    Response guidelines:
    - Focus on identifying likely causes (no greetings or introductions)
    - Include possible conditions, seriousness, and basic management steps
    - Mention appropriate over-the-counter (OTC) medicines if applicable
    - Keep it clear, factual, and under 6 lines
    - Avoid emojis, unnecessary empathy, or disclaimers
    - Use a clinical yet reassuring tone

    Symptom described: {symptom_input.message}
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return {"reply": response.text}


# ---------- Final Summary Endpoint ----------
@app.post("/chat-summary")
async def chat_summary(symptom_input: SymptomInput):
    prompt = f"""
    Summarize the patient's symptoms and predict the most likely disease.
    Include only:
    1. Symptoms (bullet points)
    2. Likely Disease
    3. Whether it's serious
    4. Suggested Medicines (just names)
    Keep it brief and end with **Disclaimer: Consult a doctor for confirmation.**

    Conversation:
    {symptom_input.message}
    """
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return {"summary": response.text}


# ---------- OCR Endpoint ----------
@app.post("/ocr-text")
async def ocr_extract(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    extracted_text = pytesseract.image_to_string(image).replace('\n', ' ').strip()
    return {"extracted_text": extracted_text}
