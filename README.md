
---

## 🚀 Getting Started

### Prerequisites
*   **Python** 3.9+
*   **Node.js** 16+ & npm/yarn
*   **Google Gemini API Key** (for LLM inference)

### Backend Setup
1.  Navigate to the backend directory:
    ```
    cd PolicySim-backend
    ```
2.  Install python dependencies:
    ```
    pip install -r requirements.txt
    ```
3.  Configure environment variables:
    Create a `.env` file in `PolicySim-backend/` and add your API key:
    ```
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```
4.  Launch the API server:
    ```
    python api.py
    ```
    *Server will start at `http://localhost:8000`*

### Frontend Setup
1.  Navigate to the frontend directory:
    ```
    cd ../PolicySim-Frontend
    ```
2.  Install dependencies:
    ```
    npm install
    ```
3.  Start the development server:
    ```
    npm run dev
    ```
    *Access the dashboard at `http://localhost:5173`*

---

## 💻 Usage

### API Usage Example
To analyze a policy programmatically, send a `POST` request to the analysis endpoint:

```bash
curl -X 'POST'
'http://localhost:8000/analyze_policy'
-H 'Content-Type: application/x-www-form-urlencoded'
-d 'city=Hyderabad&policy_text=Digital%20Ration%20Card%20Policy%202025%3A%20Mandatory%20biometric%20auth...'

### Dashboard Workflow

1. **Upload/Paste Policy**: Input the policy document on the `LandingScreen`.
2. **Select City**: Choose the target demographic region.
3. **View Analysis**:
    * **Macro View**: City-wide risk statistics and heatmap.
    * **Micro View**: Ward-specific data breakdown.
    * **Simulation**: Watch AI agents debate the policy's pros and cons.

---

## 🛠 Tech Stack

| Component    | Technologies                                        |
| ------------ | --------------------------------------------------- |
| **Core Logic** | Python, NumPy, Pandas                             |
| **AI / LLM**   | Google Gemini 1.5 Flash & Pro (`google-generativeai`) |
| **API**        | FastAPI, Uvicorn                                   |
| **Geospatial** | Geopandas, Folium                                  |
| **Frontend**   | React, TypeScript, Vite, Tailwind CSS              |

---

## 📄 Citation

If you use this tool in your research, please cite:

