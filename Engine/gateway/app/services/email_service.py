from app.db.session import SessionLocal
from app.models.email_model import Email
import os
import requests
from app.models.interaction_model import Interaction, Explanation


PHISHING_URL = os.getenv("PHISHING_SERVICE_URL", "http://phishing-generator:8001")


# def get_user_emails(user_id: int):
#     db = SessionLocal()

#     try:
#         emails = (
#             db.query(Email)
#             .filter(Email.user_id == user_id)
#             .order_by(Email.created_at.desc())
#             .all()
#         )

#         return [
#             {
#                 "id": e.id,
#                 "subject": e.subject,
#                 "body": e.body,
#                 "is_phishing": e.is_phishing,
#                 "created_at": str(e.created_at),
#             }
#             for e in emails
#         ]

#     finally:
#         db.close()



def get_user_emails(user_id: int):
    db = SessionLocal()

    try:
        emails = (
            db.query(Email)
            .filter(Email.user_id == user_id)
            .order_by(Email.created_at.desc())
            .all()
        )

        result = []

        for e in emails:
            # 🔹 Check if user interacted
            interaction = (
                db.query(Interaction)
                .filter(
                    Interaction.user_id == user_id,
                    Interaction.email_id == e.id
                )
                .first()
            )

            # 🔹 Get latest explanation
            explanation = (
                db.query(Explanation)
                .filter(
                    Explanation.user_id == user_id,
                    Explanation.email_id == e.id
                )
                .order_by(Explanation.created_at.desc())
                .first()
            )

            result.append({
                "id": e.id,
                "subject": e.subject,
                "body": e.body,
                "is_phishing": e.is_phishing,
                "type": "phishing" if e.is_phishing else "safe",
                "created_at": str(e.created_at),

                # 🔥 NEW FIELDS
                "acted": True if interaction else False,
                "action": interaction.action if interaction else None,

                "explanation": explanation.explanation if explanation else None,
                "ai_message": getattr(explanation, "ai_message", None) if explanation else None
            })

        return result

    finally:
        db.close()



def generate_phishing_email(user_id: int, difficulty: str):
    db = SessionLocal()

    try:
        # ✅ FIX — fallback if agent failed
        if not difficulty:
            difficulty = "medium"

        response = requests.post(
            f"{PHISHING_URL}/generate",
            json={
                "theme": "Salary Update",
                "difficulty": difficulty,
                "style_profile": {   # ✅ FIX (NOT None)
                    "department": "HR",
                    "tone": "formal"
                }
            },
            timeout=120
        )

        if response.status_code != 200:
            print("GENERATOR ERROR RESPONSE:", response.text)   # 🔥 DEBUG
            return {"error": "Phishing generator failed"}

        data = response.json()

        # ✅ SAVE TO DB
        new_email = Email(
            user_id=user_id,
            subject=data.get("subject"),
            body=data.get("body"),
            is_phishing=True,
            attack_metadata=data.get("attack_metadata")
        )

        db.add(new_email)
        db.commit()
        db.refresh(new_email)

        return {
            "id": new_email.id,
            "subject": new_email.subject,
            "body": new_email.body,
            "attack_metadata": new_email.attack_metadata
        }

    except Exception as e:
        return {"error": f"Generator unreachable: {str(e)}"}

    finally:
        db.close()