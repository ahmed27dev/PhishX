# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from app.db.session import get_db
# from app.core.security import require_admin
# from app.core.security import require_soc


# from app.models.user_models import User
# from app.models.email_model import Email
# from app.models.campaign_models import Campaign


# #new and suspisious Ali
# #from app.models.email_model import Email
# #from app.models.user_models import User
# #from app.models.campaign_models import Campaign
# from app.models.interaction_model import Interaction
# from app.models.risk_model import RiskProfile
# #Ali


# #New from Ahmed
# from app.models.interaction_model import Explanation
# #Ahmed


# from sqlalchemy import func


# router = APIRouter()




# # 📊 OVERVIEW
# @router.get("/overview")
# def soc_overview(db: Session = Depends(get_db), user=Depends(require_soc)):


#     total_users = db.query(User).count()
#     total_emails = db.query(Email).count()


#     phishing_emails = db.query(Email).filter(Email.is_phishing == True).count()
#     safe_emails = db.query(Email).filter(Email.is_phishing == False).count()


#     return {
#         "total_users": total_users,
#         "total_emails": total_emails,
#         "phishing_emails": phishing_emails,
#         "safe_emails": safe_emails
#     }




# # 👥 USERS RISK (BASIC)
# @router.get("/users")
# def soc_users(db: Session = Depends(get_db), user=Depends(require_soc)):
#     users = db.query(User).all()
#     data = []
#     for u in users:
#         email_count = db.query(Email).filter(Email.user_id == u.id).count()
#         # Added: fetch real risk profile per user
#         risk = db.query(RiskProfile).filter(RiskProfile.user_id == u.id).first()
#         data.append({
#             "user_id": u.id,
#             "email": u.email,
#             "role": u.role,
#             "department": u.department,
#             "emails_received": email_count,
#             "risk_score": risk.risk_score if risk else None,
#             "trend": risk.trend if risk else None,
#         })
#     return data




# # 📧 INTERACTIONS SUMMARY
# @router.get("/interactions")
# def soc_interactions(db: Session = Depends(get_db), user=Depends(require_soc)):


#     total = db.query(Email).count()


#     phishing = db.query(Email).filter(Email.is_phishing == True).count()


#     return {
#         "total_emails": total,
#         "phishing_emails": phishing,
#         "safe_emails": total - phishing
#     }




# @router.get("/analytics")
# def soc_analytics(db: Session = Depends(get_db), user=Depends(require_soc)):


#     # 📊 Interaction counts
#     interactions = db.query(
#         Interaction.action,
#         func.count(Interaction.id)
#     ).group_by(Interaction.action).all()


#     interaction_data = {i[0]: i[1] for i in interactions}


#     # 📊 Email distribution
#     phishing = db.query(Email).filter(Email.is_phishing == True).count()
#     safe = db.query(Email).filter(Email.is_phishing == False).count()


#     # 📊 Risk distribution
#     risks = db.query(RiskProfile).all()


#     high = sum(1 for r in risks if r.risk_score >= 70)
#     medium = sum(1 for r in risks if 40 <= r.risk_score < 70)
#     low = sum(1 for r in risks if r.risk_score < 40)


#     # ⚠️ High risk users
#     high_risk_users = [
#         {
#             "user_id": r.user_id,
#             "risk_score": r.risk_score,
#             "trend": r.trend
#         }
#         for r in risks if r.risk_score >= 70
#     ]


#     return {
#         "interactions": interaction_data,
#         "email_distribution": {
#             "phishing": phishing,
#             "safe": safe
#         },
#         "risk_distribution": {
#             "high": high,
#             "medium": medium,
#             "low": low
#         },
#         "high_risk_users": high_risk_users
#     }




# #New from Ahmed


# # 👤 USER DETAIL — risk profile + interaction history + explanations
# @router.get("/user/{user_id}")
# def soc_user_detail(user_id: int, db: Session = Depends(get_db), user=Depends(require_soc)):


#     from fastapi import HTTPException


#     u = db.query(User).filter(User.id == user_id).first()
#     if not u:
#         raise HTTPException(status_code=404, detail="User not found")


#     risk = db.query(RiskProfile).filter(RiskProfile.user_id == user_id).first()


#     interactions = (
#         db.query(Interaction, Email)
#         .join(Email, Interaction.email_id == Email.id)
#         .filter(Interaction.user_id == user_id)
#         .order_by(Interaction.created_at.desc())
#         .all()
#     )


#     explanations = db.query(Explanation).filter(Explanation.user_id == user_id).all()
#     explanation_map = {e.email_id: e.explanation for e in explanations}


#     history = []
#     for interaction, email in interactions:
#         history.append({
#             "interaction_id": interaction.id,
#             "email_id": email.id,
#             "email_subject": email.subject,
#             "is_phishing": email.is_phishing,
#             "action": interaction.action,
#             "timestamp": str(interaction.created_at),
#             "explanation": explanation_map.get(email.id)
#         })


#     action_counts = {"clicked": 0, "reported": 0, "ignored": 0}
#     for interaction, _ in interactions:
#         if interaction.action in action_counts:
#             action_counts[interaction.action] += 1


