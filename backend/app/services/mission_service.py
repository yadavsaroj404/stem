"""
Mission Service for handling Mission-type tests.
Missions have two questions per item: a primary question and a secondary question.
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
    TestSession,
    StudentAnswer,
    ItemPool,
    ItemsGroup,
)

logger = get_logger(__name__)


class MissionService:
    """Service for handling Mission-type test operations"""

    def __init__(self):
        logger.info("Initializing MissionService with database support")

    def get_mission_test(self, test_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get a mission test with all its questions.

        Each mission has:
        - primary_question: The main question
        - secondary_question: The follow-up/secondary question

        Args:
            test_id: Optional test ID. If not provided, gets the first missions test.

        Returns:
            Dictionary containing test info and mission questions
        """
        db: Session = SessionLocal()
        try:
            # Get the test
            if test_id:
                test = db.query(Test).filter(
                    Test.test_id == test_id,
                    Test.test_type == "missions"
                ).first()
            else:
                test = db.query(Test).filter(Test.test_type == "missions").first()

            if not test:
                logger.warning("No missions test found", extra={'test_id': test_id})
                return None

            # Get all missions for this test with eager loading
            missions = db.query(MissionsTest).filter(
                MissionsTest.test_id == test.test_id
            ).options(
                joinedload(MissionsTest.primary_question).joinedload(Question.options),
                joinedload(MissionsTest.primary_question).joinedload(Question.cluster),
                joinedload(MissionsTest.secondary_question).joinedload(Question.options),
                joinedload(MissionsTest.secondary_question).joinedload(Question.cluster),
            ).all()

            # Format missions
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

        except Exception as e:
            logger.error(
                "Failed to fetch mission test",
                extra={'error': str(e), 'error_type': type(e).__name__, 'test_id': test_id},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def _format_question(self, question: Question) -> Dict[str, Any]:
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

        # Check for item pools (for mapping/grouping questions)
        if hasattr(question, 'item_pools') and question.item_pools:
            items_by_group = {}
            for item in question.item_pools:
                group_id = str(item.group_id) if item.group_id else "default"
                if group_id not in items_by_group:
                    items_by_group[group_id] = {
                        "groupId": group_id,
                        "groupName": item.group.group_name if item.group else None,
                        "items": []
                    }
                items_by_group[group_id]["items"].append({
                    "_id": str(item.pool_id),
                    "text": item.item_text,
                    "displayOrder": item.display_order
                })
            formatted_q["itemGroups"] = list(items_by_group.values())

        return formatted_q

    def get_all_mission_tests(self, filter_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all mission-type tests.

        Args:
            filter_name: Optional filter by test name

        Returns:
            List of mission tests
        """
        db: Session = SessionLocal()
        try:
            query = db.query(Test).filter(Test.test_type == "missions")

            if filter_name:
                query = query.filter(Test.test_name.ilike(f"%{filter_name}%"))

            tests = query.all()

            result = []
            for test in tests:
                test_data = self.get_mission_test(str(test.test_id))
                if test_data:
                    result.append(test_data)

            return result

        except Exception as e:
            logger.error(
                "Failed to fetch mission tests",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def get_mission_by_id(self, mission_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a single mission by its ID.

        Args:
            mission_id: The mission ID

        Returns:
            Mission data with primary and secondary questions
        """
        db: Session = SessionLocal()
        try:
            mission = db.query(MissionsTest).filter(
                MissionsTest.id == mission_id
            ).options(
                joinedload(MissionsTest.primary_question).joinedload(Question.options),
                joinedload(MissionsTest.secondary_question).joinedload(Question.options),
            ).first()

            if not mission:
                return None

            return {
                "_id": str(mission.id),
                "testId": str(mission.test_id),
                "primaryQuestion": self._format_question(mission.primary_question) if mission.primary_question else None,
                "secondaryQuestion": self._format_question(mission.secondary_question) if mission.secondary_question else None,
            }

        except Exception as e:
            logger.error(
                "Failed to fetch mission",
                extra={'error': str(e), 'error_type': type(e).__name__, 'mission_id': mission_id},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def create_mission_session(
        self,
        user_id: str,
        test_id: str,
        name: str
    ) -> Dict[str, Any]:
        """
        Create a new test session for a mission test.

        Args:
            user_id: User ID
            test_id: Test ID
            name: Session name

        Returns:
            Session info
        """
        db: Session = SessionLocal()
        try:
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
                "Mission session created",
                extra={
                    'session_id': str(session.session_id),
                    'user_id': user_id,
                    'test_id': test_id
                }
            )

            return {
                "sessionId": str(session.session_id),
                "userId": user_id,
                "testId": test_id,
                "name": name,
                "status": session.status,
                "startedAt": session.started_at.isoformat()
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to create mission session",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def submit_mission_answer(
        self,
        session_id: str,
        question_id: str,
        answer: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submit an answer for a mission question.

        Args:
            session_id: Session ID
            question_id: Question ID (can be primary or secondary)
            answer: Answer data (selectedOptionId or selectedItems)

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

            # Check if answer already exists for this question
            existing = db.query(StudentAnswer).filter(
                StudentAnswer.session_id == session_id,
                StudentAnswer.question_id == question_id
            ).first()

            if existing:
                # Update existing answer
                existing.student_answer = json.dumps(answer)
                existing.answered_at = datetime.now()
            else:
                # Create new answer
                student_answer = StudentAnswer(
                    session_id=session_id,
                    question_id=question_id,
                    student_answer=json.dumps(answer)
                )
                db.add(student_answer)

            db.commit()

            logger.info(
                "Mission answer submitted",
                extra={
                    'session_id': session_id,
                    'question_id': question_id
                }
            )

            return {
                "status": "success",
                "message": "Answer submitted successfully",
                "sessionId": session_id,
                "questionId": question_id
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to submit mission answer",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def complete_mission_session(self, session_id: str) -> Dict[str, Any]:
        """
        Mark a mission session as completed.

        Args:
            session_id: Session ID

        Returns:
            Completion result with summary
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

            logger.info(
                "Mission session completed",
                extra={
                    'session_id': session_id,
                    'answer_count': answer_count
                }
            )

            return {
                "status": "success",
                "message": "Mission completed successfully",
                "sessionId": session_id,
                "answersSubmitted": answer_count,
                "completedAt": session.submitted_at.isoformat()
            }

        except Exception as e:
            db.rollback()
            logger.error(
                "Failed to complete mission session",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )
            raise
        finally:
            db.close()

    def get_mission_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a mission session with all answers.

        Args:
            session_id: Session ID

        Returns:
            Session data with answers
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

            answers = []
            for answer in session.student_answers:
                answers.append({
                    "questionId": str(answer.question_id),
                    "answer": json.loads(answer.student_answer) if answer.student_answer else None,
                    "answeredAt": answer.answered_at.isoformat() if answer.answered_at else None
                })

            return {
                "sessionId": str(session.session_id),
                "userId": session.user_id,
                "testId": str(session.test_id) if session.test_id else None,
                "name": session.name,
                "status": session.status,
                "startedAt": session.started_at.isoformat() if session.started_at else None,
                "submittedAt": session.submitted_at.isoformat() if session.submitted_at else None,
                "answers": answers,
                "totalAnswers": len(answers)
            }

        except Exception as e:
            logger.error(
                "Failed to get mission session",
                extra={'error': str(e), 'error_type': type(e).__name__, 'session_id': session_id},
                exc_info=True
            )
            raise
        finally:
            db.close()


# Singleton instance
mission_service = MissionService()
