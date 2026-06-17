difficulty_matrix = {
    "easy": "obvious urgency and generic wording",
    "medium": "professional tone with mild urgency",
    "hard": "realistic corporate communication",
    "expert": "natural internal communication with minimal cues"
}


def get_difficulty_instruction(level: str) -> str:
    return difficulty_matrix[level]