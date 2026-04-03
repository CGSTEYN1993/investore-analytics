/**
 * Sentiment Signals Service
 *
 * Fetches investment signals, company sentiment, and commodity sentiment
 * from the backend sentiment API.
 */

import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API = RAILWAY_API_URL;

// ── Types ──

export interface InvestmentSignal {
  id: number;
  ticker: string;
  exchange: string;
  company_name: string | null;
  signal_type: 'invest' | 'divest' | 'watch';
  signal_strength: 'strong' | 'moderate' | 'weak';
  headline: string;
  reasoning: string | null;
  triggers: string[];
  sentiment_score: number | null;
  sentiment_shift: number | null;
  news_count_7d: number;
  positive_count_7d: number;
  negative_count_7d: number;
  material_events_7d: number;
  commodity: string | null;
  share_price: number | null;
  created_at: string | null;
  expires_at: string | null;
}

export interface SignalsResponse {
  signals: InvestmentSignal[];
  total: number;
  invest_count: number;
  divest_count: number;
  watch_count: number;
}

export interface CompanySentiment {
  ticker: string;
  exchange: string;
  has_data: boolean;
  total_hits?: number;
  hits_7d?: number;
  hits_30d?: number;
  sentiment?: {
    avg_7d: number | null;
    avg_30d: number | null;
    avg_90d: number | null;
    label_7d: string;
    label_30d: string;
    trend: 'improving' | 'deteriorating' | 'stable';
  };
  breakdown?: {
    positive_30d: number;
    negative_30d: number;
    material_events_30d: number;
    top_event_type: string | null;
    consensus_impact: string | null;
  };
  investment_signal?: 'bullish' | 'bearish' | 'neutral';
  recent_headlines?: Array<{
    title: string;
    sentiment: string | null;
    score: number | null;
    event_type: string | null;
    significance: string | null;
    impact_prediction: string | null;
    date: string | null;
    source: string | null;
  }>;
  active_signals?: Array<{
    type: string;
    strength: string;
    headline: string;
    reasoning: string | null;
    triggers: string[];
    created_at: string | null;
  }>;
}

export interface TrendingStock {
  ticker: string;
  exchange: string;
  company_name: string | null;
  hits: number;
  avg_sentiment: number | null;
  positive: number;
  negative: number;
  material_events: number;
  bias: 'bullish' | 'bearish' | 'mixed';
  latest_date: string | null;
}

// ── API Functions ──

/**
 * Get active investment/divestment signals for pop-up notifications
 */
export async function getActiveSignals(
  signalType?: 'invest' | 'divest' | 'watch',
  exchange?: string,
  commodity?: string,
  limit = 20,
): Promise<SignalsResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (signalType) params.append('signal_type', signalType);
  if (exchange) params.append('exchange', exchange);
  if (commodity) params.append('commodity', commodity);

  const res = await fetch(`${API}/api/v1/sentiment/signals?${params}`);
  if (!res.ok) throw new Error('Failed to fetch signals');
  return res.json();
}

/**
 * Dismiss a signal
 */
export async function dismissSignal(signalId: number): Promise<void> {
  await fetch(`${API}/api/v1/sentiment/signals/dismiss/${signalId}`, {
    method: 'POST',
  });
}

/**
 * Generate fresh investment signals
 */
export async function generateSignals(
  daysLookback = 30,
  minNewsCount = 2,
): Promise<{
  status: string;
  companies_analysed: number;
  signals_created: number;
  invest_signals: number;
  divest_signals: number;
  watch_signals: number;
}> {
  const params = new URLSearchParams({
    days_lookback: daysLookback.toString(),
    min_news_count: minNewsCount.toString(),
  });
  const res = await fetch(`${API}/api/v1/sentiment/generate-signals?${params}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to generate signals');
  return res.json();
}

/**
 * Get detailed company sentiment
 */
export async function getCompanySentiment(
  ticker: string,
  exchange = 'ASX',
): Promise<CompanySentiment> {
  const res = await fetch(
    `${API}/api/v1/sentiment/company/${ticker}?exchange=${exchange}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch sentiment for ${ticker}`);
  return res.json();
}

/**
 * Get commodity-level sentiment
 */
export async function getCommoditySentiment(
  commodity: string,
  days = 30,
): Promise<{
  commodity: string;
  has_data: boolean;
  total_companies: number;
  companies_with_news: number;
  total_hits: number;
  sentiment: {
    average: number | null;
    positive_count: number;
    negative_count: number;
    material_events: number;
    trend: string;
  };
  top_movers: Array<{
    ticker: string;
    company_name: string | null;
    avg_sentiment: number | null;
    hits_7d: number;
    positive: number;
    negative: number;
  }>;
}> {
  const res = await fetch(
    `${API}/api/v1/sentiment/commodity/${commodity}?days=${days}`,
  );
  if (!res.ok) throw new Error(`Failed to fetch sentiment for ${commodity}`);
  return res.json();
}

/**
 * Get trending stocks by sentiment
 */
export async function getTrendingBySentiment(
  days = 7,
  limit = 20,
): Promise<{ trending: TrendingStock[]; total: number }> {
  const res = await fetch(
    `${API}/api/v1/sentiment/trending?days=${days}&limit=${limit}`,
  );
  if (!res.ok) throw new Error('Failed to fetch trending');
  return res.json();
}

// ── Helpers ──

export function getSignalColor(type: string): string {
  switch (type) {
    case 'invest':
      return 'text-emerald-400';
    case 'divest':
      return 'text-red-400';
    case 'watch':
      return 'text-amber-400';
    default:
      return 'text-slate-400';
  }
}

export function getSignalBgColor(type: string): string {
  switch (type) {
    case 'invest':
      return 'bg-emerald-500/15 border-emerald-500/30';
    case 'divest':
      return 'bg-red-500/15 border-red-500/30';
    case 'watch':
      return 'bg-amber-500/15 border-amber-500/30';
    default:
      return 'bg-slate-500/15 border-slate-500/30';
  }
}

export function getStrengthBadge(strength: string): string {
  switch (strength) {
    case 'strong':
      return 'bg-white/20 text-white font-bold';
    case 'moderate':
      return 'bg-white/10 text-slate-200';
    case 'weak':
      return 'bg-white/5 text-slate-400';
    default:
      return 'bg-white/5 text-slate-400';
  }
}

export function getSentimentEmoji(score: number | null): string {
  if (score === null) return '❓';
  if (score > 0.3) return '🟢';
  if (score > 0.1) return '🟡';
  if (score > -0.1) return '⚪';
  if (score > -0.3) return '🟠';
  return '🔴';
}
