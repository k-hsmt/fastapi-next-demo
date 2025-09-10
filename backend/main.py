from fastapi import FastAPI,Depends
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Contact
from crud import create_contact
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from schemas import ContactIn, ContactOut,ContactRow
from typing import List
import logging

app = FastAPI()
origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://fastapi-next-demo.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # プレビュー用サブドメインも許可
    allow_credentials=True,   # 認証付きfetchを想定しないなら True/FalseどちらでもOK
    allow_methods=["*"],
    allow_headers=["*"], 
)

# ★ 起動時にテーブル作成（Alembicなしの最短ルート）
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# ロガー
logger = logging.getLogger("contact")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

@app.post("/contact", response_model=ContactOut)
def create_contact_endpoint(payload: ContactIn, db: Session = Depends(get_db)):
    logger.info(
        "Contact received: name=%s email=%s message_len=%d",
        payload.name, payload.email, len(payload.message)
    )
    _row = create_contact(db, payload)     # ← 保存！
    return ContactOut(ok=True, received=payload)

@app.get("/contact/list", response_model=List[ContactRow])
def list_contacts(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(Contact).order_by(Contact.id.desc()).limit(limit).all()
    return [
        ContactRow(
            id=r.id, name=r.name, email=r.email, message=r.message, created_at=r.created_at
        )
        for r in rows
    ]

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

class Message(BaseModel):
    text: str

@app.post("/echo")
def echo(message: Message):
    return {"received": message.text, "reply":"ダミー応答です"}
