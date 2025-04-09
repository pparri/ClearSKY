from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from models.institution import InstitutionBase

# Crează sesiunile de bază de date
db = SessionLocal()

# Exemplu de date pentru populație
institutions = [
    {"name": "University A", "address": "Address A", "representative_email": "email_a@example.com"},
    {"name": "University B", "address": "Address B", "representative_email": "email_b@example.com"},
    {"name": "University C", "address": "Address C", "representative_email": "email_c@example.com"},
]

# Populare
for institution_data in institutions:
    institution = InstitutionBase(**institution_data)
    db.add(institution)

# Comite și închide sesiunea
db.commit()
db.close()
