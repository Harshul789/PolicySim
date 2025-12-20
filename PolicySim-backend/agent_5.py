import pandas as pd
import json
import logging
import random
import os
import google.generativeai as genai
from typing import List, Dict, Any
from dotenv import load_dotenv
from adapters import fetch_sector_data

# Setup
load_dotenv()
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

class PersonaSimulationAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.persona_model = genai.GenerativeModel("gemini-2.5-flash") 
        self.debate_model = genai.GenerativeModel("gemini-3-pro-preview")

    def _clean_json(self, text: str) -> str:
        """Helper to clean LLM markdown output."""
        text = text.strip()
        if text.startswith("```json"):
            text = text.replace("```json", "", 1)
        if text.startswith("```"):
            text = text.replace("```", "", 1)
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    def extract_representative_data(self, city: str, sector: str, risk_details: List[Dict], n=20):
        """
        Fetches fresh census data and filters it based on Agent 3's risk buckets.
        """
        print(f"   ...Fetching census data for {city} simulation (Target: {n} points)...")
        try:
            _, pop_df = fetch_sector_data(city, sector)
            
            risk_map = {item['Ward_Name']: item['RISK_CATEGORY'] for item in risk_details}
            
            pop_df['risk_category'] = pop_df['Ward_Name'].map(risk_map)
            
            pop_df = pop_df.dropna(subset=['risk_category'])
            
            if pop_df.empty:
                logger.warning("No matching wards found between Census Data and Risk Report.")
                pop_df['risk_category'] = "UNKNOWN"
                return pop_df.sample(min(n, len(pop_df)))

            extracted_rows = []
            buckets = ["HIGH", "MEDIUM", "LOW"]
            samples_per_bucket = {"HIGH": int(n*0.5), "MEDIUM": int(n*0.3), "LOW": int(n*0.2)}
            
            for bucket in buckets:
                subset = pop_df[pop_df['risk_category'] == bucket]
                count = samples_per_bucket.get(bucket, 2)
                
                if not subset.empty:
                    numeric_cols = subset.select_dtypes(include=['number']).columns.tolist()
                    cols_to_keep = ['Ward_Name', 'risk_category'] + numeric_cols[:10] 
                    
                    sampled = subset[cols_to_keep].sample(min(count, len(subset)))
                    extracted_rows.append(sampled)
            
            if not extracted_rows:
                return pop_df.sample(min(n, len(pop_df)))
                
            return pd.concat(extracted_rows)

        except Exception as e:
            logger.error(f"Data extraction failed: {e}")
            return pd.DataFrame()

    def generate_personas(self, sampled_df: pd.DataFrame, policy_summary: str) -> List[Dict]:
        """Call 1: Synthesize 20 personas."""
        if sampled_df.empty:
            return []

        data_summary = sampled_df.to_dict(orient='records')
        
        prompt = f"""
        ACT AS: Socio-Economic Analyst.
        POLICY CONTEXT: "{policy_summary}"
        
        INPUT DATA (Sampled Census Rows): 
        {json.dumps(data_summary)}
        
        TASK: Create exactly 20 distinct and realistic 'User Personas' based on this data.
        - Ensure diversity in age, gender, occupation, and income.
        - If a row has 'High' risk, create a vulnerable persona (e.g., daily wager, vendor).
        - If a row has 'Low' risk, create a stable/prosperous persona (e.g., techie, business owner).
        
        OUTPUT JSON Format (Array of Objects):
        [
            {{
                "name": "Name",
                "age": 30,
                "gender": "Male/Female/Other",
                "occupation": "Job Title",
                "ward": "Ward Name",
                "risk_level": "Percentage for 100%",
                "income_class": "Lower/Middle/Upper",
                "key_concern": "Specific complaint or support regarding policy",
                "citizen_voice": "A direct quote expressing their fear or support"
            }}
        ]
        """
        
        try:
            response = self.persona_model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(self._clean_json(response.text))
        except Exception as e:
            logger.error(f"Persona generation failed: {e}")
            return []

    def run_policy_debate(self, personas: List[Dict], policy_summary: str) -> str:
        """Call 2: Generate 4 pairs of 1-on-1 discussions."""
        if len(personas) < 8:
            return "Insufficient personas generated for 4 pairs (Need 8+)."

        # 1. Select 8 Diverse Personas
        # Try to mix high/low risk if possible, otherwise just take random 8
        try:
            high_risk = [p for p in personas if "High" in str(p.get('income_class', '')) or "Lower" in str(p.get('income_class', ''))]
            low_risk = [p for p in personas if "Upper" in str(p.get('income_class', '')) or "Middle" in str(p.get('income_class', ''))]
            
            # Interleave them to create contrasting pairs
            selected_personas = []
            max_len = max(len(high_risk), len(low_risk))
            for i in range(max_len):
                if i < len(high_risk): selected_personas.append(high_risk[i])
                if i < len(low_risk): selected_personas.append(low_risk[i])
                if len(selected_personas) >= 8: break
            
            # Fill with others if we don't have 8 yet
            if len(selected_personas) < 8:
                remaining = [p for p in personas if p not in selected_personas]
                selected_personas.extend(remaining[:8 - len(selected_personas)])
                
        except Exception:
            selected_personas = personas[:8]

        # 2. Build the Pair Context string
        pairs_context = ""
        pair_list = []
        
        for i in range(0, 8, 2):
            p1 = selected_personas[i]
            p2 = selected_personas[i+1]
            pair_list.append((p1, p2))
            
            pairs_context += f"""
            PAIR {int(i/2)+1}:
            - {p1['name']} ({p1['occupation']}, {p1['ward']}). Stance: {p1['key_concern']}
            - {p2['name']} ({p2['occupation']}, {p2['ward']}). Stance: {p2['key_concern']}
            """

        # 3. Prompt for 4 Mini-Discussions
        prompt = f"""
        ACT AS: A Scriptwriter for a documentary on urban policy.
        POLICY: "{policy_summary}"

        TASK: Write 4 separate, short "Street Corner Conversations". 
        For each pair defined below, write a brief exchange (1-2 lines per person max).
        NO Moderator. NO Town Hall. Just two people talking to each other directly.

        INPUT PAIRS:
        {pairs_context}

        OUTPUT FORMAT:
        
        ### Conversation 1: The Clash
        **Name 1:** "..."
        **Name 2:** "..."

        ### Conversation 2: The Practicality
        ...
        (and so on for 4 conversations)
        """
        
        try:
            response = self.debate_model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Debate generation failed: {e}")
            return "Debate generation error."

    def execute(self, city: str, sector: str, risk_report: Dict, policy_summary: str):
        """Main execution method."""
        
        # 1. Parse Input
        try:
            ward_details = risk_report.get('risk_counts', {}).get('risk_assessment_details', [])
            if not ward_details:
                print("❌ Error: 'risk_assessment_details' list is empty or missing.")
                return {"status": "error", "message": "No ward details found in input"}
        except AttributeError:
            print("❌ Error: Invalid input format.")
            return {"status": "error", "message": "Invalid input format"}

        # 2. Get Data (n=20)
        sampled_data = self.extract_representative_data(city, sector, ward_details, n=20)
        
        if sampled_data.empty:
            print("⚠️ Warning: No census data matched the ward names. Generating generic personas.")

        # 3. Generate 20 Personas
        print("   ...Synthesizing 20 digital personas...")
        personas = self.generate_personas(sampled_data, policy_summary)
        
        # 4. Save to JSON
        json_filename = "personas.json"
        if personas:
            try:
                with open(json_filename, "w", encoding="utf-8") as f:
                    json.dump(personas, f, indent=4)
                print(f"   ✅ Saved {len(personas)} personas to '{json_filename}'")
            except Exception as e:
                logger.error(f"Failed to save JSON: {e}")

        # 5. Run Debate (4 Pairs)
        print("   ...Simulating 4 street-level conversations...")
        debate_script = self.run_policy_debate(personas, policy_summary)
        
        return {
            "status": "success",
            "personas": personas,
            "debate_transcript": debate_script,
            "json_path": json_filename
        }

