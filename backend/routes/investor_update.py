from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai
import os
from typing import List, Dict

router = APIRouter()

# OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

class InvestorUpdateRequest(BaseModel):
    company_name: str
    time_period: str
    metrics: List[Dict[str, float]]  # Example: [{"Revenue": 5.2, "Net Income": 1.1}]

@router.post("/generate-summary")
def generate_investor_summary(data: InvestorUpdateRequest):
    # Convert metrics into a readable format for the AI prompt
    metrics_text = "\n".join([f"{key}: {value}" for row in data.metrics for key, value in row.items()])

    prompt = f"""
    Generate a professional investor summary for {data.company_name} for {data.time_period}.
    
    Financial metrics provided:
    {metrics_text}

    Ensure the summary is concise, professional, and provides key insights for investors.
    """

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system", "content": "You are an investor relations AI, generating concise financial summaries."},
                      {"role": "user", "content": prompt}]
        )
        return {"summary": response["choices"][0]["message"]["content"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
