# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# SQLite ファイル（ローカルは ./app.db、Render でも動く）
DATABASE_URL = "sqlite:///./app.db"

class Base(DeclarativeBase):
    pass

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite のスレッド制約回避
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI の依存関数（DBセッション供給）
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
