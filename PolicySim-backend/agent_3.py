import logging
import pandas as pd
import numpy as np
import json
import google.generativeai as genai
from typing import Dict, List, Any
import os
from dotenv import load_dotenv
from adapters import fetch_sector_data

# Setup
load_dotenv()
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

class RiskBucketingAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Using Flash for speed and low cost
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        
        self.HIGH_THRESHOLD = 0.7
        self.LOW_THRESHOLD = 0.4

    def _normalize_series(self, series: pd.Series) -> pd.Series:
        if series.max() == series.min():
            return pd.Series(0, index=series.index)
        return (series - series.min()) / (series.max() - series.min())

    def _generate_narrative(self, city, stats, top_drivers):
        """Standard narrative summary."""
        prompt = f"""
        Summarize risk for {city} in 1 sentence.
        Stats: {stats['high']} High, {stats['medium']} Med, {stats['low']} Low risk wards.
        Drivers: {', '.join(top_drivers)}.
        """
        try:
            return self.model.generate_content(prompt).text.strip()
        except:
            return "Risk analysis complete."

    def _generate_key_metrics_llm(self, city: str, high_risk_wards: List[Dict], top_driver: str):
        """
        Generates 4 specific metric cards.
        STRICT RULE: Never return 'Data Unavailable'. Estimate based on ward count if needed.
        """
        ward_count = len(high_risk_wards)
        context_preview = str(high_risk_wards[:2]) # Only send 2 rows to save tokens
        
        prompt = f"""
        Act as a Urban Data Scientist for {city}.
        
        INPUT CONTEXT:
        - High Risk Ward Count: {ward_count}
        - Top Vulnerability Driver: {top_driver}
        - Sample Data: {context_preview}
        
        TASK: Generate a JSON with 4 key metrics. 
        
        CRITICAL RULES:
        1. "high_risk_residents": Estimate the total population. If 'TOT_P' is missing in data, assume average Indian ward population (approx 35,000-50,000 per ward) * {ward_count}. Output format: "XXXXXX" number only. Dont inlcude EST. DO NOT say "Unavailable". and dont mentoin that its an estimate just a number.
        2. "impact_units": "{ward_count} Critical Zones"
        3. "economic_impact": A 2-3 word phrase describing the specific livelihood risk based on the Top Driver (e.g., "Daily Wage Loss", "Informal Sector Hit").
        4. "population_characteristics": A 2-word summary of the Top Driver (e.g., "High Illiteracy", "Dense Poverty").

        OUTPUT JSON ONLY.
        """
        
        try:
            response = self.model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            return json.loads(response.text.strip())
        except Exception as e:
            # Fallback Calculation if LLM fails
            # Estimate: 40k people per ward * number of wards
            est_pop = ward_count * 40000 
            return {
                "high_risk_residents": f"{est_pop/100000:.1f} Lakhs (Est.)",
                "impact_units": f"{ward_count} Critical Zones",
                "economic_impact": "Livelihood Disruption",
                "population_characteristics": "Vulnerable Demographics"
            }

    def execute(self, city: str, sector: str, weights: Dict[str, float]):
            
            # 1. Fetch Data
            try:
                gdf, df = fetch_sector_data(city, sector)
            except Exception as e:
                logger.error(f"Failed to fetch data: {e}")
                return None

            # 2. Apply Formula
            df['VULN_INDEX'] = 0.0
            for feature, weight in weights.items():
                if feature in df.columns:
                    norm_col = self._normalize_series(df[feature])
                    df['VULN_INDEX'] += norm_col * weight

            # 3. Bucket Wards
            def assign_bucket(score):
                if score >= self.HIGH_THRESHOLD: return "HIGH"
                elif score <= self.LOW_THRESHOLD: return "LOW"
                else: return "MEDIUM"

            df['RISK_CATEGORY'] = df['VULN_INDEX'].apply(assign_bucket)

            # 4. Calculate Stats
            high_df = df[df['RISK_CATEGORY'] == 'HIGH']
            stats = {
                "high": len(high_df),
                "medium": len(df[df['RISK_CATEGORY'] == 'MEDIUM']),
                "low": len(df[df['RISK_CATEGORY'] == 'LOW'])
            }

            # 5. Generate Metrics
            sorted_weights = sorted(weights.items(), key=lambda item: item[1], reverse=True)
            top_drivers = [k for k, v in sorted_weights[:3]]
            
            # Narrative
            narrative = self._generate_narrative(city, stats, top_drivers)
            
            # Key Metrics (LLM Call with Strict Estimation)
            high_risk_records = high_df.to_dict(orient='records')
            
            # Pass City to help with estimation context
            key_metrics = self._generate_key_metrics_llm(city, high_risk_records, top_drivers[0])

            # 6. Prepare Output
            # Export all columns to allow flexibility in future steps
            ward_details = df.to_dict(orient='records')

            output_payload = {
                "risk_counts": {
                    "stats": stats,
                    "impact_summary": narrative,
                    "key_metrics": key_metrics, 
                    "risk_assessment_details": ward_details
                }
            }

            print(json.dumps(output_payload, indent=4))
            return output_payload

# ==========================================
# EXECUTION
# ==========================================
if __name__ == "__main__":
    MY_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not MY_API_KEY: raise ValueError("API Key missing")
    
    input_weights = {"POVERTY_PROXY": 0.5, "P_ILL": 0.5}

    agent = RiskBucketingAgent(api_key=MY_API_KEY)
    agent.execute("Hyderabad", "SOCIAL_WELFARE", input_weights)