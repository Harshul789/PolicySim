import React from 'react';
import { Logo } from './Logo';

interface Props {
  onStart: () => void;
  onSignInClick: () => void;
}

const LandingScreen: React.FC<Props> = ({ onStart, onSignInClick }) => {
  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans relative overflow-hidden flex flex-col">
      <style>{`
        @keyframes spotlight-pan {
          0% { left: -10%; opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>

      {/* Static Ambient Background (Top Right) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
         <div className="absolute right-0 top-0 w-[40%] h-[50%] bg-gradient-to-bl from-neutral-100 to-transparent blur-[100px] opacity-40"></div>
      </div>

      {/* Interactive Grounded Red Gradient - Animated Pan */}
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div 
            className="absolute bottom-[-100px] w-[1000px] h-[600px] bg-gradient-to-t from-red-600/80 via-orange-500/50 to-transparent blur-[70px] opacity-70 rounded-t-full mix-blend-multiply will-change-transform"
            style={{ 
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'spotlight-pan 18s linear infinite' 
            }} 
          ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 h-24 flex items-center justify-between">
         <div className="w-32">
             <a href="#" className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">How it Works</a>
         </div>
         
         <div className="flex items-center gap-2">
            <Logo className="size-16" />
            <span className="text-lg font-bold tracking-tight font-display text-[#1d1d1f]">PolicySim</span>
         </div>

         <div className="w-32 flex justify-end">
             <button onClick={onSignInClick} className="text-sm font-medium text-neutral-500 hover:text-black transition-colors">Sign In</button>
         </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-6 pb-20">
         <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             
             {/* Tagline */}
             <p className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">
                 AI Engine for Policy Risk Assessment
             </p>

             {/* Headline - Restored Original */}
             <h1 className="text-5xl md:text-7xl font-display font-medium text-[#1d1d1f] leading-[1.1] tracking-tight">
                 Your jurisdiction has complex challenges. Finally, a simulator that <span className="italic font-serif text-neutral-400 decoration-neutral-300 line-through decoration-2">can't</span> <span className="italic font-serif text-neutral-800">can</span> answer them.
             </h1>

             {/* Description */}
             <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                 PolicySim simulates the ripple effects of legislation using multi-agent cognitive modeling, delivering precise risk assessments before implementation.
             </p>

             {/* CTA Button */}
             <div className="pt-4">
                 <button 
                    onClick={onStart}
                    className="bg-[#1d1d1f] text-white text-base font-bold rounded-full px-8 py-4 shadow-lg hover:shadow-xl hover:bg-black hover:-translate-y-1 transition-all duration-300"
                 >
                    Start the Engine
                 </button>
             </div>
         </div>
      </main>
      
      {/* Decorative Noise/Grain Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
    </div>
  );
};

export default LandingScreen;