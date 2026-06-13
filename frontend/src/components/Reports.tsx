import React from 'react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
          Executive Reports
        </h2>
        <p className="text-slate-400">Generate and download PDF cost summaries and CSV cost files.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between h-[200px]">
          <div>
            <h4 className="text-lg font-bold text-slate-200">PDF Billing Report</h4>
            <p className="text-sm text-slate-400 mt-2">Generate a formal letter-sized billing report with cost tables and charts compiled with ReportLab.</p>
          </div>
          <button className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 rounded-xl font-semibold transition text-sm">
            Download PDF Report
          </button>
        </div>

        <div className="p-6 rounded-2xl glass-card flex flex-col justify-between h-[200px]">
          <div>
            <h4 className="text-lg font-bold text-slate-200">CSV Spreadsheet Export</h4>
            <p className="text-sm text-slate-400 mt-2">Export granular daily resource spending and metadata histories for custom spreadsheets formatting.</p>
          </div>
          <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition text-sm">
            Download CSV Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
