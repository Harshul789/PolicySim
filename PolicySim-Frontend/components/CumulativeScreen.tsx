import React from 'react';
import html2pdf from 'html2pdf.js';
import { AnalysisData } from '../types';

interface Props {
  data?: AnalysisData['cumulative'];
}

const CumulativeScreen: React.FC<Props> = ({ data }) => {
  if (!data) return <div className="p-10 text-center">No analysis data available.</div>;

  // Calculate Readiness/Viability (Inverse of Risk)
  const viabilityScore = Math.max(0, 100 - data.score);
  
  let viabilityLabel = "Moderate Viability";
  let viabilityColor = "text-orange-600";
  let ringColor = "#f97316"; // orange-500

  if (viabilityScore >= 75) {
      viabilityLabel = "Optimal for Implementation";
      viabilityColor = "text-green-600";
      ringColor = "#22c55e"; // green-500
  } else if (viabilityScore <= 40) {
      viabilityLabel = "Critical Risks Detected";
      viabilityColor = "text-red-600";
      ringColor = "#ef4444"; // red-500
  }
  const handleExportPDF = () => {
    const element = document.getElementById('cumulative-content');
    if (!element) return;

    // Create a clone for PDF generation to avoid affecting UI
    const opt = {
      margin: 10,
      filename: `PolicySim_Report_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 } as const,
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false,
        windowWidth: 794 // Match the CSS width for predictable layout
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } as const,
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as any }
    };

    // Temporarily add a class for PDF generation to handle widths
    element.classList.add('pdf-rendering');
    
    html2pdf().set(opt).from(element).save().then(() => {
        element.classList.remove('pdf-rendering');
    });
  };

  return (
    <>
    <style>{`
        #cumulative-content.pdf-rendering {
            width: 794px !important;
            padding: 20px !important;
            background-color: white !important;
            color: #1a1a1a !important;
            margin: 0 !important;
            overflow: visible !important;
        }
        #cumulative-content.pdf-rendering * {
            max-width: 100% !important;
            box-sizing: border-box !important;
            word-break: break-word !important;
        }
        #cumulative-content.pdf-rendering .shadow-xl,
        #cumulative-content.pdf-rendering .shadow-sm {
            box-shadow: none !important;
            border: 1px solid #eee !important;
        }
        #cumulative-content.pdf-rendering button {
            display: none !important;
        }
        #cumulative-content.pdf-rendering .grid {
            display: block !important;
        }
        #cumulative-content.pdf-rendering .grid > div {
            margin-bottom: 20px !important;
            width: 100% !important;
        }
        #cumulative-content.pdf-rendering .space-y-6 > div {
            page-break-inside: avoid !important;
            margin-bottom: 15px !important;
            border-radius: 12px !important;
            border: 1px solid #f0f0f0 !important;
            background: #ffffff !important;
        }
        #cumulative-content.pdf-rendering h4 {
            color: #1a1a1a !important;
            font-size: 16px !important;
            margin-bottom: 4px !important;
        }
        #cumulative-content.pdf-rendering p {
            font-size: 13px !important;
            line-height: 1.5 !important;
            color: #444 !important;
        }
    `}</style>
    <div id="cumulative-content" className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-10 pb-24 bg-[#f7f7f7]">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
           <div className="flex flex-col gap-2">
               <h1 className="text-4xl font-black text-primary font-display tracking-tight">Master Policy View</h1>
               <p className="text-neutral-500 text-lg">Synthesized analysis of fiscal models (Macro) and citizen impact (Micro).</p>
           </div>
           <div className="flex flex-wrap gap-3">
               <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white border border-neutral-200 px-6 text-sm font-bold text-neutral-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 transition-all">
                   <span className="material-symbols-outlined text-[20px]">link</span>
                   <span>Shareable Link</span>
               </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-bold text-white shadow-lg hover:bg-neutral-800 hover:-translate-y-0.5 transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                    <span>Export to PDF</span>
                </button>
           </div>
       </div>

       {/* Hero Card: Viability Score */}
       <div className="bg-white rounded-[32px] border border-neutral-200 shadow-xl overflow-hidden mb-10 relative">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-200 opacity-20"></div>
           
           <div className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
               {/* Gauge Chart */}
               <div className="relative size-48 flex-shrink-0">
                   <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                       <circle
                         className="text-neutral-100"
                         strokeWidth="10"
                         stroke="currentColor"
                         fill="transparent"
                         r="40"
                         cx="50"
                         cy="50"
                       />
                       <circle
                         className="transition-all duration-1000 ease-out"
                         strokeWidth="10"
                         strokeDasharray={`${viabilityScore * 2.51}, 251.2`}
                         strokeLinecap="round"
                         stroke={ringColor}
                         fill="transparent"
                         r="40"
                         cx="50"
                         cy="50"
                       />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className={`text-4xl font-black font-display ${viabilityColor}`}>{viabilityScore}%</span>
                       <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Readiness</span>
                   </div>
               </div>

               {/* Summary Text */}
               <div className="flex-1 text-center md:text-left">
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 ${
                       viabilityScore >= 75 ? 'bg-green-100 text-green-700' :
                       viabilityScore <= 40 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                   }`}>
                       <span className="material-symbols-outlined text-sm">analytics</span>
                       {viabilityLabel}
                   </div>
                   <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight">
                       {data.riskDescription}
                   </h2>
                   <p className="text-neutral-500 leading-relaxed max-w-3xl">
                       Based on the convergence of <span className="font-bold text-primary">Macro</span> fiscal indicators and <span className="font-bold text-primary">Micro</span> sentiment analysis, this policy exhibits a calculated risk score of <strong>{data.score}/100</strong>. Key friction points in citizen housing stability are weighing down the overall implementation score.
                   </p>
               </div>
           </div>
       </div>

       {/* Unified Impact Card (Macro + Micro Bullet Points) */}
       <div className="bg-white rounded-[24px] border border-neutral-200 shadow-sm p-8 md:p-12 mb-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
               {/* Macro Section */}
               <div>
                   <div className="flex items-center gap-4 mb-6">
                       <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                           <span className="material-symbols-outlined text-2xl">domain</span>
                       </div>
                       <div>
                           <h3 className="text-xl font-bold font-display text-primary">Macro-Economic Impact</h3>
                           <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Jurisdiction Level</p>
                       </div>
                   </div>
                   <ul className="space-y-4">
                       {data.macroIndicators.map((ind, i) => (
                           <li key={i} className="flex items-start gap-4">
                               <div className={`mt-2 size-2 rounded-full flex-shrink-0 ${ind.isGood ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                               <span className="text-neutral-600 font-medium leading-relaxed">
                                   <strong className="text-primary">{ind.label}:</strong> {ind.value} <span className="text-neutral-400 font-normal">({ind.trend === 'up' ? 'Increase' : 'Decrease'})</span>
                               </span>
                           </li>
                       ))}
                   </ul>
               </div>

               {/* Micro Section */}
               <div>
                   <div className="flex items-center gap-4 mb-6">
                       <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-sm">
                           <span className="material-symbols-outlined text-2xl">groups</span>
                       </div>
                   <div>
                           <h3 className="text-xl font-bold font-display text-primary">Micro-Social Impact</h3>
                           <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Citizen Level</p>
                       </div>
                   </div>
                   <ul className="space-y-4">
                       {data.microIndicators.map((ind, i) => (
                           <li key={i} className="flex items-start gap-4">
                               <div className={`mt-2 size-2 rounded-full flex-shrink-0 ${ind.isGood ? 'bg-green-500' : 'bg-red-400'}`}></div>
                               <span className="text-neutral-600 font-medium leading-relaxed">
                                   <strong className="text-primary">{ind.label}:</strong> {ind.value} <span className="text-neutral-400 font-normal">({ind.trend === 'up' ? 'Improvement' : 'Decline'})</span>
                               </span>
                           </li>
                       ))}
                   </ul>
               </div>
           </div>
       </div>

       {/* Detailed Strategic Findings */}
       <div className="space-y-6">
           <h3 className="text-2xl font-bold font-display text-primary px-2">Detailed Strategic Findings</h3>
           <div className="bg-white rounded-[24px] border border-neutral-200 shadow-sm overflow-hidden">
               {data.summaryItems.map((item, i) => (
                   <div key={i} className="p-6 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                       <div className="flex flex-col gap-1">
                           <div className="flex justify-between items-start">
                                <h4 className="text-lg font-bold text-primary">{item.title}</h4>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Impact Level</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                                        item.impact.toLowerCase().includes('high') ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-500'
                                    }`}>
                                        {item.impact}
                                    </span>
                                </div>
                           </div>
                           <p className="text-neutral-500 leading-snug">
                               {item.description}
                           </p>
                       </div>
                   </div>
               ))}
           </div>
       </div>
     </div>
    </>
  );
};

export default CumulativeScreen;