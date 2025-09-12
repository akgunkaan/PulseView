from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geometry
from .database import Base

class GeoSpot(Base):
    __tablename__ = "geo_spots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    location = Column(Geometry(geometry_type='POINT', srid=4326))