# ==========================================
# EXECUTION (TESTING WITH YOUR AGENT 3 OUTPUT)
# ==========================================
if __name__ == "__main__":
    
    # 1. Setup
    MY_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not MY_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment")

    # 2. Configuration
    CITY = "Hyderabad"
    SECTOR = "SOCIAL_WELFARE"
    
    POLICY_SUMMARY = """
    The 'Digital Welfare Access Mandate 2025' requires all social security 
    beneficiaries to link biometric IDs via a smartphone app to receive rations.
    Manual distribution at shops will be discontinued to stop leakage.
    """

    # 3. PASTE YOUR EXACT AGENT 3 OUTPUT HERE FOR TESTING
    mock_risk_report = {
        "risk_counts": {
            "stats": {
                "high": 3,
                "medium": 77,
                "low": 65
            },
            "impact_summary": "Hyderabad's social welfare sector faces significant risk...",
            "risk_assessment_details": [
                {
                    "Ward_Name": "Ward 88 Bholakpur",
                    "VULN_INDEX": 0.7123,
                    "RISK_CATEGORY": "HIGH"
                },
                {
                    "Ward_Name": "Ward 45 Jangammet",
                    "VULN_INDEX": 0.7603,
                    "RISK_CATEGORY": "HIGH"
                },
                {
                    "Ward_Name": "Ward 95 Jubilee Hills",
                    "VULN_INDEX": 0.2871,
                    "RISK_CATEGORY": "LOW"
                },
                {
                    "Ward_Name": "Ward 15 Vanasthalipuram",
                    "VULN_INDEX": 0.2678,
                    "RISK_CATEGORY": "LOW"
                }
            ]
        }
    }

    # 4. Run Agent
    print(f"\n🚀 [Test] Running Agent 5 (4-Pair Discussion Mode)...")
    agent = PersonaSimulationAgent(api_key=MY_API_KEY)

    result = agent.execute(
        city=CITY,
        sector=SECTOR,
        risk_report=mock_risk_report, 
        policy_summary=POLICY_SUMMARY
    )

    # 5. Display Results
    if result['status'] == 'success':
        print("\n" + "█"*60)
        print(f"👤 GENERATED {len(result['personas'])} PERSONAS (First 2 Shown)")
        print("█"*60)
        for p in result['personas'][:2]:
            print(f"• {p.get('name')} | Concern: {p.get('key_concern')}")

        print("\n" + "█"*60)
        print("🎙️  STREET CONVERSATIONS (4 PAIRS)")
        print("█"*60)
        print(result['debate_transcript']) 
        
        if os.path.exists("personas.json"):
            print(f"\n✅ JSON Verification: personas.json exists.")
    else:
        print(f"❌ Simulation Failed: {result.get('message')}")