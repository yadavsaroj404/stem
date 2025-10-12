import json
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime

# app configurations
from app.core.config import settings

# database imports
from sqlalchemy.orm import Session
from app.models.database import SubmissionDB, SessionLocal, create_tables

# type definitions
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
        """Submit answers and store in PostgreSQL database"""
        submission_id = str(uuid.uuid4())
        
        # Ensure tables exist
        create_tables()
        
        # Create database session
        db: Session = SessionLocal()
        
        try:
            # Convert responses to JSON string
            responses_json = json.dumps([response.__dict__ for response in test_data.responses])
            
            # Create submission record for database
            submission_record = SubmissionDB(
                id=submission_id,
                user_id=test_data.userId,
                created_at=test_data.createdAt,
                name=test_data.name,
                status="SUBMITTED",
                responses=responses_json,
                submitted_at=datetime.now()
            )
            
            # Add and commit to database
            db.add(submission_record)
            db.commit()
            db.refresh(submission_record)
            
            return {
                "status": "success", 
                "submissionId": submission_id,
                "message": "Answers submitted successfully"
            }
            
        except Exception as e:
            db.rollback()
            return {
                "status": "error",
                "message": f"Failed to submit answers: {str(e)}"
            }
        finally:
            db.close()

    def get_submission(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific submission by ID from PostgreSQL database"""
        db: Session = SessionLocal()
        
        try:
            submission = db.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()
            
            if submission:
                return {
                    "id": submission.id,
                    "userId": submission.user_id,
                    "createdAt": submission.created_at,
                    "name": submission.name,
                    "status": submission.status,
                    "responses": json.loads(submission.responses),
                    "submittedAt": submission.submitted_at.isoformat()
                }
            
            return None
            
        except Exception as e:
            return None
        finally:
            db.close()

    def get_submissions(self, filters: Optional[SubmissionFilter] = None) -> List[Dict[str, Any]]:
        """Get submissions with optional filtering from PostgreSQL database"""
        db: Session = SessionLocal()
        
        try:
            query = db.query(SubmissionDB)
            
            # Apply filters if provided
            if filters:
                if filters.userId:
                    query = query.filter(SubmissionDB.user_id == filters.userId)
                
                if filters.status:
                    query = query.filter(SubmissionDB.status == filters.status)
                
                if filters.name:
                    query = query.filter(SubmissionDB.name.ilike(f"%{filters.name}%"))
                
                if filters.createdAtFrom:
                    query = query.filter(SubmissionDB.created_at >= filters.createdAtFrom)
                
                if filters.createdAtTo:
                    query = query.filter(SubmissionDB.created_at <= filters.createdAtTo)
                
                # Apply pagination
                if filters.offset:
                    query = query.offset(filters.offset)
                
                if filters.limit:
                    query = query.limit(filters.limit)
            
            submissions = query.all()
            
            # Convert to dictionary format
            result = []
            for submission in submissions:
                result.append({
                    "id": submission.id,
                    "userId": submission.user_id,
                    "createdAt": submission.created_at,
                    "name": submission.name,
                    "status": submission.status,
                    "responses": json.loads(submission.responses),
                    "submittedAt": submission.submitted_at.isoformat()
                })
            
            return result
        
        except Exception as e:
            return []
        finally:
            db.close()

    def delete_submission(self, submission_id: str) -> bool:
        """Delete a submission by ID from PostgreSQL database"""
        db: Session = SessionLocal()
        
        try:
            submission = db.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()
            
            if submission:
                db.delete(submission)
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            db.rollback()
            return False
        finally:
            db.close()

question_service = QuestionService()