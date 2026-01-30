import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from groq import Groq
from models import JDRequest
from prompts import jd_analysis_prompt

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

# Add CORS middleware for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_jd(data: JDRequest):
    try:
        prompt = jd_analysis_prompt(
            data.job_description,
            ", ".join(data.user_skills)
        )

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a precise job description analyzer. Always return valid JSON without markdown formatting."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Lower temperature for more consistent output
            max_tokens=2000
        )

        content = response.choices[0].message.content.strip()
        
        # Clean up potential markdown formatting
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        
        # Parse to validate JSON
        parsed_result = json.loads(content)
        
        return parsed_result

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON from LLM: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}