import React from 'react';

const CostOptimizer: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
            Cost Optimization Engine
          </h2>
          <p className="text-slate-400">Review waste detection insights and trigger Auto-Healing remediations.</p>
        </div>
        
        <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-pink-500 hover:shadow-lg hover:shadow-violet-500/10 hover:brightness-110 rounded-xl font-semibold transition text-sm">
          Run Cloud Scan
        </button>
      </div>

      <div className="space-y-4">
        {/* Recommendation card stub */}
        <div className="p-6 rounded-2xl glass-card border-l-4 border-l-emerald-500 flex justify-between items-start">
          <div className="space-y-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AWS EC2 Waste</span>
            <h4 className="text-lg font-bold text-slate-200">Idle instance: i-0abc123d456 (aws-prod-web)</h4>
            <p className="text-sm text-slate-400">Current CPU utilization is less than 2% over 7 days. Monthly savings: <b className="text-white">$85.00</b></p>
            <div className="p-3 bg-slate-900/40 rounded-xl text-xs text-slate-400 border border-slate-800/60 max-w-2xl">
              <b>AI Explanation:</b> Recommending downsizing this node to t3.medium or decommissioning. Risk is low as metrics show traffic is routed to alternate instances.
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition">
              Remediate Now
            </button>
            <button className="px-4 py-2 hover:bg-slate-800/50 text-slate-400 border border-transparent rounded-xl text-xs font-semibold transition">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostOptimizer;
