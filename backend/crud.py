# backend/crud.py
from sqlalchemy.orm import Session
from models import Contact
from schemas import ContactIn

def create_contact(db: Session, payload: ContactIn) -> Contact:
    row = Contact(name=payload.name, email=payload.email, message=payload.message)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
