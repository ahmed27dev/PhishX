from fastapi import APIRouter
from app.models.request_models import PhishRequest, ThemeRequest, StyleExtractionRequest
from app.models.response_models import PhishResponse, SafeEmailResponse, ThemeResponse
from app.services.phish_service import generate_phishing_email
from app.services.safe_service import generate_safe_email
from app.services.theme_service import generate_theme_pool
from app.services.style_service import extract_style

router = APIRouter()


@router.post("/generate-phish", response_model=PhishResponse)
def generate_phish(req: PhishRequest):
    return generate_phishing_email(req)


@router.post("/generate-safe", response_model=SafeEmailResponse)
def generate_safe(req: PhishRequest):
    return generate_safe_email(req)


@router.post("/generate", response_model=PhishResponse)
def generate(req: PhishRequest):
    return generate_phishing_email(req)


@router.post("/generate-themes", response_model=ThemeResponse)
def generate_themes(req: ThemeRequest):
    themes = generate_theme_pool(req.campaign_type, req.count)
    return {"themes": themes}


@router.post("/extract-style")
def extract_style_route(req: StyleExtractionRequest):
    return extract_style(req.internal_emails, req.phishing_emails)