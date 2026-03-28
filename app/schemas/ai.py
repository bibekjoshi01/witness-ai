from pydantic import BaseModel

class AIAskRequest(BaseModel):
    question: str


class AIResponse(BaseModel):
    answer: str
    source: str
