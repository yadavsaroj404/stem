"""
API endpoints for Mission-type tests.
Missions have two questions per item: a primary question and a secondary question.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel

from app.services.mission_service import mission_service
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


# --- Request/Response Models ---

class MissionAnswerInput(BaseModel):
    """Input model for submitting a mission answer"""
    questionId: str
    selectedOptionId: Optional[str] = None
    selectedItems: Optional[List[str]] = None


class MissionSessionCreate(BaseModel):
    """Input model for creating a mission session"""
    userId: str
    testId: str
    name: str


class MissionAnswerSubmit(BaseModel):
    """Input model for submitting an answer during a mission"""
    sessionId: str
    questionId: str
    selectedOptionId: Optional[str] = None
    selectedItems: Optional[List[str]] = None


# --- Endpoints ---

@router.get("/missions")
def get_all_missions(filter: Optional[str] = Query(None, description="Filter by test name")):
    """
    Get all mission-type tests.

    Returns a list of all missions tests with their questions.
    """
    try:
        missions = mission_service.get_all_mission_tests(filter)
        return {
            "status": "success",
            "data": missions,
            "count": len(missions)
        }
    except Exception as e:
        logger.error(
            "Failed to retrieve missions",
            extra={'error': str(e), 'error_type': type(e).__name__},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving missions. Please try again later."
        )


@router.get("/missions/test")
def get_mission_test(test_id: Optional[str] = Query(None, description="Test ID")):
    """
    Get a mission test with all its missions.

    Each mission contains:
    - primaryQuestion: The main question for the mission
    - secondaryQuestion: The follow-up/secondary question

    If no test_id is provided, returns the first available missions test.
    """
    try:
        mission_test = mission_service.get_mission_test(test_id)
        if not mission_test:
            logger.warning("Mission test not found", extra={'test_id': test_id})
            raise HTTPException(status_code=404, detail="Mission test not found")

        return {
            "status": "success",
            "data": mission_test
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve mission test",
            extra={'error': str(e), 'error_type': type(e).__name__, 'test_id': test_id},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving mission test. Please try again later."
        )


@router.get("/missions/{mission_id}")
def get_mission(mission_id: str):
    """
    Get a specific mission by ID.

    Returns the mission with its primary and secondary questions.
    """
    try:
        mission = mission_service.get_mission_by_id(mission_id)
        if not mission:
            logger.warning("Mission not found", extra={'mission_id': mission_id})
            raise HTTPException(status_code=404, detail="Mission not found")

        return {
            "status": "success",
            "data": mission
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve mission",
            extra={'error': str(e), 'error_type': type(e).__name__, 'mission_id': mission_id},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving mission. Please try again later."
        )


@router.post("/missions/session", status_code=status.HTTP_201_CREATED)
def create_mission_session(session_data: MissionSessionCreate):
    """
    Create a new session for taking a mission test.

    This initializes a test session that tracks the user's progress
    through the missions.
    """
    try:
        result = mission_service.create_mission_session(
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
            "Failed to create mission session",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'user_id': session_data.userId
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating mission session. Please try again later."
        )


@router.post("/missions/answer")
def submit_mission_answer(answer_data: MissionAnswerSubmit):
    """
    Submit an answer for a mission question.

    Can be used for both primary and secondary questions.
    Answers can be updated by submitting again for the same question.
    """
    try:
        answer = {}
        if answer_data.selectedOptionId:
            answer["selectedOptionId"] = answer_data.selectedOptionId
        if answer_data.selectedItems:
            answer["selectedItems"] = answer_data.selectedItems

        result = mission_service.submit_mission_answer(
            session_id=answer_data.sessionId,
            question_id=answer_data.questionId,
            answer=answer
        )

        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to submit mission answer",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'session_id': answer_data.sessionId
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while submitting answer. Please try again later."
        )


@router.post("/missions/session/{session_id}/complete")
def complete_mission_session(session_id: str):
    """
    Mark a mission session as completed.

    This should be called when the user has finished all missions.
    """
    try:
        result = mission_service.complete_mission_session(session_id)

        if result.get("status") == "error":
            raise HTTPException(status_code=400, detail=result.get("message"))

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to complete mission session",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'session_id': session_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while completing mission. Please try again later."
        )


@router.get("/missions/session/{session_id}")
def get_mission_session(session_id: str):
    """
    Get a mission session with all submitted answers.

    Returns session details and all answers submitted so far.
    """
    try:
        session = mission_service.get_mission_session(session_id)
        if not session:
            logger.warning("Mission session not found", extra={'session_id': session_id})
            raise HTTPException(status_code=404, detail="Mission session not found")

        return {
            "status": "success",
            "data": session
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve mission session",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'session_id': session_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving mission session. Please try again later."
        )
