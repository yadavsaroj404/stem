#!/usr/bin/env python3
"""
Seed DB from JSON files:
- clusters.json  -> clusters table
- test-questions.json -> tests + questions + list_options tables

Usage:
export DATABASE_URL="postgresql://postgres:Vishesh%402004@localhost:5432/postgres"
python seed_from_json.py --clusters path/to/clusters.json --questions path/to/test-questions.json
"""

import argparse
import json
import os
import sys
import uuid
from datetime import datetime

from sqlalchemy import create_engine, MetaData, Table, select, insert
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
    # skip if exists
    s = select(table.c[pkcolumn]).where(table.c[pkcolumn] == pkvalue)
    r = conn.execute(s).first()
    if r:
        return False
    ins = insert(table).values(**rowdict)
    conn.execute(ins)
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clusters", required=True, help="Path to clusters.json")
    ap.add_argument("--questions", required=True, help="Path to test-questions.json")
    args = ap.parse_args()

    # DATABASE_URL = os.environ.get("DATABASE_URL")
    DATABASE_URL = "postgresql://postgres:root@localhost:5432/stem_db"
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

    # table references (best-effort)
    clusters_table = ensure_table(meta, "clusters")
    questions_table = ensure_table(meta, "questions")
    list_options_table = ensure_table(meta, "list_options")
    tests_table = ensure_table(meta, "tests")
    general_test_table = ensure_table(meta, "general_test")

    # Load files
    clusters_data = load_json(args.clusters)
    questions_data = load_json(args.questions)

    with engine.begin() as conn:
        # Insert test record first
        if tests_table is not None and general_test_table is not None:
            test_id = questions_data.get("_id")
            test_name = questions_data.get("name", "Base Question Set")
            version_str = questions_data.get("version", "1.0.0")

            # Parse version (e.g., "1.0.2" -> 1)
            try:
                version_int = int(version_str.split('.')[0])
            except:
                version_int = 1

            if test_id:
                test_row = {
                    "test_id": test_id,
                    "test_name": test_name,
                    "test_type": "general",
                    "version": version_int,
                }
                try:
                    if upsert_row(conn, tests_table, "test_id", test_id, test_row):
                        print(f"Inserted test: {test_name} (version {version_int})")
                    else:
                        print(f"Test {test_id} already exists")
                except SQLAlchemyError as e:
                    print("Error inserting test", test_id, e)

        print("[INFO] Skipping general_test and missions_test inserts (require question linking)")

        # Insert clusters
        if clusters_table is not None:
            print(f"Inserting {len(clusters_data)} clusters...")
            inserted = 0
            for c in clusters_data:
                cluster_id = c.get("_id") or c.get("id")
                name = c.get("name") or c.get("cluster_name") or c.get("title")
                if not cluster_id or not name:
                    print(f"[WARN] skipping cluster with missing id/name: {c}")
                    continue
                row = {
                    "cluster_id": cluster_id,
                    "cluster_name": name,
                }
                try:
                    ok = upsert_row(conn, clusters_table, "cluster_id", cluster_id, row)
                    if ok:
                        inserted += 1
                except SQLAlchemyError as e:
                    print("Error inserting cluster", cluster_id, e)
            print(f"Clusters inserted: {inserted}")
        else:
            print("[INFO] clusters table not present; skipping cluster inserts.")

        # Insert questions + options
        if questions_table is not None:
            qlist = questions_data.get("questions") if isinstance(questions_data, dict) else questions_data
            qlist = qlist or []
            print(f"Inserting {len(qlist)} questions...")
            q_inserted = 0
            opt_inserted = 0
            for q in qlist:
                qid = q.get("_id") or q.get("id")
                if not qid:
                    print("[WARN] question missing _id, skipping:", q.get("question") or q)
                    continue
                question_row = {
                    "question_id": qid,
                    "image_url": q.get("image"),
                    "cluster_id": q.get("clusterId") or q.get("cluster_id"),
                    "question_text": q.get("question") or q.get("question_text") or q.get("text"),
                    "question_description": None,
                    "option_instruction": q.get("optionInstruction") or q.get("option_instruction"),
                    "question_type": q.get("type") or q.get("question_type"),
                    "display_order": q.get("displayOrder"),
                }
                try:
                    if upsert_row(conn, questions_table, "question_id", qid, question_row):
                        q_inserted += 1
                except SQLAlchemyError as e:
                    print("Error inserting question", qid, e)
                    continue

                # options (if any)
                options = q.get("options") or []
                for idx, opt in enumerate(options):
                    opt_id = opt.get("_id") or opt.get("id") or str(uuid.uuid4())
                    opt_row = {
                        "option_id": opt_id,
                        "question_id": qid,
                        "option_text": opt.get("text") or opt.get("option_text") or None,
                        "option_image_url": opt.get("image"),
                        "display_order": idx + 1,
                    }
                    if list_options_table is not None:
                        try:
                            if upsert_row(conn, list_options_table, "option_id", opt_id, opt_row):
                                opt_inserted += 1
                        except SQLAlchemyError as e:
                            print("Error inserting option", opt_id, e)

            print(f"Questions inserted: {q_inserted}, Options inserted: {opt_inserted}")
        else:
            print("[INFO] questions table not present; skipping question inserts.")

    print("Seeding complete.")


if __name__ == "__main__":
    main()
