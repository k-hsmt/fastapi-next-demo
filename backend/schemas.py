# backend/schemas.py
from pydantic import BaseModel, EmailStr, Field

class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=1, max_length=2000)

class ContactOut(BaseModel):
    ok: bool
    received: ContactIn
