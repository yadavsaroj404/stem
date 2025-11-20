from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Request
from app.services.question_service import question_service
from app.models.schemas import TestSubmissionPayload, SubmissionFilter
from app.core.logging import logger

router = APIRouter()

# Test Sets Endpoints
@router.get("/questions")
def get_all_questions(request: Request):
    """Get all questions"""
    logger.info("Received request for all questions from %s", request.client.host)
    try:
        questions = question_service.get_questions()
        logger.info("Successfully retrieved all questions")
        return {
            "status": "success",
            "data": questions,
        }
    except Exception as e:
        logger.error("Error retrieving all questions: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving questions: {str(e)}")

@router.get("/questions/version")
def get_test_version(request: Request):
    """Get test version"""
    logger.info("Received request for test version from %s", request.client.host)
    try:
        version = question_service.get_test_version()
        logger.info("Successfully retrieved test version: %s", version)
        return {
            "status": "success",
            "data": {"version": version},
        }
    except Exception as e:
        logger.error("Error retrieving test version: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving test version: {str(e)}")

@router.get("/test-sets")
def get_test_sets(request: Request, filter: Optional[str] = Query(None, description="Filter test sets by name")):
    """Get all test sets with optional filtering"""
    logger.info("Received request for test sets from %s with filter: %s", request.client.host, filter)
    try:
        test_sets = question_service.get_test_sets(filter)
        logger.info("Successfully retrieved test sets")
        return {
            "status": "success",
            "data": test_sets,
        }
    except Exception as e:
        logger.error("Error retrieving test sets: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving test sets: {str(e)}")

@router.get("/test-sets/{test_id}")
def get_test_set(request: Request, test_id: str):
    """Get a specific test set by ID"""
    logger.info("Received request for test set %s from %s", test_id, request.client.host)
    try:
        test_set = question_service.get_test_set(test_id)
        if not test_set:
            logger.warning("Test set with ID %s not found", test_id)
            raise HTTPException(status_code=404, detail="Test set not found")
        
        logger.info("Successfully retrieved test set %s", test_id)
        return {
            "status": "success",
            "data": test_set,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error retrieving test set %s: %s", test_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving test set: {str(e)}")

# Submission Endpoints
@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_test_answers(request: Request, test_data: TestSubmissionPayload):
    """Submit test answers"""
    logger.info("Received submission from user %s from %s", test_data.userId, request.client.host)
    try:
        result = question_service.submit_answers(test_data)
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        logger.info("Successfully processed submission for user %s", test_data.userId)
        return result
    
    except Exception as e:
        logger.error("Error submitting answers for user %s: %s", test_data.userId, e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting answers: {str(e)}"
        )

@router.get("/submissions")
def get_submissions(
    request: Request,
    user_id: Optional[str] = Query(None, alias="userId", description="Filter by user ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    name: Optional[str] = Query(None, description="Filter by submission name"),
    created_at_from: Optional[str] = Query(None, alias="createdAtFrom", description="Filter from date (ISO format)"),
    created_at_to: Optional[str] = Query(None, alias="createdAtTo", description="Filter to date (ISO format)"),
    offset: Optional[int] = Query(0, description="Pagination offset"),
    limit: Optional[int] = Query(100, description="Pagination limit")
):
    """Get submissions with optional filtering"""
    logger.info("Received request for submissions from %s with filters", request.client.host)
    try:
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
        logger.info("Successfully retrieved %d submissions", len(submissions))
        return {
            "status": "success",
            "data": submissions,
            "count": len(submissions)
        }
    
    except Exception as e:
        logger.error("Error retrieving submissions: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving submissions: {str(e)}"
        )

@router.get("/submissions/{submission_id}")
def get_submission(request: Request, submission_id: str):
    """Get a specific submission by ID"""
    logger.info("Received request for submission %s from %s", submission_id, request.client.host)
    try:
        submission = question_service.get_submission(submission_id)
        if not submission:
            logger.warning("Submission with ID %s not found", submission_id)
            raise HTTPException(status_code=404, detail="Submission not found")
        
        logger.info("Successfully retrieved submission %s", submission_id)
        return {
            "status": "success",
            "data": submission,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error retrieving submission %s: %s", submission_id, e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving submission: {str(e)}"
        )

@router.delete("/submissions/{submission_id}")
def delete_submission(request: Request, submission_id: str):
    """Delete a submission by ID"""
    logger.info("Received request to delete submission %s from %s", submission_id, request.client.host)
    try:
        success = question_service.delete_submission(submission_id)
        if not success:
            logger.warning("Failed to delete submission %s, not found", submission_id)
            raise HTTPException(status_code=404, detail="Submission not found")
        
        logger.info("Successfully deleted submission %s", submission_id)
        return {
            "status": "success",
            "message": "Submission deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error deleting submission %s: %s", submission_id, e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting submission: {str(e)}"
        )