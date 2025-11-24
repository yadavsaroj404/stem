from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.services.question_service import question_service
from app.models.schemas import TestSubmissionPayload, SubmissionFilter
from app.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

# Test Sets Endpoints
@router.get("/questions")
def get_all_questions():
    """Get all questions"""
    try:
        questions = question_service.get_questions()
        return {
            "status": "success",
            "data": questions,
        }
    except Exception as e:
        logger.error(
            "Failed to retrieve questions",
            extra={'error': str(e), 'error_type': type(e).__name__},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving questions. Please try again later."
        )

@router.get("/questions/version")
def get_test_version():
    """Get test version"""
    try:
        version = question_service.get_test_version()
        return {
            "status": "success",
            "data": {"version": version},
        }
    except Exception as e:
        logger.error(
            "Failed to retrieve test version",
            extra={'error': str(e), 'error_type': type(e).__name__},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving test version. Please try again later."
        )

@router.get("/test-sets")
def get_test_sets(filter: Optional[str] = Query(None, description="Filter test sets by name")):
    """Get all test sets with optional filtering"""
    try:
        test_sets = question_service.get_test_sets(filter)
        return {
            "status": "success",
            "data": test_sets,
        }
    except Exception as e:
        logger.error(
            "Failed to retrieve test sets",
            extra={'error': str(e), 'error_type': type(e).__name__, 'filter': filter},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving test sets. Please try again later."
        )

@router.get("/test-sets/{test_id}")
def get_test_set(test_id: str):
    """Get a specific test set by ID"""
    try:
        test_set = question_service.get_test_set(test_id)
        if not test_set:
            logger.warning("Test set not found", extra={'test_id': test_id})
            raise HTTPException(status_code=404, detail="Test set not found")

        return {
            "status": "success",
            "data": test_set,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve test set",
            extra={'error': str(e), 'error_type': type(e).__name__, 'test_id': test_id},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving test set. Please try again later."
        )

# Submission Endpoints
@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_test_answers(test_data: TestSubmissionPayload):
    """Submit test answers"""
    try:
        result = question_service.submit_answers(test_data)
        return result

    except Exception as e:
        logger.error(
            "Failed to submit answers",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'user_id': test_data.userId
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while submitting answers. Please try again later."
        )

@router.get("/submissions")
def get_submissions(
    user_id: Optional[str] = Query(None, alias="userId", description="Filter by user ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    name: Optional[str] = Query(None, description="Filter by submission name"),
    created_at_from: Optional[str] = Query(None, alias="createdAtFrom", description="Filter from date (ISO format)"),
    created_at_to: Optional[str] = Query(None, alias="createdAtTo", description="Filter to date (ISO format)"),
    offset: Optional[int] = Query(0, description="Pagination offset"),
    limit: Optional[int] = Query(100, description="Pagination limit")
):
    """Get submissions with optional filtering"""
    try:
        # Create filter object
        filters = SubmissionFilter(
            userId=user_id,
            status=status_filter,
            name=name,
            createdAtFrom=created_at_from,
            createdAtTo=created_at_to,
            offset=offset,
            limit=limit
        )

        submissions = question_service.get_submissions(filters)
        return {
            "status": "success",
            "data": submissions,
            "count": len(submissions)
        }

    except Exception as e:
        logger.error(
            "Failed to retrieve submissions",
            extra={'error': str(e), 'error_type': type(e).__name__},
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving submissions. Please try again later."
        )

@router.get("/submissions/{submission_id}")
def get_submission(submission_id: str):
    """Get a specific submission by ID"""
    try:
        submission = question_service.get_submission(submission_id)
        if not submission:
            logger.warning("Submission not found", extra={'submission_id': submission_id})
            raise HTTPException(status_code=404, detail="Submission not found")

        return {
            "status": "success",
            "data": submission,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to retrieve submission",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'submission_id': submission_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving submission. Please try again later."
        )

@router.delete("/submissions/{submission_id}")
def delete_submission(submission_id: str):
    """Delete a submission by ID"""
    try:
        success = question_service.delete_submission(submission_id)
        if not success:
            logger.warning("Submission not found for deletion", extra={'submission_id': submission_id})
            raise HTTPException(status_code=404, detail="Submission not found")

        return {
            "status": "success",
            "message": "Submission deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to delete submission",
            extra={
                'error': str(e),
                'error_type': type(e).__name__,
                'submission_id': submission_id
            },
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="An error occurred while deleting submission. Please try again later."
        )