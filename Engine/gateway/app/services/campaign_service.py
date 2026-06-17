from app.db.session import SessionLocal
from app.models.campaign_models import Campaign, CreateCampaignRequest, CampaignTheme
from app.models.user_models import User
from app.models.org_models import OrgStyleProfile
from app.models.audit_model import AuditLog
from sqlalchemy import text
import requests
import random

PHISHING_SERVICE_URL = "http://phishing-generator:8001"


# =========================
# AUDIT HELPER
# =========================
def log_audit(db, service, action, actor_id=None, details=None):
    try:
        db.add(AuditLog(
            service=service, action=action,
            actor_id=actor_id, details=details or {}
        ))
        db.commit()
    except Exception as e:
        print(f"[AUDIT ERROR] {e}")


# =========================
# GET ORG STYLE PROFILE
# Returns extracted style for prompt context
# =========================
def get_org_style_profile(db):
    profile = db.query(OrgStyleProfile).first()
    if not profile:
        return None
    return {
        "greeting_style": profile.greeting_style,
        "signoff_style":  profile.signoff_style,
        "tone":           profile.tone,
        "common_phrases": profile.common_phrases or []
    }


# =========================
# GET RAW SAMPLES FROM DB
# Returns both internal + phishing raw bodies
# stored during org onboarding
# =========================
def get_raw_samples(db) -> dict:
    try:
        profile = db.query(OrgStyleProfile).first()
        if not profile:
            return {"internal": [], "phishing": []}
        return {
            "internal": profile.internal_samples or [],
            "phishing": profile.phishing_samples or []
        }
    except Exception as e:
        print(f"[RAW SAMPLES] Failed: {e}")
        return {"internal": [], "phishing": []}


# =========================
# GET CORPUS EXAMPLES
# Pulls from phishing_patterns (Nazario seed)
# =========================
def get_corpus_examples(db, difficulty: str, lure_type: str = None, limit: int = 3) -> list:
    try:
        query = """
            SELECT attack_type, lure_type, urgency_phrases, effectiveness_score
            FROM phishing_patterns
            WHERE difficulty_level = :difficulty
        """
        params = {"difficulty": difficulty}
        if lure_type:
            query += " AND lure_type = :lure_type"
            params["lure_type"] = lure_type
        query += " ORDER BY effectiveness_score DESC LIMIT :limit"
        params["limit"] = limit
        result = db.execute(text(query), params).fetchall()
        return [dict(r._mapping) for r in result]
    except Exception as e:
        print(f"[CORPUS] Failed: {e}")
        return []


# =========================
# DETECT LURE TYPE FROM THEME
# =========================
def detect_lure_type(theme: str) -> str:
    t = theme.lower()
    if any(w in t for w in ["invoice", "payment", "finance", "billing"]):
        return "invoice_fraud"
    elif any(w in t for w in ["hr", "payroll", "salary", "benefits"]):
        return "hr_impersonation"
    elif any(w in t for w in ["ceo", "executive", "director", "wire"]):
        return "bec_executive"
    elif any(w in t for w in ["it", "helpdesk", "password", "vpn", "outlook", "reset"]):
        return "it_impersonation"
    elif any(w in t for w in ["microsoft", "paypal", "amazon", "apple", "google"]):
        return "brand_impersonation"
    else:
        return "credential_harvest"


# =========================
# CREATE CAMPAIGN
# =========================
def create_campaign(data: CreateCampaignRequest, actor_id: int = None):
    db = SessionLocal()
    try:
        new_campaign = Campaign(
            name=data.name, difficulty=data.difficulty,
            campaign_type=data.campaign_type, target_type=data.target_type,
            target_department=data.target_department,
            emails_per_user=data.emails_per_user, phishing_ratio=data.phishing_ratio
        )
        db.add(new_campaign)
        db.commit()
        db.refresh(new_campaign)
        log_audit(db, "campaign", "create_campaign", actor_id, {
            "campaign_id": new_campaign.id,
            "name": data.name, "difficulty": data.difficulty
        })
        return {"message": "Campaign created", "campaign_id": new_campaign.id}
    finally:
        db.close()


