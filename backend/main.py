from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from models.institution import Institution  # Asigură-te că folosești modelul corect (Institution sau InstitutionBase)

app = FastAPI()

# Crează sesiunea pentru fiecare request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ruta de test pentru a verifica dacă serverul funcționează
@app.get("/")
async def root():
    return {"message": "Welcome to the ClearSKY back-end!"}

# Exemplu de rută care folosește conexiunea la baza de date pentru a obține instituțiile
@app.get("/institutions/")
def get_institutions(db: Session = Depends(get_db)):
    institutions = db.query(Institution).all()  # Utilizăm modelul Institution pentru a obține instituțiile
    return institutions

