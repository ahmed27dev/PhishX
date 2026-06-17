import re
from app.services.ollama_client import generate_from_ollama


def is_similar(existing, new):
    new_words = new.lower().split()
    for e in existing:
        e_words = e.lower().split()

        # compare first word OR overlap
        if new_words[0] == e_words[0]:
            return True
        if len(set(new_words) & set(e_words)) > 1:
            return True

    return False


def clean_theme(text: str) -> str:
    # remove numbering
    text = re.sub(r"^\d+[\.\)]\s*", "", text)

    # remove prefixes
    text = re.sub(r"^(subject|title|subject line)\s*[:\-]*\s*", "", text, flags=re.IGNORECASE)

    # remove quotes
    text = text.replace('"', '').replace("'", "")

    # remove junk words
    text = re.sub(r"\b(company|confidential)\b", "", text, flags=re.IGNORECASE)

    # trim
    text = text.strip()

    # keep only first phrase (before colon if exists)
    text = text.split(":")[0]

    # limit length
    text = text[:40]

    return text.strip()


def generate_theme_pool(campaign_type: str, count: int):

    generated_themes = set()
    max_attempts = count * 6
    attempts = 0

    while len(generated_themes) < count and attempts < max_attempts:
        attempts += 1

        try:
            prompt = f"""
Generate ONE phishing email theme for a {campaign_type} campaign.

STRICT RULES:
- 2–5 words only
- NO prefixes like "Subject", "Title"
- NO quotes
- NO sentences
- Only short phrase

Examples:
Password Reset
Invoice Overdue
Unauthorized Login
Payroll Update
Shared Document Access
VPN Expiry

Return ONLY the theme.
"""

            response = generate_from_ollama(prompt)

            if not response:
                continue

            raw = response.strip().split("\n")[0]

            theme = clean_theme(raw)

            # filtering
            if (
                len(theme) < 5 or
                "it security" in theme.lower() or
                "campaign" in theme.lower()
            ):
                continue

            # diversity check
            if is_similar(generated_themes, theme):
                continue

            generated_themes.add(theme)

        except Exception as e:
            print("Theme generation error:", e)

    # fallback guarantee
    fallback = [
        "Password Reset",
        "Account Alert",
        "Security Notice",
        "Invoice Issue",
        "VPN Expiry",
        "Login Verification"
    ]

    for f in fallback:
        if len(generated_themes) >= count:
            break
        generated_themes.add(f)

    return list(generated_themes)[:count]