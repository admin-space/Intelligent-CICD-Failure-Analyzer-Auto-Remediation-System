import React from 'react';

const Alerts: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
          Alerting Rules & Budgets
        </h2>
        <p className="text-slate-400">Manage spending budgets and Slack/Email webhook hooks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl glass-card">
            <h4 className="text-lg font-bold text-slate-200 mb-4">Active Budgets</h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <h5 className="font-semibold text-slate-300">AWS Spending Limit</h5>
                  <p className="text-xs text-slate-500 mt-1">Provider: AWS • Alert threshold: 80%</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-200 font-bold">$5,000 / mo</span>
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-violet-500 h-full w-[65%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card h-fit space-y-4">
          <h4 className="text-lg font-bold text-slate-200">Alert Webhooks</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <p>Slack Webhook: <code>https://hooks.slack.com/services/...</code></p>
            <p>Email Recipient: <code>alerts@cloudwise.ai</code></p>
          </div>
          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition text-sm">
            Edit Webhooks
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
