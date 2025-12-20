import React, { useState, useEffect } from 'react';

const ProcessingScreen: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    "Initializing Simulation Environment...",
    "Running Agent 1: Fiscal Impact Model...",
    "Running Agent 2: Social Dynamics Simulation...",
    "Running Agent 3: Sentiment & Reaction Analysis...",
    "Synthesizing Cumulative Risk Assessment..."
  ];

  useEffect(() => {
    // Cycle through the steps every 1.5 seconds
    const timer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-10 max-w-md w-full px-6">
            {/* Clean Modern Spinner */}
            <div className="relative size-14">
               <div className="absolute inset-0 rounded-full border-[3px] border-neutral-200"></div>
               <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
            </div>
            
            <div className="text-center space-y-5 w-full">
                <h2 className="text-lg font-medium text-[#1d1d1f] tracking-tight transition-all duration-300 min-h-[28px] animate-pulse">
                    {steps[step]}
                </h2>
                
                {/* Agent Status Indicators */}
                <div className="flex justify-center items-center gap-3">
                    {[1, 2, 3].map((agentNum) => {
                        const isActive = step === agentNum;
                        const isDone = step > agentNum;
                        
                        return (
                            <div key={agentNum} className="flex flex-col items-center gap-2">
                                <div 
                                    className={`
                                        h-1.5 rounded-full transition-all duration-700 ease-in-out
                                        ${isActive ? 'w-10 bg-black' : isDone ? 'w-2 bg-neutral-400' : 'w-2 bg-neutral-200'}
                                    `}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProcessingScreen;