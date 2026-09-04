import React, { useState, useEffect } from 'react';
import { X, Cloud, Key, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchAWSStatus, updateAWSCredentials, syncAWSNow, AWSStatus } from '../services/api';

interface AWSConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const AWSConnectModal: React.FC<AWSConnectModalProps> = ({ isOpen, onClose, onStatusChange }) => {
  const [status, setStatus] = useState<AWSStatus | null>(null);
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStatus = async () => {
    try {
      const data = await fetchAWSStatus();
      setStatus(data);
      if (data.region) setRegion(data.region);
    } catch (e) {
      console.error('Failed to load AWS status', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim() || !secretKey.trim()) {
      setMessage({ type: 'error', text: 'Please provide both AWS Access Key ID and Secret Access Key.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await updateAWSCredentials({
        aws_access_key_id: accessKey,
        aws_secret_access_key: secretKey,
        aws_default_region: region,
        aws_session_token: sessionToken || undefined,
      });
      setMessage({ type: 'success', text: res.message || 'Successfully connected to AWS!' });
      await loadStatus();
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || err.message || 'AWS authentication failed.';
      setMessage({ type: 'error', text: errDetail });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      await syncAWSNow();
      setMessage({ type: 'success', text: 'Live AWS data refreshed successfully!' });
      await loadStatus();
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Sync failed: ' + (err.response?.data?.detail || err.message) });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 relative shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white Outfit">AWS Real-Time Connection</h3>
              <p className="text-xs text-slate-400">Manage AWS IAM credentials and real-time synchronization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Badge */}
        {status && (
          <div className={`p-4 rounded-2xl border ${status.connected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'} flex items-center justify-between`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-sm font-bold text-white">
                  {status.connected ? 'Live AWS Connected' : 'Simulation Mode (Mock AWS)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Account: <code className="text-slate-200">{status.account_id || 'N/A'}</code> | Region: <code className="text-slate-200">{status.region}</code>
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {message && (
          <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">AWS Access Key ID</label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="AKIAIOSFODNN7EXAMPLE"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">AWS Secret Access Key</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="us-east-1">US East (N. Virginia) us-east-1</option>
                <option value="us-east-2">US East (Ohio) us-east-2</option>
                <option value="us-west-1">US West (N. California) us-west-1</option>
                <option value="us-west-2">US West (Oregon) us-west-2</option>
                <option value="eu-west-1">EU (Ireland) eu-west-1</option>
                <option value="eu-central-1">EU (Frankfurt) eu-central-1</option>
                <option value="ap-south-1">Asia Pacific (Mumbai) ap-south-1</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore) ap-southeast-1</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Session Token (Optional)</label>
              <input
                type="password"
                value={sessionToken}
                onChange={(e) => setSessionToken(e.target.value)}
                placeholder="For temporary/STS credentials"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            ℹ️ Requires IAM permissions for <code>ce:GetCostAndUsage</code>, <code>ec2:Describe*</code>, <code>ec2:StopInstances</code>, <code>cloudwatch:GetMetricData</code>, and <code>s3:List*</code>.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-500/20 transition flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Verifying with AWS...' : 'Save & Connect to AWS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AWSConnectModal;
