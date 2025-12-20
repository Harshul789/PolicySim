
---

# Urban Policy Impact & Vulnerability AI

A multi-agent AI pipeline that analyzes urban policies, assesses socio-economic vulnerability using census data, maps high-risk zones, and simulates human impact through generated personas.

## 🚀 The Workflow (5-Agent Architecture)

1.  **Agent 1 (Policy Extraction):** Parses PDF/Text inputs to extract key rules and policy intent using LLMs.
2.  **Agent 2 (Vulnerability Weights):** Dynamically assigns mathematical weights to census features (e.g., poverty, literacy) based on the policy's focus.
3.  **Agent 3 (Risk Assessment):** Processes ward-level census data to calculate Vulnerability Indices and bucket wards (High/Med/Low Risk).
4.  **Agent 4 (Visualization):** Generates an interactive HTML heatmap overlaying risk scores on city GeoJSONs.
5.  **Agent 5 (Simulation Engine):** Creates synthetic personas based on real census data and simulates a debate to predict public sentiment.

## 🛠️ Tech Stack
*   **Core:** Python 3.9+, Pandas, NumPy
*   **AI/LLM:** Google Gemini 1.5 Flash & Pro (via `google-genai`)
*   **Geospatial:** Geopandas, Folium
*   **API:** FastAPI, Uvicorn

## 📂 Project Structure
```text
├── api.py                  # FastAPI entry point
├── master_agent.py         # Pipeline orchestrator
├── agent_[1-5].py          # Individual agent logic
├── adapters.py             # Data fetching utility
├── census_data/            # City CSVs and GeoJSON files
└── static/                 # Generated maps, reports, and JSON outputs
```

## ⚡ Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/policy-impact-ai.git
    cd policy-impact-ai
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set Environment Variables:**
    Create a `.env` file and add your Google Gemini API key:
    ```env
    GOOGLE_API_KEY=your_actual_api_key
    ```

4.  **Run the API:**
    ```bash
    python api.py
    ```

5.  **Access the Interface:**
    *   **Swagger UI:** Open `http://localhost:8000/docs`
    *   **Endpoint:** `POST /analyze_policy`

## 📝 Usage Example
**Input:** A policy PDF regarding "Street Vendor Evictions in Hyderabad".
**Output:**
*   Risk Score: **15.5% (High Risk)**
*   Interactive Map URL
*   20 Generated User Personas
*   Simulated Debate Transcript between a Vendor and a City Official.

---