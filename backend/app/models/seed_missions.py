#!/usr/bin/env python3
"""
Seed Missions data from JSON file:
- missions-test-questions.json -> tests + questions + list_options + items_group + item_pools + missions_test tables

Handles all question types:
- text: simple MCQ with options (uses list_options)
- rank: ordered options (uses list_options)
- multi-select: multiple selection options (uses list_options)
- group: grouped options with subOptions (uses items_group + item_pools)
- matching: left/right side matching (uses items_group + item_pools)

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


def insert_question(conn, questions_table, list_options_table, items_group_table, item_pools_table, question_data, display_order=None):
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

    # Handle different question types
    question_type = question_data.get("type", "text")

    if question_type in ("text", "rank", "multi-select"):
        # Standard options - use list_options table
        if list_options_table is None:
            return qid
        options = question_data.get("options") or []
        for idx, opt in enumerate(options):
            opt_id = opt.get("_id") or opt.get("id") or str(uuid.uuid4())
            opt_row = {
                "option_id": opt_id,
                "question_id": qid,
                "option_text": opt.get("text") or opt.get("option_text"),
                "option_image_url": opt.get("image") or opt.get("option_image_url"),
                "display_order": idx + 1,
            }
            try:
                upsert_row(conn, list_options_table, "option_id", opt_id, opt_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting option {opt_id}: {e}")

    elif question_type == "group":
        # Group questions - use items_group + item_pools tables
        if items_group_table is None or item_pools_table is None:
            print(f"    [WARN] items_group or item_pools table not available for group question")
            return qid
        options = question_data.get("options") or []
        for idx, group in enumerate(options):
            group_id = group.get("_id") or str(uuid.uuid4())
            group_name = group.get("groupName") or f"Group {idx + 1}"

            # Insert group
            group_row = {
                "group_id": group_id,
                "group_name": group_name,
                "display_order": idx + 1,
            }
            try:
                upsert_row(conn, items_group_table, "group_id", group_id, group_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting group {group_id}: {e}")

            # Insert subOptions into item_pools
            sub_options = group.get("subOptions") or []
            for sub_idx, sub_opt in enumerate(sub_options):
                pool_id = sub_opt.get("_id") or str(uuid.uuid4())
                pool_row = {
                    "pool_id": pool_id,
                    "question_id": qid,
                    "item_text": sub_opt.get("text"),
                    "display_order": sub_idx + 1,
                    "group_id": group_id,
                }
                try:
                    upsert_row(conn, item_pools_table, "pool_id", pool_id, pool_row)
                except SQLAlchemyError as e:
                    print(f"    Error inserting pool item {pool_id}: {e}")

    elif question_type == "matching":
        # Matching questions - use items_group for sides + item_pools for items
        if items_group_table is None or item_pools_table is None:
            print(f"    [WARN] items_group or item_pools table not available for matching question")
            return qid
        left_side = question_data.get("leftSide") or []
        right_side = question_data.get("rightSide") or []
        left_title = question_data.get("leftSideTitle") or "Left"
        right_title = question_data.get("rightSideTitle") or "Right"

        # Create group for left side
        left_group_id = str(uuid.uuid4())
        left_group_row = {
            "group_id": left_group_id,
            "group_name": left_title,
            "display_order": 1,
        }
        try:
            upsert_row(conn, items_group_table, "group_id", left_group_id, left_group_row)
        except SQLAlchemyError as e:
            print(f"    Error inserting left group {left_group_id}: {e}")

        # Insert left side items
        for idx, item in enumerate(left_side):
            pool_id = item.get("_id") or str(uuid.uuid4())
            pool_row = {
                "pool_id": pool_id,
                "question_id": qid,
                "item_text": item.get("text"),
                "display_order": idx + 1,
                "group_id": left_group_id,
            }
            try:
                upsert_row(conn, item_pools_table, "pool_id", pool_id, pool_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting left item {pool_id}: {e}")

        # Create group for right side
        right_group_id = str(uuid.uuid4())
        right_group_row = {
            "group_id": right_group_id,
            "group_name": right_title,
            "display_order": 2,
        }
        try:
            upsert_row(conn, items_group_table, "group_id", right_group_id, right_group_row)
        except SQLAlchemyError as e:
            print(f"    Error inserting right group {right_group_id}: {e}")

        # Insert right side items
        for idx, item in enumerate(right_side):
            pool_id = item.get("_id") or str(uuid.uuid4())
            pool_row = {
                "pool_id": pool_id,
                "question_id": qid,
                "item_text": item.get("text"),
                "display_order": idx + 1,
                "group_id": right_group_id,
            }
            try:
                upsert_row(conn, item_pools_table, "pool_id", pool_id, pool_row)
            except SQLAlchemyError as e:
                print(f"    Error inserting right item {pool_id}: {e}")

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
    items_group_table = ensure_table(meta, "items_group")
    item_pools_table = ensure_table(meta, "item_pools")
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
                    items_group_table, item_pools_table,
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
                    items_group_table, item_pools_table,
                    secondary_q, display_order=(idx * 2) + 2
                )
                if secondary_qid:
                    questions_inserted += 1

            # Insert mission record linking test to questions
            mission_row = {
                "id": mission_id,
                "test_id": test_id,
                "name": mission_name,
                "image_url": mission.get("image"),
                "video_url": mission.get("video"),
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
