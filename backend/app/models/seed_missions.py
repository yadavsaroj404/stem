#!/usr/bin/env python3
"""
Seed Missions data from JSON file:
- missions-test-questions.json -> tests + questions + list_options + missions_test tables

The missions JSON can have two formats:

Format 1 (Array of missions):
[
    {
        "name": "Mission 1",
        "primaryQuestion": {...},
        "secondaryQuestion": {...}
    }
]

Format 2 (Object with metadata):
{
    "_id": "test-uuid",
    "name": "Missions Test",
    "version": "1.0.0",
    "missions": [...]
}

Usage:
export DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres"
python -m app.models.seed_missions --missions app/data/missions-test-questions.json
"""

import argparse
import json
import os
import sys
import uuid

from sqlalchemy import create_engine, MetaData, Table, select, insert, update
from sqlalchemy.exc import SQLAlchemyError


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_table(meta, name):
    if name not in meta.tables:
        print(f"[WARN] Table '{name}' not found in database (skipping).")
        return None
    return meta.tables[name]


def upsert_row(conn, table, pkcolumn, pkvalue, rowdict):
    """Insert row if not exists, return True if inserted"""
    s = select(table.c[pkcolumn]).where(table.c[pkcolumn] == pkvalue)
    r = conn.execute(s).first()
    if r:
        return False
    ins = insert(table).values(**rowdict)
    conn.execute(ins)
    return True


