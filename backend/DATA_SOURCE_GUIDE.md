# Data Source Guide - Where Questions and Answers Come From

## Quick Answer

✅ **Questions**: Loaded from **DATABASE**
✅ **Answers**: Loaded from **JSON file** (for validation only)

---

## How to Verify

### Option 1: Run Verification Script (Recommended)

```bash
cd /Users/visheshmamoria/Desktop/stem-main/stem/backend
source .venv/bin/activate
python verify_data_source.py
```

This will show you:
- ✅ Which tables exist in database
- ✅ How many questions are in database
- ✅ Where answers come from
- ✅ Whether API endpoints work

### Option 2: Quick Check Script

```bash
cd /Users/visheshmamoria/Desktop/stem-main/stem/backend
./quick_check.sh
```

### Option 3: Manual Check

```bash
# 1. Check questions in database
python -c "from app.models.database import SessionLocal, Question; db = SessionLocal(); print(f'Questions in DB: {db.query(Question).count()}'); db.close()"

# 2. Check answers source
python -c "from app.services.scoring_service import scoring_service; print(f'Answers loaded: {len(scoring_service.correct_answers)} from answers.json')"
```

---

## Detailed Breakdown

### Questions - FROM DATABASE ✅

**File**: `app/services/question_service.py`

**Code** (lines 38-52):
```python
def get_questions(self) -> dict:
    """Return all questions as a dictionary, fetched from database"""
    db: Session = SessionLocal()
    try:
        # Get test info from DATABASE
        test = db.query(Test).first()

        # Get all questions with their options from DATABASE
        questions = db.query(Question).options(
            joinedload(Question.options),
            joinedload(Question.cluster)
        ).order_by(Question.display_order).all()
```

**What happens**:
1. Opens database connection
2. Queries `tests` table
3. Queries `questions` table with joins to `list_options` and `clusters`
4. Returns formatted question data

**API Endpoint**: `GET /questions`

---

### Answers - FROM JSON FILE ✅

**File**: `app/services/scoring_service.py`

**Code** (lines 30-48):
```python
def _load_correct_answers(self):
    """Load correct answers from answers.json file"""
    answers_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "answers.json"
    )

    if os.path.exists(answers_path):
        with open(answers_path, 'r') as f:
            self.correct_answers = json.load(f)
```

**File Path**: `app/data/answers.json`

**Why JSON?**: Answers are only used for validation/scoring, not displayed to users. They're stored in JSON for:
- Easy updates without database changes
- Version control
- Security (not exposed in API responses)

**Used in**: Answer validation during submission

---

## What Gets Loaded from Where

| Data Type | Source | When | How |
|-----------|--------|------|-----|
| **Questions** | DATABASE | API call to `/questions` | SQLAlchemy query |
| **Options** | DATABASE | API call to `/questions` | Joined with questions |
| **Clusters** | DATABASE | API call to `/questions` | Joined with questions |
| **Tests** | DATABASE | API call to `/test-sets` | SQLAlchemy query |
| **Answers** | JSON FILE | Service initialization | File read on startup |
| **User Responses** | DATABASE | Saved on submission | Inserted into `student_answers` |
| **Scores** | DATABASE | Computed on submission | Inserted into `candidate_scores` |

---

## Check if Database is Being Used

### Method 1: Check Logs

When backend starts, you'll see:
```
INFO: Initializing database tables
INFO: Database tables initialized successfully
INFO: Initializing QuestionService with database support
```

When you call `/questions`:
```
INFO: Fetching questions from database
```

### Method 2: Check Network Traffic

Use browser DevTools Network tab:
1. Open http://localhost:8000/questions
2. Check the response
3. Look at the data - if it has database IDs (UUIDs), it's from the database

### Method 3: Temporarily Break Database

1. Stop PostgreSQL: `brew services stop postgresql` (or equivalent)
2. Try to access `/questions` endpoint
3. You'll get an error: **This proves it's using the database!**
4. Restart PostgreSQL: `brew services start postgresql`

### Method 4: Check Question Count

```bash
# Count in database
psql -U visheshmamoria -d postgres -c "SELECT COUNT(*) FROM questions;"

# Count from API
curl http://localhost:8000/questions | jq '.data.questions | length'

# They should match!
```

---

## Code Flow Diagram

### Question Retrieval:
```
User Request
    ↓
GET /questions (tests.py:11)
    ↓
question_service.get_questions() (question_service.py:38)
    ↓
db.query(Question) → DATABASE
    ↓
Format and return JSON
    ↓
User receives response
```

### Answer Validation:
```
User Submits Response
    ↓
POST /responses (tests.py:231)
    ↓
response_service.submit_responses() (response_service.py:34)
    ↓
scoring_service.check_answer() (scoring_service.py:55)
    ↓
self.correct_answers[question_id] → JSON FILE (answers.json)
    ↓
Compare and mark correct/incorrect
    ↓
Save to student_answers table → DATABASE
```

---

## How to Verify After Deployment

### 1. SSH into server
```bash
ssh user@your-server.com
```

### 2. Check database
```bash
cd /path/to/backend
source .venv/bin/activate
python verify_data_source.py
```

### 3. Or use API
```bash
# Should return questions from database
curl http://your-server.com/questions

# Check the response has database UUIDs
```

---

## Common Questions

**Q: Why are answers in JSON and not database?**
A: Answers are only used for internal validation, not exposed to users. JSON is simpler and more secure.

**Q: Can I move answers to database?**
A: Yes, but it's not necessary. Current design is standard practice.

**Q: What if I update answers.json?**
A: Restart the backend to reload answers: `systemctl restart backend` (or equivalent)

**Q: What if database is empty?**
A: Run the seed script:
```bash
python app/models/seed_from_json.py --clusters app/data/clusters.json --questions app/data/test-questions.json
```

**Q: How do I know if seeding worked?**
A: Check with verification script or query database directly:
```bash
python -c "from app.models.database import SessionLocal, Question; db = SessionLocal(); print(f'{db.query(Question).count()} questions in database'); db.close()"
```

---

## Summary Checklist

When deploying to a new server, verify:

- [ ] Database is running
- [ ] Database is seeded (run seed script)
- [ ] `answers.json` file exists at `app/data/answers.json`
- [ ] Backend starts without errors
- [ ] Run `python verify_data_source.py`
- [ ] All checks pass
- [ ] API endpoint `/questions` returns data
- [ ] Question count from API matches database

---

## Need Help?

If verification fails:

1. **Database connection error**: Check DATABASE_URL in .env
2. **No questions found**: Run seed script
3. **No answers loaded**: Check `app/data/answers.json` exists
4. **API returns empty**: Check database has data

Run the verification script for detailed diagnostics:
```bash
python verify_data_source.py
```
