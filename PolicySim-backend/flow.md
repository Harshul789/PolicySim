┌─────────────────────────────────────────────────────────────────┐
│                    POLICY IMPACT ASSESSMENT SYSTEM               │
│                  (Policy Implementation & Risk Assessment)       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ INPUT LAYER                                                       │
├──────────────────────────────────────────────────────────────────┤
│  • Policy Document (PDF)                                         │
│  • City Selection (5 major cities available)                     │
│  • Optional: Historical policy outcomes for validation           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ AGENT 1: POLICY ANALYZER                                         │
├──────────────────────────────────────────────────────────────────┤
│ Input:  Policy PDF                                               │
│ Process:                                                          │
│  1. Extract policy rules using LLM + structured parsing          │
│  2. Identify affected sectors (e.g., housing, transportation)    │
│  3. Extract affected groups (e.g., low-income, elderly)          │
│  4. Determine relevant data fields (e.g., income, age, location) │
│                                                                   │
│ Output:                                                           │
│  {                                                                │
│    "policy_id": "ZN-2024-03",                                    │
│    "sectors": ["housing", "zoning"],                             │
│    "affected_groups": ["renters", "low-income households"],      │
│    "required_fields": ["median_income", "rental_rate",           │
│                        "population_density", "ward_id"]          │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ AGENT 2: VULNERABILITY INDEX CALCULATOR                          │
├──────────────────────────────────────────────────────────────────┤
│ Input:                                                            │
│  • Ward-level data from adapters                                 │
│  • Policy rules from Agent 1                                     │
│                                                                   │
│ Process:                                                          │
│  1. LLM reasons about which features matter for THIS policy      │
│     Example: "Housing policy → income, rent burden, evictions"  │
│                                                                   │
│  2. LLM assigns weights based on policy severity                 │
│     Example prompt: "A zoning change restricting multi-family    │
│     units will most impact renters (w=0.4) and low-income        │
│     households (w=0.3). Assign remaining weights."               │
│                                                                   │
│  3. Normalize features to [0,1] scale                            │
│  4. Calculate vulnerability index:                               │
│     VULN_INDEX = Σ(wᵢ × normalized_featureᵢ)                    │
│                                                                   │
│ Output:                                                           │
│  [                                                                │
│    {"ward_id": "W01", "vuln_score": 0.73, "features_used": [...]}│
│    {"ward_id": "W02", "vuln_score": 0.41, ...}                  │
│  ]                                                                │
│                                                                   │
│ Weights justification logged for explainability                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ AGENT 3: RISK BUCKETING & THRESHOLD INTERPRETER                  │
├──────────────────────────────────────────────────────────────────┤
│ Input: Vulnerability scores + city context                       │
│                                                                   │
│ AI Role (the part you were unsure about):                        │
│  • LLM analyzes score distribution contextually                  │
│    Example: "City X has baseline vulnerability of 0.45. Scores   │
│    above 0.65 are 1.5 std devs above mean → classify as HIGH"   │
│                                                                   │
│  • Alternative: Use LLM to compare against historical policies   │
│    Example: "Previous transit policy had 0.55 avg score.         │    
│    Current policy's 0.68 avg suggests higher systemic risk"     │
│                                                                   │
│ Process:                                                          │
│  1. Calculate percentiles/std devs                               │
│  2. LLM suggests thresholds (or use fixed: High>0.6, Med>0.3)   │
│  3. Bucket wards: {HIGH: [W01, W05], MED: [W02], LOW: [W03...]} │
│                                                                   │
│ Output:                                                           │
│  {                                                                │
│    "thresholds": {"high": 0.6, "medium": 0.3},                  │
│    "buckets": {                                                   │
│      "HIGH": ["W01", "W05", "W12"],                             │
│      "MEDIUM": ["W02", "W07"],                                   │
│      "LOW": ["W03", "W04", ...]                                 │
│    },                                                             │
│    "reasoning": "Thresholds set using 75th percentile..."       │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ AGENT 4: POLICY RECOMMENDATION & VISUALIZATION ENGINE            │
├──────────────────────────────────────────────────────────────────┤
│ Input:                                                            │
│  • Risk buckets from Agent 3                                     │
│  • Original policy rules from Agent 1                            │
│  • Ward geometries (GeoJSON)                                     │
│                                                                   │
│ Process - Part A (Policy Reasoning):                             │
│  LLM generates structured analysis:                              │
│    1. Implementation Pathway                                     │
│       "To implement this zoning change equitably:                │
│        - Phase rollout starting with LOW risk wards              │
│        - Provide rent subsidies in HIGH risk wards"             │
│                                                                   │
│    2. Recommended Modifications                                  │
│       "Modify policy to exempt buildings with >50% low-income    │
│        tenants in wards W01, W05, W12"                          │
│                                                                   │
│    3. Equity Analysis                                            │
│       "Policy disproportionately affects renters (68% of impact) │
│        in southern wards. Consider targeted assistance."        │
│                                                                   │
│    4. Monitoring Metrics                                         │
│       "Track eviction rates in HIGH risk wards quarterly"        │
│                                                                   │
│ Process - Part B (Visualization):                                │
│  1. Load ward GeoJSON geometries                                 │
│  2. Join risk buckets to geometries                              │
│  3. Apply color scheme:                                          │
│     HIGH → Red (#E74C3C)                                         │
│     MEDIUM → Orange (#F39C12)                                    │
│     LOW → Green (#27AE60)                                        │
│  4. Generate interactive map with tooltips showing:              │
│     - Vulnerability score                                        │
│     - Contributing factors                                       │
│     - Affected population count                                  │
│                                                                   │
│ Output:                                                           │
│  {                                                                │
│    "policy_analysis": "<structured text>",                       │
│    + geogrpahical representation                                                          │
│  }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ OUTPUT LAYER                                                      │
├──────────────────────────────────────────────────────────────────┤
│  1. Executive Summary Report (PDF/HTML)                          │
│  2. Interactive Risk Map (GeoJSON + Web Interface)               │
│  3. Ward-Level Risk Profiles (CSV/JSON)                          │
│  4. Policy Modification Recommendations (Structured Text)        │
│  5. API Endpoints for downstream systems                         │
└──────────────────────────────────────────────────────────────────┘
