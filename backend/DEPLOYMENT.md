# FastAPI Backend Deployment on Vercel

This backend is configured for deployment on Vercel with PostgreSQL database support.

## Deployment Steps

### 1. Prepare Your Repository
Make sure your backend code is in a GitHub repository.

### 2. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `backend` folder as the root directory
5. Vercel will auto-detect the Python framework

### 3. Set Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Note:** Use your actual PostgreSQL database URL (Railway, Supabase, or other provider)

### 4. Deploy
Click "Deploy" and Vercel will build and deploy your FastAPI application.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `QUESTIONS_PATH` | Path to questions JSON file | `app/data/test-questions.json` |
| `SUBMISSIONS_PATH` | Path to submissions JSON file | `app/data/test-submission.json` |

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your database URL

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

- `GET /` - Health check
- `GET /questions` - Get all questions
- `POST /submit` - Submit test answers
- `GET /submissions` - Get submissions (with filters)
- `GET /submissions/{id}` - Get specific submission
- `DELETE /submissions/{id}` - Delete submission

## Database

The application uses PostgreSQL with SQLAlchemy ORM. Database tables are created automatically on startup.

## CORS Configuration

CORS is configured to allow all origins for development. Update in production as needed.