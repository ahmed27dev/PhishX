import os
import requests

AGENT_URL = os.getenv("AGENT_SERVICE_URL", "http://agent-engine:8002")


def analyze_interaction(user_id: int, email_id: int, action: str):
    try:
        response = requests.post(
            f"{AGENT_URL}/analyze-interaction",
            json={
                "user_id": user_id,
                "email_id": email_id,
                "action": action.lower()   # ✅ KEEP ONLY THIS
            },
            timeout=120
        )

        if response.status_code != 200:
            print("AGENT ERROR RESPONSE:", response.text)
            return {"error": "Agent engine failed"}

        return response.json()

    except Exception as e:
        print("AGENT ERROR:", str(e))
        return {"error": f"Agent service unreachable: {str(e)}"}