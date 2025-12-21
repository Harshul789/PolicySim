import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv

# ====================================================
# IMPORT AGENTS
# ====================================================
try:
    from agent_1 import analyze_policy_agent
    from agent_2 import VulnerabilityAgent
    from agent_3 import RiskBucketingAgent
    from agent_4 import MapGenerationAgent
    from agent_5 import PersonaSimulationAgent
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Ensure agent_1.py, agent_2.py, agent_3.py, agent_4.py, and agent_5.py are in the same directory.")
    exit(1)

logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
load_dotenv()

# ====================================================
# HELPERS
# ====================================================
def parse_weights_from_formula(formula_str: str) -> dict:
    weights = {}
    try:
        terms = formula_str.split(' + ')
        for term in terms:
            parts = term.split(' * ')
            if len(parts) == 2:
                weights[parts[1].strip()] = float(parts[0].strip())
        return weights
    except Exception:
        return {}

def generate_master_summary(api_key, city, policy_title, risk_pct, top_drivers):
    """Generates a one-line executive summary."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"""
    Context: Policy Analysis for {city}. Policy: "{policy_title}"
    Data: {risk_pct}% High Risk. Drivers: {', '.join(top_drivers)}.
    Task: Write a single, high-impact sentence summarizing the risk magnitude and cause.
    """
    try:
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception:
        return f"Policy puts {risk_pct}% of the city at risk due to {top_drivers[0]}."

def generate_strategic_insights(api_key, city, policy_summary, top_drivers, risk_pct):
    """
    Generates Macro/Micro impacts and Strategic Findings using LLM.
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash") # Fast & efficient
    
    prompt = f"""
    ACT AS: Senior Policy Strategist for {city}.
    
    CONTEXT:
    - Policy: "{policy_summary}"
    - Risk Level: {risk_pct}% of the city is High Risk.
    - Key Vulnerability Drivers: {', '.join(top_drivers)}.
    
    TASK: Generate a JSON insights report with exactly this structure:
    
    1. "macro_impact": List of 3 distinct bullet points on city-wide/systemic impact.
    2. "micro_impact": List of 3 distinct bullet points on individual/household level impact.
    3. "strategic_findings": List of exactly 4 objects. Each object must have:
       - "heading": Short title (2-4 words).
       - "explanation": 1 sentence explanation.
       - "sentiment": "Positive" or "Negative".

    OUTPUT JSON ONLY. Do not use Markdown.
    """
    
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        text = response.text.strip()
        # Clean potential markdown
        if text.startswith("```json"): text = text.replace("```json", "", 1)
        if text.startswith("```"): text = text.replace("```", "", 1)
        if text.endswith("```"): text = text[:-3]
        return json.loads(text)
    except Exception as e:
        # Fallback if LLM fails
        return {
            "macro_impact": ["Systemic strain on welfare infrastructure.", "Administrative efficiency changes.", "Economic shifts in vulnerable zones."],
            "micro_impact": ["Individual access barriers.", "Short-term financial stress.", "Inclusion benefits."],
            "strategic_findings": [
                {"heading": "Implementation Risk", "explanation": "Dependency on infrastructure may exclude the poor.", "sentiment": "Negative"},
                {"heading": "Data Integrity", "explanation": "Reduction in ghost beneficiaries saves funds.", "sentiment": "Positive"},
                {"heading": "Social Friction", "explanation": "Potential for unrest in high-risk wards.", "sentiment": "Negative"},
                {"heading": "Long-term Efficiency", "explanation": "Streamlined processes for future delivery.", "sentiment": "Positive"}
            ]
        }

