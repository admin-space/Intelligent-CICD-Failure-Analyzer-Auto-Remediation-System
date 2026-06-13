import React from 'react';

const FinOpsCopilot: React.FC = () => {
  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col justify-between">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white Outfit">
          FinOps Copilot
        </h2>
        <p className="text-slate-400">Ask the RAG-powered chatbot about costs, recommendations, and metrics.</p>
      </div>

      {/* Messages area placeholder */}
      <div className="flex-1 overflow-y-auto my-6 p-6 rounded-2xl glass-panel flex flex-col justify-center items-center text-slate-500 text-sm">
        <p>No chat history yet. Try asking:</p>
        <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-md">
          <button className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-400 text-xs transition">
            "What are my highest spending services?"
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-400 text-xs transition">
            "Summarize active cost recommendations"
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-400 text-xs transition">
            "Is there any budget alert active?"
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="Ask a question about your cloud costs..." 
          className="flex-1 px-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-slate-200"
        />
        <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-xl font-semibold transition text-sm">
          Send
        </button>
      </div>
    </div>
  );
};

export default FinOpsCopilot;
