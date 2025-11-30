"""
Scoring service for evaluating candidate responses and computing scores.
Handles answer validation, scoring computation, and cluster-level analysis.
"""

import json
import os
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from app.core.logging import get_logger
from app.models.database import (
    SubmissionDB,
    StudentAnswer,
    CandidateScore,
    Question,
    Answer,
    Cluster,
    TestSession,
    ListOption,
    ItemPool,
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

    # Only method that is in used in this application rest are there but unused
    def calculate_scores_from_responses(self, db: Session, responses: List[Dict]) -> Dict[str, int]:
        """
        Calculate cluster scores directly from a list of responses without a session.

        Args:
            db: Database session
            responses: List of response dicts with questionId, answer

        Returns:
            Dictionary with cluster IDs as keys and scores as values
        """
        cluster_stats = {}  # {cluster_id: {"correct": 0, "total": 0}}

        for response in responses:
            question_id = response.questionId
            answer_value = response.selectedOption

            question = db.query(Question).filter(Question.question_id == question_id).first()

            if not question or not question.cluster_id:
                continue

            cluster_id = str(question.cluster_id)
            if cluster_id not in cluster_stats:
                cluster_stats[cluster_id] = {"correct": 0, "total": 0}

            cluster_stats[cluster_id]["total"] += 1

            # Simple correctness check (assumes single correct answer)
            # This might need to be more complex based on question type
            correct_answer_record = db.query(Answer).filter(Answer.question_id == question_id).first()
            if correct_answer_record and answer_value == correct_answer_record.correct_answer:
                cluster_stats[cluster_id]["correct"] += 1

        # Calculate final scores
        cluster_scores = {}
        for cluster_id, stats in cluster_stats.items():
            score = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
            cluster_scores[cluster_id] = int(score)

        return cluster_scores

    def get_selected_answers(self, db: Session, submission_id: str) -> Dict[str, Any]:
        """
        Retrieves and formats the selected answers for a given submission,
        comparing them against correct answers and structuring the output by cluster.
        """
        submission = db.query(SubmissionDB).filter(SubmissionDB._id == submission_id).first()

        if not submission:
            return {"error": "Submission not found"}

        responses = json.loads(submission.responses)
        
        clusters_data = {}

        for response in responses:
            question_id = response.get("questionId")
            user_answer_str = response.get("selectedOption")

            question = db.query(Question).options(
                joinedload(Question.cluster),
                joinedload(Question.options),
                joinedload(Question.item_pools).joinedload(ItemPool.group)
            ).filter(Question.question_id == question_id).first()
            
            if not question:
                continue

            # Get correct answer from the Answer table
            correct_answer_record = db.query(Answer).filter(Answer.question_id == question_id).first()
            correct_answer_str = correct_answer_record.correct_answer if correct_answer_record else ""

            # Initialize cluster if not present
            cluster_id = str(question.cluster.cluster_id)
            if cluster_id not in clusters_data:
                clusters_data[cluster_id] = {
                    "clusterId": cluster_id,
                    "score": 0,
                    "clusterName": question.cluster.cluster_name,
                    "questionCount": 0,
                    "questions": []
                }
            
            clusters_data[cluster_id]["questionCount"] += 1

            # Determine correctness
            is_correct = self._compare_answers(question.question_type, user_answer_str, correct_answer_str)
            if is_correct:
                clusters_data[cluster_id]["score"] += 1

            # Format answers into human-readable text
            formatted_user_answer = self._format_answer_text(db, question, user_answer_str)
            formatted_correct_answer = self._format_answer_text(db, question, correct_answer_str)

            clusters_data[cluster_id]["questions"].append({
                "questionId": question_id,
                "questionType": question.question_type,
                "questionText": question.question_text,
                "selectedOption": formatted_user_answer,
                "correct_option": formatted_correct_answer,
                "isCorrect": is_correct,
                "pointsAwarded": 1 if is_correct else 0,
            })

        return {
            "submission_id": submission_id,
            "submittedAt": submission.submitted_at.isoformat(),
            "clusters": list(clusters_data.values())
        }

    def _compare_answers(self, q_type: str, user_answer: str, correct_answer: str) -> bool:
        """Compares user's answer with the correct answer based on question type."""
        if user_answer is None or correct_answer is None:
            return False

        if q_type in ['text', 'text-image']:
            return user_answer == correct_answer
        
        if q_type == 'multi-select':
            user_options = set(user_answer.split(';'))
            correct_options = set(correct_answer.split(';'))
            return user_options == correct_options

        if q_type in ['mapping', 'group']:
            user_pairs = set(user_answer.split(';'))
            correct_pairs = set(correct_answer.split(';'))
            return user_pairs == correct_pairs

        if q_type == 'matching':
            # Matching uses different separator format
            user_pairs = set(user_answer.replace('->', '-').split(';'))
            correct_pairs = set(correct_answer.replace('->', '-').split(';'))
            return user_pairs == correct_pairs
            
        return False

    def _format_answer_text(self, db: Session, question: Question, answer_str: str) -> str:
        """Converts an answer string of IDs into a human-readable text representation."""
        if not answer_str:
            return ""

        q_type = question.question_type

        if q_type in ['text', 'text-image']:
            option = db.query(ListOption).filter(ListOption.option_id == answer_str).first()
            return option.option_text if option else "N/A"

        if q_type == 'multi-select':
            option_ids = answer_str.split(';')
            options = db.query(ListOption).filter(ListOption.option_id.in_(option_ids)).all()
            return '; '.join(sorted([opt.option_text for opt in options]))

        if q_type in ['mapping', 'group']:
            text_pairs = []
            pairs = answer_str.split(';')
            all_item_ids = [p.split('->')[0] for p in pairs if '->' in p] + [p.split('->')[1] for p in pairs if '->' in p]

            items = db.query(ItemPool).filter(ItemPool.pool_id.in_(all_item_ids)).all()
            item_map = {str(item.pool_id): item.item_text for item in items}

            for pair in pairs:
                if '->' in pair:
                    left_id, right_id = pair.split('->')
                    left_text = item_map.get(left_id, "N/A")
                    right_text = item_map.get(right_id, "N/A")
                    text_pairs.append(f"{left_text} -> {right_text}")
            return '; '.join(sorted(text_pairs))

        if q_type == 'matching':
            # Matching questions are image-based, return formatted pair indicators
            pairs = answer_str.split(';')
            formatted_pairs = []
            for i, pair in enumerate(pairs, 1):
                formatted_pairs.append(f"Match {i}")
            return '; '.join(formatted_pairs)

        if q_type == 'rank':
            option_ids = answer_str.split(';')
            options = db.query(ListOption).filter(ListOption.option_id.in_(option_ids)).all()
            option_map = {str(opt.option_id): opt.option_text for opt in options}
            # Preserve order (don't sort like multi-select)
            return '; '.join([option_map.get(oid, "N/A") for oid in option_ids])

        return answer_str
# Singleton instance
scoring_service = ScoringService()