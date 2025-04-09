import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Obținem informațiile din variabilele de mediu
DB_HOST = os.getenv("DB_HOST", "postgres")  # Numele serviciului din docker-compose
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "clearsky")
DB_PASSWORD = os.getenv("DB_PASSWORD", "securepassword")
DB_NAME = os.getenv("DB_NAME", "clearsky")

# Creăm URL-ul de conexiune
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Crearea motorului de conexiune
engine = create_engine(DATABASE_URL)

# Crearea unei sesiuni de conectare la baza de date
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Definirea bazei de date
Base = declarative_base()

