import React from 'react';

const FrictionScreen: React.FC = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 py-10">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold mb-3">Policy Impact Conflict Analysis</h1>
        <p className="text-neutral-500">Simulating socio-economic friction points.</p>
      </div>

      <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary">groups</span>
          <h2 className="text-xl font-bold font-display">Persona Friction View</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Divider Line */}
        <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-neutral-300 to-transparent -translate-x-1/2"></div>

        {/* Left Persona */}
        <div className="flex flex-col gap-4 bg-white border border-[#ededed] rounded-xl p-8 shadow-sm">
            <div className="flex items-start gap-4 pb-6 border-b border-[#ededed]">
                <div className="size-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-neutral-600">person</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold">Sarah T.</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">Tenant</span>
                        <span className="text-xs text-neutral-500">Single Parent, Income &lt; $45k</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 py-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                        <span className="material-symbols-outlined text-[16px]">payments</span>
                        <span className="uppercase tracking-wider font-bold">Policy Change</span>
                    </div>
                    <p className="text-base font-medium leading-relaxed text-primary">
                        "This rule reduces my rent cap by <span className="font-semibold text-green-700">5%</span>."
                        <sup className="text-xs font-bold text-neutral-400 ml-1">[A1]</sup>
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-xs text-red-700 mb-2">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span className="uppercase tracking-wider font-bold">Conflict Point: Subsidy</span>
                    </div>
                    <p className="text-base font-medium leading-relaxed text-primary">
                        "The new income threshold calculation <span className="bg-red-50 text-red-700 px-1 rounded">eliminates my childcare subsidy entirely</span>."
                        <sup className="text-xs font-bold text-neutral-400 ml-1">[B1]</sup>
                    </p>
                </div>
                <div className="border-t border-neutral-100 pt-4">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-500">Net Monthly Disposable</span>
                        <span className="text-lg font-bold text-red-600">-$240.00</span>
                     </div>
                </div>
            </div>
        </div>

        {/* Right Persona */}
        <div className="flex flex-col gap-4 bg-white border border-[#ededed] rounded-xl p-8 shadow-sm">
            <div className="flex items-start gap-4 pb-6 border-b border-[#ededed]">
                <div className="size-12 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-neutral-600">business_center</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold">Marcus L.</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700">Landlord</span>
                        <span className="text-xs text-neutral-500">Small Business Owner</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 py-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                        <span className="material-symbols-outlined text-[16px]">balance</span>
                        <span className="uppercase tracking-wider font-bold">Policy Effect</span>
                    </div>
                    <p className="text-base font-medium leading-relaxed text-primary">
                        "Reducing the rent cap forces me to <span className="font-semibold text-orange-700">defer non-critical maintenance</span>."
                        <sup className="text-xs font-bold text-neutral-400 ml-1">[C1]</sup>
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-2 text-xs text-orange-700 mb-2">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span className="uppercase tracking-wider font-bold">Conflict Point: Value</span>
                    </div>
                    <p className="text-base font-medium leading-relaxed text-primary">
                        "This will lower the building's safety rating over time and <span className="bg-orange-50 text-orange-700 px-1 rounded">decrease property value</span>."
                        <sup className="text-xs font-bold text-neutral-400 ml-1">[D1]</sup>
                    </p>
                </div>
                 <div className="border-t border-neutral-100 pt-4">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-neutral-500">Safety Rating (5yr)</span>
                        <span className="text-lg font-bold text-orange-600">-1.5 Stars</span>
                     </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FrictionScreen;