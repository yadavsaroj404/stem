import json
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime

# app configurations
from app.core.config import settings
from app.core.logging import logger

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
        logger.info("Initializing QuestionService")
        try:
            questions_path = settings.questions_absolute_path
            with open(questions_path, "r", encoding="utf-8") as f:
                self.__questions = json.load(f)
            logger.info("Successfully loaded questions from %s", questions_path)
        except FileNotFoundError:
            logger.error("Questions file not found at %s", questions_path, exc_info=True)
            raise
        except json.JSONDecodeError:
            logger.error("Failed to decode JSON from %s", questions_path, exc_info=True)
            raise
        except Exception:
            logger.error("An unexpected error occurred during QuestionService initialization", exc_info=True)
            raise

    def get_questions(self) -> dict:
        """Return all questions as a dictionary"""
        logger.info("Retrieving all questions")
        return self.__questions

    def get_test_sets(self, filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all test sets, optionally filtered"""
        logger.info("Retrieving test sets with filter: %s", filter)
        test_sets = [self.__questions]
        
        if filter:
            filtered_sets = [ts for ts in test_sets if filter.lower() in ts.get("name", "").lower()]
            logger.info("Found %d test sets matching filter", len(filtered_sets))
            return filtered_sets
        
        logger.info("Returning all %d test sets", len(test_sets))
        return test_sets

    def get_test_set(self, test_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific test set by ID"""
        logger.info("Retrieving test set with ID: %s", test_id)
        if self.__questions.get("_id") == test_id:
            logger.info("Found test set with ID: %s", test_id)
            return self.__questions
        logger.warning("Test set with ID: %s not found", test_id)
        return None

    def submit_answers(self, test_data: TestSubmissionPayload) -> Dict[str, Any]:
        """Submit answers and store in PostgreSQL database"""
        submission_id = str(uuid.uuid4())
        logger.info("Submitting answers for user %s with submission ID %s", test_data.userId, submission_id)
        
        db: Session = SessionLocal()
        
        try:
            responses_json = json.dumps([response.__dict__ for response in test_data.responses])
            
            submission_record = SubmissionDB(
                id=submission_id,
                user_id=test_data.userId,
                created_at=test_data.createdAt,
                name=test_data.name,
                status="SUBMITTED",
                responses=responses_json,
                submitted_at=datetime.now()
            )
            
            db.add(submission_record)
            db.commit()
            db.refresh(submission_record)
            logger.info("Successfully submitted answers for submission ID %s", submission_id)
            
            return {
                "status": "success", 
                "submissionId": submission_id,
                "message": "Answers submitted successfully"
            }
            
        except Exception as e:
            db.rollback()
            logger.error("Failed to submit answers for user %s: %s", test_data.userId, e, exc_info=True)
            return {
                "status": "error",
                "message": f"Failed to submit answers: {str(e)}"
            }
        finally:
            db.close()

    def get_submission(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific submission by ID from PostgreSQL database"""
        logger.info("Retrieving submission with ID: %s", submission_id)
        db: Session = SessionLocal()
        
        try:
            submission = db.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()
            
            if submission:
                logger.info("Found submission with ID: %s", submission_id)
                return {
                    "id": submission.id,
                    "userId": submission.user_id,
                    "createdAt": submission.created_at,
                    "name": submission.name,
                    "status": submission.status,
                    "responses": json.loads(submission.responses),
                    "submittedAt": submission.submitted_at.isoformat()
                }
            
            logger.warning("Submission with ID: %s not found", submission_id)
            return None
            
        except Exception as e:
            logger.error("Failed to retrieve submission %s: %s", submission_id, e, exc_info=True)
            return None
        finally:
            db.close()

    def get_submissions(self, filters: Optional[SubmissionFilter] = None) -> List[Dict[str, Any]]:
        """Get submissions with optional filtering from PostgreSQL database"""
        logger.info("Retrieving submissions with filters: %s", filters)
        db: Session = SessionLocal()
        
        try:
            query = db.query(SubmissionDB)
            
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
                if filters.offset:
                    query = query.offset(filters.offset)
                if filters.limit:
                    query = query.limit(filters.limit)
            
            submissions = query.all()
            logger.info("Found %d submissions matching filters", len(submissions))
            
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
            logger.error("Failed to retrieve submissions: %s", e, exc_info=True)
            return []
        finally:
            db.close()

    def get_test_version(self) -> str:
        """Get the version of the test questions"""
        version = self.__questions.get("version", "1.0.0")
        logger.info("Retrieving test version: %s", version)
        return version

    def delete_submission(self, submission_id: str) -> bool:
        """Delete a submission by ID from PostgreSQL database"""
        logger.info("Deleting submission with ID: %s", submission_id)
        db: Session = SessionLocal()
        
        try:
            submission = db.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()
            
            if submission:
                db.delete(submission)
                db.commit()
                logger.info("Successfully deleted submission with ID: %s", submission_id)
                return True
            
            logger.warning("Submission with ID: %s not found for deletion", submission_id)
            return False
            
        except Exception as e:
            db.rollback()
            logger.error("Failed to delete submission %s: %s", submission_id, e, exc_info=True)
            return False
        finally:
            db.close()

question_service = QuestionService()