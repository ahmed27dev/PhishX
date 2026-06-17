from app.services.ollama_client import generate_from_ollama
from app.utils.json_parser import parse_llm_json
from app.utils.difficulty import get_difficulty_instruction
from app.core.config import OLLAMA_MODEL
from app.core.logging_config import logger
import random
import json
import email as email_lib

FAKE_LINKS = [
    "http://secure-login-verify.com/auth",
    "http://account-validation-portal.net/verify",
    "http://it-helpdesk-reset.org/password",
    "http://mail-security-alert.com/confirm",
    "http://vpn-access-renewal.net/login",
    "http://hr-portal-internal.net/update",
    "http://secure-docs-portal.com/view",
    "http://payroll-update-internal.org/confirm",
]

FAKE_ATTACHMENTS = {
    "invoice_fraud":       ["Invoice_Q4_2024.pdf",          "Payment_Confirmation.xlsx"],
    "hr_impersonation":    ["Payroll_Update_2024.xlsx",      "Benefits_Enrollment.pdf"],
    "bec_executive":       ["Urgent_Transfer_Request.pdf",   "Confidential_Brief.docx"],
    "it_impersonation":    ["Security_Patch_Required.zip",   "VPN_Config_Update.zip"],
    "credential_harvest":  ["Account_Verification.pdf",      "Login_Required.html"],
    "brand_impersonation": ["Statement_Oct2024.pdf",         "Receipt_Confirmation.pdf"],
    "generic_phishing":    ["Important_Document.pdf",        "Action_Required.docx"]
}

FAKE_SENDERS = {
    "it_impersonation":    ["it-support@helpdesk-internal.org",  "noreply@it-alerts.net"],
    "hr_impersonation":    ["hr-team@payroll-internal.net",      "noreply@hr-portal.org"],
    "invoice_fraud":       ["billing@accounts-payable.net",      "invoices@finance-portal.org"],
    "bec_executive":       ["ceo.office@executive-comms.net",    "director@corp-internal.org"],
    "credential_harvest":  ["security@account-alerts.net",       "noreply@login-verify.org"],
    "brand_impersonation": ["support@microsoft-security.net",    "noreply@paypal-alerts.org"],
    "generic_phishing":    ["noreply@company-alerts.net",        "admin@internal-portal.org"]
}


def detect_lure_type(theme: str) -> str:
    t = theme.lower()
    if any(w in t for w in ["invoice", "payment", "finance", "billing"]):   return "invoice_fraud"
    if any(w in t for w in ["hr", "payroll", "salary", "benefits"]):        return "hr_impersonation"
    if any(w in t for w in ["ceo", "executive", "director", "wire"]):       return "bec_executive"
    if any(w in t for w in ["it", "helpdesk", "password", "vpn", "reset"]): return "it_impersonation"
    if any(w in t for w in ["microsoft", "paypal", "amazon", "apple"]):     return "brand_impersonation"
    return "credential_harvest"


def parse_eml_body(raw: str) -> str:
    try:
        msg = email_lib.message_from_string(raw)
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        return payload.decode("utf-8", errors="ignore").strip()
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                return payload.decode("utf-8", errors="ignore").strip()
    except Exception:
        pass
    return raw.strip()


def build_context_section(corpus_examples: list, eml_patterns: list, internal_samples: list) -> str:
    section = ""

    # ── SOURCE 1: Nazario DB patterns ─────────────────────
    if corpus_examples:
        section += "\n--- Attack patterns from phishing corpus ---\n"
        for i, ex in enumerate(corpus_examples, 1):
            try:
                phrases = json.loads(ex.get("urgency_phrases", "[]")) \
                    if isinstance(ex.get("urgency_phrases"), str) \
                    else ex.get("urgency_phrases", [])
                phrases_str = ", ".join(phrases) if phrases else "none"
            except Exception:
                phrases_str = "none"
            section += (
                f"\nPattern {i}: attack={ex.get('attack_type','credential')} | "
                f"lure={ex.get('lure_type','unknown')} | "
                f"urgency phrases: {phrases_str} | "
                f"effectiveness: {ex.get('effectiveness_score', 0.5)}\n"
            )

    # ── SOURCE 2: Uploaded phishing .eml bodies ───────────
    if eml_patterns:
        section += "\n--- Real phishing email samples (uploaded) ---\n"
        for i, raw in enumerate(eml_patterns[:5], 1):
            body    = parse_eml_body(raw)
            preview = body[:300].replace("\n", " ").strip()
            section += f"\nSample {i}: {preview}\n"

    # ── SOURCE 3: Internal email style samples ────────────
    if internal_samples:
        section += "\n--- Internal org email style samples ---\n"
        for i, raw in enumerate(internal_samples[:3], 1):
            body    = parse_eml_body(raw)
            preview = body[:200].replace("\n", " ").strip()
            section += f"\nInternal sample {i}: {preview}\n"

    if section:
        section = (
            "\nReal-world intelligence (use as inspiration — do NOT copy verbatim):\n"
            + section
        )
    return section


