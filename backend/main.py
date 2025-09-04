from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
origins = [
    "http://localhost:3000",      # 開発中のNext.js
    "http://127.0.0.1:3000",
    "https://fastapi-next-demo.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # プレビュー用サブドメインも許可
    allow_credentials=True,   # 認証付きfetchを想定しないなら True/FalseどちらでもOK
    allow_methods=["*"],
    allow_headers=["*"], # または ["content-type", "authorization", ...]
)

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

class Message(BaseModel):
    text: str

@app.post("/echo")
def echo(message: Message):
    return {"received": message.text, "reply":"ダミー応答です"}
