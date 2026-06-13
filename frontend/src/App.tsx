import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import CloudExplorer from './components/CloudExplorer';
import CostOptimizer from './components/CostOptimizer';
import FinOpsCopilot from './components/FinOpsCopilot';
import Reports from './components/Reports';
import Alerts from './components/Alerts';

type Tab = 'overview' | 'explorer' | 'optimizer' | 'copilot' | 'reports' | 'alerts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="flex min-h-screen bg-finops-dark text-slate-100 overflow-hidden">
      {/* Sidebar Layout */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto space-y-8">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'explorer' && <CloudExplorer />}
          {activeTab === 'optimizer' && <CostOptimizer />}
          {activeTab === 'copilot' && <FinOpsCopilot />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'alerts' && <Alerts />}
        </div>
      </main>
    </div>
  );
};

export default App;
