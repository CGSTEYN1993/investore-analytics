'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Send, Sparkles, FileText, MessageSquare,
  Target, AlertTriangle, Loader2, Database, Clock,
  ChevronDown, ChevronUp, Building2, TrendingUp, Copy,
  Check, RefreshCw, BarChart3, Shield, Zap, Search,
  DollarSign, Activity, Newspaper, ArrowUpRight, ArrowDownRight,
  Gauge, PieChart, Layers, Globe, Hammer, BookOpen,
  CircleDot, Star, Hash, ExternalLink, X
} from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE = RAILWAY_API_URL;

// ─── Types ─────────────────────────────────────────────────────────────
interface SupportingData {
  table: string;
  field: string;
  value: string;
  record_id?: string;
  date?: string;
}

interface InvestmentRecommendation {
  rating?: string;
  conviction?: string;
  price_target?: string;
  upside_potential_pct?: number;
  downside_risk_pct?: number;
  risk_reward_ratio?: string;
  entry_zone?: string;
  stop_loss?: string;
  position_size_pct?: string;
}

interface ValuationSummary {
  ev_per_resource?: string;
  p_nav?: string;
  vs_peers?: string;
  fair_value_estimate?: string;
}

interface TradingSignals {
  momentum?: string;
  volume_trend?: string;
  '52w_position'?: string;
}

interface InvestmentOutlook {
  lassonde_stage?: string;
  short_term?: string;
  medium_term?: string;
  long_term?: string;
  key_catalysts?: string[];
  key_risks?: string[];
}

interface AnalystResponse {
  headline: string;
  interpretation: string;
  why_it_matters: string;
  supporting_data: SupportingData[];
  comparable_companies?: Record<string, unknown>[];
  risks_and_flags?: string[];
  confidence: string;
  confidence_reason: string;
  query_type: string;
  investment_recommendation?: InvestmentRecommendation;
  investment_outlook?: InvestmentOutlook;
  valuation_summary?: ValuationSummary;
  trading_signals?: TradingSignals;
  companies_mentioned?: string[];
  data_points?: string[];
}

interface ChatResponse {
  response: AnalystResponse;
  raw_sql_queries?: string[];
  processing_time_ms: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: AnalystResponse;
  processingTime?: number;
  timestamp: Date;
}

interface SnapshotData {
  ticker: string;
  found: boolean;
  company?: {
    ticker: string;
    name: string;
    commodity?: string;
    exchange?: string;
  };
  market_data?: {
    share_price: number | null;
    market_cap: number | null;
    performance: {
      change_1d_pct: number | null;
      change_7d_pct: number | null;
      change_30d_pct: number | null;
      change_ytd_pct: number | null;
    };
    high_52w: number | null;
    low_52w: number | null;
  };
  drilling?: { holes: number; total_meters: number; projects: number };
  intercepts?: { count: number; commodities: string[]; best_grade: number | null; avg_grade: number | null };
  recent_news?: { headline: string; sentiment: string; event_type: string; date: string }[];
  external_news?: { title: string; snippet: string; source: string; date: string; url: string }[];
  recent_asx_announcements?: { title: string; url: string; date: string }[];
  news_sentiment_summary?: {
    total_hits: number;
    hits_7d: number;
    avg_sentiment: number | null;
    positive_count: number;
    negative_count: number;
    material_events: number;
  };
  resource_estimates?: {
    category: string; commodity: string; tonnage: number | null;
    grade: number | null; grade_unit: string; contained_metal: number | null;
    contained_unit: string; project: string;
  }[];
  project_economics?: {
    project: string; npv_usd: number | null; irr_pct: number | null;
    aisc: number | null; aisc_unit: string;
  }[];
  capital_raisings?: {
    type: string; date: string; amount_aud: number | null;
    discount_pct: number | null; dilution_pct: number | null;
  }[];
  orebody_valuation?: {
    in_situ_value_usd: number | null; ev_usd: number | null;
    price_to_isv: number | null; ev_to_isv: number | null;
    implied_discount_pct: number | null;
  };
  projects?: { name: string; stage: string; commodity: string; country: string }[];
  investment_signal?: {
    signal_type: string; signal_strength: string;
    sentiment_score: number | null; confidence: number | null;
    reasoning: string; date: string;
  } | null;
  relevant_commodity_prices?: {
    commodity: string; name: string; price_usd: number; unit: string;
    change_1d: number | null;
  }[];
  peer_companies?: {
    ticker: string; name: string; share_price: number | null;
    market_cap: number | null; exchange: string;
  }[];
}

// ─── Commodity Snapshot Types ──────────────────────────────────────────
interface CommoditySnapshotData {
  commodity: string;
  commodity_code: string;
  commodity_enum: string;
  spot_price?: {
    price_usd: number | null;
    unit: string;
    change_1d_pct: number | null;
    change_7d_pct: number | null;
    high_52w: number | null;
    low_52w: number | null;
    price_date: string | null;
  };
  company_count: number;
  companies: {
    ticker: string; name: string; exchange: string; type: string; country: string;
  }[];
  sector_sentiment?: {
    signal: string;
    trend: string;
    avg_sentiment_7d: number | null;
    avg_sentiment_30d: number | null;
    positive_articles_30d: number;
    negative_articles_30d: number;
    material_events_30d: number;
    total_news_hits: number;
    news_hits_7d: number;
    news_hits_30d: number;
  };
  top_intercepts?: {
    symbol: string; company: string; commodity: string;
    grade: number | null; grade_unit: string;
    width_m: number | null; significant: boolean;
  }[];
  resource_totals?: {
    estimate_count: number; companies_with_resources: number;
    mi_tonnage_mt: number | null; mi_contained: number | null;
    inf_tonnage_mt: number | null; inf_contained: number | null;
    contained_unit: string;
  };
  sector_signals?: {
    invest_count: number; divest_count: number; watch_count: number;
    total_active: number;
    signals: {
      ticker: string; signal_type: string; signal_strength: string;
      headline: string; reasoning: string;
      sentiment_score: number | null; confidence: number | null; date: string | null;
    }[];
  };
  recent_news?: {
    ticker: string; company: string; headline: string;
    event_type: string; significance: string;
    sentiment: string; impact: string; date: string | null;
  }[];
  top_resource_holders?: {
    ticker: string; name: string; contained: number | null;
    unit: string; tonnage_mt: number | null;
  }[];
}

// Commodity search detection
const KNOWN_COMMODITIES: Record<string, string> = {
  GOLD: 'gold', AU: 'gold',
  SILVER: 'silver', AG: 'silver',
  COPPER: 'copper', CU: 'copper',
  LITHIUM: 'lithium', LI: 'lithium',
  NICKEL: 'nickel', NI: 'nickel',
  ZINC: 'zinc', ZN: 'zinc',
  URANIUM: 'uranium', U3O8: 'uranium',
  IRON: 'iron-ore', 'IRON ORE': 'iron-ore', FE: 'iron-ore',
  PLATINUM: 'platinum', PT: 'platinum',
  PALLADIUM: 'palladium', PD: 'palladium',
  COBALT: 'cobalt', CO: 'cobalt',
  MANGANESE: 'manganese', MN: 'manganese',
  COAL: 'coal',
  DIAMONDS: 'diamonds',
  GRAPHITE: 'graphite',
  POTASH: 'potash',
  TIN: 'tin', SN: 'tin',
  LEAD: 'lead', PB: 'lead',
  ALUMINUM: 'aluminum', ALUMINIUM: 'aluminum', AL: 'aluminum',
  TUNGSTEN: 'tungsten', W: 'tungsten',
  MOLYBDENUM: 'molybdenum', MO: 'molybdenum',
  ANTIMONY: 'antimony', SB: 'antimony',
  'RARE EARTHS': 'rare-earths', REE: 'rare-earths',
  VANADIUM: 'vanadium',
  CHROME: 'chrome', CR: 'chrome',
  PHOSPHATE: 'phosphate',
  SILICA: 'silica',
};

