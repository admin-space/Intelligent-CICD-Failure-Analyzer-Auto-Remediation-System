import React from 'react';

const Overview: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
          Dashboard Overview
        </h2>
        <p className="text-slate-400">Summarized cost histories and saving parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card relative overflow-hidden">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Monthly Spend</p>
          <h3 className="text-3xl font-bold mt-2 text-white Outfit">$14,240</h3>
          <p className="text-xs text-emerald-400 mt-2 font-medium">↓ 5.4% from last month</p>
        </div>
        
        <div className="p-6 rounded-2xl glass-card">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Projected Savings</p>
          <h3 className="text-3xl font-bold mt-2 text-white Outfit">$3,180</h3>
          <p className="text-xs text-violet-400 mt-2 font-medium">Based on 14 optimizations</p>
        </div>

        <div className="p-6 rounded-2xl glass-card">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Active Resources</p>
          <h3 className="text-3xl font-bold mt-2 text-white Outfit">284</h3>
          <p className="text-xs text-slate-500 mt-2">Across AWS, Azure, GCP</p>
        </div>
      </div>

      {/* Chart Scaffolding */}
      <div className="p-6 rounded-2xl glass-card h-[400px] flex items-center justify-center text-slate-500">
        Recharts Cost Trend Visualizer Placeholder
      </div>
    </div>
  );
};

export default Overview;
