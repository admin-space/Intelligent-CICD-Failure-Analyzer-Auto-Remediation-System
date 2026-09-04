import React, { useState, useEffect } from 'react';
import { FileBarChart, Download, FileText, CheckCircle, ShieldAlert, DollarSign, Sparkles, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';

const Reports: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/reports/summary');
      setReport(data);
    } catch (e) {
      console.error('Failed to load executive report', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const downloadCSV = () => {
    window.open('http://127.0.0.1:8000/api/reports/csv', '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
            Executive FinOps Reports
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Audit-ready cost summaries, waste breakdown reports, and CSV inventory exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV Inventory
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 glass-card rounded-3xl">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
          Generating Executive Report...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Monthly Spend</span>
              <h3 className="text-3xl font-extrabold text-white mt-2 Outfit">
                ${report?.monthly_spend?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-xs text-slate-500 mt-2">Active AWS billing estimate</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-violet-500/30 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300">Projected Monthly Savings</span>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-2 Outfit">
                ${report?.projected_monthly_savings?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-xs text-slate-400 mt-2">Identified via waste detection</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Projected Annual Savings</span>
              <h3 className="text-3xl font-extrabold text-white mt-2 Outfit">
                ${report?.projected_annual_savings?.toFixed(2) || '0.00'}
              </h3>
              <p className="text-xs text-slate-500 mt-2">12-Month run-rate recovery</p>
            </div>
          </div>

          {/* Top Opportunities Table */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white Outfit">Top Cost Optimization Opportunities</h3>
            <p className="text-xs text-slate-400">Actionable items requiring remediation or downscaling</p>

            <div className="divide-y divide-slate-800/60 pt-2">
              {report?.top_waste_opportunities && report.top_waste_opportunities.length > 0 ? (
                report.top_waste_opportunities.map((item: any, idx: number) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-300 text-[10px] font-bold uppercase">
                          {item.service}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">{item.resource_id}</span>
                      </div>
                      <p className="text-xs text-slate-400">{item.recommendation}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        +${item.monthly_savings.toFixed(2)}/mo
                      </span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                        {item.risk} Risk
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-slate-500">No active opportunities.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
