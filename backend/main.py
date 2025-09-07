from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from schemas import ContactIn, ContactOut
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
def create_contact(payload: ContactIn):
    # まずはログに記録（実サービスならDB保存やメール送信へ拡張）
    logger.info(
        "Contact received: name=%s email=%s message_len=%d",
        payload.name, payload.email, len(payload.message)
    )
    return ContactOut(ok=True, received=payload)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}

class Message(BaseModel):
    text: str

@app.post("/echo")
def echo(message: Message):
    return {"received": message.text, "reply":"ダミー応答です"}
