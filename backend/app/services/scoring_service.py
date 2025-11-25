"""
Scoring service for evaluating candidate responses and computing scores.
Handles answer validation, scoring computation, and cluster-level analysis.
"""

import json
import os
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.core.logging import get_logger
from app.models.database import (
    StudentAnswer,
    CandidateScore,
    Question,
    Cluster,
    TestSession,
)

logger = get_logger(__name__)


class ScoringService:
    """Service for scoring candidate responses"""

    def __init__(self):
        self.correct_answers: Dict[str, str] = {}
        self._load_correct_answers()

    def _load_correct_answers(self):
        """Load correct answers from answers.json file"""
        try:
            answers_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data",
                "answers.json"
            )

            if os.path.exists(answers_path):
                with open(answers_path, 'r') as f:
                    self.correct_answers = json.load(f)
                logger.info(f"Loaded {len(self.correct_answers)} correct answers from answers.json")
            else:
                logger.warning(f"answers.json not found at {answers_path}")
        except Exception as e:
            logger.error(
                "Failed to load correct answers",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )

    def check_answer(self, question_id: str, selected_option_id: Optional[str],
                     selected_items: Optional[str] = None) -> bool:
        """
        Check if an answer is correct

        Args:
            question_id: The question ID
            selected_option_id: The selected option ID (for MCQ)
            selected_items: JSON string of selected items (for mapping/pattern questions)

        Returns:
            True if correct, False otherwise
        """
        if question_id not in self.correct_answers:
            logger.warning(f"No correct answer found for question {question_id}")
            return False

        correct_answer = self.correct_answers[question_id]

        # For mapping/pattern questions (multiple selections)
        if selected_items:
            try:
                selected_list = json.loads(selected_items) if isinstance(selected_items, str) else selected_items
                # Normalize the format and compare
                selected_str = ";".join(sorted(selected_list))
                correct_str = correct_answer
                return selected_str == correct_str
            except Exception as e:
                logger.error(f"Error comparing mapping answer: {e}")
                return False

        # For MCQ questions (single selection)
        if selected_option_id:
            return selected_option_id == correct_answer

        return False

    def compute_scores(self, db: Session, session_id: str) -> Dict:
        """
        Compute scores for a test session

        Args:
            db: Database session
            session_id: The session ID to compute scores for

        Returns:
            Dictionary with overall and cluster-level scores
        """
        logger.info(f"Computing scores for session {session_id}")

        # Get all answers for this session
        answers = db.query(StudentAnswer).filter(
            StudentAnswer.session_id == session_id
        ).all()

        if not answers:
            logger.warning(f"No answers found for session {session_id}")
            return {
                "overallScore": 0,
                "totalQuestions": 0,
                "correctAnswers": 0,
                "incorrectAnswers": 0,
                "unanswered": 0,
                "clusterScores": []
            }

        # Get all questions to determine clusters
        question_ids = [a.question_id for a in answers]
        questions = db.query(Question).filter(Question.question_id.in_(question_ids)).all()
        question_map = {str(q.question_id): q for q in questions}

        # Track overall stats
        total_questions = len(answers)
        correct_answers = sum(1 for a in answers if a.is_correct == 1)
        incorrect_answers = sum(1 for a in answers if a.is_correct == 0)
        unanswered = sum(1 for a in answers if a.is_correct is None)

        overall_score = (correct_answers / total_questions * 100) if total_questions > 0 else 0

        # Compute cluster-level scores
        cluster_stats: Dict[str, Dict] = {}
        for answer in answers:
            question = question_map.get(str(answer.question_id))
            if not question or not question.cluster_id:
                continue

            cluster_id = str(question.cluster_id)
            if cluster_id not in cluster_stats:
                cluster_stats[cluster_id] = {
                    "total": 0,
                    "correct": 0,
                    "incorrect": 0,
                    "unanswered": 0
                }

            cluster_stats[cluster_id]["total"] += 1
            if answer.is_correct == 1:
                cluster_stats[cluster_id]["correct"] += 1
            elif answer.is_correct == 0:
                cluster_stats[cluster_id]["incorrect"] += 1
            else:
                cluster_stats[cluster_id]["unanswered"] += 1

        # Delete existing scores for this session
        db.query(CandidateScore).filter(
            CandidateScore.session_id == session_id
        ).delete()

        # Save cluster scores to database
        cluster_scores_list = []
        for cluster_id, stats in cluster_stats.items():
            score_percentage = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0

            cluster_score = CandidateScore(
                session_id=session_id,
                cluster_id=cluster_id,
                total_questions=stats["total"],
                correct_answers=stats["correct"],
                incorrect_answers=stats["incorrect"],
                unanswered=stats["unanswered"],
                score_percentage=int(score_percentage),
                cluster_score=stats["correct"]
            )
            db.add(cluster_score)
            cluster_scores_list.append({
                "clusterId": cluster_id,
                "totalQuestions": stats["total"],
                "correctAnswers": stats["correct"],
                "incorrectAnswers": stats["incorrect"],
                "unanswered": stats["unanswered"],
                "scorePercentage": score_percentage
            })

        # Save overall score
        overall_score_record = CandidateScore(
            session_id=session_id,
            cluster_id=None,  # NULL for overall score
            total_questions=total_questions,
            correct_answers=correct_answers,
            incorrect_answers=incorrect_answers,
            unanswered=unanswered,
            score_percentage=int(overall_score),
            cluster_score=correct_answers
        )
        db.add(overall_score_record)

        db.commit()

        logger.info(
            f"Scores computed for session {session_id}",
            extra={
                "overall_score": overall_score,
                "total_questions": total_questions,
                "correct_answers": correct_answers
            }
        )

        return {
            "overallScore": overall_score,
            "totalQuestions": total_questions,
            "correctAnswers": correct_answers,
            "incorrectAnswers": incorrect_answers,
            "unanswered": unanswered,
            "clusterScores": cluster_scores_list
        }


# Singleton instance
scoring_service = ScoringService()
