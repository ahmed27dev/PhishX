import requests
import os
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:7b")


def generate_awareness_message(explanation_json: dict) -> str:
    """
    Converts structured explanation into a human-friendly
    cybersecurity awareness training message using LLM.
    """

    prompt = f"""
You are a cybersecurity awareness trainer.

Convert the following structured phishing explanation into a professional,
clear, and educational training message.

Do NOT invent new facts.
Only use the information provided.

Structured Explanation:
{json.dumps(explanation_json, indent=2)}

Write a short, direct awareness message (2–3 sentences).
Do NOT format as email.
Do NOT include greetings or signatures.
Do not include greetings, subject lines, or formatting.
Focus only on what the user did wrong and how to avoid it.
"""

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        if response.status_code != 200:
            return "AI awareness generation failed."

        result = response.json()
        return result.get("response", "").strip()

    except Exception:
        return "AI awareness generation unavailable."