from typing import List, Literal, Optional
from pydantic import BaseModel
from datetime import datetime

class Response(BaseModel):
    questionId: str
    selectedOptionId: int

class TestSubmissionPayload(BaseModel):
    userId: str
    createdAt: str
    name: str
    responses: List[Response]

class TestSubmissionResponse(BaseModel):
    id: str  # Changed from _id to id (FastAPI doesn't like underscores in response models)
    userId: str
    createdAt: str
    name: str
    status: Literal['SUBMITTED', 'PENDING', 'ABORTED']
    responses: List[Response]

class Question(BaseModel):
    id: str
    question: str
    options: List[str]

class QuestionResponse(BaseModel):
    questions: List[Question]

class SubmissionFilter(BaseModel):
    userId: Optional[str] = None
    status: Optional[Literal['SUBMITTED', 'PENDING', 'ABORTED']] = None
    name: Optional[str] = None
    createdAtFrom: Optional[str] = None
    createdAtTo: Optional[str] = None
    limit: Optional[int] = 10
    offset: Optional[int] = 0