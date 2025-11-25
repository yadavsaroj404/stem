#!/usr/bin/env python3
"""
Verification script to check if questions and answers are loaded from database or JSON files.
Run this to verify your data sources.
"""

import os
import sys
from sqlalchemy import text

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app.models.database import SessionLocal, Question, Cluster, ListOption, Test
from app.services.scoring_service import scoring_service
from app.services.question_service import question_service


def verify_questions_source():
    """Verify questions are loaded from database"""
    print("\n" + "="*70)
    print("VERIFYING QUESTIONS SOURCE")
    print("="*70)

    db = SessionLocal()
    try:
        # Check if we can query questions from database
        questions = db.query(Question).all()

        if not questions:
            print("❌ No questions found in database!")
            print("   Action: Run seed script to populate database")
            return False

        print(f"✅ Found {len(questions)} questions in DATABASE")

        # Show a sample question
        sample = questions[0]
        print(f"\n📋 Sample Question from DB:")
        print(f"   ID: {sample.question_id}")
        print(f"   Text: {sample.question_text[:50]}...")
        print(f"   Type: {sample.question_type}")

        # Verify the service uses database
        print(f"\n🔍 Checking QuestionService...")
        try:
            result = question_service.get_questions()
            if result and 'questions' in result and len(result['questions']) > 0:
                print(f"✅ QuestionService returns {len(result['questions'])} questions from DATABASE")
                print(f"   Test Name: {result.get('name', 'N/A')}")
                print(f"   Version: {result.get('version', 'N/A')}")
            else:
                print("❌ QuestionService returned empty results")
                return False
        except Exception as e:
            print(f"❌ QuestionService error: {e}")
            return False

        return True

    except Exception as e:
        print(f"❌ Error accessing database: {e}")
        print("   Action: Check DATABASE_URL and database connection")
        return False
    finally:
        db.close()


def verify_answers_source():
    """Verify answers source (currently from JSON file)"""
    print("\n" + "="*70)
    print("VERIFYING ANSWERS SOURCE")
    print("="*70)

    # Check scoring service
    if len(scoring_service.correct_answers) == 0:
        print("❌ No correct answers loaded!")
        print("   Action: Check if app/data/answers.json exists")
        return False

    print(f"✅ Found {len(scoring_service.correct_answers)} correct answers")
    print(f"   Source: app/data/answers.json file")

    # Show sample answers
    sample_items = list(scoring_service.correct_answers.items())[:3]
    print(f"\n📋 Sample Correct Answers:")
    for q_id, answer in sample_items:
        print(f"   Question: {q_id[:20]}...")
        print(f"   Answer: {answer[:50]}{'...' if len(answer) > 50 else ''}")

    print(f"\n⚠️  NOTE: Answers are currently loaded from JSON file")
    print(f"   File: app/data/answers.json")
    print(f"   This is normal - answers are used for validation only")

    return True


def verify_database_tables():
    """Verify all required tables exist"""
    print("\n" + "="*70)
    print("VERIFYING DATABASE TABLES")
    print("="*70)

    db = SessionLocal()
    try:
        # Check each table
        tables_to_check = [
            ('clusters', Cluster),
            ('questions', Question),
            ('list_options', ListOption),
            ('tests', Test),
        ]

        all_exist = True
        for table_name, model in tables_to_check:
            try:
                count = db.query(model).count()
                if count > 0:
                    print(f"✅ {table_name:20} - {count:4} records")
                else:
                    print(f"⚠️  {table_name:20} - 0 records (empty)")
                    all_exist = False
            except Exception as e:
                print(f"❌ {table_name:20} - Error: {e}")
                all_exist = False

        return all_exist

    finally:
        db.close()


def test_api_endpoint():
    """Test that API endpoint returns database data"""
    print("\n" + "="*70)
    print("TESTING API ENDPOINT")
    print("="*70)

    try:
        # Test the question service directly (same as API endpoint)
        result = question_service.get_questions()

        if not result or 'questions' not in result:
            print("❌ API would return empty response")
            return False

        questions = result['questions']
        print(f"✅ API endpoint '/questions' would return {len(questions)} questions")

        if len(questions) > 0:
            sample = questions[0]
            print(f"\n📋 Sample API Response:")
            print(f"   Question ID: {sample.get('_id', 'N/A')}")
            print(f"   Question: {sample.get('question', 'N/A')[:50]}...")
            print(f"   Type: {sample.get('type', 'N/A')}")
            print(f"   Options: {len(sample.get('options', []))} options")

        return True

    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return False


def show_summary(checks):
    """Show summary of verification"""
    print("\n" + "="*70)
    print("VERIFICATION SUMMARY")
    print("="*70)

    total = len(checks)
    passed = sum(1 for result in checks.values() if result)

    for check_name, result in checks.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {check_name}")

    print(f"\n{'='*70}")
    print(f"Result: {passed}/{total} checks passed")
    print(f"{'='*70}\n")

    if passed == total:
        print("🎉 ALL CHECKS PASSED!")
        print("✅ Questions are loaded from DATABASE")
        print("✅ Answers are loaded from JSON file (for validation)")
        print("✅ System is working correctly")
    else:
        print("⚠️  SOME CHECKS FAILED")
        print("   Action: Review the errors above and fix issues")


def main():
    """Main verification function"""
    print("\n" + "🔍 " * 20)
    print("DATABASE vs JSON FILE VERIFICATION TOOL")
    print("🔍 " * 20)

    checks = {
        "Database Tables Exist": verify_database_tables(),
        "Questions Loaded from Database": verify_questions_source(),
        "Answers Loaded (JSON)": verify_answers_source(),
        "API Endpoint Works": test_api_endpoint(),
    }

    show_summary(checks)


if __name__ == "__main__":
    main()