# =========================
# ACTIVATE CAMPAIGN
# =========================
def activate_campaign(campaign_id: int, actor_id: int = None):
    db = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return {"error": "Campaign not found"}

        # ── 1. Org style (tone, greeting, signoff, phrases) ──
        org_style = get_org_style_profile(db)
        print(f"[Campaign] Org style: {org_style['tone'] if org_style else 'generic'}")

        # ── 2. Raw samples stored from onboarding ────────────
        # internal_samples → safe email style context
        # phishing_samples → phishing attack pattern context
        raw_samples = get_raw_samples(db)
        print(f"[Campaign] Raw samples — internal: {len(raw_samples['internal'])} | phishing: {len(raw_samples['phishing'])}")

        # ── 3. Nazario DB corpus ──────────────────────────────
        general_corpus = get_corpus_examples(db, difficulty=campaign.difficulty, limit=3)
        print(f"[Corpus] DB patterns: {len(general_corpus)} | difficulty={campaign.difficulty}")

        # ── 4. Get users ──────────────────────────────────────
        if campaign.target_type == "organization":
            users = db.query(User).filter(User.role == "user").all()
        elif campaign.target_type == "department":
            users = db.query(User).filter(
                User.department == campaign.target_department,
                User.role == "user"
            ).all()
        else:
            return {"error": "specific_users not implemented yet"}
        print(f"[Campaign] Users: {len(users)}")

        # ── 5. Themes ─────────────────────────────────────────
        themes = db.query(CampaignTheme).filter(
            CampaignTheme.campaign_id == campaign.id
        ).all()
        if not themes:
            print("[Campaign] Generating themes...")
            generated = generate_theme_pool(campaign.campaign_type)
            for t in generated:
                db.add(CampaignTheme(campaign_id=campaign.id, theme_text=t))
            db.commit()
            themes = db.query(CampaignTheme).filter(
                CampaignTheme.campaign_id == campaign.id
            ).all()
        themes = [t.theme_text for t in themes]

        # ── 6. Generate emails ────────────────────────────────
        for user in users:
            for i in range(campaign.emails_per_user):
                is_phish = random.random() < campaign.phishing_ratio
                theme    = random.choice(themes)

                if is_phish:
                    lure_type    = detect_lure_type(theme)
                    lure_corpus  = get_corpus_examples(
                        db, difficulty=campaign.difficulty,
                        lure_type=lure_type, limit=3
                    )
                    final_corpus = lure_corpus if lure_corpus else general_corpus

                    payload = {
                        "theme":             theme,
                        "difficulty":        campaign.difficulty,
                        "style_profile":     org_style,
                        # SOURCE 1: Nazario DB patterns
                        "corpus_examples":   final_corpus,
                        # SOURCE 2: raw phishing .eml bodies from onboarding
                        "eml_patterns":      raw_samples["phishing"],
                        # SOURCE 3: raw internal email bodies (for style mimicry)
                        "internal_samples":  raw_samples["internal"]
                    }
                    res = requests.post(f"{PHISHING_SERVICE_URL}/generate-phish", json=payload)
                else:
                    payload = {
                        "theme":            theme,
                        "difficulty":       campaign.difficulty,
                        "style_profile":    org_style,
                        # Internal samples help safe emails sound authentic
                        "internal_samples": raw_samples["internal"]
                    }
                    res = requests.post(f"{PHISHING_SERVICE_URL}/generate-safe", json=payload)

                print("RAW RESPONSE:", res.text)
                if res.status_code != 200:
                    print("GENERATOR ERROR:", res.text)
                    continue
                try:
                    data = res.json()
                except Exception:
                    print("INVALID JSON:", res.text)
                    continue

                validate_generator_response(data)
                store_email(db, campaign.id, user.id, data, is_phish, i, theme)

        campaign.active = True
        db.commit()

        log_audit(db, "campaign", "activate_campaign", actor_id, {
            "campaign_id":      campaign_id,
            "users_targeted":   len(users),
            "emails_generated": len(users) * campaign.emails_per_user,
            "corpus_db":        len(general_corpus),
            "internal_samples": len(raw_samples["internal"]),
            "phishing_samples": len(raw_samples["phishing"])
        })

        return {"message": "Campaign activated"}
    finally:
        db.close()


