# import requests
# from app.db.session import SessionLocal
# from app.models.org_models import OrgStyleProfile

# PHISHING_SERVICE_URL = "http://phishing-generator:8001"


# def extract_and_store_org_style(internal_texts: list[str], phishing_texts: list[str]):
#     db = SessionLocal()
#     try:
#         res = requests.post(
#             f"{PHISHING_SERVICE_URL}/extract-style",
#             json={
#                 "internal_emails": internal_texts,
#                 "phishing_emails": phishing_texts
#             },
#             timeout=120
#         )

#         if res.status_code != 200:
#             return {"error": "Style extraction failed", "detail": res.text}

#         style = res.json()

#         existing = db.query(OrgStyleProfile).first()

#         if existing:
#             existing.greeting_style = style.get("greeting_style")
#             existing.signoff_style = style.get("signoff_style")
#             existing.tone = style.get("tone")
#             existing.common_phrases = style.get("common_phrases", [])
#             existing.raw_sample_count = len(internal_texts)
#             existing.phishing_sample_count = len(phishing_texts)  # ← NEW
#         else:
#             profile = OrgStyleProfile(
#                 greeting_style=style.get("greeting_style"),
#                 signoff_style=style.get("signoff_style"),
#                 tone=style.get("tone"),
#                 common_phrases=style.get("common_phrases", []),
#                 raw_sample_count=len(internal_texts),
#                 phishing_sample_count=len(phishing_texts)  # ← NEW
#             )
#             db.add(profile)

#         db.commit()
#         return {"message": "Org style profile saved", "style": style}

#     except Exception as e:
#         return {"error": str(e)}
#     finally:
#         db.close()


# def get_org_style():
#     db = SessionLocal()
#     try:
#         profile = db.query(OrgStyleProfile).first()
#         if not profile:
#             return {"configured": False}
#         return {
#             "configured": True,
#             "greeting_style": profile.greeting_style,
#             "signoff_style": profile.signoff_style,
#             "tone": profile.tone,
#             "common_phrases": profile.common_phrases,
#             "raw_sample_count": profile.raw_sample_count,
#             "phishing_sample_count": profile.phishing_sample_count  # ← NEW
#         }
#     finally:
#         db.close()

import requests
from app.db.session import SessionLocal
from app.models.org_models import OrgStyleProfile

PHISHING_SERVICE_URL = "http://phishing-generator:8001"


def extract_and_store_org_style(internal_texts: list[str], phishing_texts: list[str]):
    db = SessionLocal()
    try:
        # ── Send to phishing-generator for style extraction ──
        res = requests.post(
            f"{PHISHING_SERVICE_URL}/extract-style",
            json={
                "internal_emails": internal_texts,
                "phishing_emails": phishing_texts
            },
            timeout=120
        )
        if res.status_code != 200:
            return {"error": "Style extraction failed", "detail": res.text}

        style = res.json()

        # ── Trim raw bodies to 1500 chars each for storage ──
        # Keeps DB size manageable while preserving enough
        # context for Ollama to learn from
        stored_internal  = [t[:1500] for t in internal_texts[:20]]
        stored_phishing  = [t[:1500] for t in phishing_texts[:20]]

        existing = db.query(OrgStyleProfile).first()
        if existing:
            existing.greeting_style        = style.get("greeting_style")
            existing.signoff_style         = style.get("signoff_style")
            existing.tone                  = style.get("tone")
            existing.common_phrases        = style.get("common_phrases", [])
            existing.raw_sample_count      = len(internal_texts)
            existing.phishing_sample_count = len(phishing_texts)
            existing.internal_samples      = stored_internal
            existing.phishing_samples      = stored_phishing
        else:
            profile = OrgStyleProfile(
                greeting_style        = style.get("greeting_style"),
                signoff_style         = style.get("signoff_style"),
                tone                  = style.get("tone"),
                common_phrases        = style.get("common_phrases", []),
                raw_sample_count      = len(internal_texts),
                phishing_sample_count = len(phishing_texts),
                internal_samples      = stored_internal,
                phishing_samples      = stored_phishing
            )
            db.add(profile)

        db.commit()
        return {
            "message":          "Org style profile saved",
            "style":            style,
            "internal_stored":  len(stored_internal),
            "phishing_stored":  len(stored_phishing)
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()


def get_org_style():
    db = SessionLocal()
    try:
        profile = db.query(OrgStyleProfile).first()
        if not profile:
            return {"configured": False}
        return {
            "configured":            True,
            "greeting_style":        profile.greeting_style,
            "signoff_style":         profile.signoff_style,
            "tone":                  profile.tone,
            "common_phrases":        profile.common_phrases,
            "raw_sample_count":      profile.raw_sample_count,
            "phishing_sample_count": profile.phishing_sample_count,
            "internal_stored":       len(profile.internal_samples or []),
            "phishing_stored":       len(profile.phishing_samples or [])
        }
    finally:
        db.close()