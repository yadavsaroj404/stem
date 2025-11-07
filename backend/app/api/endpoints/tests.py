from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query
from app.services.question_service import question_service
from app.models.schemas import TestSubmissionPayload, SubmissionFilter

router = APIRouter()

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
        import traceback
        raise HTTPException(status_code=500, detail=f"Error retrieving questions: {str(e)}\nTraceback: {traceback.format_exc()}")

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
        import traceback
        raise HTTPException(status_code=500, detail=f"Error retrieving test version: {str(e)}\nTraceback: {traceback.format_exc()}")

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
        import traceback
        raise HTTPException(status_code=500, detail=f"Error retrieving test sets: {str(e)}\nTraceback: {traceback.format_exc()}")

@router.get("/test-sets/{test_id}")
def get_test_set(test_id: str):
    """Get a specific test set by ID"""
    try:
        test_set = question_service.get_test_set(test_id)
        if not test_set:
            raise HTTPException(status_code=404, detail="Test set not found")
        
        return {
            "status": "success",
            "data": test_set,
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"Error retrieving test set: {str(e)}\nTraceback: {traceback.format_exc()}")

# Submission Endpoints
@router.post("/submit", status_code=status.HTTP_201_CREATED)
def submit_test_answers(test_data: TestSubmissionPayload):
    """Submit test answers"""
    try:
        result = question_service.submit_answers(test_data)
        return result
    
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting answers: {str(e)}\nTraceback: {traceback.format_exc()}"
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
        import traceback
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving submissions: {str(e)}\nTraceback: {traceback.format_exc()}"
        )

@router.get("/submissions/{submission_id}")
def get_submission(submission_id: str):
    """Get a specific submission by ID"""
    try:
        submission = question_service.get_submission(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "status": "success",
            "data": submission,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving submission: {str(e)}\nTraceback: {traceback.format_exc()}"
        )

@router.delete("/submissions/{submission_id}")
def delete_submission(submission_id: str):
    """Delete a submission by ID"""
    try:
        success = question_service.delete_submission(submission_id)
        if not success:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return {
            "status": "success",
            "message": "Submission deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting submission: {str(e)}\nTraceback: {traceback.format_exc()}"
        )