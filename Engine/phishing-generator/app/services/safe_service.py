# from app.services.ollama_client import generate_from_ollama
# from app.utils.json_parser import parse_llm_json
# from app.core.config import OLLAMA_MODEL
# from app.core.logging_config import logger


# def generate_safe_email(req):
#     logger.info(f"Generate SAFE email | theme={req.theme}")

#     style_section = ""
#     if req.style_profile:
#         tone     = req.style_profile.get("tone", "semi-formal")
#         greeting = req.style_profile.get("greeting_style", "Dear Team")
#         signoff  = req.style_profile.get("signoff_style", "Regards")
#         phrases  = req.style_profile.get("common_phrases", [])
#         style_section = f"""
# Organizational Style Guidelines (MUST follow):
# - Tone: {tone}
# - Greeting: start with "{greeting}"
# - Sign-off: end with "{signoff}"
# - Naturally use these phrases: {phrases}
# """

#     prompt = f"""
# You are generating a LEGITIMATE internal corporate email.
# This is a real, safe, non-suspicious email from the organization.

# STRICT RULES:
# - DO NOT use placeholders like [Name], [Department], [Company], [Date].
# - Write everything fully as if it is ready to send.
# - Sound completely normal — no urgency, no suspicious links, no attachments.
# - Do not mention "simulation" or "training" anywhere in the email.

# {style_section}

# Theme:
# {req.theme}

# Return STRICTLY valid JSON:
# {{
#   "subject": "...",
#   "body": "..."
# }}
# """

#     raw_output = generate_from_ollama(prompt)
#     parsed     = parse_llm_json(raw_output)

#     subject   = parsed.get("subject", req.theme)
#     body_text = parsed.get("body", "")

#     return {
#         "subject": subject,
#         "body": body_text,
#         "safe_metadata": {
#             "is_phishing":  False,
#             "generated_by": OLLAMA_MODEL
#         }
#     }
from app.services.ollama_client import generate_from_ollama
from app.utils.json_parser import parse_llm_json
from app.core.config import OLLAMA_MODEL
from app.core.logging_config import logger
import email as email_lib


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


def generate_safe_email(req):
    logger.info(f"Generate safe | theme={req.theme}")

    internal_samples = getattr(req, "internal_samples", []) or []

    # ── Internal samples section ──────────────────────────
    # Helps Ollama write safe emails that genuinely sound
    # like your org — not generic corporate boilerplate
    internal_section = ""
    if internal_samples:
        internal_section = "\n--- Internal org email style samples (match this style) ---\n"
        for i, raw in enumerate(internal_samples[:3], 1):
            body    = parse_eml_body(raw)
            preview = body[:200].replace("\n", " ").strip()
            internal_section += f"\nSample {i}: {preview}\n"

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
You are generating a LEGITIMATE internal corporate email.
This is a real, safe, non-suspicious email from the organization.

STRICT RULES:
- DO NOT use placeholders like [Name], [Department], [Company], [Date].
- Write everything fully as if ready to send.
- Sound completely normal — no urgency, no suspicious links, no attachments.
- Do not mention "simulation" or "training" anywhere in the email.

{style_section}
{internal_section}

Theme: {req.theme}

Return STRICTLY valid JSON:
{{
  "subject": "...",
  "body": "..."
}}
"""

    raw_output = generate_from_ollama(prompt)
    parsed     = parse_llm_json(raw_output)

    return {
        "subject": parsed.get("subject", req.theme),
        "body":    parsed.get("body", ""),
        "safe_metadata": {
            "is_phishing":   False,
            "generated_by":  OLLAMA_MODEL,
            "internal_used": len(internal_samples)
        }
    }