// ─── Helpers ───────────────────────────────────────────────────────────
const confidenceColors: Record<string, string> = {
  high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const ratingColors: Record<string, string> = {
  'STRONG BUY': 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40',
  'BUY': 'bg-green-500/30 text-green-300 border-green-500/40',
  'ACCUMULATE': 'bg-teal-500/30 text-teal-300 border-teal-500/40',
  'HOLD': 'bg-amber-500/30 text-amber-300 border-amber-500/40',
  'REDUCE': 'bg-orange-500/30 text-orange-300 border-orange-500/40',
  'SELL': 'bg-red-500/30 text-red-300 border-red-500/40',
  'AVOID': 'bg-red-600/30 text-red-200 border-red-600/40',
};

const signalColors: Record<string, { bg: string; text: string; border: string }> = {
  invest: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  divest: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  watch: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
};

function fmtNum(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(decimals)}`;
}

function PctBadge({ val, classes = '' }: { val: number | null | undefined; classes?: string }) {
  if (val == null) return <span className="text-metallic-500">—</span>;
  const positive = val >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-medium ${positive ? 'text-emerald-400' : 'text-red-400'} ${classes}`}>
      {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(val).toFixed(1)}%
    </span>
  );
}

// ─── Quick-action analysis templates ───────────────────────────────────
const analysisTemplates = [
  { label: 'Full Analysis', icon: Target, prompt: (t: string) => `Provide a comprehensive investment analysis of ${t} including valuation, risks, and recommendation.` },
  { label: 'Sentiment', icon: Activity, prompt: (t: string) => `What is the current market sentiment for ${t}? Analyze recent news, social media mentions, and announcement flow.` },
  { label: 'Investability', icon: DollarSign, prompt: (t: string) => `Is ${t} a good investment right now? Provide a clear BUY/HOLD/SELL recommendation with price target and risk assessment.` },
  { label: 'Announcements', icon: Newspaper, prompt: (t: string) => `Summarize the latest announcements and news for ${t}. What are the key takeaways for investors?` },
  { label: 'Lassonde Curve', icon: BarChart3, prompt: (t: string) => `Where is ${t} on the Lassonde Curve? What stage of development are they in and what does this mean for investors?` },
  { label: 'Risks', icon: AlertTriangle, prompt: (t: string) => `What are the key risks for ${t}? Include dilution risk, operational risks, commodity exposure, and jurisdiction risk.` },
  { label: 'Drill Results', icon: Hammer, prompt: (t: string) => `Analyze the drilling results for ${t}. What are the best intercepts and what do they indicate about the orebody?` },
  { label: 'Peer Compare', icon: Layers, prompt: (t: string) => `Compare ${t} with its closest peers on valuation metrics, resource size, and market cap.` },
];

const suggestedQuestions = [
  { text: "What are the top 5 gold explorers with the best drill results this month?", icon: Star, category: 'Discovery' },
  { text: "Which companies have the strongest buy signals right now?", icon: TrendingUp, category: 'Signals' },
  { text: "Compare BHP and RIO on valuation and risk metrics", icon: Layers, category: 'Comparison' },
  { text: "What's happening in the lithium sector? Any new discoveries?", icon: Zap, category: 'Sector' },
  { text: "Analyze NST - is it undervalued compared to peers?", icon: DollarSign, category: 'Valuation' },
  { text: "What are the most significant drilling intersections this week?", icon: Hammer, category: 'Exploration' },
  { text: "Best gold companies to invest in for long-term growth?", icon: Star, category: 'Commodity' },
  { text: "Which copper stocks should I buy based on recent sentiment?", icon: Activity, category: 'Sentiment' },
  { text: "Uranium sector outlook — which companies benefit from the nuclear renaissance?", icon: Zap, category: 'Sector' },
];

const commodityAnalysisTemplates = [
  { label: 'Sector Outlook', icon: TrendingUp, prompt: (c: string) => `What is the current outlook for the ${c} sector? Include price trends, supply/demand dynamics, and top picks for investors.` },
  { label: 'Top Picks', icon: Star, prompt: (c: string) => `Which ${c} companies are the best investment opportunities right now? Rank by short-term, medium-term, and long-term potential.` },
  { label: 'Sentiment', icon: Activity, prompt: (c: string) => `What is the current market sentiment across ${c} companies? Which have the most bullish news flow and strongest buy signals?` },
  { label: 'New Discoveries', icon: Hammer, prompt: (c: string) => `What are the most significant recent ${c} drill results and discoveries? Which companies are making new finds?` },
  { label: 'Invest Now', icon: DollarSign, prompt: (c: string) => `Should I invest in ${c} right now? Give me your top 3 picks with clear buy/hold recommendations and price targets.` },
  { label: 'Risks', icon: AlertTriangle, prompt: (c: string) => `What are the key risks facing ${c} investors? Include commodity price risk, oversupply, and company-specific risks.` },
  { label: 'Resource Leaders', icon: Database, prompt: (c: string) => `Which companies have the largest ${c} resources? Compare them on EV/oz or EV/lb, grade, and development stage.` },
  { label: 'Short vs Long', icon: BarChart3, prompt: (c: string) => `Compare short-term trading opportunities vs long-term investment plays in the ${c} sector. Which companies for each?` },
];

