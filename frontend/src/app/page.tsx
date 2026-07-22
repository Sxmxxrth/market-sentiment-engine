"use client";

import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

type Article = {
  title: string;
  score: number;
  label: string;
};

type SentimentResponse = {
  ticker: string;
  average_score: number;
  sentiment: string;
  articles: Article[];
  timestamp: string;
};

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<SentimentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    
    setLoading(true);
    setError("");
    setData(null);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/analyze/${ticker}`);
      if (!res.ok) {
        throw new Error("Failed to fetch sentiment data");
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Error analyzing ticker. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment.includes("Bullish")) return <TrendingUp className="text-green-400 w-12 h-12" />;
    if (sentiment.includes("Bearish")) return <TrendingDown className="text-red-400 w-12 h-12" />;
    return <Minus className="text-gray-400 w-12 h-12" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.15) return "text-green-400";
    if (score <= -0.15) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Market Sentiment Engine
          </h1>
          <p className="text-slate-400 text-lg">Real-time NLP analysis of global financial news</p>
        </div>

        {/* Search */}
        <form onSubmit={analyzeTicker} className="relative max-w-xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter Stock Ticker (e.g. AAPL, TSLA)"
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-xl shadow-xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Results Dashboard */}
        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex items-center justify-between shadow-2xl">
                <div>
                  <p className="text-slate-400 font-medium mb-1">Overall Sentiment</p>
                  <h2 className="text-4xl font-bold text-white">{data.sentiment}</h2>
                  <p className="text-sm text-slate-500 mt-2">Analyzed {data.articles.length} latest articles</p>
                </div>
                {getSentimentIcon(data.sentiment)}
              </div>
              
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex flex-col justify-center shadow-2xl">
                <p className="text-slate-400 font-medium mb-1">VADER Score</p>
                <h3 className={`text-4xl font-bold ${getScoreColor(data.average_score)}`}>
                  {data.average_score > 0 ? "+" : ""}{data.average_score}
                </h3>
              </div>
            </div>

            {/* Articles List */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
                <h3 className="font-semibold text-slate-200">Recent Headlines Analysed</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {data.articles.map((article, i) => (
                  <div key={i} className="p-6 hover:bg-slate-700/20 transition-colors flex justify-between items-start gap-4">
                    <p className="text-slate-300 leading-relaxed">{article.title}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap
                      ${article.label === 'Positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        article.label === 'Negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                      {article.score > 0 ? "+" : ""}{article.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
