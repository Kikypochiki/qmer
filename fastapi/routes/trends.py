from fastapi import APIRouter
import os
from supabase import create_client, Client
from datetime import datetime, timedelta

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_URL else None

@router.get("/trends")
async def get_trends():
    if not supabase: return {"error": "Supabase not configured"}
    
    # Query interventions for the last 30 days
    thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
    res = supabase.table("interventions").select("*").gte("documented_at", thirty_days_ago).execute()
    
    interventions = res.data
    
    counts = {}
    categories = {}
    total_delay = 0
    delay_count = 0
    
    for i in interventions:
        action = i.get("action")
        category = i.get("category", "other")
        if action:
            counts[action] = counts.get(action, 0) + 1
            categories[action] = category
            
        if i.get("is_delayed") and i.get("actual_time"):
            doc_at_str = i.get("documented_at")
            act_at_str = i.get("actual_time")
            if doc_at_str and act_at_str:
                try:
                    doc_at = datetime.fromisoformat(doc_at_str.replace('Z', '+00:00'))
                    act_at = datetime.fromisoformat(act_at_str.replace('Z', '+00:00'))
                    diff = (doc_at - act_at).total_seconds() / 60
                    if diff > 0:
                        total_delay += diff
                        delay_count += 1
                except ValueError:
                    pass
                
    top_actions = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    avg_delay = (total_delay / delay_count) if delay_count > 0 else 0
    
    return {
        "interventions": [{"action": k, "count": v, "category": categories[k]} for k, v in top_actions],
        "avgDelay": round(avg_delay, 1)
    }
