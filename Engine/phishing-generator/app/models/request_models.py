from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field

class PhishRequest(BaseModel):
    style_profile:    Optional[Dict]           = None
    difficulty:       str = Field(..., pattern="^(easy|medium|hard|expert)$")
    theme:            str
    corpus_examples:  Optional[List[Dict[str, Any]]] = []  # Nazario DB patterns
    eml_patterns:     Optional[List[str]]            = []  # phishing .eml bodies
    internal_samples: Optional[List[str]]            = []  # internal email bodies

class ThemeRequest(BaseModel):
    campaign_type: str
    count:         int

class StyleExtractionRequest(BaseModel):
    internal_emails: List[str]
    phishing_emails: List[str] = []