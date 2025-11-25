"""
SQLAlchemy ORM models for the STEM assessment database.
Includes all models: Cluster, Question, ListOption, ItemPool, ItemsGroup, Test, GeneralTest, MissionsTest, and SubmissionDB.
"""

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Integer,
    Text,
    ForeignKey,
    DateTime,
    Index,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid

from app.core.config import settings

# Create database engine with connection pooling
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def gen_uuid():
    """Generate UUID as string"""
    return str(uuid.uuid4())


# --- Career Assessment Models ---

class Cluster(Base):
    """Career clusters table"""
    __tablename__ = "clusters"

    cluster_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    cluster_name = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    questions = relationship("Question", back_populates="cluster")


class Question(Base):
    """Questions table"""
    __tablename__ = "questions"

    question_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    image_url = Column(String(255), nullable=True)
    cluster_id = Column(UUID(as_uuid=False), ForeignKey("clusters.cluster_id"), nullable=True)
    question_text = Column(String(250), nullable=False)
    question_description = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=True)
    option_instruction = Column(Text, nullable=True)
    question_type = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    cluster = relationship("Cluster", back_populates="questions")
    options = relationship("ListOption", back_populates="question", cascade="all, delete-orphan")


class ListOption(Base):
    """List options for questions"""
    __tablename__ = "list_options"

    option_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=False)
    option_text = Column(String(250), nullable=True)  # Allow NULL for image-only options
    option_image_url = Column(String(255), nullable=True)
    display_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    question = relationship("Question", back_populates="options")


class ItemsGroup(Base):
    """Items group for organizing item pools"""
    __tablename__ = "items_group"

    group_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    group_name = Column(String(95), nullable=False)
    display_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    items = relationship("ItemPool", back_populates="group")


class ItemPool(Base):
    """Item pools for grouping questions"""
    __tablename__ = "item_pools"

    pool_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=True)
    item_text = Column(String(250), nullable=True)
    display_order = Column(Integer, nullable=True)
    group_id = Column(UUID(as_uuid=False), ForeignKey("items_group.group_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    question = relationship("Question", backref="item_pools")
    group = relationship("ItemsGroup", back_populates="items")


class Test(Base):
    """Tests table"""
    __tablename__ = "tests"

    test_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    test_name = Column(String(50), nullable=False)
    test_type = Column(String(50), nullable=True)
    version = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    general_tests = relationship("GeneralTest", back_populates="test", cascade="all, delete-orphan")
    missions = relationship("MissionsTest", back_populates="test", cascade="all, delete-orphan")


class GeneralTest(Base):
    """General test details"""
    __tablename__ = "general_test"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=False)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=False)

    # Relationships
    test = relationship("Test", back_populates="general_tests")
    question = relationship("Question")


class MissionsTest(Base):
    """Missions test details"""
    __tablename__ = "missions_test"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=False)
    primary_question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=True)
    secondary_question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=True)

    # Relationships
    test = relationship("Test", back_populates="missions")
    primary_question = relationship("Question", foreign_keys=[primary_question_id])
    secondary_question = relationship("Question", foreign_keys=[secondary_question_id])


# --- User Submission and Response Models ---

class TestSession(Base):
    """Test sessions for tracking user test attempts"""
    __tablename__ = "test_sessions"

    session_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(String, nullable=False)
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=True)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="IN_PROGRESS")  # IN_PROGRESS, SUBMITTED, COMPLETED
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    test = relationship("Test")
    student_answers = relationship("StudentAnswer", back_populates="session", cascade="all, delete-orphan")
    scores = relationship("CandidateScore", back_populates="session", cascade="all, delete-orphan")


class StudentAnswer(Base):
    """Student answers for each question in a test session"""
    __tablename__ = "student_answers"

    answer_id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(UUID(as_uuid=False), ForeignKey("test_sessions.session_id"), nullable=False)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=False)
    student_answer = Column(Text, nullable=False)  # JSON stored as text
    is_correct = Column(Integer, nullable=True)  # 1 = true, 0 = false, NULL = not graded
    answered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session = relationship("TestSession", back_populates="student_answers")
    question = relationship("Question")


# Legacy submission model (kept for backward compatibility)
class SubmissionDB(Base):
    """Legacy user test submissions"""
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, nullable=False)
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=True)
    created_at = Column(String, nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="SUBMITTED")
    responses = Column(Text, nullable=False)  # Store JSON as text
    submitted_at = Column(DateTime, nullable=False, default=datetime.now)

    # Relationships
    test = relationship("Test")


class CandidateScore(Base):
    """Computed scores for test sessions"""
    __tablename__ = "candidate_scores"

    score_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    session_id = Column(UUID(as_uuid=False), ForeignKey("test_sessions.session_id"), nullable=False)
    cluster_id = Column(UUID(as_uuid=False), ForeignKey("clusters.cluster_id"), nullable=True)
    total_questions = Column(Integer, nullable=False, default=0)
    correct_answers = Column(Integer, nullable=False, default=0)
    incorrect_answers = Column(Integer, nullable=False, default=0)
    unanswered = Column(Integer, nullable=False, default=0)
    score_percentage = Column(Integer, nullable=True)  # Percentage score (0-100)
    cluster_score = Column(Integer, nullable=True)  # Cluster-specific score
    computed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    session = relationship("TestSession", back_populates="scores")
    cluster = relationship("Cluster")


# --- Indexes and Constraints for performance ---
Index("ix_questions_cluster", Question.cluster_id)
Index("ix_item_pools_question", ItemPool.question_id)
Index("ix_list_options_question", ListOption.question_id)
Index("ix_general_test_test", GeneralTest.test_id)
Index("ix_missions_test_test", MissionsTest.test_id)
Index("ix_test_sessions_user", TestSession.user_id)
Index("ix_student_answers_session", StudentAnswer.session_id)
Index("ix_student_answers_question", StudentAnswer.question_id)
Index("ix_student_answers_unique", StudentAnswer.session_id, StudentAnswer.question_id, unique=True)
Index("ix_candidate_scores_session", CandidateScore.session_id)
Index("ix_candidate_scores_cluster", CandidateScore.cluster_id)


# --- Database utilities ---

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()