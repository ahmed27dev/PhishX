from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal
from .database import get_db
from .models import RiskProfile, Interaction, Email, Explanation
from .explainability_engine import generate_explanation
from .ai_awareness import generate_awareness_message
import logging

logger = logging.getLogger(__name__)


app = FastAPI(
    title="Agent Engine Service",
    description="Behavioral Risk Scoring + Explainability Engine",
    version="2.5.0"
)

# -------------------------
# Pydantic Request Model
# -------------------------
class InteractionRequest(BaseModel):
    user_id: int
    email_id: int
    action: Literal["opened", "clicked", "downloaded", "reported", "ignored"]


# -------------------------
# Difficulty Recommendation Logic
# -------------------------
def get_recommended_difficulty(score: int) -> str:
    if score <= 20:
        return "easy"
    elif score <= 50:
        return "medium"
    elif score <= 75:
        return "hard"
    else:
        return "expert"


# -------------------------
# Health Endpoint
# -------------------------
@app.get("/health")
def health():
    return {"status": "agent-engine up"}


# -------------------------
# Analyze Interaction Endpoint (Phase 2 + 2.5)
# -------------------------
@app.post("/analyze-interaction")
def analyze_interaction(req: InteractionRequest, db: Session = Depends(get_db)):

    # -------------------------
    # Fetch Email
    # -------------------------
    email = db.query(Email).filter(Email.id == req.email_id).first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    # -------------------------
    # Fetch or Create Risk Profile
    # -------------------------
    risk_profile = db.query(RiskProfile).filter(
        RiskProfile.user_id == req.user_id
    ).first()

    if not risk_profile:
        risk_profile = RiskProfile(
            user_id=req.user_id,
            risk_score=5,
            trend="stable"
        )
        db.add(risk_profile)
        db.commit()
        db.refresh(risk_profile)

    old_score = risk_profile.risk_score
    delta = 0

    # -------------------------
    # Scoring Logic
    # -------------------------
    if email.is_phishing:
        if req.action == "opened":
            delta = 5
        elif req.action == "clicked":
            delta = 25
        elif req.action == "downloaded":
            delta = 40
        elif req.action == "reported":
            delta = -25
        elif req.action == "ignored":
            delta = -5   # better than 0
    else:
        # raise HTTPException(status_code=400, detail=f"Invalid action: {req.action}") // edit this if needed later
     
        # SAFE EMAIL LOGIC
        if req.action == "reported":
            delta = +10   # good awareness
        elif req.action == "ignored":
            delta = +5
        elif req.action in ["opened", "clicked", "downloaded"]:
            delta = 0   # neutral behavior

    

    # Update score (bounded 0–100)
    new_score = max(0, min(100, old_score + delta))
    risk_profile.risk_score = new_score
    difficulty = get_recommended_difficulty(new_score)
    logger.info(
    f"[Agent] User {req.user_id} performed '{req.action}' on email {req.email_id} | Score: {old_score} → {new_score}"
)
    
    # Determine trend
    if old_score == 100 and delta > 0:
        risk_profile.trend = "critical"
    elif new_score > old_score:
        risk_profile.trend = "worsening"
    elif new_score < old_score:
        risk_profile.trend = "improving"
    else:
        risk_profile.trend = "stable"

    # -------------------------
    # Store Interaction
    # -------------------------
    interaction = Interaction(
        user_id=req.user_id,
        email_id=req.email_id,
        action=req.action
    )
    db.add(interaction)

    # -------------------------
    # Phase 2 – Deterministic Explanation
    # -------------------------
    explanation_json = generate_explanation(email, req.action)
    ai_awareness_message = generate_awareness_message(explanation_json)

    explanation_record = Explanation(
        email_id=req.email_id,
        user_id=req.user_id,
        explanation=explanation_json,
        ai_message=ai_awareness_message
    )

    # explanation_record = Explanation(
    #     email_id=req.email_id,
    #     user_id=req.user_id,
    #     explanation=explanation_json
    # )

    db.add(explanation_record)
    db.commit()

    
    # -------------------------
    # Phase 2.5 – AI Awareness Layer
    # -------------------------
    #ai_awareness_message = generate_awareness_message(explanation_json)


    return {
    "old_score": old_score,
    "new_score": new_score,
    "trend": risk_profile.trend,
    "recommended_difficulty": difficulty,   # ✅ HERE
    "structured_explanation": explanation_json,
    "ai_awareness_message": ai_awareness_message
    }


# -------------------------
# Get Risk Endpoint
# -------------------------
@app.get("/risk/{user_id}")
def get_risk(user_id: int, db: Session = Depends(get_db)):
    risk_profile = db.query(RiskProfile).filter(RiskProfile.user_id == user_id).first()

    if not risk_profile:
        raise HTTPException(status_code=404, detail="Risk profile not found")

    difficulty = get_recommended_difficulty(risk_profile.risk_score)

    return {

        "user_id": user_id,
        "risk_score": risk_profile.risk_score,
        "trend": risk_profile.trend,
        "recommended_difficulty": difficulty
    }