def generate_phishing_email(req):
    logger.info(f"Generate phish | theme={req.theme} | difficulty={req.difficulty}")

    difficulty_instruction = get_difficulty_instruction(req.difficulty)
    lure_type              = detect_lure_type(req.theme)

    corpus_examples  = getattr(req, "corpus_examples",  []) or []
    eml_patterns     = getattr(req, "eml_patterns",     []) or []
    internal_samples = getattr(req, "internal_samples", []) or []

    context_section  = build_context_section(corpus_examples, eml_patterns, internal_samples)

    logger.info(f"Context | db={len(corpus_examples)} eml={len(eml_patterns)} internal={len(internal_samples)}")

    fake_link       = random.choice(FAKE_LINKS)
    fake_attachment = random.choice(FAKE_ATTACHMENTS.get(lure_type, FAKE_ATTACHMENTS["generic_phishing"]))
    fake_sender     = random.choice(FAKE_SENDERS.get(lure_type, FAKE_SENDERS["generic_phishing"]))

    style_section = ""
    if req.style_profile:
        tone     = req.style_profile.get("tone", "semi-formal")
        greeting = req.style_profile.get("greeting_style", "Dear Team")
        signoff  = req.style_profile.get("signoff_style", "Regards")
        phrases  = req.style_profile.get("common_phrases", [])
        style_section = f"""
Organizational Style Guidelines (MUST follow):
- Tone: {tone}
- Greeting: start with "{greeting}"
- Sign-off: end with "{signoff}"
- Naturally use these phrases: {phrases}
"""

    prompt = f"""
You are generating a SAFE phishing simulation email for internal cybersecurity training.

STRICT RULES:
- No real harmful payloads.
- DO NOT use placeholders like [Name], [Department], [Company], [Link], [Date].
- Every field must be fully written — no brackets, no blanks.
- Use this exact link in the email body: {fake_link}
- If attachment needed, use this exact filename: {fake_attachment}
- Sender appears to be: {fake_sender}
- Write the full email body as if ready to send right now.
- Do NOT write "simulation" or "training" anywhere in the email body.

{style_section}
{context_section}

Difficulty guidance:
{difficulty_instruction}

Theme: {req.theme}

Return STRICTLY valid JSON:
{{
  "subject": "...",
  "body": "...",
  "attack_type": "credential | attachment | hybrid",
  "has_attachment": true or false,
  "attachment_name": "{fake_attachment} or null"
}}
"""

    raw_output      = generate_from_ollama(prompt)
    parsed          = parse_llm_json(raw_output)

    subject         = parsed.get("subject", req.theme)
    body_text       = parsed.get("body", "")
    attack_type     = parsed.get("attack_type", "credential")
    has_attachment  = parsed.get("has_attachment", False)
    attachment_name = parsed.get("attachment_name")

    logger.info(f"Generated | attack_type={attack_type} | lure_type={lure_type}")

    return {
        "subject": subject,
        "body":    body_text,
        "attack_metadata": {
            "difficulty":      req.difficulty,
            "theme":           req.theme,
            "generated_by":    OLLAMA_MODEL,
            "simulation":      True,
            "attack_type":     attack_type,
            "lure_type":       lure_type,
            "has_attachment":  has_attachment,
            "attachment_name": attachment_name,
            "fake_link":       fake_link,
            "fake_sender":     fake_sender,
            "corpus_db":       len(corpus_examples),
            "corpus_eml":      len(eml_patterns),
            "internal_used":   len(internal_samples)
        }
    }