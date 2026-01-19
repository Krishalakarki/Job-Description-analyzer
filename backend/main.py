import os
from fastapi import FastAPI
from dotenv import load_dotenv
from groq import Groq
from models import JDRequest
from prompts import jd_analysis_prompt

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

@app.post("/analyze")
async def analyze_jd(data: JDRequest):
    prompt = jd_analysis_prompt(
        data.job_description,
        ", ".join(data.user_skills)
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content
