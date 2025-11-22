"""
Create DB schema inferred from uploaded diagram.

- Uses SQLAlchemy ORM + PostgreSQL
- Expects DATABASE_URL env var (e.g. postgresql+psycopg2://user:pass@host/db)
- Run: python create_schema.py
"""

import os
import sys
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    func,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy import create_engine, Boolean

import uuid

Base = declarative_base()


def gen_uuid():
    return str(uuid.uuid4())


# --- Tables inferred from diagram ---


class Clusters(Base):
    __tablename__ = "clusters"
    cluster_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    cluster_name = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # relationship backrefs from questions if needed:
    questions = relationship("Questions", back_populates="cluster")


class Questions(Base):
    __tablename__ = "questions"
    question_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    image_url = Column(String(255), nullable=True)
    cluster_id = Column(UUID(as_uuid=False), ForeignKey("clusters.cluster_id"), nullable=True)
    question_text = Column(String(250), nullable=False)
    question_description = Column(Text, nullable=True)
    display_order = Column(Integer, nullable=True)
    option_instruction = Column(Text, nullable=True)
    question_type = Column(String(50), nullable=False)  # mcq/mapping/pattern etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    cluster = relationship("Clusters", back_populates="questions")
    options = relationship("ListOptions", back_populates="question", cascade="all, delete-orphan")
    # other relationships (like item pools) can be added as needed


class ItemPools(Base):
    __tablename__ = "item_pools"
    pool_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=True)
    item_text = Column(String(250), nullable=True)
    display_order = Column(Integer, nullable=True)
    group_id = Column(UUID(as_uuid=False), ForeignKey("items_group.group_id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    question = relationship("Questions", backref="item_pools")
    group = relationship("ItemsGroup", back_populates="items")


class ItemsGroup(Base):
    __tablename__ = "items_group"
    group_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    group_name = Column(String(95), nullable=False)
    display_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    items = relationship("ItemPools", back_populates="group")


class ListOptions(Base):
    __tablename__ = "list_options"
    option_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=False)
    option_text = Column(String(250), nullable=False)
    option_image_url = Column(String(255), nullable=True)
    display_order = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    question = relationship("Questions", back_populates="options")


# Tests / test sets tables (diagram shows tests, general_test, missions_test)
class Tests(Base):
    __tablename__ = "tests"
    test_id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    test_name = Column(String(50), nullable=False)
    test_type = Column(String(50), nullable=True)  # e.g., general/mission/etc.
    version = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships:
    general_tests = relationship("GeneralTest", back_populates="test", cascade="all, delete-orphan")
    missions = relationship("MissionsTest", back_populates="test", cascade="all, delete-orphan")


class GeneralTest(Base):
    __tablename__ = "general_test"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=False)
    question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=False)

    test = relationship("Tests", back_populates="general_tests")
    question = relationship("Questions")


class MissionsTest(Base):
    __tablename__ = "missions_test"
    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    test_id = Column(UUID(as_uuid=False), ForeignKey("tests.test_id"), nullable=False)
    primary_question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=True)
    secondary_question_id = Column(UUID(as_uuid=False), ForeignKey("questions.question_id"), nullable=True)

    test = relationship("Tests", back_populates="missions")
    primary_question = relationship("Questions", foreign_keys=[primary_question_id])
    secondary_question = relationship("Questions", foreign_keys=[secondary_question_id])


# create indexes (example)
Index("ix_questions_cluster", Questions.cluster_id)
Index("ix_item_pools_question", ItemPools.question_id)
Index("ix_list_options_question", ListOptions.question_id)
Index("ix_general_test_test", GeneralTest.test_id)
Index("ix_missions_test_test", MissionsTest.test_id)


# --- Create engine and create all tables ---
def main():
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if not DATABASE_URL:
        print("Please set DATABASE_URL environment variable (e.g. postgresql+psycopg2://user:pass@host/db)")
        sys.exit(1)

    engine = create_engine(DATABASE_URL, echo=False)
    Session = sessionmaker(bind=engine)

    print("Creating all tables...")
    Base.metadata.create_all(engine)
    print("Done. Tables created.")


if __name__ == "__main__":
    main()
