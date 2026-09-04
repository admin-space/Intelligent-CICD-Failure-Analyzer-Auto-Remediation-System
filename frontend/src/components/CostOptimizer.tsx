import React, { useState, useEffect } from 'react';
import {
  Sparkles, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck,
  Zap, ArrowRight, Check, XCircle
} from 'lucide-react';
import { fetchRecommendations, triggerCloudScan, remediateRecommendation, Recommendation } from '../services/api';

interface CostOptimizerProps {
  onStatusRefresh?: () => void;
}

const CostOptimizer: React.FC<CostOptimizerProps> = ({ onStatusRefresh }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [remediatingId, setRemediatingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ id: number; message: string } | null>(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await fetchRecommendations();
      setRecommendations(data);
    } catch (e) {
      console.error('Failed to load recommendations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const data = await triggerCloudScan();
      setRecommendations(data);
      if (onStatusRefresh) onStatusRefresh();
    } catch (e) {
      console.error('Failed to run cloud scan', e);
    } finally {
      setScanning(false);
    }
  };

  const handleRemediate = async (id: number) => {
    setRemediatingId(id);
    setNotification(null);
    try {
      const res = await remediateRecommendation(id, true);
      setNotification({ id, message: res.remediation_log || 'Remediation completed successfully.' });
      await loadRecommendations();
      if (onStatusRefresh) onStatusRefresh();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Remediation failed';
      setNotification({ id, message: `Error: ${errorMsg}` });
    } finally {
      setRemediatingId(null);
    }
  };

  const activeRecs = recommendations.filter(r => r.status === 'active');
  const remediatedRecs = recommendations.filter(r => r.status === 'remediated');
  const totalPotentialSavings = activeRecs.reduce((acc, curr) => acc + curr.estimated_savings, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
              Cost Optimization & Auto-Healing
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {activeRecs.length} Opportunities
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review automated waste detection insights and trigger 1-click safe infrastructure remediations.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block font-medium">Recoverable Spend</span>
            <span className="text-lg font-extrabold text-emerald-400 Outfit">
              ${totalPotentialSavings.toFixed(2)}/mo
            </span>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 hover:brightness-110 rounded-2xl text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Analyzing Waste...' : 'Run Waste Scan'}
          </button>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-5">
        {loading ? (
          <div className="p-12 text-center text-slate-500 glass-card rounded-3xl">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
            Loading cost optimization recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center glass-card rounded-3xl border border-slate-800 space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white Outfit">No Cloud Waste Detected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your monitored AWS infrastructure is currently operating efficiently. Run a scan anytime to re-evaluate metrics.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const isRemediated = rec.status === 'remediated';
            const isProcessing = remediatingId === rec.id;

            return (
              <div
                key={rec.id}
                className={`p-6 rounded-3xl border transition-all duration-300 ${
                  isRemediated
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-900/80 border-slate-800 hover:border-violet-500/40 shadow-xl'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Info Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-wider">
                        AWS {rec.service_type}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                        rec.risk_assessment === 'low'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {rec.risk_assessment.toUpperCase()} RISK
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ID: {rec.resource_id}
                      </span>
                      {isRemediated && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-3 h-3" /> REMEDIATED
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white Outfit">
                      {rec.resource_name || rec.resource_id}
                    </h4>

                    <p className="text-xs text-slate-300">
                      <b className="text-slate-400">Current Profile:</b> {rec.current_state}
                    </p>

                    <p className="text-xs text-slate-300">
                      <b className="text-slate-400">Recommendation:</b> {rec.recommended_state}
                    </p>

                    {/* AI Explanation Box */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl text-xs text-slate-300 border border-slate-800/80 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold text-violet-400 mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Copilot Justification:
                      </div>
                      <p>{rec.ai_explanation}</p>
                    </div>

                    {/* Remediation Audit Log if available */}
                    {rec.remediation_log && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 font-mono">
                        ✓ {rec.remediation_log}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
                        Projected Savings
                      </span>
                      <span className="text-2xl font-extrabold text-emerald-400 Outfit">
                        +${rec.estimated_savings.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">per month</span>
                    </div>

                    {!isRemediated ? (
                      <button
                        onClick={() => handleRemediate(rec.id)}
                        disabled={isProcessing}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                      >
                        {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        {isProcessing ? 'Remediating...' : 'Remediate Now'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-800 text-slate-500 rounded-xl text-xs font-medium cursor-default"
                      >
                        Action Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CostOptimizer;
