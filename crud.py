from sqlalchemy.orm import Session
from geoalchemy2.functions import ST_X, ST_Y
from . import models, schemas

def get_spots(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieves spots from the database and extracts latitude/longitude information.
    """
    results = db.query(
            models.GeoSpot.id,
            models.GeoSpot.name,
            models.GeoSpot.category,
            ST_Y(models.GeoSpot.location).label('latitude'),
            ST_X(models.GeoSpot.location).label('longitude')
        ).offset(skip).limit(limit).all()
    # Convert results to a list of dictionaries suitable for the Pydantic model
    return [schemas.UrbanSpot.from_orm(row) for row in results]

def create_spot(db: Session, spot: schemas.UrbanSpotCreate):
    """
    Creates a new GeoSpot.
    """
    wkt_location = f'POINT({spot.longitude} {spot.latitude})'
    db_spot = models.GeoSpot(name=spot.name, category=spot.category, location=wkt_location)
    db.add(db_spot)
    db.commit()
    db.refresh(db_spot)
    # Return the new spot by converting the SQLAlchemy object to a Pydantic model
    return schemas.UrbanSpot.from_orm(db_spot)