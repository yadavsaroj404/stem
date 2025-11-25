# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for the STEM backend application.

## Prerequisites

- PostgreSQL installed on your system
- Python 3.8 or higher

## Installation

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Login to PostgreSQL
psql postgres

# Create database
CREATE DATABASE stem_db;

# Create user (optional)
CREATE USER stem_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE stem_db TO stem_user;

# Exit psql
\q
```

## Configuration

### 1. Install Python Dependencies

```bash
cd stem/backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cp .env.example .env
```

Update the `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/stem_db
```

**Database URL Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

### 3. Initialize Database

Run the initialization script to create tables:

```bash
python init_db.py
```

You should see:
```
============================================================
PostgreSQL Database Initialization
============================================================

📊 Database URL: localhost:5432/stem_db

🔌 Testing database connection...
✅ Database connection successful!

📝 Creating database tables...
✅ Database tables created successfully!

🎉 Database initialization complete!
```

## Database Schema

The application creates the following table:

### submissions

| Column | Type | Description |
|--------|------|-------------|
| id | String | Primary key (UUID) |
| user_id | String | User identifier |
| created_at | String | Creation timestamp |
| name | String | Submission name |
| status | String | Submission status (default: "SUBMITTED") |
| responses | Text | JSON-encoded responses |
| submitted_at | DateTime | Submission timestamp |

## Testing the Connection

You can test your PostgreSQL connection:

```bash
# Using psql
psql -U postgres -d stem_db -c "SELECT 1;"

# Using Python
python -c "from app.models.database import engine; from sqlalchemy import text; engine.connect().execute(text('SELECT 1'))"
```

## Troubleshooting

### Connection Refused

**Issue:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
- Ensure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check if PostgreSQL is listening on port 5432: `lsof -i :5432`

### Authentication Failed

**Issue:** `FATAL: password authentication failed`

**Solution:**
- Verify credentials in `.env` file
- Reset password: `psql postgres -c "ALTER USER postgres PASSWORD 'new_password';"`

### Database Does Not Exist

**Issue:** `FATAL: database "stem_db" does not exist`

**Solution:**
```bash
psql postgres -c "CREATE DATABASE stem_db;"
```

### Permission Denied

**Issue:** `permission denied for schema public`

**Solution:**
```bash
psql stem_db -c "GRANT ALL ON SCHEMA public TO postgres;"
```

## Production Deployment

For production (e.g., Railway, Heroku):

1. Use the provided DATABASE_URL from your hosting provider
2. Update `.env` with the production DATABASE_URL
3. Set `LOG_FORMAT=json` for structured logging
4. Run `python init_db.py` to initialize tables

Example Railway configuration:
```env
DATABASE_URL=postgresql://postgres:password@host.railway.app:5432/railway
LOG_FORMAT=json
LOG_LEVEL=INFO
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [FastAPI Database Documentation](https://fastapi.tiangolo.com/tutorial/sql-databases/)
