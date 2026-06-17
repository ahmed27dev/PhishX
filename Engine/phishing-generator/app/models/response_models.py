from pydantic import BaseModel
from typing import Dict
from typing import List

class PhishResponse(BaseModel):
    subject: str
    body: str
    attack_metadata: Dict

class SafeEmailResponse(BaseModel):
    subject: str
    body: str
    safe_metadata: Dict


class ThemeResponse(BaseModel):
    themes: List[str]