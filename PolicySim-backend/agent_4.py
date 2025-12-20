import folium
import geopandas as gpd
import pandas as pd
import json
import os
import logging
from typing import Dict, List, Any

# Configure Logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

class MapGenerationAgent:
    def __init__(self):
        self.COLORS = {
            "HIGH": "#E74C3C",    # Red
            "MEDIUM": "#F39C12",  # Orange
            "LOW": "#27AE60",     # Green
            "DEFAULT": "#95A5A6"  # Grey
        }

    def execute(self, 
                agent3_output: Dict, 
                geojson_path: str, 
                map_output_path: str = "policy_risk_map.html"):
        """
        Generates an interactive map based on Agent 3's risk assessment.
        """
        
        # 1. Extract Data from Agent 3's new structure
        try:
            risk_data = agent3_output.get('risk_counts', {})
            ward_details = risk_data.get('risk_assessment_details', [])
            
            if not ward_details:
                logger.error("No ward details found in Agent 3 output.")
                return {"error": "Missing ward details"}
                
        except Exception as e:
            logger.error(f"Failed to parse Agent 3 output: {e}")
            return {"error": str(e)}

        # 2. Prepare Dataframe
        df = pd.DataFrame(ward_details)

        # 3. Load GeoJSON
        if not os.path.exists(geojson_path):
            logger.error(f"GeoJSON file not found at: {geojson_path}")
            return {"error": f"GeoJSON missing: {geojson_path}"}
            
        try:
            gdf = gpd.read_file(geojson_path)
        except Exception as e:
            logger.error(f"Error reading GeoJSON: {e}")
            return {"error": f"Invalid GeoJSON: {e}"}

        # 4. Standardization & Merging
        # Normalize column names for merging (lowercase, strip)
        gdf_cols = [c.lower() for c in gdf.columns]
        
        # Try to find the ward name column in GeoJSON
        possible_names = ['ward_name', 'wardname', 'ward', 'name']
        name_col = next((col for col in gdf.columns if col.lower() in possible_names), None)
        
        if not name_col:
            # Fallback to first column if no name column found
            name_col = gdf.columns[0] 

        # Create join keys
        gdf['join_key'] = gdf[name_col].astype(str).str.lower().str.strip()
        df['join_key'] = df['Ward_Name'].astype(str).str.lower().str.strip()
        
        # Merge Data
        merged = gdf.merge(df, on='join_key', how='left')
        
        # Fill NaN values for wards that didn't match
        merged['RISK_CATEGORY'] = merged['RISK_CATEGORY'].fillna('DEFAULT')
        merged['VULN_INDEX'] = merged['VULN_INDEX'].fillna(0)
        
        # 5. Create Folium Map
        try:
            # Center map
            center_lat = merged.geometry.centroid.y.mean()
            center_lon = merged.geometry.centroid.x.mean()
            m = folium.Map(location=[center_lat, center_lon], zoom_start=11, tiles="CartoDB positron")
            
            # Styling function
            def style_fn(feature):
                risk = feature['properties'].get('RISK_CATEGORY', 'DEFAULT')
                return {
                    'fillColor': self.COLORS.get(risk, self.COLORS['DEFAULT']),
                    'color': 'black', 
                    'weight': 1, 
                    'fillOpacity': 0.7
                }
            
            # Add GeoJson Layer
            folium.GeoJson(
                merged,
                name="Vulnerability Map",
                style_function=style_fn,
                tooltip=folium.GeoJsonTooltip(
                    fields=[name_col, 'RISK_CATEGORY', 'VULN_INDEX'],
                    aliases=['Ward:', 'Risk:', 'Score:'],
                    localize=True
                )
            ).add_to(m)
            
            # Add Legend
            legend_html = f'''
                 <div style="position: fixed; bottom: 50px; left: 50px; width: 150px; height: 110px; 
                 border:2px solid grey; z-index:9999; font-size:14px;
                 background-color:white; opacity: 0.9; padding: 10px;">
                 <b>Risk Legend</b><br>
                 <i style="background:{self.COLORS['HIGH']};width:10px;height:10px;display:inline-block;margin-right:5px;"></i> High Risk<br>
                 <i style="background:{self.COLORS['MEDIUM']};width:10px;height:10px;display:inline-block;margin-right:5px;"></i> Medium Risk<br>
                 <i style="background:{self.COLORS['LOW']};width:10px;height:10px;display:inline-block;margin-right:5px;"></i> Low Risk<br>
                 <i style="background:{self.COLORS['DEFAULT']};width:10px;height:10px;display:inline-block;margin-right:5px;"></i> No Data
                 </div>
                 '''
            m.get_root().html.add_child(folium.Element(legend_html))
            
            # Save Map
            m.save(map_output_path)
            
            output_payload = {
                "map_generation": {
                    "status": "success",
                    "file_path": map_output_path
                }
            }
            
            # Print JSON output
            print(json.dumps(output_payload, indent=4))
            return output_payload

        except Exception as e:
            logger.error(f"Folium map generation failed: {e}")
            return {"error": f"Map generation failed: {e}"}

# ==========================================
# EXECUTION EXAMPLE
# ==========================================
if __name__ == "__main__":
    
    # Mock Output from Agent 3 (New Format)
    mock_agent3_output = {
        "risk_counts": {
            "stats": {"high": 2, "medium": 0, "low": 1},
            "impact_summary": "High risk concentrated in Kempegowda Ward...",
            "risk_assessment_details": [
                {'Ward_Name': 'Kempegowda Ward', 'VULN_INDEX': 0.85, 'RISK_CATEGORY': 'HIGH'},
                {'Ward_Name': 'Chowdeswari Ward', 'VULN_INDEX': 0.72, 'RISK_CATEGORY': 'HIGH'},
                {'Ward_Name': 'Hebbal', 'VULN_INDEX': 0.30, 'RISK_CATEGORY': 'LOW'}
            ]
        }
    }

    # Path to a valid GeoJSON for testing (Ensure this file exists or change path)
    geojson_input = "census_data/bangalore_wards_standardized.geojson" 
    
    # Initialize Agent
    agent = MapGenerationAgent()
    
    # Execute
    if os.path.exists(geojson_input):
        agent.execute(
            agent3_output=mock_agent3_output,
            geojson_path=geojson_input,
            map_output_path="final_risk_map.html"
        )
    else:
        print(json.dumps({"error": "GeoJSON file not found for testing"}, indent=4))