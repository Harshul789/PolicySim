import React, { useState, useRef } from 'react';
import { Logo } from './Logo';

interface Props {
  onAnalyze: (text: string, city: string) => void;
}

const SAMPLE_POLICY = `The Housing Stability and Affordability Act of 2024 proposes a comprehensive overhaul of urban zoning and rental assistance. 

Key Provisions:
1. Rent Cap Adjustment: Establishes a strict 5% annual cap on rent increases for all multi-family properties built before 2010.
2. Subsidy Threshold Calculation: Revises the eligibility for housing subsidies. Adjusted Gross Income (AGI) must now include all state and federal aid, effectively raising the threshold for qualification.
3. Maintenance Deferral Allowance: Allows landlords to defer "non-critical" maintenance (facade, landscaping, aesthetic upgrades) for up to 3 years if net operating income drops below 15%.
4. Mixed-Use Zoning Mandate: Requires 20% of ground-floor space in new developments >50 units to be reserved for small local businesses at below-market rates.
5. Child Tax Credit Expansion: Increases the state-level child tax credit by $250 per dependent for families earning under $60,000.`;

const UploadScreen: React.FC<Props> = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [city, setCity] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUseSample = () => {
    setText(SAMPLE_POLICY);
    setCity('Hyderabad');
    setFileName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Simulate reading file content if text area is empty
      if (!text) {
        setText(`[Content extracted from uploaded file: ${file.name}]\n\n${SAMPLE_POLICY}`);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col items-center text-neutral-900 font-sans relative">
      
      {/* History Modal Overlay */}
      {showHistory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowHistory(false)}>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-neutral-100 scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                    <h3 className="font-display font-bold text-lg text-[#1d1d1f]">Analysis History</h3>
                    <button onClick={() => setShowHistory(false)} className="size-8 flex items-center justify-center hover:bg-neutral-200 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-neutral-500 text-xl">close</span>
                    </button>
                </div>
                <div className="p-12 flex flex-col items-center text-center">
                    <div className="size-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-neutral-400">history_edu</span>
                    </div>
                    <h4 className="text-base font-bold text-neutral-900 mb-1">No previous history</h4>
                    <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
                        Your recent policy analysis reports and uploaded PDFs will appear here.
                    </p>
                </div>
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-center">
                    <button onClick={() => setShowHistory(false)} className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">Close</button>
                </div>
            </div>
         </div>
       )}

      {/* Header - Aligned to match App.tsx structure */}
      <header className="w-full max-w-[1400px] mx-auto flex justify-between items-center py-6 px-6 lg:px-10">
         <div className="flex items-center gap-2">
            <Logo className="size-16" />
            <span className="text-lg font-bold tracking-tight font-display">PolicySim</span>
         </div>
         <nav className="flex gap-6 text-sm font-medium text-neutral-500">
            <button onClick={() => setShowHistory(true)} className="hover:text-black transition-colors">History</button>
         </nav>
      </header>

      <div className="flex-grow flex flex-col justify-center w-full max-w-2xl py-12 px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-[#1d1d1f]">
            Analyze Policy Impact
          </h1>
          <p className="text-neutral-500 text-lg max-w-lg mx-auto leading-relaxed">
             Upload a PDF or paste policy text to simulate social and economic implications for your jurisdiction.
          </p>
        </div>

        {/* City Input */}
        <div className="mb-6 w-full">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 ml-1">Target City / Jurisdiction</label>
            <input 
                type="text" 
                className="w-full p-4 bg-white border border-neutral-200 rounded-xl text-base placeholder:text-neutral-400 focus:ring-2 focus:ring-black focus:border-transparent outline-none shadow-sm transition-all text-neutral-900 font-medium"
                placeholder="e.g. San Francisco, CA"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6 mb-8 relative group transition-all hover:shadow-md">
           
           {/* PDF Upload Area */}
           <div 
             onClick={handleUploadClick}
             className={`border-2 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${fileName ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
           >
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
              />
              <div className={`size-12 rounded-full flex items-center justify-center mb-3 transition-colors ${fileName ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                 <span className="material-symbols-outlined">{fileName ? 'check' : 'upload_file'}</span>
              </div>
              <p className="text-sm font-medium text-neutral-900">
                  {fileName ? fileName : "Upload policy document (PDF)"}
              </p>
              {!fileName && <p className="text-xs text-neutral-400 mt-1">or drag and drop</p>}
              {fileName && <p className="text-xs text-green-600 mt-2 font-medium">Ready for analysis</p>}
           </div>

           <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">Or paste text</span>
                </div>
            </div>

           <textarea 
             className="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none transition-colors"
             placeholder="Paste policy provisions here..."
             value={text}
             onChange={(e) => setText(e.target.value)}
           ></textarea>
           
           <div className="flex justify-between items-center mt-4">
              <button 
                onClick={handleUseSample}
                className="text-xs font-bold text-neutral-400 hover:text-black uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">description</span>
                Use Sample Data
              </button>
              <div className="text-xs text-neutral-400">
                {text.length} chars
              </div>
           </div>
        </div>

        <button 
          onClick={() => onAnalyze(text || SAMPLE_POLICY, city || "San Francisco (Default)")}
          disabled={(!text && !fileName) && !city}
          className="w-full bg-[#1d1d1f] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2 text-[17px]"
        >
           <span>Analyze Impact</span>
           <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
      
      <footer className="w-full max-w-[1400px] border-t border-neutral-200 py-8 px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-400 mt-auto">
        <p>© 2024 Policy Sim Analytics.</p>
        <div className="flex gap-4">
           <a href="#" className="hover:text-neutral-600">Privacy</a>
           <a href="#" className="hover:text-neutral-600">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default UploadScreen;