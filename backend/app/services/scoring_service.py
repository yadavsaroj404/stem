"""
Scoring service for evaluating candidate responses and computing scores.
Handles answer validation, scoring computation, and cluster-level analysis.
"""

import json
import os
from typing import Any, Dict, List, Optional, Tuple
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
        self.pathways: Dict[str, Dict] = {}
        self._load_correct_answers()
        self._load_pathways()

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
                    answers_data = json.load(f)

                # Handle both array format and dict format
                if isinstance(answers_data, list):
                    # Convert array format to dict: {questionId: selectedOption}
                    for item in answers_data:
                        qid = item.get("questionId", "")
                        selected = item.get("selectedOption", "")
                        # Store with both hyphenated and non-hyphenated keys
                        self.correct_answers[qid] = selected
                        self.correct_answers[qid.replace("-", "")] = selected
                else:
                    # Already in dict format
                    self.correct_answers = answers_data

                logger.info(f"Loaded {len(self.correct_answers)} correct answers from answers.json")
            else:
                logger.warning(f"answers.json not found at {answers_path}")
        except Exception as e:
            logger.error(
                "Failed to load correct answers",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )

    def _load_pathways(self):
        """Load pathway details from pathways.json file"""
        try:
            pathways_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data",
                "pathways.json"
            )

            if os.path.exists(pathways_path):
                with open(pathways_path, 'r') as f:
                    self.pathways = json.load(f)
                logger.info(f"Loaded {len(self.pathways)} pathway definitions from pathways.json")
            else:
                logger.warning(f"pathways.json not found at {pathways_path}")
        except Exception as e:
            logger.error(
                "Failed to load pathways",
                extra={'error': str(e), 'error_type': type(e).__name__},
                exc_info=True
            )

    def check_answer(self, question_id: str, selected_option_id: Optional[str],
                     selected_items: Optional[str] = None) -> bool:
        """
        Check if an answer is correct.

        Handles different question types:
        - text: Single option ID comparison
        - rank: Ordered list of option IDs (order matters!)
        - group: Pairs of groupId-selectedOptionId (order matters!)
        - matching: Pairs of leftItemId-rightItemId (order matters!)
        - multi-select: Multiple option IDs (order doesn't matter)

        Args:
            question_id: The question ID (with or without hyphens)
            selected_option_id: The selected option ID (for single-selection MCQ)
            selected_items: JSON string of selected items (for multi-selection questions)

        Returns:
            True if correct, False otherwise
        """
        # Normalize question_id (remove hyphens for lookup)
        normalized_qid = question_id.replace("-", "")

        if normalized_qid not in self.correct_answers:
            # Also try with original format
            if question_id not in self.correct_answers:
                logger.warning(f"No correct answer found for question {question_id}")
                return False
            correct_answer = self.correct_answers[question_id]
        else:
            correct_answer = self.correct_answers[normalized_qid]

        # For single-selection MCQ questions
        if selected_option_id:
            # Normalize for comparison
            selected_normalized = selected_option_id.replace("->", "")
            correct_normalized = correct_answer.replace("->", "")
            return selected_normalized == correct_normalized

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

    def compute_scores_from_submission(self, db: Session, submission_id: str, responses: List[Dict]) -> Dict:
        """
        Compute scores from submission responses array.

        Args:
            db: Database session
            submission_id: The submission ID
            responses: List of response dicts with questionId, selectedOption, isCorrect

        Returns:
            Dictionary with overall and cluster-level scores
        """
        logger.info(f"Computing scores for submission {submission_id}")

        if not responses:
            logger.warning(f"No responses found for submission {submission_id}")
            return {
                "overallScore": 0,
                "totalQuestions": 0,
                "correctAnswers": 0,
                "incorrectAnswers": 0,
                "unanswered": 0,
                "clusterScores": []
            }

        # Get all questions to determine clusters
        question_ids = [r["questionId"] for r in responses]
        questions = db.query(Question).filter(Question.question_id.in_(question_ids)).all()
        question_map = {str(q.question_id): q for q in questions}

        # Track overall stats
        total_questions = len(responses)
        correct_count = sum(1 for r in responses if r.get("isCorrect") is True)
        incorrect_count = sum(1 for r in responses if r.get("isCorrect") is False)
        unanswered = sum(1 for r in responses if r.get("isCorrect") is None)

        overall_score = (correct_count / total_questions * 100) if total_questions > 0 else 0

        # Compute cluster-level scores
        cluster_stats: Dict[str, Dict] = {}
        for response in responses:
            question = question_map.get(str(response["questionId"]))
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
            if response.get("isCorrect") is True:
                cluster_stats[cluster_id]["correct"] += 1
            elif response.get("isCorrect") is False:
                cluster_stats[cluster_id]["incorrect"] += 1
            else:
                cluster_stats[cluster_id]["unanswered"] += 1

        # Delete existing scores for this submission
        db.query(CandidateScore).filter(
            CandidateScore.submission_id == submission_id
        ).delete()

        # Save cluster scores to database
        cluster_scores_list = []
        for cluster_id, stats in cluster_stats.items():
            score_percentage = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0

            cluster_score = CandidateScore(
                submission_id=submission_id,
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
            submission_id=submission_id,
            cluster_id=None,  # NULL for overall score
            total_questions=total_questions,
            correct_answers=correct_count,
            incorrect_answers=incorrect_count,
            unanswered=unanswered,
            score_percentage=int(overall_score),
            cluster_score=correct_count
        )
        db.add(overall_score_record)

        db.commit()

        logger.info(
            f"Scores computed for submission {submission_id}",
            extra={
                "overall_score": overall_score,
                "total_questions": total_questions,
                "correct_answers": correct_count
            }
        )

        return {
            "overallScore": overall_score,
            "totalQuestions": total_questions,
            "correctAnswers": correct_count,
            "incorrectAnswers": incorrect_count,
            "unanswered": unanswered,
            "clusterScores": cluster_scores_list
        }

    def _normalize_uuid(self, uuid_str: str) -> str:
        """Convert UUID to hyphenated format if it isn't already"""
        clean = uuid_str.replace("-", "")
        if len(clean) == 32:
            return f"{clean[:8]}-{clean[8:12]}-{clean[12:16]}-{clean[16:20]}-{clean[20:]}"
        return uuid_str

    def get_top_clusters(self, db: Session, submission_id: str) -> List[Dict[str, Any]]:
        """
        Get top 3 clusters based on correct answers count with full pathway details.

        Args:
            db: Database session
            submission_id: The submission ID

        Returns:
            List of pathway dictionaries for primary, secondary, and tertiary
        """
        # Get cluster scores for this submission (excluding overall score where cluster_id is NULL)
        cluster_scores = db.query(CandidateScore).filter(
            CandidateScore.submission_id == submission_id,
            CandidateScore.cluster_id.isnot(None)
        ).order_by(CandidateScore.correct_answers.desc()).all()

        pathway_names = ["Primary", "Secondary", "Tertiary"]
        pathway_tags = ["Your Primary Pathway", "Your Secondary Pathway", "Your Tertiary Pathway"]

        pathways = []

        for i, score in enumerate(cluster_scores[:3]):
            cluster_id = str(score.cluster_id)
            # Try both hyphenated and non-hyphenated formats for pathway lookup
            pathway_data = self.pathways.get(cluster_id, {})
            if not pathway_data:
                # Try normalized (hyphenated) format
                normalized_id = self._normalize_uuid(cluster_id)
                pathway_data = self.pathways.get(normalized_id, {})

            pathway = {
                "pathname": pathway_names[i] if i < len(pathway_names) else f"Pathway {i+1}",
                "tag": pathway_tags[i] if i < len(pathway_tags) else f"Your Pathway {i+1}",
                "careerImage": pathway_data.get("careerImage", ""),
                "title": pathway_data.get("title", ""),
                "subtitle": pathway_data.get("subtitle", ""),
                "description": pathway_data.get("description", ""),
                "skills": pathway_data.get("skills", []),
                "subjects": pathway_data.get("subjects", []),
                "careers": pathway_data.get("careers", []),
                "tryThis": pathway_data.get("tryThis", "")
            }
            pathways.append(pathway)

        logger.info(
            f"Top pathways computed for submission {submission_id}",
            extra={
                "pathway_count": len(pathways),
                "primary": pathways[0]["title"] if len(pathways) > 0 else None,
                "secondary": pathways[1]["title"] if len(pathways) > 1 else None,
                "tertiary": pathways[2]["title"] if len(pathways) > 2 else None
            }
        )

        return pathways


# Singleton instance
scoring_service = ScoringService()