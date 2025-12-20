import os
import json
import fitz  # PyMuPDF
import google.generativeai as genai
from typing import List, Optional
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
load_dotenv()

# ==========================================
# 1. SETUP: Define the structure we want
# ==========================================

class PolicyAnalysis(BaseModel):
    title: str
    sector: str
    city: str
    summary: str
    rules_extracted: List[str]
    
# ==========================================
# 2. HELPER: Extract PDF Text
# ==========================================

def extract_pdf_text(pdf_path: str) -> str:
    if not os.path.exists(pdf_path):
        return f"Error: File not found at {pdf_path}"
    
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

# ==========================================
# 3. CORE: The Policy Analyzer Agent
# ==========================================

def clean_json_string(json_str: str) -> str:
    """Removes markdown formatting if the LLM adds it."""
    cleaned = json_str.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned.replace("```json", "", 1)
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```", "", 1)
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()

def analyze_policy_agent(api_key: str, city: str, input_data: str, is_pdf: bool = False):
    """
    Takes text or a PDF path, calls Gemini, and returns a Python dictionary.
    """
    
    policy_text = input_data
    if is_pdf:
        print(f"Reading PDF from: {input_data}...")
        policy_text = extract_pdf_text(input_data)
        if policy_text.startswith("Error"):
            return {"error": policy_text}

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash-lite")

    prompt = f"""
    You are an expert Policy Analyst for the city of {city}.
    
    Analyze the following policy text and return the output strictly as valid JSON.
    
    Instructions:
    1. Extract the exact title.
    2. Categorize the sector.
    3. Write a concise 1-2 line summary of the policy.
    4. Extract only the TOP 4-5 most critical rules or points that cover the core essence of the document. Do not list every single rule.
    
    The JSON must have this exact structure:
    {{
        "title": "The exact title of the policy",
        "sector": "Choose EXACTLY ONE from: HEALTHCARE, HOUSING, TRANSPORTATION, EDUCATION, EMPLOYMENT, SOCIAL_WELFARE",
        "city": "{city}",
        "summary": "A concise 1-2 line summary of the policy's intent.",
        "rules_extracted": [
            "Critical Point 1", 
            "Critical Point 2", 
            "Critical Point 3", 
            "Critical Point 4", 
            "Critical Point 5"
        ]
    }}

    POLICY TEXT:
    {policy_text}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        raw_text = response.text
        
        clean_text = clean_json_string(raw_text)
        data_dict = json.loads(clean_text)
        
        validated_data = PolicyAnalysis(**data_dict)
        
        return validated_data.model_dump()

    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON from LLM response", "raw_response": raw_text}
    except ValidationError as e:
        return {"error": "Structure mismatch", "details": str(e)}
    except Exception as e:
        return {"error": f"API Error: {str(e)}"}

# ==========================================
# 4. EXECUTION
# ==========================================

if __name__ == "__main__":
    
    MY_API_KEY = os.getenv("GOOGLE_API_KEY")

    if not MY_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment")

    print("\n--- TEST 1: Text Input ---")
    sample_policy = """
    ZONING AMENDMENT: Housing Density Rules
    1. No building taller than 3 stories in downtown.
    2. 20% of units must be low-income housing.
    """
    
    result_text = analyze_policy_agent(
        api_key=MY_API_KEY, 
        city="Hyderabad", 
        input_data=sample_policy, 
        is_pdf=False
    )
    print(json.dumps(result_text, indent=2))

    print("\n--- TEST 2: PDF Input ---")
    pdf_path = "data/education_policy.pdf" 
    
    if os.path.exists(pdf_path):
        result_pdf = analyze_policy_agent(
            api_key=MY_API_KEY, 
            city="Bangalore", 
            input_data=pdf_path, 
            is_pdf=True
        )
        print(json.dumps(result_pdf, indent=2))
    else:
        print(f"Skipping PDF test: File {pdf_path} not found.")