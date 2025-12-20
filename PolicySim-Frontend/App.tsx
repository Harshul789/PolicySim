import React, { useState } from 'react';

import { ScreenType, AnalysisData, Persona } from './types';
import { Logo } from './components/Logo';
import LandingScreen from './components/LandingScreen';
import UploadScreen from './components/UploadScreen';
import ProcessingScreen from './components/ProcessingScreen';
import MacroScreen from './components/MacroScreen';
import MicroScreen from './components/MicroScreen';
import DialogueScreen from './components/DialogueScreen';
import FrictionScreen from './components/FrictionScreen';
import AgentScreen from './components/AgentScreen';
import ImpactScreen from './components/ImpactScreen';
import CumulativeScreen from './components/CumulativeScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const handleAnalyze = async (text: string, city: string) => {
    setCurrentScreen('processing');
    
    try {
      const formData = new FormData();
      formData.append('city', city);
      formData.append('policy_text', text);

      const response = await fetch('http://localhost:8000/analyze_policy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const backendData = await response.json();

      // Fetch and map personas if available
      let personas: Persona[] = [];
      let fetchFailed = false;

      if (backendData.details?.simulation?.personas_url) {
          try {
             const pRes = await fetch(backendData.details.simulation.personas_url);
             if (pRes.ok) {
                 const rawPersonas = await pRes.json();
                 // Map backend keys to frontend keys
                 if (Array.isArray(rawPersonas) && rawPersonas.length > 0) {
                     personas = rawPersonas.map((p: any, index: number) => {
                         // Determine riskLevel from backend risk_level (can be "High Risk", "85%", etc.)
                         let riskLevel: Persona['riskLevel'] = 'Stable';
                         const riskStr = String(p.risk_level || '').toLowerCase();
                         
                         if (riskStr.includes('high')) {
                             riskLevel = 'High';
                         } else if (riskStr.includes('med')) {
                             riskLevel = 'Med';
                         } else if (riskStr.includes('low')) {
                             riskLevel = 'Low';
                         } else {
                            const riskVal = parseInt(riskStr.replace('%', '') || '0');
                            if (riskVal > 70) riskLevel = 'High';
                            else if (riskVal > 40) riskLevel = 'Med';
                            else if (riskVal > 15) riskLevel = 'Low';
                         }

                         return {
                            id: (index + 1).toString().padStart(3, '0'),
                            name: p.name || 'Anonymous Resident',
                            role: p.occupation || 'Resident',
                            description: p.citizen_voice || p.key_concern || 'Impact analysis pending.',
                            income: p.income_class || 'Unknown',
                            housingCost: 'Estimated Impact',
                            familySize: Math.floor(Math.random() * 4) + 1,
                            riskLevel: riskLevel,
                            avatarColor: 'text-neutral-400'
                         };
                     });
                 } else {
                     fetchFailed = true;
                 }
             } else {
                 fetchFailed = true;
             }
          } catch (e) {
              console.error("Failed to fetch personas:", e);
              fetchFailed = true;
          }
      } else {
          fetchFailed = true;
      }

      // Fallback Personas if fetch failed or returned empty
      if (fetchFailed || personas.length === 0) {
          const roles = ['Retail Associate', 'Substitute Teacher', 'Freelance Designer', 'Construction Worker', 'Nursing Assistant', 'Hospitality Staff'];
          const risks: Array<'High' | 'Med' | 'Low' | 'Stable'> = ['High', 'Med', 'Low', 'Stable'];
          personas = Array.from({ length: 6 }).map((_, i) => ({
              id: (i + 1).toString().padStart(3, '0'),
              name: `Simulated Resident ${i + 1}`,
              role: roles[i % roles.length],
              description: "Synthetic profile generated to demonstrate impact trends when real-time simulation is pending.",
              income: `$${30000 + (i * 10000)}`,
              housingCost: `$${1000 + (i * 200)}/mo`,
              familySize: 1 + (i % 4),
              riskLevel: risks[i % risks.length],
              avatarColor: 'text-neutral-400'
          }));
      }
      
      // Map Backend response to AnalysisData
      const mappedData: AnalysisData = {
        macro: {
          riskAnalysis: backendData.master_summary,
          affectedPop: backendData.key_metrics.high_risk_residents,
          riskLayer: backendData.overall_risk_score,
          map_url: backendData.map_url,
          details: backendData.details,
          stats: {
            units: backendData.key_metrics.impact_units,
            income: backendData.key_metrics.economic_impact,
            education: backendData.key_metrics.population_characteristics
          },
          agents: [] // MacroScreen uses hardcoded/mapped agents
        },
        micro: {
          citizens: personas
        },
        cumulative: {
          score: parseFloat(backendData.overall_risk_score?.replace('%', '') || '0'),
          riskLabel: 'High', // inferred
          riskDescription: backendData.master_summary,
          macroIndicators: [],
          microIndicators: [],
          summaryItems: []
        }
      };

      setAnalysisData(mappedData);
      setCurrentScreen('macro');
    } catch (error) {
      console.error("Analysis failed:", error);
      // Fallback or error state could go here, for now just go back
      setCurrentScreen('upload');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing': return <LandingScreen onStart={() => setCurrentScreen('upload')} />;
      case 'upload': return <UploadScreen onAnalyze={handleAnalyze} />;
      case 'processing': return <ProcessingScreen />;
      case 'macro': return <MacroScreen data={analysisData?.macro} />;
      case 'micro': return <MicroScreen data={analysisData?.micro} />;
      case 'dialogue': return <DialogueScreen />;
      case 'friction': return <FrictionScreen />;
      case 'agents': return <AgentScreen />;
      case 'impact': return <ImpactScreen />;
      case 'cumulative': return <CumulativeScreen data={analysisData?.cumulative} />;
      default: return <LandingScreen onStart={() => setCurrentScreen('upload')} />;
    }
  };

  const isFullscreen = currentScreen === 'landing' || currentScreen === 'upload' || currentScreen === 'processing';
  const hasData = !!analysisData;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#f7f7f7] text-[#141414]">
      {/* Dynamic Header based on context */}
      {!isFullscreen && (
        <header className="sticky top-0 z-50 w-full border-b border-[#ededed] bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentScreen('upload')}>
              <div className="flex items-center gap-2">
                <Logo className="size-7" />
                <span className="text-lg font-bold tracking-tight font-display">
                  PolicySim
                </span>
              </div>
            </div>

            <nav className="hidden md:flex flex-1 justify-center">
              {hasData && (
                <div className="flex items-center gap-8">
                  <button onClick={() => setCurrentScreen('macro')} className={`text-sm font-medium transition-colors ${currentScreen === 'macro' ? 'text-primary font-bold' : 'text-neutral-500 hover:text-primary'}`}>Macro Overview</button>
                  <button onClick={() => setCurrentScreen('micro')} className={`text-sm font-medium transition-colors ${currentScreen === 'micro' ? 'text-primary font-bold' : 'text-neutral-500 hover:text-primary'}`}>Micro Overview</button>
                  <button onClick={() => setCurrentScreen('cumulative')} className={`text-sm font-medium transition-colors ${currentScreen === 'cumulative' ? 'text-primary font-bold' : 'text-neutral-500 hover:text-primary'}`}>Cumulative Overview</button>
                </div>
              )}
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                   <div className="size-9 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-bold text-xs">
                     JD
                   </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow w-full mx-auto">
        {renderScreen()}
      </main>

      {!isFullscreen && (
        <footer className="border-t border-[#ededed] bg-white py-8 mt-auto">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-6 lg:flex-row lg:px-10">
            <p className="text-sm text-neutral-500">© 2024 PolicySim Analytics. All data is anonymized.</p>
            <div className="flex gap-8">
              <a className="text-sm text-neutral-500 hover:text-primary" href="#">Data Sources</a>
              <a className="text-sm text-neutral-500 hover:text-primary" href="#">Privacy Policy</a>
              <a className="text-sm text-neutral-500 hover:text-primary" href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;