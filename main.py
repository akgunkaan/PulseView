import time
from typing import List, Dict
from io import BytesIO
from pathlib import Path

import geopandas as gpd
import pandas as pd
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import inspect
from pydantic import BaseModel
import requests
from PIL import Image

import crud, models, schemas
from vision_encoder import VisionEncoder
from change_analyzer import ChangeAnalyzer
from caption_decoder import CaptionDecoder
from database import SessionLocal, engine

app = FastAPI(title="PulseView API")

# --- Database and Data Loading ---

# Creates the database and tables.
# In a real application, this should be managed with a migration tool like Alembic.
models.Base.metadata.create_all(bind=engine)

def init_db():
    # Check if data is already loaded
    db = SessionLocal()
    try:
        spot_count = db.query(models.GeoSpot).count()
        if spot_count == 0:
            print("No spots found in the database, loading from CSV...")
            # Adjust the path to data/urban_spots.csv according to your project structure
            csv_path = Path(__file__).parent / "data" / "urban_spots.csv"
            if not csv_path.exists():
                print(f"WARNING: Data file not found: {csv_path}")
                return
            df = pd.read_csv(csv_path)
            gdf = gpd.GeoDataFrame(
                df, geometry=gpd.points_from_xy(df.longitude, df.latitude), crs="EPSG:4326"
            )
            gdf.to_postgis(models.GeoSpot.__tablename__, engine, if_exists='append', index=False, schema='public')
            print("Data successfully loaded into PostGIS.")
    finally:
        db.close()

# --- AI Model Initialization ---

vision_encoder = VisionEncoder()
change_analyzer = ChangeAnalyzer()
caption_decoder = CaptionDecoder()


@app.on_event("startup")
def on_startup():
    # Give the DB a moment to start
    time.sleep(5)
    init_db()
    print("AI models initialized (mocked).")

# --- API Dependencies & Middleware ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the PulseView API"}

@app.get("/api/v1/spots", response_model=List[schemas.UrbanSpot])
def read_spots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Reads geographic points (spots) from the database and returns them as a Pydantic model.
    """
    spots = crud.get_spots(db, skip=skip, limit=limit)
    return spots

@app.post("/api/v1/spots", response_model=schemas.UrbanSpot)
def create_spot(spot: schemas.UrbanSpotCreate, db: Session = Depends(get_db)):
    """
    Adds a new geographic point (spot) to the database.
    Takes latitude, longitude, name, and category as input.
    """
    new_spot = crud.create_spot(db=db, spot=spot)
    return new_spot


class ChangeAnalysisRequest(BaseModel):
    image_url_pre: str
    image_url_post: str
    instruction: str


@app.post("/api/v1/change_analysis")
def analyze_changes(request: ChangeAnalysisRequest) -> Dict:
    """
    Analyzes the changes between two images, producing a change mask
    and a natural language description.
    """
    try:
        response_pre = requests.get(request.image_url_pre)
        response_pre.raise_for_status()
        image_pre = Image.open(BytesIO(response_pre.content)).convert("RGB")

        response_post = requests.get(request.image_url_post)
        response_post.raise_for_status()
        image_post = Image.open(BytesIO(response_post.content)).convert("RGB")
    except requests.exceptions.RequestException as e:
        return {"error": f"Could not download image: {e}"}
    except Exception as e:
        return {"error": f"Error processing image: {e}"}

    features_pre = vision_encoder.extract_features(image_pre)
    features_post = vision_encoder.extract_features(image_post)

    key_change_features, change_mask = change_analyzer.get_key_change_features(features_pre, features_post)
    caption = caption_decoder.generate_caption(key_change_features, request.instruction)

    return {"caption": caption, "change_mask": change_mask.tolist()}