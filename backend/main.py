from fastapi import FastAPI
from api.institution import router as institution_router

# Crearea aplicației FastAPI
app = FastAPI()

# Înregistrarea rutelor API
app.include_router(institution_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the ClearSKY back-end!"}
