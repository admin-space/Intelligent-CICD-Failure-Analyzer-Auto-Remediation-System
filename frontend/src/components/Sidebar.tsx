import React from 'react';
import { LayoutDashboard, Compass, Sparkles, MessageSquare, FileBarChart, ShieldAlert, Cloud, Radio } from 'lucide-react';
import { AWSStatus } from '../services/api';

export type Tab = 'overview' | 'explorer' | 'optimizer' | 'copilot' | 'reports' | 'alerts';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  awsStatus: AWSStatus | null;
  onOpenAWSModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, awsStatus, onOpenAWSModal }) => {
  const navItems = [
    { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
    { id: 'explorer' as Tab, label: 'Cloud Explorer', icon: Compass },
    { id: 'optimizer' as Tab, label: 'Cost Optimizer', icon: Sparkles },
    { id: 'copilot' as Tab, label: 'FinOps Copilot', icon: MessageSquare },
    { id: 'reports' as Tab, label: 'Reports', icon: FileBarChart },
    { id: 'alerts' as Tab, label: 'Alerts & Rules', icon: ShieldAlert },
  ];

  const isLive = awsStatus?.connected;

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 p-5 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-xl z-20">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-violet-500/25">
            CW
          </div>
          <div>
            <h1 className="font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-200 to-pink-300 text-lg Outfit">
              CloudWise AI
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">FinOps Auto-Healing</p>
          </div>
        </div>

        {/* AWS Live Connection Pill */}
        <button
          onClick={onOpenAWSModal}
          className={`w-full p-3 rounded-2xl border text-left transition group ${
            isLive
              ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-slate-300">
              <Cloud className="w-3.5 h-3.5" />
              AWS Status
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className={`text-[10px] font-bold ${isLive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isLive ? 'LIVE' : 'SIMULATION'}
              </span>
            </span>
          </div>
          <p className="text-xs font-semibold text-white mt-1 truncate">
            {awsStatus?.account_id ? `Acc: ${awsStatus.account_id.split(' ')[0]}` : 'Configure AWS'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5" />
            {awsStatus?.region || 'us-east-1'} &bull; Click to settings
          </p>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-white font-semibold shadow-inner border border-violet-500/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shadow">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">DevOps Admin</p>
            <p className="text-[10px] text-slate-500 truncate">admin@cloudwise.ai</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
