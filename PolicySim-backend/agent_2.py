import os
import json
import logging
import pandas as pd
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
from adapters import fetch_sector_data

# Setup
load_dotenv()
logging.basicConfig(level=logging.ERROR) # Set to ERROR to suppress INFO logs
logger = logging.getLogger(__name__)

class VulnerabilityAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash-lite")

    def _clean_json(self, text: str) -> str:
        """Cleans markdown formatting from LLM JSON response."""
        text = text.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "", 1)
        if text.startswith("```"):
            text = text.replace("```", "", 1)
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def _normalize_series(self, series: pd.Series) -> pd.Series:
        """Min-Max normalization to 0-1 range."""
        if series.max() == series.min():
            return pd.Series(0, index=series.index)
        return (series - series.min()) / (series.max() - series.min())

    def _get_readable_names(self, technical_names: list) -> list:
        """
        Uses LLM to convert technical column names (e.g., P_SC) 
        to human-readable labels (e.g., Scheduled Caste Population).
        """
        prompt = f"""
        Act as a Data Dictionary Assistant.
        Convert these technical Indian Census/Urban Data column names into clear, human-readable labels (Title Case).

        INPUT: {json.dumps(technical_names)}

        EXAMPLES:
        "TOT_P" -> "Total Population"
        "P_SC" -> "Scheduled Caste Population"
        "P_LIT" -> "Literate Population"
        "MAINWORK_P" -> "Main Workers"
        "POVERTY_PROXY" -> "Poverty Index"

        OUTPUT: A JSON list of strings strictly matching the order of input.
        """
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(self._clean_json(response.text))
        except Exception as e:
            logger.warning(f"Failed to translate names: {e}")
            return technical_names

    def analyze_and_calculate(self, city: str, sector: str, policy_text: str):
        """
        Fetches data, calculates vulnerability, and returns a clean JSON summary.
        """
        # 1. Fetch Data (Silently)
        try:
            gdf, df = fetch_sector_data(city, sector)
        except Exception as e:
            logger.error(f"Adapter failed: {e}")
            return None

        # 2. Prepare Data Columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        exclude_cols = ['State_Code', 'Town_Code', 'area_km2']
        candidate_cols = [c for c in numeric_cols if c not in exclude_cols]
        
        # 3. LLM Prompt for Weights
        prompt = f"""
        You are a Public Policy Impact Analyst AI.
        
        INPUT CONTEXT:
        City: {city} | Sector: {sector} | Available Columns: {json.dumps(candidate_cols)}
        
        POLICY: "{policy_text}"

        TASK:
        1. Select data columns relevant to vulnerability under this policy.
        2. Assign weights (sum = 1.0).
        
        OUTPUT JSON ONLY:
        {{
            "weights": {{ "COL_NAME": 0.X, ... }},
            "high_level_reasoning": "Brief explanation of why these factors were chosen."
        }}
        """

        try:
            response = self.model.generate_content(
                prompt, 
                generation_config={"response_mime_type": "application/json"}
            )
            result_json = json.loads(self._clean_json(response.text))
            weights = result_json.get("weights", {})
            reasoning = result_json.get("high_level_reasoning", "")

            # Normalize weights if needed
            total_weight = sum(weights.values())
            if total_weight > 0 and not (0.95 <= total_weight <= 1.05):
                weights = {k: v/total_weight for k, v in weights.items()}

        except Exception as e:
            logger.error(f"LLM Analysis failed: {e}")
            return None

        # 4. Calculate Scores (Internal calculation, no print)
        df['VULN_INDEX'] = 0.0
        for feature, weight in weights.items():
            if feature in df.columns:
                normalized_col = self._normalize_series(df[feature])
                df['VULN_INDEX'] += normalized_col * weight

        # 5. Format Output
        # Sort weights to find top fields
        sorted_weights = sorted(weights.items(), key=lambda x: x[1], reverse=True)
        
        # Get Technical Names (for Formula)
        top_fields_tech = [k for k, v in sorted_weights[:3]] 
        
        # Get Human Readable Names (via LLM)
        top_fields_human = self._get_readable_names(top_fields_tech)
        
        # Construct formula string using TECHNICAL names (Essential for Agent 3 math)
        formula_parts = [f"{v:.2f} * {k}" for k, v in weights.items()]
        formula_str = " + ".join(formula_parts)

        output_payload = {
            "vulnerability_factors": {
                "top_fields": top_fields_human, # Display: "Total Population"
                "reasoning": reasoning
            },
            "formula": formula_str # Logic: "0.2 * TOT_P..."
        }

        # Print the requested format
        print(json.dumps(output_payload, indent=4))
        
        return output_payload

# ==========================================
# EXECUTION
# ==========================================
if __name__ == "__main__":
    MY_API_KEY = os.getenv("GOOGLE_API_KEY")
    
    if not MY_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment")

    agent = VulnerabilityAgent(api_key=MY_API_KEY)

    # Example Inputs
    target_city = "Hyderabad"
    target_sector = "EDUCATION" 
    
    # Using the Policy from your prompt 
    policy_input = """
    National Education Policy 2020: 
    Focuses on social justice, equity, and inclusion. 
    Aims to bridge gaps for marginalized communities and improve foundational literacy.
    """

    result = agent.analyze_and_calculate(
        city=target_city, 
        sector=target_sector, 
        policy_text=policy_input
    )