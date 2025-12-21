export interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  income: string;
  housingCost: string;
  familySize: number;
  riskLevel: 'High' | 'Med' | 'Low' | 'Stable';
  avatarColor: string;
}

export type ScreenType = 
  | 'landing'
  | 'upload' 
  | 'processing' 
  | 'macro' 
  | 'micro' 
  | 'dialogue' 
  | 'friction' 
  | 'agents' 
  | 'impact' 
  | 'cumulative';

export interface NavItem {
  id: ScreenType;
  label: string;
  icon: string;
}

export interface AnalysisData {
  macro: {
    riskAnalysis: string;
    affectedPop: string;
    riskLayer: string;
    map_url?: string;
    details?: any; // Added details to hold the flexible backend details
    stats: {
      units: string;
      income: string;
      education: string;
    };
    agents: {
      id: string;
      name: string;
      status: string;
      summary: string;
      efficiency: number;
    }[];
  };
  micro: {
    citizens: Persona[];
    debateTranscript?: string;
  };
  cumulative: {
    score: number;
    riskLabel: string;
    riskDescription: string;
    macroIndicators: { label: string; value: string; trend: 'up' | 'down'; isGood: boolean }[];
    microIndicators: { label: string; value: string; trend: 'up' | 'down'; isGood: boolean }[];
    summaryItems: { title: string; tag: string; description: string; impact: string }[];
  };
}