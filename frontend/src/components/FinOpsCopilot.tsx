import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, RefreshCw, Zap, ArrowUpRight } from 'lucide-react';
import { askFinOpsCopilot } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sources?: Array<{ type: string; resource_id: string; savings: string; action: string }>;
  timestamp: string;
}

const FinOpsCopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! I am **CloudWise AI Copilot**, your real-time FinOps assistant. I continuously monitor your AWS infrastructure for idle resources, compute waste, and optimization opportunities.\n\nAsk me anything like *'Where is my cloud waste?'* or *'How can I reduce my EC2 bill?'*",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await askFinOpsCopilot(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.response,
        sources: res.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I encountered an issue retrieving telemetry. Please make sure the backend is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Where is my cloud waste?',
    'Which EC2 instances are idle?',
    'How much can I save by purging unattached EBS volumes?',
    'Explain the Auto-Healing safety guardrails'
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl animate-fade-in">
      {/* Copilot Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-pink-500 rounded-2xl text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base Outfit">FinOps AI Copilot</h3>
            <p className="text-xs text-slate-400">Grounded in live AWS telemetry & optimization rules</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-bold rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Online & Ready
        </span>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-3xl p-5 text-xs leading-relaxed space-y-3 ${
                  isBot
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/10'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-sm">
                  {msg.text}
                </div>

                {/* Source References */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Referenced:</span>
                    {msg.sources.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-violet-300 font-mono"
                      >
                        {s.type}: {s.resource_id} ({s.savings})
                      </span>
                    ))}
                  </div>
                )}

                <span className={`block text-[10px] text-right ${isBot ? 'text-slate-500' : 'text-violet-200'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
              CloudWise Copilot is analyzing your AWS infrastructure...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/20 flex gap-2 overflow-x-auto text-xs">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/40 rounded-xl text-slate-400 hover:text-slate-200 text-[11px] whitespace-nowrap transition flex items-center gap-1"
          >
            <span>{prompt}</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your AWS spending, idle instances, or remediations..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:outline-none focus:border-violet-500 transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl transition disabled:opacity-40 shadow-lg shadow-violet-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default FinOpsCopilot;
