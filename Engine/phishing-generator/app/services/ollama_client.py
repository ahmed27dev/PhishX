import requests
from app.core.config import OLLAMA_URL, OLLAMA_MODEL


def generate_from_ollama(prompt: str) -> str:
    response = requests.post(
        f"{OLLAMA_URL}/api/generate",
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        },
        timeout=180
    )

    if response.status_code != 200:
        raise Exception("LLM request failed")

    result = response.json()
    return result.get("response", "")