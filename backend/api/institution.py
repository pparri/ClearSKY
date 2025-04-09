from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from crud.institution import create_institution, get_institutions, get_institution_by_id
from db.database import SessionLocal
from models.institution import InstitutionBase, InstitutionInDB

router = APIRouter()

# Dependență pentru sesiunea DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/institutions/", response_model=InstitutionInDB)
async def register_institution(institution_data: InstitutionBase, db: Session = Depends(get_db)):
    institution = await create_institution(institution_data, db)
    return institution

@router.get("/institutions/", response_model=list[InstitutionInDB])
async def list_institutions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    institutions = await get_institutions(skip, limit, db)
    return institutions

@router.get("/institutions/{institution_id}", response_model=InstitutionInDB)
async def get_institution(institution_id: str, db: Session = Depends(get_db)):
    institution = await get_institution_by_id(institution_id, db)
    if institution is None:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution
