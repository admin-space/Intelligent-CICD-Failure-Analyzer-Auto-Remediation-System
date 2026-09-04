import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
  TrendingDown, TrendingUp, Sparkles, Server, DollarSign,
  Cloud, ArrowRight, RefreshCw, ShieldCheck
} from 'lucide-react';
import { fetchCostSummary, triggerCloudScan, CostSummary, AWSStatus } from '../services/api';
import { Tab } from './Sidebar';

interface OverviewProps {
  onNavigate: (tab: Tab) => void;
  onOpenAWSModal: () => void;
  awsStatus: AWSStatus | null;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

const Overview: React.FC<OverviewProps> = ({ onNavigate, onOpenAWSModal, awsStatus }) => {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCostSummary();
      setSummary(data);
    } catch (e) {
      console.error('Failed to load overview data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      await triggerCloudScan();
      await loadData();
    } catch (e) {
      console.error('Scan failed', e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
              FinOps Command Center
            </h2>
            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
              awsStatus?.connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {awsStatus?.connected ? 'Live AWS' : 'Simulation Mode'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time AWS cost intelligence, idle infrastructure detection, and automated FinOps remediations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAWSModal}
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-2xl text-xs font-semibold text-slate-200 transition flex items-center gap-2"
          >
            <Cloud className="w-4 h-4 text-amber-400" />
            AWS Settings
          </button>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:brightness-110 rounded-2xl text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning AWS...' : 'Run Cloud Scan'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Monthly Spend */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monthly Spend</span>
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-3 Outfit">
            ${summary?.total_monthly_spend.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {summary?.spend_change_percentage && summary.spend_change_percentage > 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-semibold">+{summary.spend_change_percentage}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{summary?.spend_change_percentage || 0}%</span>
              </>
            )}
            <span className="text-slate-500">vs. previous period</span>
          </div>
        </div>

        {/* Projected Savings */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/30 via-slate-900/60 to-slate-900/60 border border-violet-500/30 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-violet-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300">Projected Savings</span>
            <div className="p-2 bg-violet-500/20 rounded-xl text-violet-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-3 Outfit text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
            ${summary?.projected_savings.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Monthly waste identified</span>
            <button
              onClick={() => onNavigate('optimizer')}
              className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
            >
              Optimize <ArrowRight className="w-3 h-3" />
            </button>
          </p>
        </div>

        {/* Active Resources */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monitored Resources</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white mt-3 Outfit">
            {summary?.active_resources_count || 0}
          </h3>
          <p className="text-xs text-slate-400 mt-2">
            EC2, EBS, RDS, S3, and EIPs
          </p>
        </div>

        {/* Annual ROI Potential */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden backdrop-blur-md shadow-xl group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Annual Run-Rate ROI</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-3 Outfit">
            ${((summary?.projected_savings || 0) * 12).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Calculated over 12 months
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spend Trend Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white Outfit">Daily Spending Trend (Last 30 Days)</h3>
              <p className="text-xs text-slate-400">Historical AWS Cost Explorer daily unblended compute and storage expenditure</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {summary?.daily_trends && summary.daily_trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.daily_trends}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '1rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`$${value}`, 'Daily Cost']}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#spendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Loading cost trend telemetry...
              </div>
            )}
          </div>
        </div>

        {/* Service Breakdown Bar Chart (1 Col) */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white Outfit">Service Cost Breakdown</h3>
            <p className="text-xs text-slate-400">Top AWS service cost drivers</p>
          </div>

          <div className="space-y-3 pt-2">
            {summary?.service_breakdown && summary.service_breakdown.length > 0 ? (
              summary.service_breakdown.slice(0, 5).map((item, idx) => (
                <div key={item.service} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 truncate max-w-[170px]">{item.service}</span>
                    <span className="text-white">${item.amount.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[idx % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                No service metrics available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
