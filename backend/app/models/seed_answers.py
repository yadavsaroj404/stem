#!/usr/bin/env python3
"""
Seed correct answers from answers.json into the correct_answers table.

Usage:
export DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
python -m app.models.seed_answers --answers app/data/answers.json
"""

import argparse
import json
import os
import sys
import uuid

from sqlalchemy import create_engine, MetaData, select, insert
from sqlalchemy.exc import SQLAlchemyError


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def upsert_row(conn, table, pkcolumn, pkvalue, rowdict):
    """Insert row if not exists, return True if inserted"""
    s = select(table.c[pkcolumn]).where(table.c[pkcolumn] == pkvalue)
    r = conn.execute(s).first()
    if r:
        return False
    ins = insert(table).values(**rowdict)
    conn.execute(ins)
    return True


def main():
    ap = argparse.ArgumentParser(description="Seed correct answers from JSON file")
    ap.add_argument("--answers", required=True, help="Path to answers.json file")
    args = ap.parse_args()

    # DATABASE_URL = os.environ.get("DATABASE_URL")
    DATABASE_URL = "postgresql://postgres.wyfwogtrghawhpmbwpmu:RRWBkRgxocmYDSqN@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"
    if not DATABASE_URL:
        print("Please export DATABASE_URL first.")
        sys.exit(1)

    engine = create_engine(DATABASE_URL)
    meta = MetaData()
    try:
        meta.reflect(bind=engine)
    except Exception as e:
        print("Failed to reflect database schema:", e)
        sys.exit(1)

    # Get correct_answers table
    if "answers" not in meta.tables:
        print("[ERROR] correct_answers table not found in database.")
        sys.exit(1)

    correct_answers_table = meta.tables["answers"]
    
    # if "correct_answers" not in meta.tables:
    #     print("[ERROR] correct_answers table not found in database.")
    #     sys.exit(1)

    # correct_answers_table = meta.tables["correct_answers"]

    # Load answers data
    answers_data = load_json(args.answers)

    print(f"{'='*60}")
    print(f"Seeding Correct Answers")
    print(f"{'='*60}")
    print(f"Answers Count: {len(answers_data)}")
    print(f"{'='*60}\n")

    with engine.begin() as conn:
        inserted = 0
        skipped = 0

        for item in answers_data:
            question_id = item.get("questionId")
            selected_option = item.get("selectedOption")

            if not question_id or not selected_option:
                print(f"[WARN] Skipping invalid entry: {item}")
                continue

            row = {
                "_id": str(uuid.uuid4()),
                "question_id": question_id,
                "correct_answer": selected_option,
            }

            try:
                # Check if answer already exists for this question
                s = select(correct_answers_table.c._id).where(
                    correct_answers_table.c.question_id == question_id
                )
                existing = conn.execute(s).first()

                if existing:
                    skipped += 1
                else:
                    ins = insert(correct_answers_table).values(**row)
                    conn.execute(ins)
                    inserted += 1
                    print(f"[+] Inserted answer for question: {question_id[:8]}...")

            except SQLAlchemyError as e:
                print(f"[!] Error inserting answer for {question_id}: {e}")

    print(f"\n{'='*60}")
    print(f"Seeding Complete!")
    print(f"{'='*60}")
    print(f"  Inserted: {inserted}")
    print(f"  Skipped (already exist): {skipped}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
