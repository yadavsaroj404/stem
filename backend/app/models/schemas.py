from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Legacy Response Models (for backward compatibility) ---

class Response(BaseModel):
    questionId: str
    selectedOptionId: str

class TestSubmissionPayload(BaseModel):
    userId: str
    createdAt: str
    name: str
    responses: List[Response]

class TestSubmissionResponse(BaseModel):
    id: str
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


# --- New Detailed Response Models ---

class CandidateResponseInput(BaseModel):
    """Input model for a single candidate response"""
    questionId: str
    selectedOptionId: Optional[str] = None
    selectedItems: Optional[List[str]] = None  # For mapping/pattern questions
    responseTimeMs: Optional[int] = None

class CandidateResponseOutput(BaseModel):
    """Output model for a single candidate response"""
    responseId: str
    questionId: str
    selectedOptionId: Optional[str] = None
    selectedItems: Optional[List[str]] = None
    responseTimeMs: Optional[int] = None
    isCorrect: Optional[int] = None
    createdAt: str
    updatedAt: str

class TestResponseSubmission(BaseModel):
    """New model for submitting test responses with detailed tracking"""
    userId: str
    testId: Optional[str] = None
    name: str
    responses: List[CandidateResponseInput]

class ClusterScore(BaseModel):
    """Score breakdown by cluster"""
    clusterId: str
    clusterName: str
    totalQuestions: int
    correctAnswers: int
    incorrectAnswers: int
    unanswered: int
    scorePercentage: float

class SubmissionScore(BaseModel):
    """Overall submission score"""
    submissionId: str
    userId: str
    overallScore: float
    totalQuestions: int
    correctAnswers: int
    incorrectAnswers: int
    unanswered: int
    clusterScores: List[ClusterScore]
    computedAt: str

class SubmissionWithResponses(BaseModel):
    """Complete submission with responses and scores"""
    submissionId: str
    userId: str
    testId: Optional[str] = None
    name: str
    status: str
    submittedAt: str
    responses: List[CandidateResponseOutput]
    score: Optional[SubmissionScore] = None