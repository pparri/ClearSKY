from db.database import institutions_collection
from db.database import institutions_collection
from models.institution import InstitutionBase, InstitutionInDB


# Convert MongoDB's ObjectId to string for easy use
def institution_helper(institution) -> InstitutionInDB:
    return InstitutionInDB(
        id=str(institution["_id"]),
        name=institution["name"],
        address=institution["address"],
        representative_email=institution["representative_email"]
    )

# Create a new institution
async def create_institution(institution_data: InstitutionBase):
    institution_dict = institution_data.dict()
    institution = await institutions_collection.insert_one(institution_dict)
    new_institution = await institutions_collection.find_one({"_id": institution.inserted_id})
    return institution_helper(new_institution)

# Get all institutions
async def get_institutions(skip: int = 0, limit: int = 100):
    institutions = []
    async for institution in institutions_collection.find().skip(skip).limit(limit):
        institutions.append(institution_helper(institution))
    return institutions

# Get an institution by ID
async def get_institution_by_id(institution_id: str):
    institution = await institutions_collection.find_one({"_id": ObjectId(institution_id)})
    if institution:
        return institution_helper(institution)
    return None

