# Response API Documentation

## Overview

The Response API provides endpoints for submitting and retrieving candidate test responses with automatic scoring. This system stores individual responses, validates answers, and computes both overall and cluster-level scores.

## Key Features

✅ **Automatic Database Setup**: All tables are created automatically when the backend starts
✅ **Response Storage**: Individual responses stored with question-option mappings
✅ **Automatic Scoring**: Answers validated against correct answers and scored immediately
✅ **Cluster-Level Analysis**: Scores computed for each career cluster
✅ **Response Time Tracking**: Optional tracking of time taken per question
✅ **Comprehensive Retrieval**: Get submissions with responses and computed scores

---

## Database Schema

### New Tables

#### 1. `candidate_responses`
Stores individual responses for each question in a submission.

| Column | Type | Description |
|--------|------|-------------|
| response_id | UUID | Primary key |
| submission_id | String | Foreign key to submissions |
| question_id | UUID | Foreign key to questions |
| selected_option_id | UUID | Selected option for MCQ questions |
| selected_items | Text | JSON array for mapping/pattern questions |
| response_time_ms | Integer | Time taken to answer (milliseconds) |
| is_correct | Integer | 1=correct, 0=incorrect, NULL=not graded |
| created_at | DateTime | Timestamp |
| updated_at | DateTime | Timestamp |

#### 2. `candidate_scores`
Stores computed scores (overall and per-cluster).

| Column | Type | Description |
|--------|------|-------------|
| score_id | UUID | Primary key |
| submission_id | String | Foreign key to submissions |
| cluster_id | UUID | Foreign key to clusters (NULL for overall) |
| total_questions | Integer | Total questions answered |
| correct_answers | Integer | Number of correct answers |
| incorrect_answers | Integer | Number of incorrect answers |
| unanswered | Integer | Number of unanswered questions |
| score_percentage | Integer | Score as percentage (0-100) |
| cluster_score | Integer | Raw score for cluster |
| computed_at | DateTime | When score was computed |

---

## API Endpoints

### 1. Submit Responses (POST)

**Endpoint**: `POST /responses`

**Description**: Submit candidate responses with automatic scoring.

**Request Body**:
```json
{
  "userId": "user123",
  "testId": "test-uuid-here",
  "name": "John Doe",
  "responses": [
    {
      "questionId": "q1-uuid",
      "selectedOptionId": "option1-uuid",
      "responseTimeMs": 5000
    },
    {
      "questionId": "q2-uuid",
      "selectedItems": ["item1-uuid", "item2-uuid"],
      "responseTimeMs": 8000
    }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "submissionId": "submission-uuid",
  "message": "Responses submitted and scored successfully",
  "score": {
    "overallScore": 85.5,
    "totalQuestions": 43,
    "correctAnswers": 37,
    "incorrectAnswers": 5,
    "unanswered": 1,
    "clusterScores": [
      {
        "clusterId": "cluster-uuid",
        "totalQuestions": 5,
        "correctAnswers": 4,
        "incorrectAnswers": 1,
        "unanswered": 0,
        "scorePercentage": 80.0
      }
    ]
  }
}
```

**Flow**:
1. Creates a submission record
2. Stores each response in `candidate_responses` table
3. Validates answers against `answers.json`
4. Marks each response as correct/incorrect
5. Computes overall and cluster-level scores
6. Stores scores in `candidate_scores` table
7. Returns submission ID and computed scores

---

### 2. Get Submission Details (GET)

**Endpoint**: `GET /responses/{submission_id}`

**Description**: Retrieve a submission with all responses and computed scores.

**Response**:
```json
{
  "status": "success",
  "data": {
    "submissionId": "submission-uuid",
    "userId": "user123",
    "testId": "test-uuid",
    "name": "John Doe",
    "status": "SUBMITTED",
    "submittedAt": "2024-01-15T10:30:00",
    "responses": [
      {
        "responseId": "response-uuid",
        "questionId": "q1-uuid",
        "selectedOptionId": "option1-uuid",
        "selectedItems": null,
        "responseTimeMs": 5000,
        "isCorrect": 1,
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "score": {
      "submissionId": "submission-uuid",
      "userId": "user123",
      "overallScore": 85.5,
      "totalQuestions": 43,
      "correctAnswers": 37,
      "incorrectAnswers": 5,
      "unanswered": 1,
      "clusterScores": [
        {
          "clusterId": "cluster-uuid",
          "clusterName": "Future Builder",
          "totalQuestions": 5,
          "correctAnswers": 4,
          "incorrectAnswers": 1,
          "unanswered": 0,
          "scorePercentage": 80.0
        }
      ],
      "computedAt": "2024-01-15T10:30:01"
    }
  }
}
```

---

### 3. Get User Submissions (GET)

