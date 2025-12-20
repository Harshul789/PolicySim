import React from 'react';

const DialogueScreen: React.FC = () => {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-10 pb-20 pt-8">
      <div className="flex flex-col items-center pb-6 text-center">
        <div className="flex gap-2 text-sm text-neutral-500 mb-4">
            <span>Policy Analysis</span>
            <span>/</span>
            <span className="text-primary font-medium">Urban Zoning Reform</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight max-w-[800px] text-primary">
          Policy Impact Conflict Analysis
        </h1>
        <p className="text-neutral-500 mt-4 text-base max-w-[600px]">
          Simulating socio-economic friction points for Housing Bill 2024-B.
        </p>
        <button className="mt-8 group flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary text-white text-base font-bold shadow-lg hover:scale-105 transition-all">
          <span className="material-symbols-outlined text-[20px]">compare_arrows</span>
          <span>Show policy conflicts</span>
        </button>
      </div>

      <div className="mt-12 flex flex-col gap-10 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary">groups</span>
          <h2 className="text-xl font-bold font-display">Dynamic Dialogue View</h2>
        </div>

        {/* Message 1 */}
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
             <span className="material-symbols-outlined text-neutral-600">person</span>
          </div>
          <div className="flex flex-col w-full">
             <div className="flex items-baseline gap-2 mb-1">
               <h3 className="text-base font-bold">Sarah T.</h3>
               <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">Tenant</span>
             </div>
             <div className="relative bg-[#f7f7f7] rounded-xl rounded-bl-sm p-5 border border-neutral-200">
               <p className="text-base font-medium leading-relaxed text-neutral-800">
                 "This rule reduces my rent cap by 5%, which sounds good, but the new income threshold calculation <span className="bg-red-50 text-red-700 px-1 rounded">eliminates my childcare subsidy entirely</span>. I'll actually end up with less disposable income."
                 <sup className="text-xs font-bold text-neutral-400 ml-1">[1]</sup>
               </p>
             </div>
             <div className="mt-2 pl-2 border-l-2 border-neutral-100 ml-1">
                <div className="flex items-center justify-between text-sm py-1 max-w-[280px]">
                  <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Net Monthly Impact</span>
                  <span className="font-bold text-red-600">-$240.00</span>
                </div>
             </div>
          </div>
        </div>

        {/* Message 2 */}
        <div className="flex items-start gap-4 flex-row-reverse">
          <div className="size-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
             <span className="material-symbols-outlined text-neutral-600">business_center</span>
          </div>
          <div className="flex flex-col items-end w-full">
             <div className="flex items-baseline gap-2 mb-1">
               <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">Landlord</span>
               <h3 className="text-base font-bold">Marcus L.</h3>
             </div>
             <div className="relative bg-primary text-white rounded-xl rounded-br-sm p-5 shadow-sm">
               <p className="text-base font-medium leading-relaxed">
                 "Reducing the rent cap forces me to <span className="bg-orange-100 text-orange-800 px-1 rounded">defer non-critical maintenance</span> like the roof repair. While legal, this will lower the building's safety rating over time and decrease property value."
                 <sup className="text-xs font-bold text-white/50 ml-1">[2]</sup>
               </p>
             </div>
             <div className="mt-2 pr-2 border-r-2 border-neutral-100 mr-1 flex flex-col items-end">
                <div className="flex items-center justify-between text-sm py-1 w-[240px]">
                  <span className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Safety Risk (5yr)</span>
                  <span className="font-bold text-orange-600">-1.5 Stars</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;