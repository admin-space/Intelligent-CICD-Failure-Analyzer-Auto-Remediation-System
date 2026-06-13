import React from 'react';

const CloudExplorer: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
          Cloud Cost Explorer
        </h2>
        <p className="text-slate-400">Explore cloud metrics across multiple dimensions.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-800 pb-4">
        <button className="px-4 py-2 bg-violet-600/20 text-violet-300 rounded-lg border border-violet-500/30 font-medium">All Providers</button>
        <button className="px-4 py-2 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg transition font-medium">AWS</button>
        <button className="px-4 py-2 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg transition font-medium">Azure</button>
        <button className="px-4 py-2 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg transition font-medium">GCP</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card h-[350px] flex items-center justify-center text-slate-500">
          Service Cost Breakdown Pie Chart
        </div>
        <div className="p-6 rounded-2xl glass-card h-[350px] flex items-center justify-center text-slate-500">
          Regional Cost Distribution Map/Bar Chart
        </div>
      </div>
    </div>
  );
};

export default CloudExplorer;
