import os
import shutil
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import logging

from master_agent import run_master_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("API")

app = FastAPI(title="Policy Impact AI Agent")

# 1. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIRS = {
    "maps": os.path.join(BASE_DIR, "static", "maps"),
    "data": os.path.join(BASE_DIR, "static", "data"),
    "reports": os.path.join(BASE_DIR, "static", "reports"),
    "uploads": os.path.join(BASE_DIR, "temp_uploads")
}

for key, path in DIRS.items():
    os.makedirs(path, exist_ok=True)

# Serves files at http://localhost:8000/static/...
app.mount("/static", StaticFiles(directory="static"), name="static")

# ==========================================
# HELPER: Safe File Move
# ==========================================
def safe_move_file(src_path: str, dest_folder: str, new_filename: str = None):
    """Moves a file to destination, overwriting if it exists."""
    if not os.path.exists(src_path):
        return None
    
    filename = new_filename if new_filename else os.path.basename(src_path)
    dest_path = os.path.join(dest_folder, filename)
    
    if os.path.exists(dest_path):
        os.remove(dest_path)
        
    shutil.move(src_path, dest_path)
    return filename

# ==========================================
# ENDPOINT
# ==========================================
@app.post("/analyze_policy")
async def analyze_policy(
    city: str = Form(..., description="Name of the city (e.g., Hyderabad)"),
    policy_text: Optional[str] = Form(None, description="Raw text of the policy"),
    file: Optional[UploadFile] = File(None, description="Upload PDF policy document")
):
    """
    Main Endpoint: Accepts Text OR PDF + City. 
    Runs the multi-agent pipeline and returns comprehensive risk analysis.
    """
    
    if not policy_text and not file:
        raise HTTPException(status_code=400, detail="Either 'policy_text' or 'file' must be provided.")

    input_path = ""
    is_file_upload = False

    if file:
        try:
            file_location = os.path.join(DIRS["uploads"], file.filename)
            with open(file_location, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            input_path = file_location
            is_file_upload = True
            logger.info(f"File uploaded to: {input_path}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    else:
        input_path = policy_text

    geojson_filename = f"{city.lower()}_wards_standardized.geojson"
    geojson_path = os.path.join(BASE_DIR, "census_data", geojson_filename)

    if not os.path.exists(geojson_path):
        geojson_path = os.path.join(BASE_DIR, "census_data", f"{city}_wards.geojson")
        if not os.path.exists(geojson_path):
             raise HTTPException(
                status_code=404, 
                detail=f"GeoJSON data for city '{city}' not found in census_data/ folder."
            )

    try:
        logger.info(f"Starting pipeline for {city}...")
        
        result = run_master_pipeline(
            pdf_path=input_path, 
            city_override=city, 
            geojson_path=geojson_path
        )

        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("message"))

    except Exception as e:
        logger.error(f"Pipeline Error: {str(e)}")
        if is_file_upload and os.path.exists(input_path):
            os.remove(input_path)
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")
    
    if is_file_upload and os.path.exists(input_path):
        os.remove(input_path)

    map_url = result.get("map_url", "")
    if map_url:
        map_filename = os.path.basename(map_url) # Extract "city_risk_map.html"
        src_map = os.path.join(BASE_DIR, map_filename)
        
        moved_name = safe_move_file(src_map, DIRS["maps"])
        if moved_name:
            result["map_url"] = f"http://localhost:8000/static/maps/{moved_name}"

    personas_url = result["details"]["simulation"].get("personas_url", "")
    if personas_url:
        json_filename = os.path.basename(personas_url) # "personas.json"
        
        src_json = os.path.join(BASE_DIR, "personas.json")
        
        new_name = f"{city}_personas.json"
        
        moved_name = safe_move_file(src_json, DIRS["data"], new_filename=new_name)
        
        if moved_name:
            result["details"]["simulation"]["personas_url"] = f"http://localhost:8000/static/data/{moved_name}"
    
    return result

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Policy Agent API...")
    uvicorn.run(app, port=8000)