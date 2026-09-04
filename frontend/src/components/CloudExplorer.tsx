import React, { useState, useEffect } from 'react';
import {
  Server, HardDrive, Database, Globe, Layers, Search,
  Filter, RefreshCw, Radio
} from 'lucide-react';
import { fetchCloudResources, CloudResource } from '../services/api';

const CloudExplorer: React.FC = () => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await fetchCloudResources(selectedType);
      setResources(data);
    } catch (e) {
      console.error('Failed to load resources', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [selectedType]);

  const filteredResources = resources.filter((res) => {
    const q = searchQuery.toLowerCase();
    return res.name.toLowerCase().includes(q) || res.resource_id.toLowerCase().includes(q);
  });

  const getServiceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ec2': return <Server className="w-4 h-4 text-violet-400" />;
      case 'ebs': return <HardDrive className="w-4 h-4 text-amber-400" />;
      case 'rds': return <Database className="w-4 h-4 text-cyan-400" />;
      case 's3': return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'eip': return <Globe className="w-4 h-4 text-pink-400" />;
      default: return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
            AWS Cloud Resource Explorer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time inventory of provisioned compute, storage, and networking assets.
          </p>
        </div>

        <button
          onClick={loadResources}
          className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-2xl text-xs font-semibold text-slate-200 transition flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Table
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 border border-slate-800 p-4 rounded-3xl backdrop-blur-md">
        {/* Service Type Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['all', 'ec2', 'ebs', 'rds', 's3', 'eip'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition uppercase tracking-wider ${
                selectedType === t
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t === 'all' ? 'All Services' : t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Resource</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Region</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Key Metrics / Specs</th>
                <th className="py-4 px-6 text-right">Est. Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" />
                    Fetching live AWS inventory...
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No resources matching filter.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => {
                  const details = res.details || {};
                  return (
                    <tr key={res.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-xl">
                            {getServiceIcon(res.type)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 text-sm">{res.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{res.resource_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                          {res.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                        {res.region}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                          res.status === 'running' || res.status === 'in-use' || res.status === 'active' || res.status === 'available'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : res.status === 'orphan'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 text-[11px]">
                        {res.type === 'ec2' && (
                          <span>Avg CPU: <b className={details.cpu_utilization_avg < 5 ? 'text-rose-400' : 'text-emerald-400'}>{details.cpu_utilization_avg}%</b> &bull; IP: {details.private_ip}</span>
                        )}
                        {res.type === 'ebs' && (
                          <span>Size: <b>{details.size_gib} GB</b> &bull; {details.volume_type} &bull; {details.is_unattached ? 'Unattached' : 'Attached'}</span>
                        )}
                        {res.type === 'rds' && (
                          <span>Engine: <b>{details.engine}</b> &bull; {details.instance_class}</span>
                        )}
                        {res.type === 'eip' && (
                          <span>Public IPv4: <b>{details.public_ip}</b></span>
                        )}
                        {res.type === 's3' && (
                          <span>Bucket Size: ~{details.size_gb || 20} GB</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-slate-100 text-sm font-mono">
                        ${res.estimated_monthly_cost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CloudExplorer;
