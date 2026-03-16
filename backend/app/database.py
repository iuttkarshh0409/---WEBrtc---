from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Use SQLite for simplicity in local demo instead of PostgreSQL, 
# although PostgreSQL was mentioned it requires external setup. 
# We'll configure it so it uses Postgres if provided, fallback to SQLite.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./webrtc.db")

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
