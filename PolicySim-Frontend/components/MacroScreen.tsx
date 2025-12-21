import React from 'react';
import html2pdf from 'html2pdf.js';
import { AnalysisData } from '../types';

interface Props {
  data?: AnalysisData['macro'];
}

const MacroScreen: React.FC<Props> = ({ data }) => {
  if (!data) return <div className="p-10 text-center">No analysis data available.</div>;

  // Hardcoded agents to match specific UI request structure, populated with real data if available
  const agents = [
    { 
        id: '1', 
        name: 'PDF Analysing Agent', 
        role_description: "Parses unstructured policy documents to extract key regulatory rules and fiscal provisions.",
        status: 'Complete', 
        icon: 'picture_as_pdf',
        color: 'blue',
        output: data?.details?.policy_insights ? JSON.stringify({
            "policy_insights": data.details.policy_insights
        }, null, 2) : JSON.stringify({
            "policy_insights": {
                "rules": ["Rent Cap Adjustment: Imposes strict 5% annual limit on increases.", "Subsidy Threshold: Calculation revised to include all aid sources."],
                "summary": "Policy imposes stricter caps on pre-2010 multi-family properties."
            }
        }, null, 2)
    },
    { 
        id: '2', 
        name: 'Vulnerability Agent', 
        role_description: "Analyzes demographic data to identify specific population segments sensitive to policy shifts.",
        status: 'Optimized',
        icon: 'person_alert',
        color: 'purple',
        output: data?.details?.vulnerability_factors ? JSON.stringify({
            "vulnerability_factors": data.details.vulnerability_factors
        }, null, 2) : JSON.stringify({
            "vulnerability_factors": {
                "top_fields": ["POVERTY_PROXY", "P_ILLITERACY"],
                "reasoning": "Weights heavily favor economic fragility indicators."
            }
        }, null, 2)
    },
    { 
        id: '3', 
        name: 'Risk Bucketing Agent', 
        role_description: "Categorizes the population into risk levels (High, Medium, Low) based on vulnerability factors.",
        status: 'Active', 
        icon: 'pie_chart',
        color: 'orange',
        output: data?.details?.risk_counts ? JSON.stringify({
            "risk_counts": data.details.risk_counts
        }, null, 2) : JSON.stringify({
            "risk_counts": {
                "stats": {"high": 24, "medium": 86, "low": 412},
                "impact_summary": "High risk concentrated in Ward C (older units)."
            }
        }, null, 2)
    }
  ];

  // Helper to render JSON content cleanly
  const renderJSONContent = (jsonString: string) => {
    try {
        const data = JSON.parse(jsonString);
        return (
            <div className="space-y-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-2">
                         {/* Top Level Key */}
                         <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                {key.replace(/_/g, ' ')}
                            </span>
                         </div>
                         
                         {/* Content */}
                         <div className="pl-1">
                             {typeof value === 'object' && value !== null ? (
                                 <div className="grid gap-3">
                                     {Object.entries(value).map(([subKey, subValue]) => {
                                         // Special Handling for Stats Object (Vertical Boxes)
                                         if (typeof subValue === 'object' && subValue !== null && !Array.isArray(subValue) && Object.keys(subValue).some(k => ['high', 'medium', 'low'].includes(k.toLowerCase()))) {
                                             return (
                                                <div key={subKey} className="text-sm">
                                                    <span className="font-semibold text-neutral-700 block mb-2 capitalize">
                                                        {subKey.replace(/_/g, ' ')}:
                                                    </span>
                                                    <div className="flex flex-col gap-2">
                                                        {Object.entries(subValue as any).map(([k, v]) => {
                                                            let colorClass = "bg-neutral-50 border-neutral-100 text-neutral-600";
                                                            const kLower = k.toLowerCase();
                                                            if (kLower === 'high') colorClass = "bg-red-50 border-red-100 text-red-700";
                                                            else if (kLower === 'medium') colorClass = "bg-orange-50 border-orange-100 text-orange-700";
                                                            else if (kLower === 'low') colorClass = "bg-green-50 border-green-100 text-green-700";

                                                            return (
                                                                <div key={k} className={`p-3 rounded-lg border flex justify-between items-center ${colorClass}`}>
                                                                    <span className="text-xs font-bold uppercase tracking-wider">{k} Risk</span>
                                                                    <span className="font-bold text-lg">{String(v)}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                             );
                                         }
                                         
                                         return (
                                         <div key={subKey} className="text-sm">
                                             <span className="font-semibold text-neutral-700 block mb-1 capitalize">
                                                 {subKey.replace(/_/g, ' ')}:
                                             </span>
                                             {Array.isArray(subValue) ? (
                                                 // Modified for sentence-like vertical list
                                                 <div className="flex flex-col gap-2 mt-1">
                                                     {subValue.map((item, i) => (
                                                         <div key={i} className="flex items-start gap-2.5">
                                                             <span className="mt-1.5 size-1.5 rounded-full bg-neutral-400 flex-shrink-0"></span>
                                                             <span className="text-neutral-600 leading-relaxed bg-neutral-50 px-2 py-1 rounded border border-neutral-100 w-full text-sm">
                                                                 {String(item)}
                                                             </span>
                                                         </div>
                                                     ))}
                                                 </div>
                                             ) : typeof subValue === 'object' ? (
                                                 <div className="bg-neutral-50 p-2 rounded border border-neutral-100 grid grid-cols-2 gap-2">
                                                     {Object.entries(subValue as any).map(([k, v]) => (
                                                         <div key={k} className="flex justify-between items-center text-xs">
                                                             <span className="text-neutral-500 capitalize">{k}:</span>
                                                             <span className="font-mono font-bold text-neutral-800">{String(v)}</span>
                                                         </div>
                                                     ))}
                                                 </div>
                                             ) : (
                                                 <span className="text-neutral-600 leading-relaxed bg-neutral-50 px-2 py-1 rounded block border border-neutral-100">
                                                     {String(subValue)}
                                                 </span>
                                             )}
                                         </div>
                                     )})}
                                 </div>
                             ) : (
                                 <span className="text-neutral-600">{String(value)}</span>
                             )}
                         </div>
                    </div>
                ))}
            </div>
        );
    } catch (e) {
        return <div className="text-xs text-red-500">Error parsing output data.</div>;
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('macro-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `PolicySim_Macro_Report_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 } as const,
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        windowWidth: 794 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } as const,
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any }
    };

    element.classList.add('pdf-rendering');
    
    html2pdf().set(opt).from(element).save().then(() => {
        element.classList.remove('pdf-rendering');
    });
  };

  return (
    <>
    <style>{`
        #macro-content.pdf-rendering {
            width: 794px !important;
            padding: 20px !important;
            background-color: white !important;
            color: #1a1a1a !important;
            margin: 0 !important;
            overflow: visible !important;
        }
        #macro-content.pdf-rendering * {
            max-width: 100% !important;
            box-sizing: border-box !important;
            word-break: break-word !important;
        }
         #macro-content.pdf-rendering button {
            display: none !important;
        }
        #macro-content.pdf-rendering .shadow-sm,
        #macro-content.pdf-rendering .shadow-md {
            box-shadow: none !important;
            border: 1px solid #eee !important;
        }
        #macro-content.pdf-rendering .grid {
            display: block !important;
        }
        #macro-content.pdf-rendering .grid > div {
            width: 100% !important;
            margin-bottom: 20px !important;
        }
        #macro-content.pdf-rendering .lg\\:col-span-2 {
            width: 100% !important;
        }
        #macro-content.pdf-rendering .pdf-hide {
            display: none !important;
        }
        #macro-content.pdf-rendering .pdf-no-border {
            border-top: none !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
        }
    `}</style>
    <div id="macro-content" className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-8 pb-20">
        <div className="pdf-hide">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold font-display text-primary tracking-tight">City Risk Analysis</h2>
                <p className="text-neutral-500 mt-1 max-w-2xl">{data.riskAnalysis || "Socio-economic vulnerability assessment across metropolitan wards."}</p>
            </div>
            <div className="flex gap-3">
                  <button 
                     onClick={handleExportPDF}
                     className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl shadow-sm text-sm font-semibold hover:bg-neutral-50 hover:border-neutral-300 transition-all text-neutral-700"
                  >
                     <span className="material-symbols-outlined text-[18px]">ios_share</span>
                     Export Report
                  </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
             {/* Map Area */}
             <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden relative h-[500px]">
                 <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-white z-10">
                    <div className="text-sm font-bold text-neutral-700 flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                         <span className="material-symbols-outlined text-neutral-500 text-lg">layers</span>
                         Risk Layer: {data.riskLayer}
                    </div>

                 </div>
                 
                 {/* Stylized SVG Map or Iframe */}
                 <div className="flex-grow bg-[#f5f5f7] relative flex items-center justify-center p-0 overflow-hidden">
                    {data.map_url ? (
                        <iframe 
                            src={data.map_url} 
                            className="w-full h-full border-none"
                            title="City Risk Map"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center relative p-10">
                            {/* Map Grid Background */}
                            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(#cfcfcf 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3}}></div>
                            
                            <svg viewBox="0 0 400 300" className="w-full h-full max-w-lg drop-shadow-xl transform hover:scale-105 transition-transform duration-700">
                                <path d="M50,50 L150,40 L160,120 L40,130 Z" className="fill-white stroke-neutral-300 stroke-1 hover:fill-blue-50 transition-colors cursor-pointer" />
                                <text x="90" y="90" className="text-[8px] fill-neutral-400 font-bold text-center pointer-events-none">WARD A</text>
                                
                                <path d="M150,40 L280,30 L270,110 L160,120 Z" className="fill-white stroke-neutral-300 stroke-1 hover:fill-blue-50 transition-colors cursor-pointer" />
                                <text x="210" y="75" className="text-[8px] fill-neutral-400 font-bold text-center pointer-events-none">WARD B</text>

                                {/* High Risk Ward */}
                                <g className="cursor-pointer group">
                                    <path d="M40,130 L160,120 L150,220 L60,240 Z" className="fill-red-50 stroke-red-500 stroke-[1.5] group-hover:fill-red-100 transition-colors" />
                                    {/* Dot pattern overlay simulation via circles */}
                                    <circle cx="80" cy="160" r="1.5" className="fill-red-400 animate-pulse" />
                                    <circle cx="100" cy="150" r="1.5" className="fill-red-400 animate-pulse" style={{animationDelay: '0.2s'}} />
                                    <circle cx="120" cy="170" r="1.5" className="fill-red-400 animate-pulse" style={{animationDelay: '0.4s'}} />
                                    <text x="100" y="190" className="text-[8px] fill-red-700 font-bold text-center pointer-events-none">WARD C (CRITICAL)</text>
                                </g>

                                <path d="M160,120 L270,110 L350,130 L340,210 L150,220 Z" className="fill-white stroke-neutral-300 stroke-1 hover:fill-blue-50 transition-colors cursor-pointer" />
                                <text x="250" y="170" className="text-[8px] fill-neutral-400 font-bold text-center pointer-events-none">WARD D</text>
                            </svg>
                        </div>
                    )}
                 </div>


             </div>

             {/* Sidebar Info */}
             <div className="flex flex-col gap-6">
                 {/* Residents At Risk Card */}
                 <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-8xl">groups</span>
                     </div>
                     <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Residents At Risk</h3>
                     <div className="flex items-baseline gap-2">
                         <span className="text-6xl font-black font-display text-[#1d1d1f] tracking-tighter">{data.affectedPop}</span>
                     </div>
                     <p className="text-sm text-neutral-500 mt-3 leading-relaxed">Residents projected to be severely affected by the policy changes in high-risk zones.</p>
                     
                     <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-neutral-500 uppercase">
                            <span>Overall Risk</span>
                            <span>High</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{width: '64%'}}></div>
                        </div>
                     </div>
                 </div>

                 {/* Quick Stats Grid */}
                 <div className="grid grid-cols-1 gap-4 flex-grow">
                     <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
                         <div>
                             <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Impacted Units</p>
                             <p className="text-2xl font-bold text-primary">{data.stats.units}</p>
                         </div>
                         <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <span className="material-symbols-outlined">home_work</span>
                         </div>
                     </div>
                     <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
                         <div>
                             <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Economic Status</p>
                             <p className="text-2xl font-bold text-primary">{data.stats.income}</p>
                         </div>
                         <div className="size-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                            <span className="material-symbols-outlined">trending_up</span>
                         </div>
                     </div>
                     <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
                         <div>
                             <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Population Characteristics</p>
                             <p className="text-2xl font-bold text-primary">{data.stats.education}</p>
                         </div>
                         <div className="size-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                            <span className="material-symbols-outlined">school</span>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
        </div>

        {/* New Section: Agent Output Summary */}
        <div className="border-t border-neutral-200 pt-10 mt-10 pdf-no-border">
            <div className="flex items-center gap-3 mb-8">
                <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <h2 className="text-2xl font-bold font-display text-primary">Multi-Agent Simulation Results</h2>
            </div>

            {/* Summary Boxes Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {agents.map((agent, index) => (
                    <div key={`summary-${index}`} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden hover:shadow-md transition-all">
                        <div className={`absolute top-0 right-0 p-3 opacity-5 ${
                            agent.color === 'blue' ? 'text-blue-500' : 
                            agent.color === 'purple' ? 'text-purple-500' : 'text-orange-500'
                        }`}>
                             <span className="material-symbols-outlined text-6xl">{agent.icon}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className={`size-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                                 agent.color === 'blue' ? 'bg-blue-600' : 
                                 agent.color === 'purple' ? 'bg-purple-600' : 'bg-orange-600'
                             }`}>
                                 {index + 1}
                             </div>
                             <h4 className="font-bold text-sm text-primary uppercase tracking-wide">{agent.name}</h4>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium leading-relaxed relative z-10">
                            {agent.role_description}
                        </p>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {agents.map((agent, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                        {/* Agent Header */}
                        <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-lg flex items-center justify-center border ${
                                    agent.color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                                    agent.color === 'purple' ? 'bg-purple-50 border-purple-100 text-purple-600' : 
                                    'bg-orange-50 border-orange-100 text-orange-600'
                                }`}>
                                    <span className="material-symbols-outlined text-xl">{agent.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-primary">{agent.name}</h4>
                                    <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Agent {String(index + 1).padStart(2, '0')}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${
                                agent.status === 'Active' || agent.status === 'Complete' || agent.status === 'Optimized' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                            }`}>
                                {agent.status}
                            </span>
                        </div>
                        
                        {/* Agent Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="bg-white rounded-xl p-4 border border-neutral-200 flex-grow shadow-sm">
                                <p className="text-xs font-bold text-neutral-400 uppercase mb-4 flex items-center gap-1 border-b border-neutral-100 pb-2">
                                    <span className="material-symbols-outlined text-[14px]">data_object</span>
                                    Structured Output
                                </p>
                                {renderJSONContent(agent.output)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    </>
  );
};

export default MacroScreen;