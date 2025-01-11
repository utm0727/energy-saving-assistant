from pydantic import BaseModel
from typing import List, Dict

class AnalysisResponse(BaseModel):
    trends: Dict
    suggestions: List[str]
    predictions: List[Dict]
    savings_predictions: List[Dict] 