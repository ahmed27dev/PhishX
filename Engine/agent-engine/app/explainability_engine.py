from typing import Dict


def generate_explanation(email, user_action: str) -> Dict:
    """
    Advanced Deterministic Explainability Engine (Phase 2 Enhanced)
    Combines:
    - Email attack metadata
    - User behavior
    - Dynamic severity assessment
    """

    # -----------------------------
    # SAFE EMAIL CASE
    # -----------------------------
    if not email.is_phishing:
        return {
            "severity_level": "Low",
            "risk_reason": "This email was a legitimate internal communication.",
            "red_flags": [],
            "user_action_analysis": "No phishing indicators were present.",
            "training_feedback": "Good practice includes verifying unexpected requests even in routine emails.",
            "recommended_action": "Continue applying verification procedures consistently."
        }

    metadata = email.attack_metadata or {}

    attack_type = metadata.get("attack_type", "unknown")
    difficulty = metadata.get("difficulty", "unknown")
    has_attachment = metadata.get("has_attachment", False)
    theme = metadata.get("theme", "unspecified")

    red_flags = []
    severity = "Medium"

    # -----------------------------
    # Attack Type Analysis
    # -----------------------------
    if attack_type == "credential":
        red_flags.append("Credential harvesting attempt detected.")
    elif attack_type == "attachment":
        red_flags.append("Malicious attachment delivery attempt.")
    elif attack_type == "hybrid":
        red_flags.append("Hybrid attack combining credential theft and malicious attachment.")
    else:
        red_flags.append("Suspicious phishing characteristics detected.")

    if has_attachment:
        red_flags.append("Unexpected attachment included.")

    # -----------------------------
    # Difficulty Realism Indicator
    # -----------------------------
    if difficulty == "easy":
        red_flags.append("Obvious urgency and generic wording.")
    elif difficulty == "medium":
        red_flags.append("Moderate realism with subtle urgency.")
    elif difficulty == "hard":
        red_flags.append("Highly realistic phishing attempt.")
    elif difficulty == "expert":
        red_flags.append("Expert-level phishing with minimal visible indicators.")

    # -----------------------------
    # Behavior + Attack Combined Intelligence
    # -----------------------------
    if user_action == "reported":
        severity = "Low"
        action_analysis = "User correctly identified and reported the phishing attempt."
        training_feedback = "Excellent awareness behavior demonstrated."
        recommended_action = "Continue reporting suspicious emails immediately."

    elif user_action == "opened":
        severity = "Medium"
        action_analysis = "User opened the phishing email, increasing exposure risk."
        training_feedback = "Opening suspicious emails increases risk. Always verify sender authenticity."
        recommended_action = "Avoid engaging with suspicious messages and report them."

    elif user_action == "clicked":
        if attack_type in ["credential", "hybrid"]:
            severity = "High"
            action_analysis = (
                "User clicked a link associated with a credential harvesting attempt, "
                "significantly increasing compromise risk."
            )
        else:
            severity = "High"
            action_analysis = (
                "User clicked a suspicious link, potentially exposing the system to threats."
            )

        training_feedback = "Clicking unknown links is a major phishing success indicator."
        recommended_action = "Immediately reset credentials and notify security teams."

    elif user_action == "downloaded":
        if attack_type in ["attachment", "hybrid"]:
            severity = "Critical"
            action_analysis = (
                "User downloaded a malicious attachment, creating a high probability of malware execution."
            )
        else:
            severity = "High"
            action_analysis = (
                "User downloaded an unexpected attachment from a suspicious email."
            )

        training_feedback = "Downloading unknown attachments is a severe security risk."
        recommended_action = "Run endpoint security scan and notify IT immediately."

    elif user_action == "ignored":
        severity = "Low"
        action_analysis = "User ignored the phishing email. No interaction occurred."
        training_feedback = "Ignoring suspicious emails reduces risk but reporting is preferred."
        recommended_action = "Report suspicious emails instead of ignoring them."

    else:
        action_analysis = "Unknown user action."
        training_feedback = "No behavioral analysis available."
        recommended_action = "Follow standard cybersecurity best practices."

    # -----------------------------
    # Risk Reason Summary
    # -----------------------------
    risk_reason = (
        f"Phishing simulation under theme '{theme}' "
        f"identified as '{attack_type}' type attack."
    )

    return {
        "severity_level": severity,
        "risk_reason": risk_reason,
        "red_flags": red_flags,
        "user_action_analysis": action_analysis,
        "training_feedback": training_feedback,
        "recommended_action": recommended_action
    }