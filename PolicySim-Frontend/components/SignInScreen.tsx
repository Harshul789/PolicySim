import React, { useState } from 'react';
import { Logo } from './Logo';

interface Props {
  onSignIn: () => void;
}

const SignInScreen: React.FC<Props> = ({ onSignIn }) => {
  const [userId, setUserId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated delay for "authenticating" feel
    setTimeout(() => {
        if (userId === 'POLICY_ADMIN_01' && passcode === 'SIM_2025') {
            onSignIn();
        } else {
            setError('Invalid Digital ID or Passcode');
            setIsLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-sans relative overflow-hidden flex flex-col items-center justify-center p-6">
      <style>{`
        @keyframes spotlight-pan {
          0% { left: -10%; opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { left: 110%; opacity: 0; }
        }
      `}</style>

      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
         <div className="absolute right-0 top-0 w-[40%] h-[50%] bg-gradient-to-bl from-neutral-100 to-transparent blur-[100px] opacity-40"></div>
         <div 
            className="absolute bottom-[-100px] w-[1000px] h-[600px] bg-gradient-to-t from-red-600/80 via-orange-500/50 to-transparent blur-[70px] opacity-70 rounded-t-full mix-blend-multiply"
            style={{ 
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'spotlight-pan 18s linear infinite' 
            }} 
          ></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10">
            
            <div className="flex flex-col items-center mb-10">
                <Logo className="size-16 mb-4" />
                <h1 className="text-2xl font-bold font-display text-primary">Secure Access</h1>
                <p className="text-neutral-500 text-sm font-medium">Policy Simulation Engine</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                        Digital User ID
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 material-symbols-outlined text-[20px]">badge</span>
                        <input 
                            type="text" 
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-12 pr-4 font-mono text-sm font-bold text-primary placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all"
                            placeholder="Ex: POLICY_ADMIN_01"
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">
                        Passcode
                    </label>
                    <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 material-symbols-outlined text-[20px]">lock</span>
                        <input 
                            type="password" 
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-12 pr-4 font-mono text-sm font-bold text-primary placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-400 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-[#1d1d1f] text-white rounded-xl font-bold shadow-lg shadow-black/10 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {isLoading ? (
                        <>
                            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Verifying...
                        </>
                    ) : (
                        <>
                            Sign In to Console
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
                <p className="text-[10px] text-neutral-400 font-medium">
                    Restricted Access • Authorized Personnel Only
                </p>
            </div>
        </div>
      </div>

       {/* Decorative Noise/Grain Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
    </div>
  );
};

export default SignInScreen;
