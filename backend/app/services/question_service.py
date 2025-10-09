import json
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.core.config import settings
from app.models.schemas import (
    TestSubmissionPayload,
    SubmissionFilter,
)

class QuestionService:
    __questions: dict

    def __init__(self):
        questions_path = settings.questions_path
        with open(questions_path, "r") as f:
            self.__questions = json.load(f)

    def get_questions(self) -> dict:
        """Return all questions as a dictionary"""
        return self.__questions

    def get_test_sets(self, filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all test sets, optionally filtered"""
        # For now, return the single test set we have
        # In the future, this could support multiple test sets
        test_sets = [self.__questions]
        
        if filter:
            # Apply filter logic here if needed
            filtered_sets = [ts for ts in test_sets if filter.lower() in ts.get("name", "").lower()]
            return filtered_sets
        
        return test_sets

    def get_test_set(self, test_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific test set by ID"""
        if self.__questions.get("_id") == test_id:
            return self.__questions
        return None

    def submit_answers(self, test_data: TestSubmissionPayload) -> Dict[str, Any]:
        """Submit answers and store in JSON file"""
        submission_id = str(uuid.uuid4())
        
        # Create submission record
        submission_record = {
            "id": submission_id,  # Using 'id' instead of '_id' for consistency
            "userId": test_data.userId,
            "createdAt": test_data.createdAt,
            "name": test_data.name,
            "status": "SUBMITTED",
            "responses": [response.__dict__ for response in test_data.responses],
            "submittedAt": datetime.now().isoformat()
        }
        
        submissions_path = settings.submissions_path
        
        try:
            # Read existing submissions
            with open(submissions_path, "r") as f:
                content = f.read().strip()
                if content:
                    submissions = json.loads(content)
                else:
                    submissions = []
            
            # Add new submission
            submissions.append(submission_record)
            
            # Write back to file
            with open(submissions_path, "w") as f:
                json.dump(submissions, f)
                
        except FileNotFoundError:
            # Create new file with the first submission
            with open(submissions_path, "w") as f:
                json.dump([submission_record], f)
        
        return {
            "status": "success", 
            "submissionId": submission_id,
            "message": "Answers submitted successfully"
        }

    def get_submission(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific submission by ID"""
        submissions_path = settings.submissions_path
        
        try:
            with open(submissions_path, "r") as f:
                content = f.read().strip()
                if not content:
                    return None
                submissions = json.loads(content)
            
            # Find submission by ID
            for submission in submissions:
                if submission.get("id") == submission_id:
                    return submission
            
            return None
            
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    def get_submissions(self, filters: Optional[SubmissionFilter] = None) -> List[Dict[str, Any]]:
        """Get submissions with optional filtering"""
        submissions_path = settings.submissions_path
        
        try:
            with open(submissions_path, "r") as f:
                content = f.read().strip()
                if not content:
                    return []
                submissions = json.loads(content)
        
        except (FileNotFoundError, json.JSONDecodeError):
            return []
        
        # Apply filters if provided
        if filters:
            filtered_submissions = []
            
            for submission in submissions:
                # Filter by userId
                if filters.userId and submission.get("userId") != filters.userId:
                    continue
                
                # Filter by status
                if filters.status and submission.get("status") != filters.status:
                    continue
                
                # Filter by name
                if filters.name and filters.name.lower() not in submission.get("name", "").lower():
                    continue
                
                # Filter by date range
                submission_date = submission.get("createdAt", "")
                if filters.createdAtFrom and submission_date < filters.createdAtFrom:
                    continue
                
                if filters.createdAtTo and submission_date > filters.createdAtTo:
                    continue
                
                filtered_submissions.append(submission)
            
            submissions = filtered_submissions
        
        # Apply pagination
        if filters and filters.offset:
            submissions = submissions[filters.offset:]
        
        if filters and filters.limit:
            submissions = submissions[:filters.limit]
        
        return submissions

    def delete_submission(self, submission_id: str) -> bool:
        """Delete a submission by ID"""
        submissions_path = settings.submissions_path
        
        try:
            with open(submissions_path, "r") as f:
                content = f.read().strip()
                if not content:
                    return False
                submissions = json.loads(content)
            
            # Find and remove submission
            original_count = len(submissions)
            submissions = [s for s in submissions if s.get("id") != submission_id]
            
            if len(submissions) < original_count:
                # Write back updated submissions
                with open(submissions_path, "w") as f:
                    json.dump(submissions, f, indent=2)
                return True
            
            return False
            
        except (FileNotFoundError, json.JSONDecodeError):
            return False

question_service = QuestionService()