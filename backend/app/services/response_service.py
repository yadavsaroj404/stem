"""
Response service for managing candidate test responses.
Handles storing responses, computing scores, and retrieving submission details.
"""

import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session, joinedload

from app.models.database import (
    SessionLocal,
    TestSession,
    StudentAnswer,
    CandidateScore,
    Question,
    Cluster,
)
from app.models.schemas import (
    TestResponseSubmission,
    CandidateResponseInput,
    SubmissionWithResponses,
)
from app.services.scoring_service import scoring_service
from app.core.logging import get_logger

logger = get_logger(__name__)


class ResponseService:
    """Service for managing candidate responses and submissions"""

    def submit_responses(self, submission_data: TestResponseSubmission) -> Dict[str, Any]:
        """
        Submit candidate responses and compute scores

        Args:
            submission_data: The test response submission data

        Returns:
            Dictionary with session ID and status
        """
        session_id = str(uuid.uuid4())
        db: Session = SessionLocal()

        try:
            logger.info(
                "Starting response submission",
                extra={
                    'user_id': submission_data.userId,
                    'session_id': session_id,
                    'response_count': len(submission_data.responses)
                }
            )

            # Create test session record
            test_session = TestSession(
                session_id=session_id,
                user_id=submission_data.userId,
                test_id=submission_data.testId,
                name=submission_data.name,
                status="SUBMITTED",
                submitted_at=datetime.now()
            )
            db.add(test_session)
            db.flush()  # Get the session ID

            # Process each response
            for response_input in submission_data.responses:
                # Prepare student answer JSON
                answer_json = {
                    "selectedOptionId": response_input.selectedOptionId,
                    "selectedItems": response_input.selectedItems,
                    "responseTimeMs": response_input.responseTimeMs
                }

                # Check if answer is correct
                is_correct = None
                if response_input.selectedOptionId or response_input.selectedItems:
                    selected_items_json = json.dumps(response_input.selectedItems) if response_input.selectedItems else None
                    is_correct = 1 if scoring_service.check_answer(
                        response_input.questionId,
                        response_input.selectedOptionId,
                        selected_items_json
                    ) else 0

                # Create student answer record
                student_answer = StudentAnswer(
                    session_id=session_id,
                    question_id=response_input.questionId,
                    student_answer=json.dumps(answer_json),
                    is_correct=is_correct
                )
                db.add(student_answer)

            db.commit()

            # Compute scores after storing responses
            logger.info(f"Computing scores for session {session_id}")
            scores = scoring_service.compute_scores(db, session_id)

            logger.info(
                "Response submission successful",
                extra={
                    'session_id': session_id,
                    'user_id': submission_data.userId,
                    'overall_score': scores.get('overallScore', 0)
                }
            )

            return {
                "status": "success",
                "sessionId": session_id,
                "message": "Responses submitted and scored successfully",
                "score": scores
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Response submission failed",
                extra={
                    'session_id': session_id,
                    'user_id': submission_data.userId,
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            raise

        finally:
            db.close()

    def get_session_with_responses(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a test session with all responses and computed scores

        Args:
            session_id: The session ID

        Returns:
            Dictionary with session details, responses, and scores
        """
        db: Session = SessionLocal()

        try:
            # Get test session
            session = db.query(TestSession).filter(
                TestSession.session_id == session_id
            ).first()

            if not session:
                logger.warning(f"Session {session_id} not found")
                return None

            # Get student answers
            answers = db.query(StudentAnswer).filter(
                StudentAnswer.session_id == session_id
            ).all()

            # Format answers
            formatted_answers = []
            for answer in answers:
                answer_data = json.loads(answer.student_answer) if answer.student_answer else {}
                formatted_answers.append({
                    "answerId": answer.answer_id,
                    "questionId": str(answer.question_id),
                    "studentAnswer": answer_data,
                    "isCorrect": answer.is_correct,
                    "answeredAt": answer.answered_at.isoformat() if answer.answered_at else None,
                })

            # Get scores
            scores = db.query(CandidateScore).filter(
                CandidateScore.session_id == session_id
            ).all()

            # Separate overall score and cluster scores
            overall_score_record = next((s for s in scores if s.cluster_id is None), None)
            cluster_score_records = [s for s in scores if s.cluster_id is not None]

            # Get cluster names
            cluster_ids = [s.cluster_id for s in cluster_score_records]
            clusters = db.query(Cluster).filter(Cluster.cluster_id.in_(cluster_ids)).all()
            cluster_map = {str(c.cluster_id): c.cluster_name for c in clusters}

            # Format cluster scores
            cluster_scores = []
            for score in cluster_score_records:
                cluster_scores.append({
                    "clusterId": str(score.cluster_id),
                    "clusterName": cluster_map.get(str(score.cluster_id), "Unknown"),
                    "totalQuestions": score.total_questions,
                    "correctAnswers": score.correct_answers,
                    "incorrectAnswers": score.incorrect_answers,
                    "unanswered": score.unanswered,
                    "scorePercentage": float(score.score_percentage) if score.score_percentage else 0.0
                })

            # Format overall score
            score_data = None
            if overall_score_record:
                score_data = {
                    "sessionId": session_id,
                    "userId": session.user_id,
                    "overallScore": float(overall_score_record.score_percentage) if overall_score_record.score_percentage else 0.0,
                    "totalQuestions": overall_score_record.total_questions,
                    "correctAnswers": overall_score_record.correct_answers,
                    "incorrectAnswers": overall_score_record.incorrect_answers,
                    "unanswered": overall_score_record.unanswered,
                    "clusterScores": cluster_scores,
                    "computedAt": overall_score_record.computed_at.isoformat() if overall_score_record.computed_at else None
                }

            return {
                "sessionId": str(session.session_id),
                "userId": session.user_id,
                "testId": str(session.test_id) if session.test_id else None,
                "name": session.name,
                "status": session.status,
                "startedAt": session.started_at.isoformat(),
                "submittedAt": session.submitted_at.isoformat() if session.submitted_at else None,
                "answers": formatted_answers,
                "score": score_data
            }

        except Exception as e:
            logger.error(
                "Failed to retrieve session with responses",
                extra={
                    'session_id': session_id,
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            return None

        finally:
            db.close()

    def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all test sessions for a user

        Args:
            user_id: The user ID

        Returns:
            List of sessions with basic info
        """
        db: Session = SessionLocal()

        try:
            sessions = db.query(TestSession).filter(
                TestSession.user_id == user_id
            ).order_by(TestSession.started_at.desc()).all()

            result = []
            for session in sessions:
                # Get overall score
                overall_score = db.query(CandidateScore).filter(
                    CandidateScore.session_id == str(session.session_id),
                    CandidateScore.cluster_id.is_(None)
                ).first()

                result.append({
                    "sessionId": str(session.session_id),
                    "userId": session.user_id,
                    "testId": str(session.test_id) if session.test_id else None,
                    "name": session.name,
                    "status": session.status,
                    "startedAt": session.started_at.isoformat(),
                    "submittedAt": session.submitted_at.isoformat() if session.submitted_at else None,
                    "overallScore": float(overall_score.score_percentage) if overall_score and overall_score.score_percentage else 0.0
                })

            return result

        except Exception as e:
            logger.error(
                "Failed to retrieve user sessions",
                extra={
                    'user_id': user_id,
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            return []

        finally:
            db.close()


# Singleton instance
response_service = ResponseService()
