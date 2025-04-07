from pydantic import BaseModel

# Define a Pydantic model for validation
class InstitutionBase(BaseModel):
    name: str
    address: str
    representative_email: str

# Model for output response
class InstitutionInDB(InstitutionBase):
    id: str
