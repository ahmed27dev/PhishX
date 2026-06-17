from app.services.ollama_client import generate_from_ollama
import json
import re
import email


def parse_email_content(raw: str) -> str:
    """Strip .eml headers and extract plain text body."""
    try:
        msg = email.message_from_string(raw)
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += payload.decode("utf-8", errors="ignore")
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode("utf-8", errors="ignore")
        return body.strip() if body.strip() else raw
    except Exception:
        return raw


def extract_style(internal_emails: list[str], phishing_emails: list[str]) -> dict:

    # Parse .eml format if needed
    parsed_internal = [parse_email_content(e) for e in internal_emails[:10]]
    parsed_phishing = [parse_email_content(e) for e in phishing_emails[:10]]

    internal_sample = "\n\n---\n\n".join(parsed_internal)
    phishing_sample = "\n\n---\n\n".join(parsed_phishing)

    prompt = f"""
You are an email style analyst. Analyze the following internal company emails and extract the communication style.

INTERNAL EMAILS:
{internal_sample}

{"PHISHING PATTERN EMAILS:" + phishing_sample if phishing_sample else ""}

Extract and return ONLY a JSON object with these fields:
{{
  "greeting_style": "most common greeting used (e.g. Hi [Name], Dear Team)",
  "signoff_style": "most common sign-off used (e.g. Regards, Best)",
  "tone": "one of: formal, semi-formal, informal",
  "common_phrases": ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5"]
}}

Return ONLY the JSON. No explanation. No markdown.
"""

    raw = generate_from_ollama(prompt)

    try:
        cleaned = re.sub(r"```json|```", "", raw).strip()
        style = json.loads(cleaned)
    except Exception:
        style = {
            "greeting_style": "Dear Team",
            "signoff_style": "Regards",
            "tone": "semi-formal",
            "common_phrases": [
                "Please action this immediately",
                "Kindly verify your information",
                "Your account requires attention",
                "Please click below to proceed",
                "Contact IT support if needed"
            ]
        }

    return style