from fastapi import APIRouter
import requests
from app.core.config import OLLAMA_URL, OLLAMA_MODEL

router = APIRouter()


@router.get("/health")
def health():
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)

        if response.status_code != 200:
            return {"status": "degraded", "ollama": "unreachable", "model": OLLAMA_MODEL}

        models = response.json().get("models", [])
        model_names = [m.get("name") for m in models]

        if OLLAMA_MODEL not in model_names:
            return {"status": "degraded", "ollama": "reachable", "model": "not loaded"}

        return {"status": "healthy", "ollama": "reachable", "model": OLLAMA_MODEL}

    except Exception:
        return {"status": "unhealthy", "ollama": "unreachable", "model": OLLAMA_MODEL}