// ─── Component ─────────────────────────────────────────────────────────
export default function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ticker search & snapshot
  const [tickerSearch, setTickerSearch] = useState('');
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'overview' | 'news' | 'resources'>('chat');

  // Commodity snapshot
  const [commoditySnapshot, setCommoditySnapshot] = useState<CommoditySnapshotData | null>(null);
  const [commodityLoading, setCommodityLoading] = useState(false);
  const [commodityError, setCommodityError] = useState<string | null>(null);
  const [commodityTab, setCommodityTab] = useState<'chat' | 'overview' | 'signals' | 'intercepts'>('overview');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Snapshot ─────────────────────────────────────────────────────────
  const fetchSnapshot = useCallback(async (ticker: string) => {
    if (!ticker.trim()) return;
    const t = ticker.trim().toUpperCase();
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ai-analyst/snapshot/${t}`);
      if (!res.ok) {
        if (res.status === 404) { setSnapshotError(`Ticker "${t}" not found`); setSnapshot(null); return; }
        throw new Error(`API ${res.status}`);
      }
      const data: SnapshotData = await res.json();
      setSnapshot(data);
      setCommoditySnapshot(null);
      setActiveTab('overview');
    } catch {
      setSnapshotError('Failed to load company data.');
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  const fetchCommoditySnapshot = useCallback(async (code: string) => {
    setCommodityLoading(true);
    setCommodityError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ai-analyst/snapshot/commodity/${code}`);
      if (!res.ok) {
        if (res.status === 404) { setCommodityError(`Commodity "${code}" not found`); setCommoditySnapshot(null); return; }
        throw new Error(`API ${res.status}`);
      }
      const data: CommoditySnapshotData = await res.json();
      setCommoditySnapshot(data);
      setSnapshot(null);
      setCommodityTab('overview');
    } catch {
      setCommodityError('Failed to load commodity data.');
    } finally {
      setCommodityLoading(false);
    }
  }, []);

  // ── Chat ─────────────────────────────────────────────────────────────
  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;
    setActiveTab('chat');

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai-analyst/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.role === 'user' ? m.content : m.response?.headline || m.content
          }))
        })
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data: ChatResponse = await res.json();

      const aMsg: Message = {
        id: `a-${Date.now()}`, role: 'assistant', content: data.response.headline,
        response: data.response, processingTime: data.processing_time_ms, timestamp: new Date()
      };
      setMessages(prev => [...prev, aMsg]);
      setExpandedMessages(prev => new Set([...Array.from(prev), aMsg.id]));
    } catch {
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedMessages(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s; });
  };
  const copyToClipboard = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = tickerSearch.trim().toUpperCase();
    if (!q) return;
    // Check if it's a commodity
    const commodityCode = KNOWN_COMMODITIES[q];
    if (commodityCode) {
      fetchCommoditySnapshot(commodityCode);
    } else {
      fetchSnapshot(q);
    }
  };

  const s = snapshot; // shorthand

  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950">
      {/* ═══ Header ═══ */}
      <header className="border-b border-metallic-800 bg-metallic-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/analysis" className="text-metallic-400 hover:text-white transition-colors flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="h-6 w-px bg-metallic-700 flex-shrink-0" />
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white leading-tight">AI Research Analyst</h1>
                <p className="text-xs text-metallic-500 hidden sm:block">66+ data sources · Claude Sonnet 4 · Real-time market data</p>
              </div>
            </div>

            {/* Ticker search */}
            <form onSubmit={handleTickerSubmit} className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-metallic-500" />
                <input
                  type="text"
                  value={tickerSearch}
                  onChange={(e) => setTickerSearch(e.target.value.toUpperCase())}
                  placeholder="Ticker or commodity (BHP, Gold...)"
                  className="w-44 sm:w-56 pl-9 pr-3 py-2 bg-metallic-800/80 border border-metallic-700 rounded-lg text-sm text-white placeholder-metallic-500 focus:outline-none focus:border-emerald-500/50"
                  maxLength={10}
                />
              </div>
              <button type="submit" disabled={!tickerSearch.trim() || snapshotLoading || commodityLoading} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all flex items-center gap-1.5">
                {(snapshotLoading || commodityLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Analyze
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* ═══ Snapshot Dashboard (Ticker) ═══ */}
        {(snapshot || snapshotLoading || snapshotError) && (
          <div className="mb-4">
            {snapshotError && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{snapshotError}</span>
                <button onClick={() => { setSnapshotError(null); setSnapshot(null); }} className="ml-auto text-metallic-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            )}
            {snapshotLoading && (
              <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8 flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <span className="text-metallic-400">Loading company snapshot...</span>
              </div>
            )}

            {s && !snapshotLoading && (
              <>
                {/* Company header */}
                <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4 mb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-white">{s.company?.name || s.ticker}</h2>
                          <span className="px-2 py-0.5 text-xs font-mono rounded bg-metallic-800 text-metallic-300 border border-metallic-700">{s.company?.exchange || 'ASX'}:{s.ticker}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-metallic-400 mt-0.5">
                          {s.company?.commodity && <span>{s.company.commodity}</span>}
                          {s.intercepts?.commodities && s.intercepts.commodities.length > 0 && (
                            <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{s.intercepts.commodities.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price + signal */}
                    {s.market_data && (
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {s.market_data.share_price != null ? `$${s.market_data.share_price.toFixed(3)}` : '—'}
                          </div>
                          <div className="flex items-center gap-3 text-xs mt-0.5">
                            <span className="text-metallic-500">1D:</span><PctBadge val={s.market_data.performance?.change_1d_pct} />
                            <span className="text-metallic-500">7D:</span><PctBadge val={s.market_data.performance?.change_7d_pct} />
                            <span className="text-metallic-500">30D:</span><PctBadge val={s.market_data.performance?.change_30d_pct} />
                            <span className="text-metallic-500">YTD:</span><PctBadge val={s.market_data.performance?.change_ytd_pct} />
                          </div>
                        </div>
                        {s.investment_signal && (
                          <div className={`px-3 py-2 rounded-lg border ${signalColors[s.investment_signal.signal_type]?.bg || ''} ${signalColors[s.investment_signal.signal_type]?.border || ''}`}>
                            <div className={`text-xs font-semibold uppercase ${signalColors[s.investment_signal.signal_type]?.text || ''}`}>
                              {s.investment_signal.signal_type} · {s.investment_signal.signal_strength}
                            </div>
                            <div className="text-xs text-metallic-400 mt-0.5 max-w-[200px] truncate">{s.investment_signal.reasoning}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
                  <KpiCard icon={DollarSign} label="Market Cap" value={fmtNum(s.market_data?.market_cap)} color="text-emerald-400" />
                  <KpiCard icon={TrendingUp} label="52W High" value={s.market_data?.high_52w != null ? `$${s.market_data.high_52w.toFixed(3)}` : '—'} color="text-green-400" />
                  <KpiCard icon={Activity} label="52W Low" value={s.market_data?.low_52w != null ? `$${s.market_data.low_52w.toFixed(3)}` : '—'} color="text-red-400" />
                  <KpiCard icon={Hammer} label="Drill Holes" value={s.drilling?.holes?.toLocaleString() || '0'} color="text-cyan-400" />
                  <KpiCard icon={CircleDot} label="Intercepts" value={s.intercepts?.count?.toLocaleString() || '0'} color="text-purple-400" />
                  <KpiCard icon={Newspaper} label="News (7d)" value={String(s.news_sentiment_summary?.hits_7d || 0)} color="text-amber-400" />
                  <KpiCard icon={Gauge} label="Sentiment" value={s.news_sentiment_summary?.avg_sentiment != null ? s.news_sentiment_summary.avg_sentiment.toFixed(2) : '—'} color="text-blue-400" />
                  <KpiCard icon={Layers} label="Projects" value={String(s.projects?.length || 0)} color="text-pink-400" />
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 mb-3 border-b border-metallic-800 pb-1">
                  {([
                    { id: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
                    { id: 'overview' as const, label: 'Overview', icon: PieChart },
                    { id: 'news' as const, label: 'News & Announcements', icon: Newspaper },
                    { id: 'resources' as const, label: 'Resources & Economics', icon: Database },
                  ]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-metallic-800/60 text-white border border-metallic-700 border-b-0'
                          : 'text-metallic-400 hover:text-metallic-200 hover:bg-metallic-800/30'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Quick analysis buttons */}
                {activeTab === 'chat' && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {analysisTemplates.map(tmpl => (
                      <button key={tmpl.label} onClick={() => handleSend(tmpl.prompt(s.ticker))} disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-metallic-800/50 border border-metallic-700/50 text-metallic-300 hover:text-white hover:border-emerald-500/30 disabled:opacity-50 transition-colors">
                        <tmpl.icon className="w-3.5 h-3.5" />{tmpl.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab content */}
                {activeTab === 'overview' && <OverviewTab snapshot={s} />}
                {activeTab === 'news' && <NewsTab snapshot={s} />}
                {activeTab === 'resources' && <ResourcesTab snapshot={s} />}
              </>
            )}
          </div>
        )}

        {/* ═══ Commodity Dashboard ═══ */}
        {(commoditySnapshot || commodityLoading || commodityError) && !snapshot && (
          <div className="mb-4">
            {commodityError && (
              <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{commodityError}</span>
                <button onClick={() => { setCommodityError(null); setCommoditySnapshot(null); }} className="ml-auto text-metallic-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            )}
            {commodityLoading && (
              <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8 flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-metallic-400">Loading commodity intelligence...</span>
              </div>
            )}

            {commoditySnapshot && !commodityLoading && (() => { const cs = commoditySnapshot; return (
              <>
                {/* Commodity header */}
                <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4 mb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-white">{cs.commodity}</h2>
                          <span className="px-2 py-0.5 text-xs font-mono rounded bg-metallic-800 text-metallic-300 border border-metallic-700">{cs.commodity_code}</span>
                          <span className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{cs.company_count} companies</span>
                        </div>
                        {cs.sector_sentiment && (
                          <div className="flex items-center gap-3 text-xs mt-0.5">
                            <span className={`font-semibold ${cs.sector_sentiment.signal === 'BULLISH' ? 'text-emerald-400' : cs.sector_sentiment.signal === 'BEARISH' ? 'text-red-400' : 'text-amber-400'}`}>
                              Sector: {cs.sector_sentiment.signal}
                            </span>
                            <span className={`${cs.sector_sentiment.trend === 'improving' ? 'text-emerald-400' : cs.sector_sentiment.trend === 'deteriorating' ? 'text-red-400' : 'text-metallic-400'}`}>
                              Trend: {cs.sector_sentiment.trend}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {cs.spot_price && cs.spot_price.price_usd != null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${cs.spot_price.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-sm text-metallic-400 ml-1">/{cs.spot_price.unit}</span></div>
                        <div className="flex items-center gap-3 text-xs mt-0.5">
                          <span className="text-metallic-500">1D:</span><PctBadge val={cs.spot_price.change_1d_pct} />
                          <span className="text-metallic-500">7D:</span><PctBadge val={cs.spot_price.change_7d_pct} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
                  <KpiCard icon={Building2} label="Companies" value={String(cs.company_count)} color="text-emerald-400" />
                  <KpiCard icon={DollarSign} label="Spot Price" value={cs.spot_price?.price_usd != null ? `$${cs.spot_price.price_usd.toLocaleString()}` : '—'} color="text-amber-400" />
                  <KpiCard icon={Activity} label="Sentiment (7d)" value={cs.sector_sentiment?.avg_sentiment_7d != null ? cs.sector_sentiment.avg_sentiment_7d.toFixed(2) : '—'} color="text-blue-400" />
                  <KpiCard icon={Newspaper} label="News (7d)" value={String(cs.sector_sentiment?.news_hits_7d || 0)} color="text-cyan-400" />
                  <KpiCard icon={TrendingUp} label="Invest Signals" value={String(cs.sector_signals?.invest_count || 0)} color="text-green-400" />
                  <KpiCard icon={AlertTriangle} label="Divest Signals" value={String(cs.sector_signals?.divest_count || 0)} color="text-red-400" />
                  <KpiCard icon={CircleDot} label="Top Intercepts" value={String(cs.top_intercepts?.length || 0)} color="text-purple-400" />
                  <KpiCard icon={Database} label="Resource Cos" value={String(cs.resource_totals?.companies_with_resources || 0)} color="text-pink-400" />
                </div>

                {/* Tab bar */}
                <div className="flex items-center gap-1 mb-3 border-b border-metallic-800 pb-1">
                  {([
                    { id: 'chat' as const, label: 'AI Chat', icon: MessageSquare },
                    { id: 'overview' as const, label: 'Sector Overview', icon: PieChart },
                    { id: 'signals' as const, label: 'Signals & News', icon: Activity },
                    { id: 'intercepts' as const, label: 'Discoveries & Resources', icon: Hammer },
                  ]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCommodityTab(tab.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-t-lg transition-colors ${
                        commodityTab === tab.id
                          ? 'bg-metallic-800/60 text-white border border-metallic-700 border-b-0'
                          : 'text-metallic-400 hover:text-metallic-200 hover:bg-metallic-800/30'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Quick analysis buttons for commodity */}
                {commodityTab === 'chat' && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commodityAnalysisTemplates.map(tmpl => (
                      <button key={tmpl.label} onClick={() => handleSend(tmpl.prompt(cs.commodity))} disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-metallic-800/50 border border-metallic-700/50 text-metallic-300 hover:text-white hover:border-amber-500/30 disabled:opacity-50 transition-colors">
                        <tmpl.icon className="w-3.5 h-3.5" />{tmpl.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tab content */}
                {commodityTab === 'overview' && <CommodityOverviewTab data={cs} />}
                {commodityTab === 'signals' && <CommoditySignalsTab data={cs} />}
                {commodityTab === 'intercepts' && <CommodityInterceptsTab data={cs} />}
              </>
            ); })()}
          </div>
        )}

        {/* ═══ Main Chat ═══ */}
        {((commoditySnapshot ? commodityTab === 'chat' : activeTab === 'chat') || (!snapshot && !commoditySnapshot)) && (
          <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl flex flex-col" style={{ height: (snapshot || commoditySnapshot) ? 'calc(100vh - 520px)' : 'calc(100vh - 160px)', minHeight: '400px' }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <EmptyState onSend={handleSend} />
              ) : (
                <>
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] rounded-xl ${msg.role === 'user' ? 'bg-emerald-600 text-white px-4 py-3' : 'bg-metallic-800/50 border border-metallic-700/50 p-4'}`}>
                        {msg.role === 'user' ? (
                          <p>{msg.content}</p>
                        ) : msg.response ? (
                          <AssistantMessage message={msg} expanded={expandedMessages.has(msg.id)} onToggle={() => toggleExpand(msg.id)} onCopy={copyToClipboard} copiedId={copiedId} />
                        ) : (
                          <p className="text-metallic-200">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-metallic-800/50 border border-metallic-700/50 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-metallic-400">
                          <Loader2 className="w-4 h-4 animate-spin" />Analyzing with AI (66+ data sources)...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-metallic-700/50 p-3">
              <div className="flex items-end gap-2">
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyPress}
                  placeholder={commoditySnapshot ? `Ask about ${commoditySnapshot.commodity}...` : snapshot ? `Ask about ${snapshot.ticker}...` : 'Ask about any mining company, commodity, or market trend...'}
                  className="flex-1 px-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-xl text-white placeholder-metallic-500 focus:outline-none focus:border-emerald-500/50 resize-none text-sm"
                  rows={2} disabled={isLoading} />
                <button onClick={() => handleSend()} disabled={!input.trim() || isLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-metallic-600">Enter to send · Shift+Enter for new line</span>
                <span className="text-xs text-emerald-500/70 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Claude Sonnet 4</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════════

function KpiCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-metallic-900/50 border border-metallic-800 rounded-lg p-2.5 text-center">
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <div className="text-sm font-bold text-white truncate">{value}</div>
      <div className="text-[10px] text-metallic-500 truncate">{label}</div>
    </div>
  );
}

function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-emerald-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">AI Mining Research Analyst</h2>
      <p className="text-metallic-400 max-w-xl mb-6 text-sm">
        Enter a ticker above for instant company data, or ask any question about mining companies,
        market sentiment, announcements, drill results, valuations, and investment opportunities.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl">
        {suggestedQuestions.map((q, idx) => (
          <button key={idx} onClick={() => onSend(q.text)}
            className="flex items-start gap-3 p-3 text-left rounded-lg bg-metallic-800/50 border border-metallic-700/50 hover:border-emerald-500/30 hover:bg-metallic-800 transition-colors group">
            <q.icon className="w-4 h-4 text-metallic-500 group-hover:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-metallic-600 block uppercase tracking-wider">{q.category}</span>
              <span className="text-xs text-metallic-300 group-hover:text-white">{q.text}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[10px] text-metallic-600">
        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> 66+ Data Sources</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> 6 Exchanges</span>
        <span>·</span>
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> JORC/NI 43-101/SEC</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Real-time Prices</span>
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────
function OverviewTab({ snapshot: s }: { snapshot: SnapshotData }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
      {s.market_data && (
        <DataCard title="Market Position" icon={TrendingUp} color="text-emerald-400">
          <Row label="Price" value={`$${s.market_data.share_price?.toFixed(3) || '—'}`} />
          <Row label="Market Cap" value={fmtNum(s.market_data.market_cap)} />
          <Row label="52W Range" value={`$${s.market_data.low_52w?.toFixed(3) || '?'} — $${s.market_data.high_52w?.toFixed(3) || '?'}`} />
        </DataCard>
      )}

      {s.news_sentiment_summary && (
        <DataCard title="News Sentiment" icon={Activity} color="text-blue-400">
          <Row label="Avg Score" value={s.news_sentiment_summary.avg_sentiment?.toFixed(3) || '—'}
            valueClass={(s.news_sentiment_summary.avg_sentiment || 0) > 0 ? 'text-emerald-400' : (s.news_sentiment_summary.avg_sentiment || 0) < 0 ? 'text-red-400' : undefined} />
          <Row label="Positive / Negative" value={`${s.news_sentiment_summary.positive_count} / ${s.news_sentiment_summary.negative_count}`} />
          <Row label="Material Events" value={String(s.news_sentiment_summary.material_events)} valueClass="text-amber-400" />
          <Row label="Total Coverage" value={`${s.news_sentiment_summary.total_hits} articles`} />
        </DataCard>
      )}

      {s.orebody_valuation && (
        <DataCard title="Orebody Valuation" icon={PieChart} color="text-purple-400">
          <Row label="In-Situ Value" value={fmtNum(s.orebody_valuation.in_situ_value_usd)} />
          <Row label="Enterprise Value" value={fmtNum(s.orebody_valuation.ev_usd)} />
          <Row label="Price/ISV" value={`${s.orebody_valuation.price_to_isv?.toFixed(2) || '—'}x`} />
          <Row label="Implied Discount" value={`${s.orebody_valuation.implied_discount_pct?.toFixed(0) || '—'}%`} valueClass="text-emerald-400" />
        </DataCard>
      )}

      {s.relevant_commodity_prices && s.relevant_commodity_prices.length > 0 && (
        <DataCard title="Commodity Prices" icon={DollarSign} color="text-amber-400">
          {s.relevant_commodity_prices.map((cp, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-metallic-400">{cp.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">${cp.price_usd.toFixed(2)}/{cp.unit}</span>
                <PctBadge val={cp.change_1d} classes="text-xs" />
              </div>
            </div>
          ))}
        </DataCard>
      )}

      {s.capital_raisings && s.capital_raisings.length > 0 && (
        <DataCard title="Capital Raisings" icon={DollarSign} color="text-pink-400">
          {s.capital_raisings.slice(0, 3).map((cr, i) => (
            <div key={i} className="text-sm border-b border-metallic-800/50 pb-1.5 last:border-0">
              <div className="flex justify-between"><span className="text-metallic-300">{cr.type || 'Placement'}</span><span className="text-white font-medium">{fmtNum(cr.amount_aud)}</span></div>
              <div className="flex gap-3 text-xs text-metallic-500 mt-0.5">
                {cr.date && <span>{new Date(cr.date).toLocaleDateString()}</span>}
                {cr.discount_pct != null && <span>Disc: {cr.discount_pct.toFixed(0)}%</span>}
                {cr.dilution_pct != null && <span>Dilution: {cr.dilution_pct.toFixed(1)}%</span>}
              </div>
            </div>
          ))}
        </DataCard>
      )}

      {s.peer_companies && s.peer_companies.length > 0 && (
        <DataCard title="Peer Companies" icon={Layers} color="text-cyan-400">
          {s.peer_companies.slice(0, 5).map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-metallic-300 font-mono text-xs">{p.ticker}</span>
              <span className="text-metallic-400 text-xs truncate max-w-[120px]">{p.name}</span>
              <span className="text-metallic-200">{p.share_price != null ? `$${p.share_price.toFixed(3)}` : '—'}</span>
            </div>
          ))}
        </DataCard>
      )}

      {s.projects && s.projects.length > 0 && (
        <DataCard title="Projects" icon={Globe} color="text-teal-400" className="col-span-full xl:col-span-1">
          {s.projects.slice(0, 6).map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-metallic-200 truncate max-w-[160px]">{p.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-metallic-500">{p.commodity}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-metallic-800 text-metallic-400 border border-metallic-700">{p.stage}</span>
              </div>
            </div>
          ))}
        </DataCard>
      )}
    </div>
  );
}

// ─── News Tab ──────────────────────────────────────────────────────────
function NewsTab({ snapshot: s }: { snapshot: SnapshotData }) {
  const allNews = [
    ...(s.recent_news || []).map(n => ({ title: n.headline, date: n.date, sentiment: n.sentiment, source: 'Database', url: '' })),
    ...(s.external_news || []).map(n => ({ title: n.title, date: n.date, sentiment: '', source: n.source, url: n.url })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const announcements = s.recent_asx_announcements || [];

  return (
    <div className="grid md:grid-cols-2 gap-3 mb-3">
      <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Newspaper className="w-3.5 h-3.5" /> Recent News ({allNews.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {allNews.length === 0 && <p className="text-sm text-metallic-500">No recent news found.</p>}
          {allNews.map((n, i) => (
            <div key={i} className="border-b border-metallic-800/50 pb-2 last:border-0">
              {n.url ? (
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm text-metallic-200 hover:text-emerald-400 transition-colors flex items-start gap-1">
                  {n.title} <ExternalLink className="w-3 h-3 flex-shrink-0 mt-1" />
                </a>
              ) : (
                <p className="text-sm text-metallic-200">{n.title}</p>
              )}
              <div className="flex gap-2 text-xs text-metallic-500 mt-0.5">
                {n.date && <span>{new Date(n.date).toLocaleDateString()}</span>}
                {n.source && <span>{n.source}</span>}
                {n.sentiment && (
                  <span className={`font-medium ${n.sentiment.includes('positive') ? 'text-emerald-400' : n.sentiment.includes('negative') ? 'text-red-400' : 'text-metallic-400'}`}>{n.sentiment}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Exchange Announcements ({announcements.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {announcements.length === 0 && <p className="text-sm text-metallic-500">No recent announcements found.</p>}
          {announcements.map((a, i) => (
            <div key={i} className="border-b border-metallic-800/50 pb-2 last:border-0">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-metallic-200 hover:text-emerald-400 transition-colors flex items-start gap-1">
                {a.title} <ExternalLink className="w-3 h-3 flex-shrink-0 mt-1" />
              </a>
              <span className="text-xs text-metallic-500">{a.date ? new Date(a.date).toLocaleDateString() : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Resources Tab ─────────────────────────────────────────────────────
function ResourcesTab({ snapshot: s }: { snapshot: SnapshotData }) {
  const resources = s.resource_estimates || [];
  const economics = s.project_economics || [];

  return (
    <div className="space-y-3 mb-3">
      {resources.length > 0 && (
        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> Resource Estimates ({resources.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-metallic-400 border-b border-metallic-700/50 text-xs">
                  <th className="text-left py-2 pr-3">Project</th>
                  <th className="text-left py-2 pr-3">Category</th>
                  <th className="text-left py-2 pr-3">Commodity</th>
                  <th className="text-right py-2 pr-3">Tonnage</th>
                  <th className="text-right py-2 pr-3">Grade</th>
                  <th className="text-right py-2 pr-3">Contained</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r, i) => (
                  <tr key={i} className="text-metallic-200 border-b border-metallic-800/30">
                    <td className="py-1.5 pr-3 truncate max-w-[150px]">{r.project}</td>
                    <td className="py-1.5 pr-3 text-xs">{r.category}</td>
                    <td className="py-1.5 pr-3 text-xs">{r.commodity}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{r.tonnage != null ? `${(r.tonnage / 1e6).toFixed(1)} Mt` : '—'}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{r.grade != null ? `${r.grade.toFixed(2)} ${r.grade_unit || ''}` : '—'}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{r.contained_metal != null ? `${r.contained_metal.toLocaleString()} ${r.contained_unit || ''}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {economics.length > 0 && (
        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Project Economics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-metallic-400 border-b border-metallic-700/50 text-xs">
                  <th className="text-left py-2 pr-3">Project</th>
                  <th className="text-right py-2 pr-3">NPV</th>
                  <th className="text-right py-2 pr-3">IRR</th>
                  <th className="text-right py-2 pr-3">AISC</th>
                </tr>
              </thead>
              <tbody>
                {economics.map((ec, i) => (
                  <tr key={i} className="text-metallic-200 border-b border-metallic-800/30">
                    <td className="py-1.5 pr-3 truncate max-w-[160px]">{ec.project}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{ec.npv_usd != null ? fmtNum(ec.npv_usd) : '—'}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{ec.irr_pct != null ? `${ec.irr_pct.toFixed(0)}%` : '—'}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{ec.aisc != null ? `$${ec.aisc.toFixed(0)}/${ec.aisc_unit || 'oz'}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resources.length === 0 && economics.length === 0 && (
        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8 text-center">
          <Database className="w-8 h-8 text-metallic-600 mx-auto mb-2" />
          <p className="text-sm text-metallic-500">No resource estimates or economics data available for {s.ticker}.</p>
        </div>
      )}
    </div>
  );
}

// ─── Commodity Overview Tab ─────────────────────────────────────────────
function CommodityOverviewTab({ data: cs }: { data: CommoditySnapshotData }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
      {cs.spot_price && (
        <DataCard title="Spot Price" icon={DollarSign} color="text-amber-400">
          <Row label="Price (USD)" value={cs.spot_price.price_usd != null ? `$${cs.spot_price.price_usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}/${cs.spot_price.unit}` : '—'} />
          <Row label="1-Day Change" value={cs.spot_price.change_1d_pct != null ? `${cs.spot_price.change_1d_pct >= 0 ? '+' : ''}${cs.spot_price.change_1d_pct.toFixed(2)}%` : '—'}
            valueClass={(cs.spot_price.change_1d_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Row label="7-Day Change" value={cs.spot_price.change_7d_pct != null ? `${cs.spot_price.change_7d_pct >= 0 ? '+' : ''}${cs.spot_price.change_7d_pct.toFixed(2)}%` : '—'}
            valueClass={(cs.spot_price.change_7d_pct || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <Row label="52W High" value={cs.spot_price.high_52w != null ? `$${cs.spot_price.high_52w.toLocaleString()}` : '—'} />
          <Row label="52W Low" value={cs.spot_price.low_52w != null ? `$${cs.spot_price.low_52w.toLocaleString()}` : '—'} />
        </DataCard>
      )}

      {cs.sector_sentiment && (
        <DataCard title="Sector Sentiment" icon={Activity} color="text-blue-400">
          <Row label="Signal" value={cs.sector_sentiment.signal}
            valueClass={cs.sector_sentiment.signal === 'BULLISH' ? 'text-emerald-400' : cs.sector_sentiment.signal === 'BEARISH' ? 'text-red-400' : 'text-amber-400'} />
          <Row label="Trend" value={cs.sector_sentiment.trend}
            valueClass={cs.sector_sentiment.trend === 'improving' ? 'text-emerald-400' : cs.sector_sentiment.trend === 'deteriorating' ? 'text-red-400' : undefined} />
          <Row label="Avg Sentiment (7d)" value={cs.sector_sentiment.avg_sentiment_7d?.toFixed(3) || '—'}
            valueClass={(cs.sector_sentiment.avg_sentiment_7d || 0) > 0 ? 'text-emerald-400' : (cs.sector_sentiment.avg_sentiment_7d || 0) < 0 ? 'text-red-400' : undefined} />
          <Row label="Positive / Negative" value={`${cs.sector_sentiment.positive_articles_30d} / ${cs.sector_sentiment.negative_articles_30d}`} />
          <Row label="Material Events" value={String(cs.sector_sentiment.material_events_30d)} valueClass="text-amber-400" />
          <Row label="Total Coverage (30d)" value={`${cs.sector_sentiment.news_hits_30d} articles`} />
        </DataCard>
      )}

      {cs.resource_totals && (
        <DataCard title="Sector Resources" icon={Database} color="text-purple-400">
          <Row label="Companies w/ Resources" value={String(cs.resource_totals.companies_with_resources)} />
          <Row label="M+I Tonnage" value={cs.resource_totals.mi_tonnage_mt != null ? `${cs.resource_totals.mi_tonnage_mt.toFixed(1)} Mt` : '—'} />
          <Row label="M+I Contained" value={cs.resource_totals.mi_contained != null ? `${cs.resource_totals.mi_contained.toLocaleString()} ${cs.resource_totals.contained_unit}` : '—'} />
          <Row label="Inferred Tonnage" value={cs.resource_totals.inf_tonnage_mt != null ? `${cs.resource_totals.inf_tonnage_mt.toFixed(1)} Mt` : '—'} />
          <Row label="Inferred Contained" value={cs.resource_totals.inf_contained != null ? `${cs.resource_totals.inf_contained.toLocaleString()} ${cs.resource_totals.contained_unit}` : '—'} />
        </DataCard>
      )}

      {cs.top_resource_holders && cs.top_resource_holders.length > 0 && (
        <DataCard title="Top Resource Holders" icon={Star} color="text-pink-400" className="col-span-full xl:col-span-1">
          {cs.top_resource_holders.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-metallic-500 text-xs font-mono w-4">{i + 1}.</span>
                <span className="font-mono text-xs text-metallic-300">{h.ticker}</span>
                <span className="text-metallic-400 truncate max-w-[120px] text-xs">{h.name}</span>
              </div>
              <span className="text-white font-medium text-xs">{h.contained != null ? `${h.contained.toLocaleString()} ${h.unit}` : '—'}</span>
            </div>
          ))}
        </DataCard>
      )}

      {cs.companies && cs.companies.length > 0 && (
        <DataCard title={`Companies (${cs.companies.length})`} icon={Building2} color="text-cyan-400" className="col-span-full xl:col-span-2">
          <div className="max-h-60 overflow-y-auto space-y-1">
            {cs.companies.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-400">{c.ticker}</span>
                  <span className="text-metallic-200 truncate max-w-[200px]">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-metallic-500">{c.exchange}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-metallic-800 text-metallic-400 border border-metallic-700">{c.type}</span>
                </div>
              </div>
            ))}
          </div>
        </DataCard>
      )}
    </div>
  );
}

// ─── Commodity Signals & News Tab ──────────────────────────────────────
function CommoditySignalsTab({ data: cs }: { data: CommoditySnapshotData }) {
  const signals = cs.sector_signals?.signals || [];
  const news = cs.recent_news || [];

  return (
    <div className="grid md:grid-cols-2 gap-3 mb-3">
      <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Investment Signals ({signals.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {signals.length === 0 && <p className="text-sm text-metallic-500">No active signals.</p>}
          {signals.map((sig, i) => {
            const sc = signalColors[sig.signal_type] || signalColors.watch;
            return (
              <div key={i} className={`${sc.bg} border ${sc.border} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-amber-400">{sig.ticker}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase ${sc.text}`}>{sig.signal_type}</span>
                    <span className="text-[10px] text-metallic-400">{sig.signal_strength}</span>
                  </div>
                </div>
                <p className="text-sm text-metallic-200">{sig.headline}</p>
                {sig.reasoning && <p className="text-xs text-metallic-400 mt-1">{sig.reasoning}</p>}
                <div className="flex gap-3 text-xs text-metallic-500 mt-1">
                  {sig.sentiment_score != null && (
                    <span className={sig.sentiment_score > 0 ? 'text-emerald-400' : sig.sentiment_score < 0 ? 'text-red-400' : ''}>
                      Sentiment: {sig.sentiment_score.toFixed(2)}
                    </span>
                  )}
                  {sig.date && <span>{new Date(sig.date).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Newspaper className="w-3.5 h-3.5" /> Recent Sector News ({news.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {news.length === 0 && <p className="text-sm text-metallic-500">No recent news.</p>}
          {news.map((n, i) => (
            <div key={i} className="border-b border-metallic-800/50 pb-2 last:border-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-xs text-amber-400">{n.ticker}</span>
                <span className="text-xs text-metallic-500 truncate">{n.company}</span>
              </div>
              <p className="text-sm text-metallic-200">{n.headline}</p>
              <div className="flex flex-wrap gap-2 text-xs text-metallic-500 mt-0.5">
                {n.date && <span>{new Date(n.date).toLocaleDateString()}</span>}
                {n.event_type && <span className="capitalize">{n.event_type}</span>}
                {n.significance && <span className={n.significance === 'high' ? 'text-amber-400 font-medium' : ''}>{n.significance}</span>}
                {n.sentiment && (
                  <span className={`font-medium ${n.sentiment.includes('positive') || n.sentiment.includes('bullish') ? 'text-emerald-400' : n.sentiment.includes('negative') || n.sentiment.includes('bearish') ? 'text-red-400' : 'text-metallic-400'}`}>{n.sentiment}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Commodity Intercepts & Resources Tab ──────────────────────────────
function CommodityInterceptsTab({ data: cs }: { data: CommoditySnapshotData }) {
  const intercepts = cs.top_intercepts || [];

  return (
    <div className="space-y-3 mb-3">
      {intercepts.length > 0 && (
        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-4 overflow-hidden">
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Hammer className="w-3.5 h-3.5" /> Top Intercepts ({intercepts.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-metallic-400 border-b border-metallic-700/50 text-xs">
                  <th className="text-left py-2 pr-3">Company</th>
                  <th className="text-left py-2 pr-3">Commodity</th>
                  <th className="text-right py-2 pr-3">Grade</th>
                  <th className="text-right py-2 pr-3">Width (m)</th>
                  <th className="text-center py-2">Significant</th>
                </tr>
              </thead>
              <tbody>
                {intercepts.map((ic, i) => (
                  <tr key={i} className={`text-metallic-200 border-b border-metallic-800/30 ${ic.significant ? 'bg-amber-500/5' : ''}`}>
                    <td className="py-1.5 pr-3 truncate max-w-[160px]">
                      <span className="font-mono text-xs text-amber-400 mr-2">{ic.symbol}</span>
                      <span className="text-metallic-300">{ic.company}</span>
                    </td>
                    <td className="py-1.5 pr-3 text-xs">{ic.commodity}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{ic.grade != null ? `${ic.grade.toFixed(2)} ${ic.grade_unit}` : '—'}</td>
                    <td className="py-1.5 pr-3 text-right font-mono text-xs">{ic.width_m != null ? ic.width_m.toFixed(1) : '—'}</td>
                    <td className="py-1.5 text-center">
                      {ic.significant && <Star className="w-3.5 h-3.5 text-amber-400 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {intercepts.length === 0 && (
        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8 text-center">
          <Hammer className="w-8 h-8 text-metallic-600 mx-auto mb-2" />
          <p className="text-sm text-metallic-500">No drill intercepts found for {cs.commodity}.</p>
        </div>
      )}
    </div>
  );
}

// ─── Shared: DataCard / Row ────────────────────────────────────────────
function DataCard({ title, icon: Icon, color, children, className = '' }: {
  title: string; icon: React.ElementType; color: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-metallic-900/50 border border-metallic-800 rounded-xl p-4 ${className}`}>
      <h3 className={`text-xs font-semibold ${color} uppercase tracking-wider mb-3 flex items-center gap-1.5`}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-metallic-400">{label}</span>
      <span className={`font-medium ${valueClass || 'text-white'}`}>{value}</span>
    </div>
  );
}

// ─── Assistant Message ─────────────────────────────────────────────────
function AssistantMessage({ message, expanded, onToggle, onCopy, copiedId }: {
  message: Message; expanded: boolean; onToggle: () => void;
  onCopy: (text: string, id: string) => void; copiedId: string | null;
}) {
  const r = message.response!;
  const rec = r.investment_recommendation;
  const val = r.valuation_summary;
  const ts = r.trading_signals;
  const outlook = r.investment_outlook;

  return (
    <div className="space-y-3">
      {/* Headline + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-white">{r.headline}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {message.processingTime && (
              <span className="text-[10px] text-metallic-600 flex items-center gap-1"><Clock className="w-3 h-3" />{message.processingTime}ms</span>
            )}
            <span className={`px-2 py-0.5 text-[10px] rounded border ${confidenceColors[r.confidence] || ''}`}>{r.confidence} confidence</span>
            {rec?.rating && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${ratingColors[rec.rating] || 'bg-metallic-700/30 text-metallic-300 border-metallic-600/30'}`}>{rec.rating}</span>
            )}
            {rec?.conviction && (
              <span className="px-2 py-0.5 text-[10px] rounded bg-metallic-700/30 text-metallic-300 border border-metallic-600/30">{rec.conviction} conviction</span>
            )}
          </div>
        </div>
        <button onClick={onToggle} className="p-1 hover:bg-metallic-700 rounded transition-colors flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-metallic-400" /> : <ChevronDown className="w-4 h-4 text-metallic-400" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-3 border-t border-metallic-700/50">
          {/* Investment Recommendation */}
          {rec && (rec.price_target || rec.entry_zone) && (
            <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-lg p-4 border border-emerald-800/30">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Investment Recommendation
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {rec.price_target && <MiniStat label="Price Target" value={rec.price_target} />}
                {rec.entry_zone && <MiniStat label="Entry Zone" value={rec.entry_zone} />}
                {rec.stop_loss && <MiniStat label="Stop Loss" value={rec.stop_loss} valueClass="text-red-400" />}
                {rec.risk_reward_ratio && <MiniStat label="Risk/Reward" value={rec.risk_reward_ratio} />}
                {rec.upside_potential_pct != null && <MiniStat label="Upside" value={`+${rec.upside_potential_pct}%`} valueClass="text-emerald-400" />}
                {rec.downside_risk_pct != null && <MiniStat label="Downside" value={`-${rec.downside_risk_pct}%`} valueClass="text-red-400" />}
                {rec.position_size_pct && <MiniStat label="Position Size" value={rec.position_size_pct} />}
              </div>
            </div>
          )}

          {/* Valuation + Trading Signals */}
          {(val || ts) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {val && Object.values(val).some(v => v) && (
                <div className="bg-metallic-900/60 rounded-lg p-3 border border-metallic-700/30">
                  <h4 className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2">Valuation</h4>
                  <div className="space-y-1 text-xs">
                    {val.ev_per_resource && <div className="flex justify-between"><span className="text-metallic-500">EV / Resource</span><span className="text-metallic-200">{val.ev_per_resource}</span></div>}
                    {val.p_nav && <div className="flex justify-between"><span className="text-metallic-500">P/NAV</span><span className="text-metallic-200">{val.p_nav}</span></div>}
                    {val.vs_peers && <div className="flex justify-between"><span className="text-metallic-500">vs Peers</span><span className="text-metallic-200">{val.vs_peers}</span></div>}
                    {val.fair_value_estimate && <div className="flex justify-between"><span className="text-metallic-500">Fair Value</span><span className="text-white font-medium">{val.fair_value_estimate}</span></div>}
                  </div>
                </div>
              )}
              {ts && Object.values(ts).some(v => v) && (
                <div className="bg-metallic-900/60 rounded-lg p-3 border border-metallic-700/30">
                  <h4 className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-2">Trading Signals</h4>
                  <div className="space-y-1 text-xs">
                    {ts.momentum && (
                      <div className="flex justify-between">
                        <span className="text-metallic-500">Momentum</span>
                        <span className={`font-medium ${ts.momentum === 'bullish' ? 'text-emerald-400' : ts.momentum === 'bearish' ? 'text-red-400' : 'text-metallic-300'}`}>{ts.momentum}</span>
                      </div>
                    )}
                    {ts.volume_trend && <div className="flex justify-between"><span className="text-metallic-500">Volume</span><span className="text-metallic-200">{ts.volume_trend}</span></div>}
                    {ts['52w_position'] && <div className="flex justify-between"><span className="text-metallic-500">52W Position</span><span className="text-metallic-200">{ts['52w_position']}</span></div>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interpretation */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">What This Means</h4>
            <p className="text-sm text-metallic-300 whitespace-pre-line">{r.interpretation}</p>
          </div>

          {/* Why It Matters */}
          <div>
            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Why It Matters</h4>
            <p className="text-sm text-metallic-300 whitespace-pre-line">{r.why_it_matters}</p>
          </div>

          {/* Investment Outlook */}
          {outlook && (
            <div className="bg-gradient-to-br from-metallic-900/80 to-metallic-800/50 rounded-lg p-4 border border-metallic-700/30">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Investment Outlook
              </h4>
              {outlook.lassonde_stage && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs text-metallic-500">Lassonde Curve:</span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">{outlook.lassonde_stage}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {outlook.short_term && (
                  <div className="p-2 bg-metallic-950/50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1"><Zap className="w-3 h-3 text-emerald-400" /><span className="text-xs font-semibold text-emerald-400">0-6 months</span></div>
                    <p className="text-xs text-metallic-300">{outlook.short_term}</p>
                  </div>
                )}
                {outlook.medium_term && (
                  <div className="p-2 bg-metallic-950/50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1"><BarChart3 className="w-3 h-3 text-blue-400" /><span className="text-xs font-semibold text-blue-400">6-18 months</span></div>
                    <p className="text-xs text-metallic-300">{outlook.medium_term}</p>
                  </div>
                )}
                {outlook.long_term && (
                  <div className="p-2 bg-metallic-950/50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1"><Shield className="w-3 h-3 text-purple-400" /><span className="text-xs font-semibold text-purple-400">18+ months</span></div>
                    <p className="text-xs text-metallic-300">{outlook.long_term}</p>
                  </div>
                )}
              </div>

              {(outlook.key_catalysts?.length || outlook.key_risks?.length) ? (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {outlook.key_catalysts && outlook.key_catalysts.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-semibold text-emerald-400 uppercase mb-1">Key Catalysts</h5>
                      <ul className="space-y-0.5">
                        {outlook.key_catalysts.map((c, i) => (
                          <li key={i} className="text-xs text-metallic-300 flex items-start gap-1">
                            <ArrowUpRight className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {outlook.key_risks && outlook.key_risks.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-semibold text-red-400 uppercase mb-1">Key Risks</h5>
                      <ul className="space-y-0.5">
                        {outlook.key_risks.map((risk, i) => (
                          <li key={i} className="text-xs text-metallic-300 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />{risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Supporting Data */}
          {r.supporting_data && r.supporting_data.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Supporting Data</h4>
              <div className="space-y-1">
                {r.supporting_data.slice(0, 8).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-metallic-900/50 rounded px-2 py-1">
                    <span className="text-metallic-500 font-mono">{d.table}.{d.field}</span>
                    <span className="text-metallic-600">→</span>
                    <span className="text-metallic-200 truncate flex-1">{String(d.value).slice(0, 80)}</span>
                    {d.date && <span className="text-metallic-600 text-[10px]">{d.date}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks & Flags */}
          {r.risks_and_flags && r.risks_and_flags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Risks & Flags</h4>
              <ul className="space-y-1">
                {r.risks_and_flags.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-metallic-300"><AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Comparable Companies */}
          {r.comparable_companies && r.comparable_companies.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Comparable Companies</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-metallic-400 border-b border-metallic-700/50"><th className="text-left py-1 pr-3">Ticker</th><th className="text-left py-1 pr-3">Name</th><th className="text-left py-1 pr-3">Commodity</th><th className="text-left py-1 pr-3">Risk</th></tr></thead>
                  <tbody>
                    {r.comparable_companies.map((comp, i) => (
                      <tr key={i} className="text-metallic-200 border-b border-metallic-800/30">
                        <td className="py-1 pr-3 font-mono">{String(comp.ticker || '')}</td>
                        <td className="py-1 pr-3">{String(comp.name || '')}</td>
                        <td className="py-1 pr-3">{String(comp.commodity || '')}</td>
                        <td className="py-1 pr-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${comp.dilution_risk === 'high' ? 'bg-red-500/20 text-red-400' : comp.dilution_risk === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {String(comp.dilution_risk || 'low')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-metallic-800/30">
            <span className="text-[10px] text-metallic-600 italic">{r.confidence_reason}</span>
            <button onClick={() => onCopy(
              `${r.headline}\n\n${r.interpretation}\n\n${r.why_it_matters}${rec?.rating ? `\n\nRating: ${rec.rating} (${rec.conviction} conviction)` : ''}${rec?.price_target ? `\nPrice Target: ${rec.price_target}` : ''}`,
              message.id
            )} className="flex items-center gap-1 text-[10px] text-metallic-500 hover:text-white transition-colors">
              {copiedId === message.id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <span className="text-[10px] text-metallic-500 block">{label}</span>
      <span className={`text-sm font-bold ${valueClass || 'text-white'}`}>{value}</span>
    </div>
  );
}