# ====================================================
# MASTER PIPELINE
# ====================================================
def run_master_pipeline(pdf_path: str, city_override: str = None, geojson_path: str = "city.geojson"):
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"status": "error", "message": "API Key missing"}

    print("\n" + "█"*60)
    print("█  MASTER AGENT: STARTING POLICY PIPELINE")
    print("█" + "█"*60)

    # ----------------------------------------------------
    # STEP 1: AGENT 1 (Policy Extraction)
    # ----------------------------------------------------
    print("\n🔹 [STEP 1] Running Agent 1: Extracting Policy Info...")
    policy_data = analyze_policy_agent(
        api_key=api_key,
        city=city_override if city_override else "Hyderabad",
        input_data=pdf_path,
        is_pdf=pdf_path.endswith(".pdf")
    )
    if "error" in policy_data: return {"status": "error", "message": policy_data['error']}
    
    extracted_city = policy_data.get('city', city_override)
    extracted_sector = policy_data.get('sector', 'SOCIAL_WELFARE')
    extracted_summary = policy_data.get('summary', '')

    # ----------------------------------------------------
    # STEP 2: AGENT 2 (Vulnerability Weights)
    # ----------------------------------------------------
    print("\n🔹 [STEP 2] Running Agent 2: Determining Vulnerability Factors...")
    vuln_agent = VulnerabilityAgent(api_key=api_key)
    agent2_output = vuln_agent.analyze_and_calculate(
        city=extracted_city,
        sector=extracted_sector,
        policy_text=json.dumps(policy_data)
    )
    if not agent2_output or "formula" not in agent2_output: return {"status": "error", "message": "Agent 2 failed"}
    weights_dict = parse_weights_from_formula(agent2_output['formula'])

    # ----------------------------------------------------
    # STEP 3: AGENT 3 (Risk Bucketing)
    # ----------------------------------------------------
    print("\n🔹 [STEP 3] Running Agent 3: Risk Assessment & Bucketing...")
    risk_agent = RiskBucketingAgent(api_key=api_key)
    risk_output = risk_agent.execute(
        city=extracted_city,
        sector=extracted_sector,
        weights=weights_dict
    )
    if not risk_output: return {"status": "error", "message": "Agent 3 failed"}

    # Calculate Score
    stats = risk_output['risk_counts']['stats']
    total = stats['high'] + stats['medium'] + stats['low']
    high_risk_pct = round((stats['high'] / total) * 100, 1) if total > 0 else 0
    
    # Extract Key Metrics (From Agent 3)
    key_metrics = risk_output['risk_counts'].get('key_metrics', {})

    # ----------------------------------------------------
    # STEP 4: AGENT 4 (Map Generation)
    # ----------------------------------------------------
    print("\n🔹 [STEP 4] Running Agent 4: Generating Visualization...")
    map_filename = f"{extracted_city}_risk_map.html".replace(" ", "_")
    map_agent = MapGenerationAgent()
    map_agent.execute(risk_output, geojson_path, map_filename)

    # ----------------------------------------------------
    # STEP 5: AGENT 5 (Simulation & Debate)
    # ----------------------------------------------------
    print("\n🔹 [STEP 5] Running Agent 5: Human Impact Simulation...")
    sim_agent = PersonaSimulationAgent(api_key=api_key)
    
    # Passing the risk report (Agent 3) and policy summary (Agent 1)
    sim_output = sim_agent.execute(
        city=extracted_city,
        sector=extracted_sector,
        risk_report=risk_output,
        policy_summary=extracted_summary
    )
    
    # Handle optional failure in simulation elegantly
    if sim_output.get("status") != "success":
        print(f"⚠️ Simulation warning: {sim_output.get('message')}")

    # ----------------------------------------------------
    # STEP 6: FINAL SYNTHESIS
    # ----------------------------------------------------
    print("\n🔹 [STEP 6] Finalizing Report...")
    top_fields = agent2_output['vulnerability_factors']['top_fields']
    
    # 1. Generate One-Line Master Summary
    master_summary = generate_master_summary(
        api_key=api_key,
        city=extracted_city,
        policy_title=policy_data.get('title', 'Unknown'),
        risk_pct=high_risk_pct,
        top_drivers=top_fields[:2]
    )

    # 2. Generate Detailed Strategic Insights
    print("   ...Generating Strategic Insights (Macro/Micro/Findings)...")
    strategic_data = generate_strategic_insights(
        api_key=api_key,
        city=extracted_city,
        policy_summary=extracted_summary,
        top_drivers=top_fields,
        risk_pct=high_risk_pct
    )

    # FINAL JSON STRUCTURE
    APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8000")
    base_url = f"{APP_BASE_URL}/static"
    
    final_json = {
        "status": "success",
        "overall_risk_score": f"{high_risk_pct}%",
        "master_summary": master_summary,
        "key_metrics": key_metrics, 
        "map_url": f"{base_url}/maps/{map_filename}",
        "pdf_report_url": f"{base_url}/reports/{extracted_city}_report.pdf",
        "details": {
            # Strategic Insights
            "macro_impact": strategic_data.get("macro_impact", []),
            "micro_impact": strategic_data.get("micro_impact", []),
            "strategic_findings": strategic_data.get("strategic_findings", []),
            
            # Policy Info
            "policy_insights": {
                "rules": policy_data.get("rules_extracted", []),
                "summary": extracted_summary
            },
            
            # Vulnerability Factors
            "vulnerability_factors": {
                "top_fields": top_fields,
                "reasoning": agent2_output['vulnerability_factors']['reasoning']
            },
            
            # Risk Stats
            "risk_counts": {
                "stats": stats,
                "impact_summary": risk_output['risk_counts']['impact_summary']
            },
            
            # Simulation Results
            "simulation": { 
                "personas_url": f"{base_url}/data/{sim_output.get('json_path', 'personas.json')}",
                "count": len(sim_output.get("personas", [])),
                "debate_transcript": sim_output.get("debate_transcript", "Simulation unavailable.")
            }
        }
    }

    print("\n" + "█"*60)
    print("█  PIPELINE COMPLETE ")
    print("█" + "█"*60)
    
    # Print the Final JSON structure strictly
    print(json.dumps(final_json, indent=4))
    
    return final_json

# ====================================================
# EXECUTION
# ====================================================
if __name__ == "__main__":
    
    # 1. Input Policy (Text or PDF Path)
    INPUT_DATA = """
    Digital Ration Card Policy 2025:
    All households must perform biometric authentication at Fair Price Shops (FPS) monthly.
    Failure to authenticate for 2 consecutive months results in temporary card suspension.
    Intended to curb ghost beneficiaries and leakage in the PDS system.
    """
    
    # 2. Config
    GEOJSON_FILE = "census_data/hyderabad_wards_standardized.geojson" 
    CITY_NAME = "Hyderabad"

    # 3. Run Pipeline
    if os.path.exists(GEOJSON_FILE):
        run_master_pipeline(INPUT_DATA, CITY_NAME, GEOJSON_FILE)
    else:
        print(f"❌ Error: GeoJSON file not found at {GEOJSON_FILE}")