# PolicySim: Multi-Agent Policy Impact Simulation Framework

[![Build using FastAPI](https://img.shields.io/badge/Build%20using-FastAPI-009688?style=for-the-badge)](https://fastapi.tiangolo.com/)
[![Frontend React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Build%20using-Gemini%20-009688?style=for-the-badge)](https://ai.google.dev/gemini-api/docs)
[![Stich](https://img.shields.io/badge/Design%20using-Stich-009688?style=for-the-badge)](https://stich.ai/)

---

## Abstract

**PolicySim** is an advanced computational framework designed to simulate, analyze, and visualize the socio-economic impacts of urban policies *before* implementation. Leveraging a **Multi-Agent System (MAS)** architecture powered by **Large Language Models (LLMs)**, the system ingests raw policy documents (PDF/Text) and synthesizes their implications across disparate demographic sectors.

By integrating **census data**, **geospatial analytics**, and **persona-based simulation**, PolicySim provides policymakers with granular risk assessments—identifying vulnerable populations and generating synthetic qualitative feedback from virtual constituents.

---

## Architecture & Methodology

The core of PolicySim operates on a **five-stage sequential multi-agent pipeline**, orchestrated to transform unstructured policy text into structured, actionable intelligence.

### The Multi-Agent Pipeline

#### Agent 1: Policy Analyzer *(Semantic Extraction)*

* **Role:** Deconstructs policy documents into machine-readable rules.
* **Function:** Extracts key provisions, identifies affected sectors (e.g., Housing, Welfare), and determines specific demographic groups targeted by the legislation.

#### Agent 2: Vulnerability Index Calculator *(Quantitative Modeling)*

* **Role:** Computes ward-level vulnerability scores.
* **Function:** Dynamically assigns weights to census features (e.g., income levels, rent burden) based on policy severity and calculates a normalized vulnerability index for every ward in the target city.

#### Agent 3: Risk Bucketing & Threshold Interpreter *(Statistical Analysis)*

* **Role:** Classifies geographical regions into risk strata.
* **Function:** Analyzes the distribution of vulnerability scores to establish dynamic thresholds, categorizing areas into **High**, **Medium**, and **Low** risk buckets based on statistical deviation.

#### Agent 4: Recommendation & Visualization Engine *(Geospatial Synthesis)*

* **Role:** Generates implementation strategies and visual mappings.
* **Function:** Produces an interactive **GeoJSON risk map** and formulates equity-focused policy modifications to mitigate negative externalities in high-risk zones.

#### Agent 5: Persona Simulation *(Qualitative Feedback)*

* **Role:** Simulates constituent reactions.
* **Function:** Generates diverse, statistically representative **Virtual Citizens (Personas)** complete with backstories, incomes, and occupations, then simulates dialogue and debate to predict public sentiment and friction points.

---

## Features

* **Automated Policy Parsing**: Ingests complex legal text and PDFs to extract causal rules.
* **Geospatial Risk Mapping**: Interactive visualization of policy impact across city wards *(Supported: Hyderabad, Delhi, Mumbai, Bangalore, etc.)*.
* **Synthetic Constituent Feedback**: Human-in-the-loop style simulation without human cost, generating qualitative feedback from AI agents representing marginalized groups.
* **Cross-Sector Analysis**: Evaluates impact across Healthcare, Housing, Transportation, Education, and Employment.
* **Executive Reporting**: Generates high-level strategic summaries and micro-impact reports for decision-makers.

---

## Technical Stack

### Backend

* **Framework:** FastAPI (Python)
* **AI / LLM:** Google Gemini Flash via `google.generativeai`
* **Data Processing:** Pandas, GeoPandas (Spatial Analysis)
* **Orchestration:** Custom Agent Pipeline

### Frontend

* **Framework:** React (TypeScript) + Vite
* **Styling:** Tailwind CSS
* **Visualization:** Interactive Risk Maps & Persona Cards

---

## Installation

### Prerequisites

* Python 3.10+
* Node.js 18+
* Google Gemini API Key

---

### Backend Setup

Clone the repository and navigate to the backend:

```bash
cd PolicySim-backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables by creating a `.env` file:

```text
GOOGLE_API_KEY=your_gemini_api_key_here
```

Start the API server:

```bash
python api.py
```

Server will run at: `http://localhost:8000`

---

### Frontend Setup

Navigate to the frontend directory:

```bash
cd PolicySim-Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Application will be accessible at: `http://localhost:5173`

---

## Usage

1. **Launch the Application** – Open the frontend URL in your browser.
2. **Select Jurisdiction** – Choose a supported city (e.g., Hyderabad, Delhi).
3. **Upload Policy** – Upload a PDF or paste raw policy text.
4. **Run Simulation** – Click **Analyze Impact** to trigger the 5-agent pipeline.
5. **View Results**:

   * **Macro View:** City-wide risk heatmap
   * **Micro View:** Persona-level qualitative feedback
   * **Impact Report:** Strategic insights and recommendations

---

## API Documentation

### Endpoint

```http
POST /analyze-policy
```

### Request (Form Data)

* `city` *(string)* – Target city name
* `policytext` *(string, optional)* – Raw policy text
* `file` *(File, optional)* – PDF policy document

### Response

```json
{
  "master_summary": "...",
  "risk_score": "...",
  "map_url": "...",
  "personas": [],
  "strategic_insights": "..."
}
```

---

## Project Structure

```bash
PolicySim/
├── PolicySim-backend/
│   ├── api.py
│   ├── master_agent.py
│   ├── agent_*.py
│   ├── adapters.py
│   └── data/
├── PolicySim-Frontend/
│   ├── src/
│   │   ├── components/
│   │   └── types.ts
│   └── vite.config.ts
└── README.md
```

---

## Citation

If you use this framework in your research, please cite:

```bibtex
@software{policysim2025,
  title  = {PolicySim: A Multi-Agent Framework for Urban Policy Impact Analysis},
  author = {PolicySim Team},
  year   = {2025},
  url    = {https://github.com/AdityaVN5/policysim}
}
```
