"""
Database initialization script
Run this script to create the database tables
"""

from app.models.database import create_tables

if __name__ == "__main__":
    print("Creating database tables...")
    create_tables()
    print("Database tables created successfully!")