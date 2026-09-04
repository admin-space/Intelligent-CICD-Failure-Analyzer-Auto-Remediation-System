import React, { useState, useEffect } from 'react';
import Sidebar, { Tab } from './components/Sidebar';
import Overview from './components/Overview';
import CloudExplorer from './components/CloudExplorer';
import CostOptimizer from './components/CostOptimizer';
import FinOpsCopilot from './components/FinOpsCopilot';
import Reports from './components/Reports';
import Alerts from './components/Alerts';
import AWSConnectModal from './components/AWSConnectModal';
import { fetchAWSStatus, AWSStatus } from './services/api';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAWSModalOpen, setIsAWSModalOpen] = useState(false);
  const [awsStatus, setAwsStatus] = useState<AWSStatus | null>(null);

  const refreshAWSStatus = async () => {
    try {
      const data = await fetchAWSStatus();
      setAwsStatus(data);
    } catch (e) {
      console.error('Failed to fetch AWS status:', e);
    }
  };

  useEffect(() => {
    refreshAWSStatus();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        awsStatus={awsStatus}
        onOpenAWSModal={() => setIsAWSModalOpen(true)}
      />
      
      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto p-8 relative h-screen">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
          {activeTab === 'overview' && (
            <Overview
              onNavigate={setActiveTab}
              onOpenAWSModal={() => setIsAWSModalOpen(true)}
              awsStatus={awsStatus}
            />
          )}
          {activeTab === 'explorer' && <CloudExplorer />}
          {activeTab === 'optimizer' && <CostOptimizer onStatusRefresh={refreshAWSStatus} />}
          {activeTab === 'copilot' && <FinOpsCopilot />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'alerts' && <Alerts />}
        </div>
      </main>

      {/* AWS Connection Modal */}
      <AWSConnectModal
        isOpen={isAWSModalOpen}
        onClose={() => setIsAWSModalOpen(false)}
        onStatusChange={refreshAWSStatus}
      />
    </div>
  );
};

export default App;