#     return {
#         "user_id": u.id,
#         "email": u.email,
#         "department": u.department,
#         "role": u.role,
#         "risk_score": risk.risk_score if risk else 0,
#         "trend": risk.trend if risk else "unknown",
#         "action_summary": action_counts,
#         "total_emails": len(interactions),
#         "history": history
#     }


#     #Ahmed


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import require_admin
from app.core.security import require_soc


from app.models.user_models import User
from app.models.email_model import Email
from app.models.campaign_models import Campaign
from app.models.interaction_model import Interaction
from app.models.risk_model import RiskProfile
from app.models.interaction_model import Explanation


from sqlalchemy import func


router = APIRouter()


# 📊 OVERVIEW
@router.get("/overview")
def soc_overview(db: Session = Depends(get_db), user=Depends(require_soc)):

    total_users = db.query(User).count()
    total_emails = db.query(Email).count()

    phishing_emails = db.query(Email).filter(Email.is_phishing == True).count()
    safe_emails = db.query(Email).filter(Email.is_phishing == False).count()

    return {
        "total_users": total_users,
        "total_emails": total_emails,
        "phishing_emails": phishing_emails,
        "safe_emails": safe_emails
    }


# 👥 USERS RISK (BASIC)
@router.get("/users")
def soc_users(db: Session = Depends(get_db), user=Depends(require_soc)):
    users = db.query(User).all()
    data = []
    for u in users:
        email_count = db.query(Email).filter(Email.user_id == u.id).count()
        risk = db.query(RiskProfile).filter(RiskProfile.user_id == u.id).first()
        data.append({
            "user_id": u.id,
            "email": u.email,
            "role": u.role,
            "department": u.department,
            "emails_received": email_count,
            "risk_score": risk.risk_score if risk else None,
            "trend": risk.trend if risk else None,
        })
    return data


# 📧 INTERACTIONS SUMMARY
@router.get("/interactions")
def soc_interactions(db: Session = Depends(get_db), user=Depends(require_soc)):

    total = db.query(Email).count()
    phishing = db.query(Email).filter(Email.is_phishing == True).count()

    return {
        "total_emails": total,
        "phishing_emails": phishing,
        "safe_emails": total - phishing
    }


@router.get("/analytics")
def soc_analytics(db: Session = Depends(get_db), user=Depends(require_soc)):

    # 📊 Interaction counts
    interactions = db.query(
        Interaction.action,
        func.count(Interaction.id)
    ).group_by(Interaction.action).all()

    interaction_data = {i[0]: i[1] for i in interactions}

    # 📊 Email distribution
    phishing = db.query(Email).filter(Email.is_phishing == True).count()
    safe = db.query(Email).filter(Email.is_phishing == False).count()

    # 📊 Risk distribution + high risk users — join User to get email
    high_risk_profiles = (
        db.query(RiskProfile, User)
        .join(User, User.id == RiskProfile.user_id)
        .all()
    )

    high = 0
    medium = 0
    low = 0
    high_risk_users = []

    for r, u in high_risk_profiles:
        if r.risk_score >= 70:
            high += 1
            high_risk_users.append({
                "user_id": r.user_id,
                "email": u.email,          # ← now included
                "department": u.department, # ← bonus: useful in SOC view
                "risk_score": r.risk_score,
                "trend": r.trend
            })
        elif 40 <= r.risk_score < 70:
            medium += 1
        else:
            low += 1

    # Sort by risk score descending so worst offenders appear first
    high_risk_users.sort(key=lambda x: x["risk_score"], reverse=True)

    return {
        "interactions": interaction_data,
        "email_distribution": {
            "phishing": phishing,
            "safe": safe
        },
        "risk_distribution": {
            "high": high,
            "medium": medium,
            "low": low
        },
        "high_risk_users": high_risk_users
    }


# 👤 USER DETAIL — risk profile + interaction history + explanations
@router.get("/user/{user_id}")
def soc_user_detail(user_id: int, db: Session = Depends(get_db), user=Depends(require_soc)):

    from fastapi import HTTPException

    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    risk = db.query(RiskProfile).filter(RiskProfile.user_id == user_id).first()

    interactions = (
        db.query(Interaction, Email)
        .join(Email, Interaction.email_id == Email.id)
        .filter(Interaction.user_id == user_id)
        .order_by(Interaction.created_at.desc())
        .all()
    )

    explanations = db.query(Explanation).filter(Explanation.user_id == user_id).all()
    explanation_map = {e.email_id: e.explanation for e in explanations}

    history = []
    for interaction, email in interactions:
        history.append({
            "interaction_id": interaction.id,
            "email_id": email.id,
            "email_subject": email.subject,
            "is_phishing": email.is_phishing,
            "action": interaction.action,
            "timestamp": str(interaction.created_at),
            "explanation": explanation_map.get(email.id)
        })

    action_counts = {"clicked": 0, "reported": 0, "ignored": 0}
    for interaction, _ in interactions:
        if interaction.action in action_counts:
            action_counts[interaction.action] += 1

    return {
        "user_id": u.id,
        "email": u.email,
        "department": u.department,
        "role": u.role,
        "risk_score": risk.risk_score if risk else 0,
        "trend": risk.trend if risk else "unknown",
        "action_summary": action_counts,
        "total_emails": len(interactions),
        "history": history
    }