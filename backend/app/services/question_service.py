import json
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime

# app configurations
from app.core.logging import get_logger

# database imports
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import create_engine
from app.models.database import (
    SubmissionDB,
    SessionLocal,
    create_tables,
    engine,
    Cluster,
    Question,
    ListOption,
    Test,
)

# type definitions
from app.models.schemas import (
    TestSubmissionPayload,
    SubmissionFilter,
)

logger = get_logger(__name__)


class QuestionService:
    def __init__(self):
        logger.info("Initializing QuestionService with database support")

    def get_questions(self) -> dict:
        """Return all questions as a dictionary, fetched from database"""
        db: Session = SessionLocal()
        try:
            # Get test info
            test = db.query(Test).first()
            if not test:
                logger.warning("No test found in database")
                return {"questions": []}

            # Get all questions with their options
            questions = db.query(Question).options(
                joinedload(Question.options),
                joinedload(Question.cluster)
            ).order_by(Question.display_order).all()

            # Format questions to match the expected structure
            formatted_questions = []
            for q in questions:
                formatted_q = {
                    "_id": str(q.question_id),
                    "image": q.image_url,
                    "clusterId": str(q.cluster_id),
                    "question": q.question_text,
                    "optionInstruction": q.option_instruction,
                    "type": q.question_type,
                    "displayOrder": q.display_order,
                    "options": []
                }

                # Add options
                for opt in sorted(q.options, key=lambda x: x.display_order or 0):
                    formatted_opt = {
                        "_id": str(opt.option_id),
                        "text": opt.option_text,
                        "image": opt.option_image_url
                    }
                    formatted_q["options"].append(formatted_opt)

                formatted_questions.append(formatted_q)

            return {
                "_id": str(test.test_id),
                "version": str(test.version) + ".0.0",
                "name": test.test_name,
                "questions": formatted_questions
            }

        except Exception as e:
            logger.error(
                "Failed to fetch questions from database",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def get_test_sets(self, filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all test sets, optionally filtered"""
        db: Session = SessionLocal()
        try:
            query = db.query(Test)

            if filter:
                query = query.filter(Test.test_name.ilike(f"%{filter}%"))

            tests = query.all()

            # Convert to dictionary format
            result = []
            for test in tests:
                # Get full test details
                test_data = self.get_test_set(str(test.test_id))
                if test_data:
                    result.append(test_data)

            return result
        finally:
            db.close()

    def get_test_set(self, test_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific test set by ID"""
        db: Session = SessionLocal()
        try:
            test = db.query(Test).filter(Test.test_id == test_id).first()
            if not test:
                return None

            # Get all questions for this test
            questions = db.query(Question).options(
                joinedload(Question.options),
                joinedload(Question.cluster)
            ).order_by(Question.display_order).all()

            # Format questions
            formatted_questions = []
            for q in questions:
                formatted_q = {
                    "_id": str(q.question_id),
                    "image": q.image_url,
                    "clusterId": str(q.cluster_id),
                    "question": q.question_text,
                    "optionInstruction": q.option_instruction,
                    "type": q.question_type,
                    "displayOrder": q.display_order,
                    "options": []
                }

                # Add options
                for opt in sorted(q.options, key=lambda x: x.display_order or 0):
                    formatted_opt = {
                        "_id": str(opt.option_id),
                        "text": opt.option_text,
                        "image": opt.option_image_url
                    }
                    formatted_q["options"].append(formatted_opt)

                formatted_questions.append(formatted_q)

            return {
                "_id": str(test.test_id),
                "version": str(test.version) + ".0.0",
                "name": test.test_name,
                "questions": formatted_questions
            }
        finally:
            db.close()

    def submit_answers(self, test_data: TestSubmissionPayload) -> Dict[str, Any]:
        """Submit answers and store in PostgreSQL database"""
        submission_id = str(uuid.uuid4())

        logger.info(
            "Starting answer submission",
            extra={
                'user_id': test_data.userId,
                'submission_id': submission_id,
                'response_count': len(test_data.responses)
            }
        )

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
            logger.debug("Saving submission to database")
            db.add(submission_record)
            db.commit()
            db.refresh(submission_record)

            logger.info(
                "Answer submission successful",
                extra={
                    'submission_id': submission_id,
                    'user_id': test_data.userId,
                    'name': test_data.name
                }
            )

            return {
                "status": "success",
                "submissionId": submission_id,
                "message": "Answers submitted successfully"
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Answer submission failed",
                extra={
                    'submission_id': submission_id,
                    'user_id': test_data.userId,
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            return {
                "status": "error",
                "message": f"Failed to submit answers: {str(e)}"
            }
        finally:
            db.close()

    def get_submission(self, submission_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific submission by ID from PostgreSQL database"""
        logger.debug(f"Fetching submission", extra={'submission_id': submission_id})
        db: Session = SessionLocal()

        try:
            submission = db.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()

            if submission:
                logger.info(
                    "Submission retrieved successfully",
                    extra={
                        'submission_id': submission_id,
                        'user_id': submission.user_id
                    }
                )
                return {
                    "id": submission.id,
                    "userId": submission.user_id,
                    "createdAt": submission.created_at,
                    "name": submission.name,
                    "status": submission.status,
                    "responses": json.loads(submission.responses),
                    "submittedAt": submission.submitted_at.isoformat()
                }

            logger.warning(
                "Submission not found",
                extra={'submission_id': submission_id}
            )
            return None

        except Exception as e:
            logger.error(
                "Failed to retrieve submission",
                extra={
                    'submission_id': submission_id,
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            return None
        finally:
            db.close()

    def get_submissions(self, filters: Optional[SubmissionFilter] = None) -> List[Dict[str, Any]]:
        """Get submissions with optional filtering from PostgreSQL database"""
        logger.debug("Fetching submissions with filters", extra={'filters': filters.dict() if filters else None})
        db: Session = SessionLocal()

        try:
            query = db.query(SubmissionDB)

            # Apply filters if provided
            active_filters = {}
            if filters:
                if filters.userId:
                    query = query.filter(SubmissionDB.user_id == filters.userId)
                    active_filters['userId'] = filters.userId

                if filters.status:
                    query = query.filter(SubmissionDB.status == filters.status)
                    active_filters['status'] = filters.status

                if filters.name:
                    query = query.filter(SubmissionDB.name.ilike(f"%{filters.name}%"))
                    active_filters['name'] = filters.name

                if filters.createdAtFrom:
                    query = query.filter(SubmissionDB.created_at >= filters.createdAtFrom)
                    active_filters['createdAtFrom'] = filters.createdAtFrom

                if filters.createdAtTo:
                    query = query.filter(SubmissionDB.created_at <= filters.createdAtTo)
                    active_filters['createdAtTo'] = filters.createdAtTo

                # Apply pagination
                if filters.offset:
                    query = query.offset(filters.offset)
                    active_filters['offset'] = filters.offset

                if filters.limit:
                    query = query.limit(filters.limit)
                    active_filters['limit'] = filters.limit

            submissions = query.all()

            logger.info(
                "Submissions retrieved successfully",
                extra={
                    'count': len(submissions),
                    'filters': active_filters
                }
            )

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
            logger.error(
                "Failed to retrieve submissions",
                extra={
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            return []
        finally:
            db.close()

    def get_test_version(self) -> str:
        """Get the version of the test questions"""
        db: Session = SessionLocal()
        try:
            test = db.query(Test).first()
            if test:
                return str(test.version) + ".0.0"
            return "1.0.0"
        finally:
            db.close()

    def delete_submission(self, submission_id: str) -> bool:
        """Delete a submission by ID from PostgreSQL database"""
        logger.info("Attempting to delete submission", extra={'submission_id': submission_id})
        db: Session = SessionLocal()

        try:
            submission = db.query(SubmissionDB).filter(SubmissionDB.id == submission_id).first()

            if submission:
                db.delete(submission)
                db.commit()
                logger.info(
                    "Submission deleted successfully",
                    extra={
                        'submission_id': submission_id,
                        'user_id': submission.user_id
                    }
                )
                return True

            logger.warning(
                "Submission not found for deletion",
                extra={'submission_id': submission_id}
            )
            return False

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to delete submission",
                extra={
                    'submission_id': submission_id,
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            return False
        finally:
            db.close()

question_service = QuestionService()