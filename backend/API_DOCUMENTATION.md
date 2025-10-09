# Questions REST API Documentation

## 🚀 Overview

I've created a comprehensive, scalable REST API for managing and serving questionnaire data. The API is designed to be flexible and easily extensible for future changes.

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/endpoints/tests.py     # REST API endpoints
│   ├── services/question_service.py  # Business logic
│   ├── models/schemas.py          # Data models and validation
│   └── data/questions/base.json   # Your question data
├── main.py                        # FastAPI application
└── requirements.txt
```

## 🎯 Key Features

### ✅ **Scalable Architecture**
- **Service Layer**: Business logic separated from API endpoints
- **Schema Validation**: Pydantic models for data validation
- **Modular Design**: Easy to add new question types and categories
- **Caching**: In-memory caching for performance

### ✅ **Flexible Data Structure**
- Support for multiple test sets
- Categorized questions (INTEREST, PERSONALITY, ABILITIES)
- Extensible options system
- Dynamic question management

### ✅ **Comprehensive API Endpoints**

#### **Test Sets Management**
- `GET /api/v1/test-sets` - Get all available test sets
- `GET /api/v1/test-sets/{test_id}` - Get complete test set

#### **Questions Retrieval**
- `GET /api/v1/test-sets/{test_id}/questions` - Get all questions (with filtering)
- `GET /api/v1/test-sets/{test_id}/questions/{question_id}` - Get specific question
- `GET /api/v1/test-sets/{test_id}/categories/{category}` - Get questions by category

#### **Question Management** (for future use)
- `POST /api/v1/test-sets/{test_id}/questions` - Add new question
- `PUT /api/v1/test-sets/{test_id}/questions/{question_id}` - Update question
- `DELETE /api/v1/test-sets/{test_id}/questions/{question_id}` - Delete question

#### **Answer Processing**
- `POST /api/v1/test-sets/{test_id}/submit` - Submit answers and get scores

#### **Utility**
- `GET /api/v1/categories` - Get available categories
- `GET /api/v1/health` - API health check

## 📊 API Usage Examples

### 1. Get All Test Sets
```bash
GET /api/v1/test-sets
```
**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "BASE",
      "name": "Base Question Set",
      "total_questions": 27,
      "categories": {
        "INTEREST": 18,
        "PERSONALITY": 10,
        "ABILITIES": 9
      }
    }
  ],
  "total_test_sets": 1
}
```

### 2. Get Questions by Category
```bash
GET /api/v1/test-sets/BASE/questions?category=INTEREST&limit=5
```
**Response:**
```json
{
  "total_questions": 18,
  "categories": ["INTEREST"],
  "questions": [
    {
      "id": "INTEREST1",
      "question": "Operate machines to make products",
      "category": "INTEREST",
      "options": {
        "Strongly Like": {"value": 5},
        "Like": {"value": 4},
        "Neither Like or Dislike": {"value": 3},
        "Dislike": {"value": 2},
        "Strongly Dislike": {"value": 1}
      },
      "question_number": 1
    }
    // ... more questions
  ]
}
```

### 3. Submit Answers
```bash
POST /api/v1/test-sets/BASE/submit
```
**Request Body:**
```json
{
  "test_id": "BASE",
  "answers": {
    "INTEREST1": "Like",
    "PERSONALITY1": "Agree a Little",
    "ABILITIES1": "Above Average"
  }
}
```

**Response:**
```json
{
  "submission_id": "uuid-here",
  "test_id": "BASE",
  "total_questions_answered": 3,
  "category_scores": {
    "INTEREST": 4.0,
    "PERSONALITY": 4.0,
    "ABILITIES": 4.0
  },
  "overall_score": 4.0,
  "timestamp": "2025-09-23T10:30:00"
}
```

## 🔧 How to Start the Server

1. **Activate Virtual Environment:**
   ```bash
   cd c:\PROJECTS\careernaksha\stem\backend
   venv\Scripts\activate
   ```

2. **Start the Server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access the API:**
   - **API Base:** http://localhost:8000/api/v1
   - **Documentation:** http://localhost:8000/docs
   - **Alternative Docs:** http://localhost:8000/redoc

## 📈 Scalability Features

### **Easy to Extend**
1. **Add New Categories:** Just add to the `QuestionType` enum
2. **New Question Types:** Extend the schema models
3. **Custom Scoring:** Modify the scoring logic in the service
4. **Multiple Test Sets:** Add new JSON files to the data directory

### **Future Enhancements**
- User authentication and sessions
- Question randomization
- Time tracking
- Advanced analytics
- Database storage (currently uses JSON files)
- Question versioning
- A/B testing support

### **Data Structure Flexibility**
The current JSON structure is maintained but the API abstracts it, allowing for:
- Easy migration to database
- Schema evolution
- Backward compatibility
- Custom question formats

## 🎨 Benefits of This Design

1. **Separation of Concerns:** API, business logic, and data are separated
2. **Type Safety:** Pydantic provides runtime validation
3. **Auto-Documentation:** FastAPI generates interactive docs
4. **Extensible:** Easy to add new features without breaking existing code
5. **Testable:** Service layer can be easily unit tested
6. **Performance:** Caching and efficient data structures

## 🚀 Ready to Use!

Your API is now ready to serve questionnaire data with a professional, scalable architecture that can grow with your needs!