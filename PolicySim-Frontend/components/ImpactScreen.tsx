import React, { useState } from 'react';

const ImpactScreen: React.FC = () => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<number>(1);

  const personas = [
      { id: 1, code: 'SM', name: 'Single Mother', sub: '2 Dependents', tags: ['Low Income'], color: 'bg-blue-100 text-blue-600' },
      { id: 2, code: 'RS', name: 'Retired Senior', sub: 'Fixed Income', tags: ['Pension'], color: 'bg-purple-100 text-purple-600' },
      { id: 3, code: 'GW', name: 'Gig Worker', sub: 'Variable Income', tags: ['Urban'], color: 'bg-orange-100 text-orange-600' },
      { id: 4, code: 'SF', name: 'Student (Full-time)', sub: 'No Dependents', tags: ['Education'], color: 'bg-teal-100 text-teal-600' },
      { id: 5, code: 'DE', name: 'Disabled Veteran', sub: 'Partial Benefits', tags: ['Medical'], color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)] min-h-[800px]">
        {/* Left Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display text-primary">Impact Overview</h2>
                <p className="text-neutral-500 text-sm">Real-time simulation results based on current policy rules.</p>
            </div>

            <div className="grid gap-4">
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-green-50 p-2 rounded-lg text-green-700"><span className="material-symbols-outlined">group_add</span></div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12.5%</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 font-display">2,450</h3>
                    <p className="text-sm text-neutral-500">Residents helped</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-red-50 p-2 rounded-lg text-red-700"><span className="material-symbols-outlined">trending_down</span></div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">-8.2%</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 font-display">142</h3>
                    <p className="text-sm text-neutral-500">Financial hardship cases</p>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-700"><span className="material-symbols-outlined">account_balance_wallet</span></div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">+$420/mo</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1 font-display">$45,200</h3>
                    <p className="text-sm text-neutral-500">Average annual income (Post-tax)</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex-1 flex flex-col">
                <h4 className="font-bold text-sm mb-4">Income Distribution Shift</h4>
                <div className="flex items-end gap-2 h-32 w-full mt-auto">
                    {[40, 55, 75, 60, 30].map((h, i) => (
                        <div key={i} className="w-1/5 bg-neutral-100 rounded-t h-full relative flex items-end">
                            <div className="w-full bg-neutral-200 rounded-t" style={{height: `${h}%`}}>
                                <div className="absolute bottom-0 w-full bg-primary h-[80%] rounded-t opacity-80"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-neutral-400">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
                <h2 className="text-lg font-bold font-display">Affected Personas</h2>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-neutral-50 rounded-lg"><span className="material-symbols-outlined text-neutral-400">filter_list</span></button>
                    <button className="p-2 hover:bg-neutral-50 rounded-lg"><span className="material-symbols-outlined text-neutral-400">search</span></button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Persona List */}
                <div className="w-1/3 border-r border-neutral-200 overflow-y-auto bg-neutral-50 p-4 space-y-3 hide-scrollbar">
                    {personas.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedPersonaId(p.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                selectedPersonaId === p.id 
                                ? 'border-primary bg-white shadow-sm' 
                                : 'border-transparent border-dashed border-neutral-300 hover:border-neutral-400 bg-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${p.color}`}>{p.code}</div>
                                <div>
                                    <h4 className="font-bold text-sm text-primary">{p.name}</h4>
                                    <p className="text-xs text-neutral-500">{p.sub}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {p.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-neutral-200 text-neutral-500 bg-white">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Details Panel */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {selectedPersonaId === 1 ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold font-display mb-1 text-primary">Single Mother (2 Dependents)</h3>
                                    <p className="text-neutral-500 text-sm">Analysis ID: #P-8821 • Region: Metro Area</p>
                                </div>
                                <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border border-red-100">
                                    <span className="material-symbols-outlined text-sm">warning</span> High Priority
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Applicable Policy Rules</h4>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                    <p className="text-sm font-bold text-primary mb-1">Child Tax Credit Expansion (Rule 4.2)</p>
                                    <p className="text-sm text-neutral-600">Increases monthly stipend by $250 per dependent under age 6.</p>
                                </div>
                                <div className="bg-neutral-50 border-l-4 border-neutral-300 p-4 rounded-r-lg opacity-60">
                                    <p className="text-sm font-bold text-primary mb-1">Housing Subsidy Cap (Rule 1.1)</p>
                                    <p className="text-sm text-neutral-600">Subsidy capped at 30% of gross income. No change for this persona.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Financial Projection (Year 1)</h4>
                                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                                    <div className="grid grid-cols-3 divide-x divide-neutral-200">
                                        <div className="p-4 text-center">
                                            <p className="text-xs text-neutral-500 mb-1">Baseline Income</p>
                                            <p className="text-lg font-bold text-primary">$32,000</p>
                                        </div>
                                        <div className="p-4 text-center bg-green-50/50">
                                            <p className="text-xs text-neutral-500 mb-1">Policy Impact</p>
                                            <p className="text-lg font-bold text-green-600">+$6,000</p>
                                        </div>
                                        <div className="p-4 text-center">
                                            <p className="text-xs text-neutral-500 mb-1">Projected Total</p>
                                            <p className="text-lg font-bold text-primary">$38,000</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-neutral-200 bg-neutral-50">
                                        <p className="text-sm font-mono text-neutral-600 text-center">Net Effect: <span className="font-bold">+18.75%</span> increase in disposable income.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Risk Assessment</h4>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-sm font-medium border border-orange-100">
                                        <span className="material-symbols-outlined text-sm">home_work</span> Housing Instability
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-sm font-medium border border-neutral-200">
                                        <span className="material-symbols-outlined text-sm">work</span> Job Vulnerability
                                    </span>
                                     <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                                        <span className="material-symbols-outlined text-sm">health_and_safety</span> Healthcare Access
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-neutral-300">
                            <span className="material-symbols-outlined text-6xl mb-4">person_search</span>
                            <p>Select a persona to view analysis details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImpactScreen;