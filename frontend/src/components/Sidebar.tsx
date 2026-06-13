import React from 'react';
import { LayoutDashboard, Compass, Sparkles, Bell, FileBarChart, ShieldAlert } from 'lucide-react';

type Tab = 'overview' | 'explorer' | 'optimizer' | 'copilot' | 'reports' | 'alerts';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'explorer' as Tab, label: 'Cloud Explorer', icon: Compass },
    { id: 'optimizer' as Tab, label: 'Cost Optimizer', icon: Sparkles },
    { id: 'copilot' as Tab, label: 'FinOps Copilot', icon: Bell },
    { id: 'reports' as Tab, label: 'Reports', icon: FileBarChart },
    { id: 'alerts' as Tab, label: 'Alerts & Rules', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800/80 p-6 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-md">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-violet-500/20">
            CW
          </div>
          <div>
            <h1 className="font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 text-lg Outfit">
              CloudWise AI
            </h1>
            <p className="text-xs text-slate-500 font-medium">FinOps Platform</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-pink-500/10 text-violet-300 border-l-4 border-violet-500'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800/80 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Admin User</p>
            <p className="text-xs text-slate-500">admin@cloudwise.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
