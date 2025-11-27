"""
Unified Assessment Service for handling all assessment types (Missions and General Tests).
Consolidates functionality from mission_service and question_service for optimized operations.
"""

import json
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.core.logging import get_logger

from sqlalchemy.orm import Session, joinedload
from app.models.database import (
    SessionLocal,
    Question,
    ListOption,
    Test,
    MissionsTest,
    GeneralTest,
    TestSession,
    StudentAnswer,
    CandidateScore,
    ItemPool,
    ItemsGroup,
    Cluster,
)
from app.services.scoring_service import scoring_service

logger = get_logger(__name__)


class AssessmentService:
    """Unified service for handling all assessment types"""

    def __init__(self):
        logger.info("Initializing AssessmentService with database support")

    # --- Question/Test Retrieval ---

    def get_all_assessments(
        self,
        test_type: Optional[str] = None,
        filter_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all assessments, optionally filtered by type.

        Args:
            test_type: 'missions' or 'general' or None for all
            filter_name: Optional filter by test name

        Returns:
            List of assessments
        """
        db: Session = SessionLocal()
        try:
            query = db.query(Test)

            if test_type:
                query = query.filter(Test.test_type == test_type)

            if filter_name:
                query = query.filter(Test.test_name.ilike(f"%{filter_name}%"))

            tests = query.all()

            result = []
            for test in tests:
                test_data = self.get_assessment_questions(
                    test_id=str(test.test_id),
                    test_type=test.test_type
                )
                if test_data:
                    result.append(test_data)

            return result

        except Exception as e:
            logger.error(
                "Failed to fetch assessments",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def get_assessment_questions(
        self,
        test_id: Optional[str] = None,
        test_type: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get assessment questions.

        For missions: Returns missions with primary/secondary questions.
        For general tests: Returns list of questions.

        Args:
            test_id: Optional test ID
            test_type: 'missions' or 'general'

        Returns:
            Assessment data with questions
        """
        db: Session = SessionLocal()
        try:
            # Determine test type if not provided
            if test_id:
                test = db.query(Test).filter(Test.test_id == test_id).first()
                if test:
                    test_type = test.test_type
            elif test_type:
                test = db.query(Test).filter(Test.test_type == test_type).first()
            else:
                test = db.query(Test).first()

            if not test:
                logger.warning("No test found", extra={'test_id': test_id, 'test_type': test_type})
                return None

            # Route to appropriate handler based on type
            if test.test_type == "missions":
                return self._get_mission_test_data(db, test)
            else:
                return self._get_general_test_data(db, test)

        except Exception as e:
            logger.error(
                "Failed to fetch assessment questions",
                extra={'error': str(e), 'error_type': type(e).__name__, 'test_id': test_id},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def _get_mission_test_data(self, db: Session, test: Test) -> Dict[str, Any]:
        """Get mission test data with primary/secondary questions"""
        missions = db.query(MissionsTest).filter(
            MissionsTest.test_id == test.test_id
        ).options(
            joinedload(MissionsTest.primary_question).joinedload(Question.options),
            joinedload(MissionsTest.primary_question).joinedload(Question.cluster),
            joinedload(MissionsTest.primary_question).joinedload(Question.item_pools).joinedload(ItemPool.group),
            joinedload(MissionsTest.secondary_question).joinedload(Question.options),
            joinedload(MissionsTest.secondary_question).joinedload(Question.cluster),
            joinedload(MissionsTest.secondary_question).joinedload(Question.item_pools).joinedload(ItemPool.group),
        ).all()

        formatted_missions = []
        for idx, mission in enumerate(missions):
            mission_data = {
                "_id": str(mission.id),
                "displayOrder": idx + 1,
                "primaryQuestion": self._format_question(mission.primary_question) if mission.primary_question else None,
                "secondaryQuestion": self._format_question(mission.secondary_question) if mission.secondary_question else None,
            }
            formatted_missions.append(mission_data)

        return {
            "_id": str(test.test_id),
            "version": f"{test.version}.0.0" if test.version else "1.0.0",
            "name": test.test_name,
            "type": "missions",
            "missions": formatted_missions,
            "totalMissions": len(formatted_missions)
        }

    def _get_general_test_data(self, db: Session, test: Test) -> Dict[str, Any]:
        """Get general test data with questions linked to this specific test"""
        # Get questions linked to this test via general_test table
        questions = db.query(Question).join(
            GeneralTest, GeneralTest.question_id == Question.question_id
        ).filter(
            GeneralTest.test_id == test.test_id
        ).options(
            joinedload(Question.options),
            joinedload(Question.cluster),
            joinedload(Question.item_pools).joinedload(ItemPool.group)
        ).order_by(Question.display_order).all()

        formatted_questions = []
        for q in questions:
            formatted_questions.append(self._format_question(q))

        return {
            "_id": str(test.test_id),
            "version": f"{test.version}.0.0" if test.version else "1.0.0",
            "name": test.test_name,
            "type": test.test_type or "general",
            "questions": formatted_questions,
            "totalQuestions": len(formatted_questions)
        }

    def _format_question(self, question: Question) -> Optional[Dict[str, Any]]:
        """Format a question object to dictionary"""
        if not question:
            return None

        formatted_q = {
            "_id": str(question.question_id),
            "image": question.image_url,
            "clusterId": str(question.cluster_id) if question.cluster_id else None,
            "question": question.question_text,
            "description": question.question_description,
            "optionInstruction": question.option_instruction,
            "type": question.question_type,
            "displayOrder": question.display_order,
            "options": []
        }

        # Add options
        if question.options:
            for opt in sorted(question.options, key=lambda x: x.display_order or 0):
                formatted_opt = {
                    "_id": str(opt.option_id),
                    "text": opt.option_text,
                    "image": opt.option_image_url
                }
                formatted_q["options"].append(formatted_opt)

        # Check for item pools (for group/matching questions)
        if hasattr(question, 'item_pools') and question.item_pools:
            items_by_group = {}
            group_order = {}  # Track group display order

            for item in question.item_pools:
                group_id = str(item.group_id) if item.group_id else "default"
                if group_id not in items_by_group:
                    items_by_group[group_id] = {
                        "_id": group_id,
                        "groupName": item.group.group_name if item.group else None,
                        "displayOrder": item.group.display_order if item.group else 0,
                        "items": []
                    }
                    group_order[group_id] = item.group.display_order if item.group else 0

                items_by_group[group_id]["items"].append({
                    "_id": str(item.pool_id),
                    "text": item.item_text,
                    "displayOrder": item.display_order
                })

            # Sort items within each group by display_order
            for group in items_by_group.values():
                group["items"] = sorted(group["items"], key=lambda x: x.get("displayOrder") or 0)

            # Sort groups by display_order
            sorted_groups = sorted(items_by_group.values(), key=lambda x: x.get("displayOrder") or 0)
            formatted_q["itemGroups"] = sorted_groups

            # For matching questions, also provide leftSide/rightSide format
            if question.question_type == "matching" and len(sorted_groups) == 2:
                formatted_q["leftSide"] = sorted_groups[0]["items"]
                formatted_q["leftSideTitle"] = sorted_groups[0]["groupName"]
                formatted_q["rightSide"] = sorted_groups[1]["items"]
                formatted_q["rightSideTitle"] = sorted_groups[1]["groupName"]

        return formatted_q

    def get_assessment_by_id(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific assessment/mission by ID.

        Args:
            assessment_id: The assessment or mission ID

        Returns:
            Assessment/mission data
        """
        db: Session = SessionLocal()
        try:
            # Try as mission first
            mission = db.query(MissionsTest).filter(
                MissionsTest.id == assessment_id
            ).options(
                joinedload(MissionsTest.primary_question).joinedload(Question.options),
                joinedload(MissionsTest.secondary_question).joinedload(Question.options),
            ).first()

            if mission:
                return {
                    "_id": str(mission.id),
                    "testId": str(mission.test_id),
                    "type": "mission",
                    "primaryQuestion": self._format_question(mission.primary_question) if mission.primary_question else None,
                    "secondaryQuestion": self._format_question(mission.secondary_question) if mission.secondary_question else None,
                }

            # Try as test
            test = db.query(Test).filter(Test.test_id == assessment_id).first()
            if test:
                return self.get_assessment_questions(test_id=assessment_id)

            return None

        except Exception as e:
            logger.error(
                "Failed to fetch assessment",
                extra={'error': str(e), 'error_type': type(e).__name__, 'assessment_id': assessment_id},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def get_test_version(self, test_id: Optional[str] = None) -> str:
        """Get the version of a test"""
        db: Session = SessionLocal()
        try:
            if test_id:
                test = db.query(Test).filter(Test.test_id == test_id).first()
            else:
                test = db.query(Test).first()

            if test:
                return f"{test.version}.0.0"
            return "1.0.0"
        finally:
            db.close()

    # --- Session Management ---

    def create_session(
        self,
        user_id: str,
        test_id: str,
        name: str
    ) -> Dict[str, Any]:
        """
        Create a new test session.

        Args:
            user_id: User ID
            test_id: Test ID
            name: Session name

        Returns:
            Session info
        """
        db: Session = SessionLocal()
        try:
            # Get test type for response
            test = db.query(Test).filter(Test.test_id == test_id).first()
            test_type = test.test_type if test else "general"

            session = TestSession(
                user_id=user_id,
                test_id=test_id,
                name=name,
                status="IN_PROGRESS"
            )
            db.add(session)
            db.commit()
            db.refresh(session)

            logger.info(
                "Session created",
                extra={
                    'session_id': str(session.session_id),
                    'user_id': user_id,
                    'test_id': test_id,
                    'test_type': test_type
                }
            )

            return {
                "sessionId": str(session.session_id),
                "userId": user_id,
                "testId": test_id,
                "testType": test_type,
                "name": name,
                "status": session.status,
                "startedAt": session.started_at.isoformat()
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to create session",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def submit_answer(
        self,
        session_id: str,
        question_id: str,
        answer: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submit an answer for a question.

        Args:
            session_id: Session ID
            question_id: Question ID
            answer: Answer data

        Returns:
            Submission result
        """
        db: Session = SessionLocal()
        try:
            # Verify session exists
            session = db.query(TestSession).filter(
                TestSession.session_id == session_id
            ).first()

            if not session:
                return {"status": "error", "message": "Session not found"}

            if session.status != "IN_PROGRESS":
                return {"status": "error", "message": "Session is not in progress"}

            # Check if answer already exists
            existing = db.query(StudentAnswer).filter(
                StudentAnswer.session_id == session_id,
                StudentAnswer.question_id == question_id
            ).first()

            # Check correctness
            is_correct = None
            selected_option_id = answer.get("selectedOptionId")
            selected_items = answer.get("selectedItems")

            if selected_option_id or selected_items:
                selected_items_json = json.dumps(selected_items) if selected_items else None
                is_correct = 1 if scoring_service.check_answer(
                    question_id,
                    selected_option_id,
                    selected_items_json
                ) else 0

            if existing:
                # Update existing answer
                existing.student_answer = json.dumps(answer)
                existing.is_correct = is_correct
                existing.answered_at = datetime.now()
            else:
                # Create new answer
                student_answer = StudentAnswer(
                    session_id=session_id,
                    question_id=question_id,
                    student_answer=json.dumps(answer),
                    is_correct=is_correct
                )
                db.add(student_answer)

            db.commit()

            logger.info(
                "Answer submitted",
                extra={
                    'session_id': session_id,
                    'question_id': question_id,
                    'is_correct': is_correct
                }
            )

            return {
                "status": "success",
                "message": "Answer submitted successfully",
                "sessionId": session_id,
                "questionId": question_id,
                "isCorrect": is_correct
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to submit answer",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def submit_bulk_responses(self, submission_data) -> Dict[str, Any]:
        """
        Submit all responses at once with scoring.

        Args:
            submission_data: BulkResponseSubmit data

        Returns:
            Submission result with scores
        """
        session_id = str(uuid.uuid4())
        db: Session = SessionLocal()

        try:
            logger.info(
                "Starting bulk response submission",
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
            db.flush()

            # Process each response
            for response_input in submission_data.responses:
                answer_json = {
                    "selectedOptionId": response_input.selectedOptionId,
                    "selectedItems": response_input.selectedItems,
                    "responseTimeMs": response_input.responseTimeMs
                }

                # Check correctness
                is_correct = None
                if response_input.selectedOptionId or response_input.selectedItems:
                    selected_items_json = json.dumps(response_input.selectedItems) if response_input.selectedItems else None
                    is_correct = 1 if scoring_service.check_answer(
                        response_input.questionId,
                        response_input.selectedOptionId,
                        selected_items_json
                    ) else 0

                student_answer = StudentAnswer(
                    session_id=session_id,
                    question_id=response_input.questionId,
                    student_answer=json.dumps(answer_json),
                    is_correct=is_correct
                )
                db.add(student_answer)

            db.commit()

            # Compute scores
            logger.info(f"Computing scores for session {session_id}")
            scores = scoring_service.compute_scores(db, session_id)

            logger.info(
                "Bulk response submission successful",
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
                "Bulk response submission failed",
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

    def complete_session(self, session_id: str) -> Dict[str, Any]:
        """
        Mark a session as completed.

        Args:
            session_id: Session ID

        Returns:
            Completion result
        """
        db: Session = SessionLocal()
        try:
            session = db.query(TestSession).filter(
                TestSession.session_id == session_id
            ).first()

            if not session:
                return {"status": "error", "message": "Session not found"}

            session.status = "COMPLETED"
            session.submitted_at = datetime.now()
            db.commit()

            # Get answer count
            answer_count = db.query(StudentAnswer).filter(
                StudentAnswer.session_id == session_id
            ).count()

            # Compute scores
            scores = scoring_service.compute_scores(db, session_id)

            logger.info(
                "Session completed",
                extra={
                    'session_id': session_id,
                    'answer_count': answer_count
                }
            )

            return {
                "status": "success",
                "message": "Session completed successfully",
                "sessionId": session_id,
                "answersSubmitted": answer_count,
                "completedAt": session.submitted_at.isoformat(),
                "score": scores
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to complete session",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a session with all answers and scores.

        Args:
            session_id: Session ID

        Returns:
            Session data with answers and scores
        """
        db: Session = SessionLocal()
        try:
            session = db.query(TestSession).filter(
                TestSession.session_id == session_id
            ).options(
                joinedload(TestSession.student_answers).joinedload(StudentAnswer.question)
            ).first()

            if not session:
                return None

            # Format answers
            answers = []
            for answer in session.student_answers:
                answer_data = json.loads(answer.student_answer) if answer.student_answer else {}
                answers.append({
                    "answerId": answer.answer_id,
                    "questionId": str(answer.question_id),
                    "answer": answer_data,
                    "isCorrect": answer.is_correct,
                    "answeredAt": answer.answered_at.isoformat() if answer.answered_at else None
                })

            # Get scores
            scores = db.query(CandidateScore).filter(
                CandidateScore.session_id == session_id
            ).all()

            overall_score_record = next((s for s in scores if s.cluster_id is None), None)
            cluster_score_records = [s for s in scores if s.cluster_id is not None]

            # Get cluster names
            cluster_ids = [s.cluster_id for s in cluster_score_records]
            clusters = db.query(Cluster).filter(Cluster.cluster_id.in_(cluster_ids)).all() if cluster_ids else []
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

            # Get test type
            test = db.query(Test).filter(Test.test_id == session.test_id).first() if session.test_id else None

            return {
                "sessionId": str(session.session_id),
                "userId": session.user_id,
                "testId": str(session.test_id) if session.test_id else None,
                "testType": test.test_type if test else "general",
                "name": session.name,
                "status": session.status,
                "startedAt": session.started_at.isoformat() if session.started_at else None,
                "submittedAt": session.submitted_at.isoformat() if session.submitted_at else None,
                "answers": answers,
                "totalAnswers": len(answers),
                "score": score_data
            }

        except Exception as e:
            logger.error(
                "Failed to get session",
                extra={'error': str(e), 'error_type': type(e).__name__, 'session_id': session_id},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all sessions for a user.

        Args:
            user_id: User ID

        Returns:
            List of sessions
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

                # Get test type
                test = db.query(Test).filter(Test.test_id == session.test_id).first() if session.test_id else None

                result.append({
                    "sessionId": str(session.session_id),
                    "userId": session.user_id,
                    "testId": str(session.test_id) if session.test_id else None,
                    "testType": test.test_type if test else "general",
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

    def delete_session(self, session_id: str) -> bool:
        """
        Delete a session and all its answers.

        Args:
            session_id: Session ID

        Returns:
            True if deleted, False if not found
        """
        db: Session = SessionLocal()
        try:
            session = db.query(TestSession).filter(
                TestSession.session_id == session_id
            ).first()

            if not session:
                return False

            # Delete related answers
            db.query(StudentAnswer).filter(
                StudentAnswer.session_id == session_id
            ).delete()

            # Delete related scores
            db.query(CandidateScore).filter(
                CandidateScore.session_id == session_id
            ).delete()

            # Delete session
            db.delete(session)
            db.commit()

            logger.info(
                "Session deleted",
                extra={'session_id': session_id}
            )

            return True

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to delete session",
                extra={
                    'session_id': session_id,
                    'error': str(e),
                    'error_type': type(e).__name__
                },
                exc_info=True
            )
            return False
        finally:
            db.close()


# Singleton instance
assessment_service = AssessmentService()