def insert_question(conn, questions_table, list_options_table, question_data, display_order=None):
    """
    Insert a question and its options.
    Handles various question types: text, rank, group, matching, multi-select

    Returns the question_id
    """
    if not question_data:
        return None

    qid = question_data.get("_id") or question_data.get("id") or str(uuid.uuid4())

    # Build question row
    question_row = {
        "question_id": qid,
        "image_url": question_data.get("image"),
        "cluster_id": question_data.get("clusterId") or question_data.get("cluster_id"),
        "question_text": question_data.get("question") or question_data.get("question_text") or question_data.get("text"),
        "question_description": question_data.get("description") or question_data.get("question_description"),
        "option_instruction": question_data.get("optionInstruction") or question_data.get("option_instruction"),
        "question_type": question_data.get("type") or question_data.get("question_type") or "text",
        "display_order": display_order,
    }

    try:
        if upsert_row(conn, questions_table, "question_id", qid, question_row):
            q_text = question_row['question_text'] or ''
            print(f"    Inserted question: {qid[:8]}... - {q_text[:40]}...")
    except SQLAlchemyError as e:
        print(f"    Error inserting question {qid}: {e}")
        return None

    if list_options_table is None:
        return qid

    # Handle different question types
    question_type = question_data.get("type", "text")

    # Standard options (text, rank, multi-select)
    options = question_data.get("options") or []
    for idx, opt in enumerate(options):
        # Handle group type with subOptions
        if question_type == "group" and "subOptions" in opt:
            # Insert the group as an option
            group_id = opt.get("_id") or str(uuid.uuid4())
            group_row = {
                "option_id": group_id,
                "question_id": qid,
                "option_text": opt.get("groupName"),
                "option_image_url": opt.get("image"),
                "display_order": idx + 1,
            }
            try:
                upsert_row(conn, list_options_table, "option_id", group_id, group_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting group option {group_id}: {e}")

            # Insert subOptions as separate options with reference to group
            for sub_idx, sub_opt in enumerate(opt.get("subOptions", [])):
                sub_id = sub_opt.get("_id") or str(uuid.uuid4())
                sub_row = {
                    "option_id": sub_id,
                    "question_id": qid,
                    "option_text": f"{opt.get('groupName')}:{sub_opt.get('text')}",
                    "option_image_url": sub_opt.get("image"),
                    "display_order": (idx + 1) * 100 + sub_idx + 1,  # Hierarchical ordering
                }
                try:
                    upsert_row(conn, list_options_table, "option_id", sub_id, sub_row)
                except SQLAlchemyError as e:
                    print(f"    Error inserting sub-option {sub_id}: {e}")
        else:
            # Regular option
            opt_id = opt.get("_id") or opt.get("id") or str(uuid.uuid4())
            opt_row = {
                "option_id": opt_id,
                "question_id": qid,
                "option_text": opt.get("text") or opt.get("option_text") or opt.get("groupName"),
                "option_image_url": opt.get("image") or opt.get("option_image_url"),
                "display_order": idx + 1,
            }
            try:
                upsert_row(conn, list_options_table, "option_id", opt_id, opt_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting option {opt_id}: {e}")

    # Handle matching type (leftSide and rightSide)
    if question_type == "matching":
        left_side = question_data.get("leftSide") or []
        right_side = question_data.get("rightSide") or []

        for idx, item in enumerate(left_side):
            item_id = item.get("_id") or str(uuid.uuid4())
            item_row = {
                "option_id": item_id,
                "question_id": qid,
                "option_text": f"left:{item.get('text', '')}",
                "option_image_url": item.get("image"),
                "display_order": idx + 1,
            }
            try:
                upsert_row(conn, list_options_table, "option_id", item_id, item_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting left item {item_id}: {e}")

        for idx, item in enumerate(right_side):
            item_id = item.get("_id") or str(uuid.uuid4())
            item_row = {
                "option_id": item_id,
                "question_id": qid,
                "option_text": f"right:{item.get('text', '')}",
                "option_image_url": item.get("image"),
                "display_order": 100 + idx + 1,  # Offset for right side
            }
            try:
                upsert_row(conn, list_options_table, "option_id", item_id, item_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting right item {item_id}: {e}")

    return qid


def main():
    ap = argparse.ArgumentParser(description="Seed missions data from JSON file")
    ap.add_argument("--missions", required=True, help="Path to missions JSON file")
    ap.add_argument("--test-id", help="Optional: Override test ID")
    ap.add_argument("--test-name", default="Missions Assessment", help="Test name (default: Missions Assessment)")
    args = ap.parse_args()

    DATABASE_URL = os.environ.get("DATABASE_URL")
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

    # Table references
    questions_table = ensure_table(meta, "questions")
    list_options_table = ensure_table(meta, "list_options")
    tests_table = ensure_table(meta, "tests")
    missions_test_table = ensure_table(meta, "missions_test")

    if not all([questions_table is not None, tests_table is not None, missions_test_table is not None]):
        print("[ERROR] Required tables not found. Make sure database schema is set up.")
        sys.exit(1)

    # Load missions data
    missions_data = load_json(args.missions)

    # Determine format: array vs object
    if isinstance(missions_data, list):
        # Format 1: Array of missions
        missions_list = missions_data
        test_id = args.test_id or str(uuid.uuid4())
        test_name = args.test_name
        version_int = 1
    else:
        # Format 2: Object with metadata
        missions_list = missions_data.get("missions") or []
        test_id = args.test_id or missions_data.get("_id") or str(uuid.uuid4())
        test_name = missions_data.get("name", args.test_name)
        version_str = missions_data.get("version", "1.0.0")
        try:
            version_int = int(version_str.split('.')[0])
        except:
            version_int = 1

    print(f"{'='*60}")
    print(f"Seeding Missions Data")
    print(f"{'='*60}")
    print(f"Test ID: {test_id}")
    print(f"Test Name: {test_name}")
    print(f"Missions Count: {len(missions_list)}")
    print(f"{'='*60}\n")

    with engine.begin() as conn:
        # Insert/update test record
        test_row = {
            "test_id": test_id,
            "test_name": test_name,
            "test_type": "missions",
            "version": version_int,
        }

        try:
            if upsert_row(conn, tests_table, "test_id", test_id, test_row):
                print(f"[+] Inserted test: {test_name} (version {version_int})")
            else:
                print(f"[=] Test {test_id[:8]}... already exists, using existing")
        except SQLAlchemyError as e:
            print(f"[!] Error inserting test: {e}")
            sys.exit(1)

        # Insert missions
        missions_inserted = 0
        questions_inserted = 0

        for idx, mission in enumerate(missions_list):
            mission_id = mission.get("_id") or str(uuid.uuid4())
            mission_name = mission.get("name", f"Mission {idx + 1}")

            print(f"\n[Mission {idx + 1}/{len(missions_list)}] {mission_name}")
            print(f"  ID: {mission_id[:8]}...")

            # Insert primary question
            primary_q = mission.get("primaryQuestion")
            primary_qid = None
            if primary_q:
                print("  Primary Question:")
                primary_qid = insert_question(
                    conn, questions_table, list_options_table,
                    primary_q, display_order=(idx * 2) + 1
                )
                if primary_qid:
                    questions_inserted += 1

            # Insert secondary question
            secondary_q = mission.get("secondaryQuestion")
            secondary_qid = None
            if secondary_q:
                print("  Secondary Question:")
                secondary_qid = insert_question(
                    conn, questions_table, list_options_table,
                    secondary_q, display_order=(idx * 2) + 2
                )
                if secondary_qid:
                    questions_inserted += 1

            # Insert mission record linking test to questions
            mission_row = {
                "id": mission_id,
                "test_id": test_id,
                "primary_question_id": primary_qid,
                "secondary_question_id": secondary_qid,
            }

            try:
                if upsert_row(conn, missions_test_table, "id", mission_id, mission_row):
                    print(f"  [+] Inserted mission link")
                    missions_inserted += 1
                else:
                    print(f"  [=] Mission already exists")
            except SQLAlchemyError as e:
                print(f"  [!] Error inserting mission: {e}")

    print(f"\n{'='*60}")
    print(f"Seeding Complete!")
    print(f"{'='*60}")
    print(f"  Test ID: {test_id}")
    print(f"  Missions inserted: {missions_inserted}")
    print(f"  Questions inserted: {questions_inserted}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
