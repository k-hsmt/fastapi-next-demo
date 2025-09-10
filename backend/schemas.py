# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=1, max_length=2000)

class ContactOut(BaseModel):
    ok: bool
    received: ContactIn

# 一覧用（最低限）
class ContactRow(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str
    created_at: datetime