**Endpoint**: `GET /responses/user/{user_id}`

**Description**: Get all submissions for a specific user.

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "submissionId": "submission-uuid-1",
      "userId": "user123",
      "testId": "test-uuid",
      "name": "John Doe - Attempt 1",
      "status": "SUBMITTED",
      "submittedAt": "2024-01-15T10:30:00",
      "overallScore": 85.5
    },
    {
      "submissionId": "submission-uuid-2",
      "userId": "user123",
      "testId": "test-uuid",
      "name": "John Doe - Attempt 2",
      "status": "SUBMITTED",
      "submittedAt": "2024-01-14T09:15:00",
      "overallScore": 78.2
    }
  ],
  "count": 2
}
```

---

## Automatic Database Creation

When the backend starts, it automatically:

1. **Creates all tables** if they don't exist:
   - `clusters`
   - `questions`
   - `list_options`
   - `item_pools`
   - `items_group`
   - `tests`
   - `general_test`
   - `missions_test`
   - `submissions`
   - `candidate_responses` ⭐ NEW
   - `candidate_scores` ⭐ NEW

2. **Creates indexes** for performance:
   - On `submission_id` in candidate_responses
   - On `question_id` in candidate_responses
   - On `submission_id` in candidate_scores
   - On `cluster_id` in candidate_scores

3. **Loads correct answers** from `app/data/answers.json`

---

## Deployment Instructions

### First-Time Setup on New Server

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd stem/backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure database**
   Create `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   ```

5. **Run the backend**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

6. **Database tables are created automatically** ✅
   The startup event will create all 11 tables automatically.

7. **Seed initial data** (optional)
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
   python app/models/seed_from_json.py --clusters app/data/clusters.json --questions app/data/test-questions.json
   ```

---

## Example Usage Flow

### Complete Test Submission Flow

```javascript
// 1. Get questions
const questionsResponse = await fetch('http://localhost:8000/questions');
const { data: { questions } } = await questionsResponse.json();

// 2. User answers questions
const responses = questions.map(q => ({
  questionId: q._id,
  selectedOptionId: userSelectedOption,
  responseTimeMs: timeTaken
}));

// 3. Submit responses
const submitResponse = await fetch('http://localhost:8000/responses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    testId: data._id,
    name: 'John Doe',
    responses: responses
  })
});

const { submissionId, score } = await submitResponse.json();

// 4. Get detailed results
const resultsResponse = await fetch(`http://localhost:8000/responses/${submissionId}`);
const { data: submission } = await resultsResponse.json();

console.log('Overall Score:', submission.score.overallScore);
console.log('Cluster Scores:', submission.score.clusterScores);
```

---

## Scoring Logic

### Answer Validation

1. **MCQ Questions**: Compares `selectedOptionId` with correct answer from `answers.json`
2. **Mapping/Pattern Questions**: Compares semicolon-separated list of item IDs

### Score Computation

1. **Per-Response Scoring**: Each response marked as correct (1) or incorrect (0)
2. **Overall Score**: `(correct_answers / total_questions) * 100`
3. **Cluster Scores**: Same calculation per cluster
4. **Storage**: All scores stored in `candidate_scores` table

---

## Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Submission/user not found
- **500 Internal Server Error**: Database or processing errors

Errors are logged with context for debugging.

---

## Legacy Endpoints (Still Supported)

The original `/submit` endpoint is still available for backward compatibility:

- `POST /submit` - Legacy submission format
- `GET /submissions` - Get all submissions
- `GET /submissions/{id}` - Get specific submission
- `DELETE /submissions/{id}` - Delete submission

---

## Performance Considerations

- **Indexes**: Created on foreign keys for fast lookups
- **Batch Processing**: All responses in a submission processed together
- **Score Caching**: Scores computed once and stored, not recalculated on retrieval
- **Connection Pooling**: SQLAlchemy connection pool for efficient DB access

---

## Security Notes

- User ID validation should be implemented at the authentication layer
- Rate limiting should be added for production
- Sensitive data in responses should be handled according to privacy requirements
- Database credentials should be stored in environment variables, never in code

---

## Testing

Test the API using curl:

```bash
# Submit responses
curl -X POST http://localhost:8000/responses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "name": "Test Submission",
    "responses": [
      {
        "questionId": "93185184db6c4cd4a77b8c5d37b178a1",
        "selectedOptionId": "07c2abacdb614a3e96980f98bca0270d"
      }
    ]
  }'

# Get submission
curl http://localhost:8000/responses/{submission_id}

# Get user history
curl http://localhost:8000/responses/user/test-user
```

---

## Support

For issues or questions, check:
- Server logs at `logs/` directory
- Database connection in `.env` file
- Correct answers in `app/data/answers.json`
