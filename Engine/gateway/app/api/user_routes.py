from fastapi import APIRouter, Depends
from app.core.security import require_user
from app.services.email_service import get_user_emails, generate_phishing_email
from app.services.training_service import get_all_training_content
from sqlalchemy.orm import Session
from ..db.session import get_db
from ..services.agent_service import analyze_interaction
from app.models.user_models import InteractionRequest
from app.services.user_service import get_user_risk

router = APIRouter()


@router.get("/test")
def user_test(user=Depends(require_user)):
    return {"message": "User access granted"}


@router.get("/inbox")
def get_inbox(user=Depends(require_user)):
    user_id = user["user_id"]
    return get_user_emails(user_id)


@router.post("/interact")
def user_interact(
    req: InteractionRequest,
    user=Depends(require_user),
    db: Session = Depends(get_db)
):
    user_id = user["user_id"]

    result = analyze_interaction(user_id, req.email_id, req.action)
    difficulty = result.get("recommended_difficulty")
    print(f"[ADAPTIVE] User {user_id} → difficulty: {difficulty}")

    email_response = generate_phishing_email(user_id=user_id, difficulty=difficulty)
    print(f"[GENERATOR] Email generated for user {user_id}")

    # return {
    #     "message": "Interaction processed",
    #     "agent_result": result,
    #     "next_email": email_response
    # }

    return {
    "message": "Interaction processed",
    "agent_result": result,
    "next_email": {
        **email_response,
        "is_new": True   # 🔥 ADD THIS
        }
    }


@router.get("/training")
def get_training(user=Depends(require_user)):
    return get_all_training_content()

@router.get("/risk")
def get_my_risk(user=Depends(require_user)):
    user_id = user["user_id"]
    return get_user_risk(user_id)