# =========================
# DEACTIVATE CAMPAIGN
# =========================
def deactivate_campaign(campaign_id: int, actor_id: int = None):
    db = SessionLocal()
    try:
        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return {"error": "Campaign not found"}
        if not campaign.active:
            return {"error": "Campaign already inactive"}
        campaign.active = False
        db.commit()
        log_audit(db, "campaign", "deactivate_campaign", actor_id,
                  {"campaign_id": campaign_id, "name": campaign.name})
        return {"message": "Campaign deactivated"}
    finally:
        db.close()


# =========================
# GET CAMPAIGN DETAIL
# =========================
def get_campaign_detail(campaign_id: int):
    db = SessionLocal()
    try:
        from app.models.email_model import Email
        from app.models.interaction_model import Interaction

        campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return {"error": "Campaign not found"}

        themes          = db.query(CampaignTheme).filter(CampaignTheme.campaign_id == campaign_id).all()
        emails          = db.query(Email).filter(Email.campaign_id == campaign_id).all()
        email_ids       = [e.id for e in emails]
        total_emails    = len(emails)
        phishing_emails = len([e for e in emails if e.is_phishing])
        safe_emails     = total_emails - phishing_emails

        interactions  = db.query(Interaction).filter(
            Interaction.email_id.in_(email_ids)
        ).all() if email_ids else []

        total_clicks  = len([i for i in interactions if i.action == "clicked"])
        total_reports = len([i for i in interactions if i.action == "reported"])
        total_opens   = len([i for i in interactions if i.action == "opened"])
        click_rate    = round(total_clicks  / phishing_emails * 100, 1) if phishing_emails else 0
        report_rate   = round(total_reports / phishing_emails * 100, 1) if phishing_emails else 0

        if campaign.target_type == "organization":
            users = db.query(User).filter(User.role == "user").all()
        elif campaign.target_type == "department":
            users = db.query(User).filter(
                User.department == campaign.target_department, User.role == "user"
            ).all()
        else:
            users = []

        return {
            "id": campaign.id, "name": campaign.name,
            "difficulty": campaign.difficulty, "campaign_type": campaign.campaign_type,
            "target_type": campaign.target_type, "target_department": campaign.target_department,
            "active": campaign.active, "created_at": str(campaign.created_at),
            "themes": [t.theme_text for t in themes],
            "stats": {
                "total_emails": total_emails, "phishing_emails": phishing_emails,
                "safe_emails": safe_emails, "total_clicks": total_clicks,
                "total_reports": total_reports, "total_opens": total_opens,
                "click_rate": click_rate, "report_rate": report_rate,
                "users_targeted": len(users)
            },
            "targeted_users": [{"email": u.email, "department": u.department} for u in users]
        }
    finally:
        db.close()


# =========================
# GET ALL CAMPAIGNS
# =========================
def get_all_campaigns():
    db = SessionLocal()
    try:
        return [
            {"id": c.id, "name": c.name, "difficulty": c.difficulty,
             "active": c.active, "created_at": str(c.created_at)}
            for c in db.query(Campaign).all()
        ]
    finally:
        db.close()


# =========================
# GET AUDIT LOGS
# =========================
def get_audit_logs():
    db = SessionLocal()
    try:
        logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
        return [
            {"id": l.id, "service": l.service, "action": l.action,
             "actor_id": l.actor_id, "details": l.details, "created_at": str(l.created_at)}
            for l in logs
        ]
    finally:
        db.close()


# =========================
# THEME SERVICE CALL
# =========================
def generate_theme_pool(campaign_type: str):
    res = requests.post(f"{PHISHING_SERVICE_URL}/generate-themes",
                        json={"campaign_type": campaign_type, "count": 5})
    data = res.json()
    if "themes" not in data:
        raise Exception("Theme generation failed")
    return data["themes"]


# =========================
# VALIDATION
# =========================
def validate_generator_response(data: dict):
    if "subject" not in data or "body" not in data:
        raise ValueError(f"Invalid generator response: {data}")


# =========================
# STORE EMAIL
# =========================
def store_email(db, campaign_id, user_id, data, is_phishing, sequence, theme):
    from app.models.email_model import Email
    db.add(Email(
        campaign_id=campaign_id, user_id=user_id,
        subject=data["subject"], body=data["body"],
        attack_metadata=data.get("attack_metadata", {}),
        is_phishing=is_phishing, sequence_number=sequence, theme_used=theme
    ))
    db.commit()