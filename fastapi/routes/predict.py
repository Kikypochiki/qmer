from fastapi import APIRouter, HTTPException
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
import json
from datetime import datetime, timezone
from supabase import create_client, Client
from models.schemas import PredictionRequest, PredictionResponse

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL else None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction="""You are a clinical decision support assistant for staff nurses at Ormoc District Hospital (ODH),
a provincial hospital in Leyte, Philippines, assigned to the Operating Room and Delivery Room (OR/DR).

Your role: suggest nursing interventions based on patient presentation.
Follow Philippine DOH obstetric protocols and standards.
Flag interventions requiring physician authorization.
Consider resource constraints typical of provincial hospitals in the Philippines.

Rules:
1. Only suggest interventions within nursing scope of practice, or clearly mark physician orders
2. Patient safety is the highest priority
3. Confidence score = likelihood this intervention is needed (0–100)
4. Consider urgency of the situation in your confidence scoring
5. Never replace clinical judgment — frame as reminders, not orders
6. Respond ONLY in the specified JSON format — no markdown, no extra text

Context: prototype system for academic evaluation (BSN-2 Nursing Informatics, VSU Faculty of Nursing).""",
        generation_config=genai.GenerationConfig(
            temperature=0.3,
            max_output_tokens=1024,
        ),
        safety_settings={
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        }
    )

@router.post("/predict", response_model=PredictionResponse)
async def get_prediction(req: PredictionRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
        
    user_prompt = f"""Patient: {req.age or 'Unknown'} y/o, {req.gravida_para or 'Unknown'}, planning {req.mode_of_delivery} delivery.
Chief complaint: {req.chief_complaint or 'not stated'}.
Cervical dilation: {req.cervix_dilation or 'not recorded'}.
Contractions: {req.contraction_freq or 'not recorded'}.
Active clinical flags: {', '.join(req.clinical_flags) if req.clinical_flags else 'None'}.
{req.historical_context or ''}

Suggest the 6 most important nursing interventions for this patient.
Return ONLY this JSON (no markdown):
{{
  "risk_level": "critical|high|moderate|low",
  "priority_note": "1-2 sentence clinical summary",
  "interventions": [
    {{
      "action": "specific actionable nursing intervention",
      "confidence": 85,
      "category": "medication|monitoring|procedure|transfer|notification|other",
      "rationale": "one sentence clinical rationale",
      "requires_physician_order": false
    }}
  ]
}}"""
    
    response = model.generate_content(user_prompt)
    raw_text = response.text.strip()
    
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    if raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
        
    raw_text = raw_text.strip()
    
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Gemini returned malformed JSON")
        
    resp = PredictionResponse(
        patient_id=req.patient_id,
        predicted_interventions=data.get("interventions", []),
        risk_level=data.get("risk_level", "low"),
        priority_note=data.get("priority_note", ""),
        model_version="gemini-1.5-flash",
        predicted_at=datetime.utcnow().isoformat()
    )
    return resp
