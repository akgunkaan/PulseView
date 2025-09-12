from pydantic import BaseModel

class UrbanSpotBase(BaseModel):
    name: str
    category: str

class UrbanSpot(UrbanSpotBase):
    id: int
    latitude: float
    longitude: float
    class Config:
        orm_mode = True