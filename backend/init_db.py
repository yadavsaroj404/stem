"""
Database initialization script
Run this script to create the database tables
"""

from app.models.database import create_tables, engine
from app.core.config import settings
from sqlalchemy import text

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("PostgreSQL Database Initialization")
    print("=" * 60)

    print(f"\n📊 Database URL: {settings.database_url.split('@')[-1]}")  # Hide credentials

    print("\n🔌 Testing database connection...")
    if not test_connection():
        print("\n⚠️  Please check your DATABASE_URL in the .env file")
        print("   Make sure PostgreSQL is running and credentials are correct")
        exit(1)

    print("✅ Database connection successful!")

    print("\n📝 Creating database tables...")
    try:
        create_tables()
        print("✅ Database tables created successfully!")
        print("\n🎉 Database initialization complete!")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        exit(1)