from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import pytesseract
import io
import os
from dotenv import load_dotenv
from openai import OpenAI

# ---------- Setup ----------
load_dotenv()
client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

pytesseract.pytesseract.tesseract_cmd = "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

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
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a courteous and knowledgeable AI medical assistant. When a user describes a symptom, begin by asking how long they have been experiencing it and whether the discomfort is mild, moderate, or severe. Based on the information provided, identify the most likely cause or condition. Recommend some appropriate over-the-counter medications. Maintain a warm and conversational tone, and keep responses concise—ideally in short of 5 lines. Avoid legal disclaimers or unnecessary follow-up questions."

                )
            },
            {
                "role": "user",
                "content": f"Symptom: {symptom_input.message}"
            }
        ]
    )
    return {"reply": response.choices[0].message.content}


# ---------- Final Summary Endpoint ----------
@app.post("/chat-summary")
async def chat_summary(symptom_input: SymptomInput):
    prompt = (
        f"Based on the conversation, summarize the patient's symptoms and predict the most likely disease. "
        f"List only: \n1. Symptoms (as bullet points)\n2. Likely Disease\n3. Whether it's serious or not\n"
        f"4. Suggested Medicine (just names)\nKeep it brief and show disclaimers (as bold)."
    )

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are an AI doctor summarizing patient symptoms briefly."},
            {"role": "user", "content": prompt + f"\nConversation:\n{symptom_input.message}"}
        ]
    )
    return {"summary": response.choices[0].message.content}


# ---------- OCR Only Endpoint ----------
@app.post("/ocr-text")
async def ocr_extract(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    extracted_text = pytesseract.image_to_string(image).replace('\n', ' ').strip()
    return {"extracted_text": extracted_text}
