"""
Unified API endpoints for all assessment types (Missions and General Tests).
This consolidated endpoint optimizes database operations and provides a consistent API.
"""

from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.database import SessionLocal
from app.services.assessment_service import assessment_service
from app.services.scoring_service import scoring_service
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Request/Response Models ---

class ResponseInput(BaseModel):
    """Input model for a single response"""
    questionId: str
    selectedOption: str


class BulkResponseSubmit(BaseModel):
    """Input model for submitting all responses at once"""
    userId: str
    submittedAt: datetime
    responses: List[ResponseInput]

class SessionCreate(BaseModel):
    """Input model for creating a test session"""
    userId: str
    testId: str
    name: str


# --- Assessment Endpoints ---

@router.get("/assessments")
def get_all_assessments(
    type: Optional[str] = Query(None, description="Filter by assessment type: 'missions' or 'general'"),
    filter: Optional[str] = Query(None, description="Filter by test name")
):
    """
    Get all assessments (both missions and general tests).

    Use type parameter to filter:
    - type=missions: Get only mission-type tests
    - type=general: Get only general tests
    - No type: Get all assessments
    """
    try:
        assessments = assessment_service.get_all_assessments(test_type=type, filter_name=filter)
        return {
            "status": "success",
            "data": assessments,
            "count": len(assessments)
        }
    except Exception as e:
        logger.error(
            "Failed to retrieve assessments",
            extra={'error': str(e), 'error_type': type(e).__name__},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving assessments. Please try again later."
        )


@router.get("/assessments/questions")
def get_assessment_questions(
    test_id: Optional[str] = Query(None, description="Test ID"),
    type: Optional[str] = Query(None, description="Assessment type: 'missions' or 'general'")
):
    """
    Get questions for an assessment.

    For missions: Returns missions with primary and secondary questions.
    For general tests: Returns list of questions.

    If no test_id provided, returns the first available test of the specified type.
    """
    try:
        assessment = assessment_service.get_assessment_questions(test_id=test_id, test_type=type)
        if not assessment:
            logger.warning("Assessment not found", extra={'test_id': test_id, 'type': type})
            raise HTTPException(status_code=404, detail="Assessment not found")

        return {
            "status": "success",
            "data": assessment
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve assessment questions",
            extra={'error': str(e), 'error_type': type(e).__name__, 'test_id': test_id},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving assessment. Please try again later."
        )


@router.get("/assessments/{assessment_id}")
def get_assessment(assessment_id: str):
    """
    Get a specific assessment by ID.

    Works for both mission items and general tests.
    """
    try:
        assessment = assessment_service.get_assessment_by_id(assessment_id)
        if not assessment:
            logger.warning("Assessment not found", extra={'assessment_id': assessment_id})
            raise HTTPException(status_code=404, detail="Assessment not found")

        return {
            "status": "success",
            "data": assessment
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve assessment",
            extra={'error': str(e), 'error_type': type(e).__name__, 'assessment_id': assessment_id},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving assessment. Please try again later."
        )


@router.get("/assessments/version")
def get_assessment_version(
    test_id: Optional[str] = Query(None, description="Test ID")
):
    """Get assessment version"""
    try:
        version = assessment_service.get_test_version(test_id)
        return {
            "status": "success",
            "data": {"version": version}
        }
    except Exception as e:
        logger.error(
            "Failed to retrieve assessment version",
            extra={'error': str(e), 'error_type': type(e).__name__},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving version. Please try again later."
        )


# --- Session Management ---

@router.post("/assessments/session", status_code=status.HTTP_201_CREATED)
def create_session(session_data: SessionCreate):
    """
    Create a new session for taking an assessment.

    Works for both missions and general tests.
    """
    try:
        result = assessment_service.create_session(
            user_id=session_data.userId,
            test_id=session_data.testId,
            name=session_data.name
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(
            "Failed to create session",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'user_id': session_data.userId
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating session. Please try again later."
        )


@router.post("/assessments/responses", status_code=status.HTTP_201_CREATED)
def submit_bulk_responses(response_data: BulkResponseSubmit):
    """
    Submit all responses at once with automatic scoring.

    This endpoint:
    1. Creates a new session
    2. Stores all responses
    3. Validates answers against correct answers
    4. Computes overall and cluster-level scores
    5. Returns submission ID and scores
    """
    try:
        result = assessment_service.submit_bulk_responses(response_data)
        return result

    except Exception as e:
        logger.error(
            "Failed to submit responses",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'user_id': response_data.userId
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while submitting responses. Please try again later."
        )
    
@router.get("/assessments/answers/{submission_id}", status_code=status.HTTP_200_OK)
def submit_get_score(submission_id: str, db: Session = Depends(get_db)):
    try:
        result = scoring_service.get_selected_answers(db, submission_id)
        return result

    except Exception as e:
        logger.error(
            "Failed to get answers for submission",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'submission_id': submission_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while getting answers. Please try again later."
        )


@router.post("/assessments/session/{session_id}/complete")
def complete_session(session_id: str):
    """
    Mark a session as completed.

    Should be called when the user has finished all questions.
    """
    try:
        result = assessment_service.complete_session(session_id)

        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to complete session",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'session_id': session_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while completing session. Please try again later."
        )


@router.get("/assessments/session/{session_id}")
def get_session(session_id: str):
    """
    Get a session with all submitted answers and scores.
    """
    try:
        session = assessment_service.get_session(session_id)
        if not session:
            logger.warning("Session not found", extra={'session_id': session_id})
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "status": "success",
            "data": session
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve session",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'session_id': session_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving session. Please try again later."
        )


@router.get("/assessments/user/{user_id}/sessions")
def get_user_sessions(user_id: str):
    """
    Get all sessions for a specific user.

    Returns a list of sessions with basic info and overall scores.
    """
    try:
        sessions = assessment_service.get_user_sessions(user_id)
        return {
            "status": "success",
            "data": sessions,
            "count": len(sessions)
        }

    except Exception as e:
        logger.error(
            "Failed to retrieve user sessions",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'user_id': user_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving user sessions. Please try again later."
        )


@router.delete("/assessments/session/{session_id}")
def delete_session(session_id: str):
    """Delete a session and its answers"""
    try:
        success = assessment_service.delete_session(session_id)
        if not success:
            logger.warning("Session not found for deletion", extra={'session_id': session_id})
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "status": "success",
            "message": "Session deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to delete session",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'session_id': session_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while deleting session. Please try again later."
        )
