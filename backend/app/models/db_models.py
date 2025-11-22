"""
SQLAlchemy ORM models for the STEM assessment database.
Matches the schema with clusters, questions, list_options, tests, general_test, missions_test tables.
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class Cluster(Base):
    """Career clusters table"""
    __tablename__ = "clusters"

    cluster_id = Column(UUID(as_uuid=False), primary_key=True)
    cluster_name = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    questions = relationship("Question", back_populates="cluster")


class Question(Base):
    """Questions table"""
    __tablename__ = "questions"

    question_id = Column(UUID(as_uuid=False), primary_key=True)
    image_url = Column(String(100))
    cluster_id = Column(UUID(as_uuid=False), ForeignKey("clusters.cluster_id"), nullable=False)
    question_text = Column(String(250), nullable=False)
    question_description = Column(Text)
    display_order = Column(Integer)
    option_instruction = Column(Text)
    question_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    cluster = relationship("Cluster", back_populates="questions")
    options = relationship("ListOption", back_populates="question", cascade="all, delete-orphan")


class ListOption(Base):
    """List options for questions"""
    __tablename__ = "list_options"

    option_id = Column(UUID(as_uuid=False), primary_key=True)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=False)
    option_text = Column(String(250))
    option_image_url = Column(Text)
    display_order = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    question = relationship("Question", back_populates="options")


class ItemPool(Base):
    """Item pools for grouping questions"""
    __tablename__ = "item_pools"

    pool_id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=False)
    group_id = Column(UUID(as_uuid=False), nullable=False)
    display_order = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Test(Base):
    """Tests table"""
    __tablename__ = "tests"

    test_id = Column(UUID(as_uuid=False), primary_key=True)
    test_name = Column(String(50), nullable=False)
    test_type = Column(String(50))
    version = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    general_test = relationship("GeneralTest", back_populates="test", uselist=False)
    missions_test = relationship("MissionsTest", back_populates="test", uselist=False)


class GeneralTest(Base):
    """General test details"""
    __tablename__ = "general_test"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    test = relationship("Test", back_populates="general_test")


class MissionsTest(Base):
    """Missions test details"""
    __tablename__ = "missions_test"

    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=False)
    primary_question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"))
    secondary_question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    test = relationship("Test", back_populates="missions_test")
