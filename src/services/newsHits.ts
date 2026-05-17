/**
 * News Hits Service
 * 
 * Fetches news hits data from multiple sources including:
 * - Exchange announcements (ASX, TSX, JSE, LSE, NYSE)
 * - External mining news (Mining.com, Northern Miner, Australian Mining, etc.)
 * 
 * All news is processed with LLM for sentiment analysis and company matching.
 */

import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE_URL = RAILWAY_API_URL;

// Types
export interface NewsHit {
  id: number;
  ticker: string;
  exchange: string;
  company_name: string | null;
  source_type: 'announcement' | 'news' | 'filing';
  source_provider: string;
  source_url: string | null;
  article_title: string;
  article_date: string;
  article_snippet: string | null;
  llm_processed: boolean;
  sentiment: {
    score: number | null;
    label: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative' | null;
    reasoning: string | null;
  };
  event_type: string | null;
  event_significance: 'material' | 'routine' | 'minor' | null;
  topics: string[];
  commodities_mentioned: string[];
  key_facts: string[];
  stock_impact: {
    prediction: 'bullish' | 'bearish' | 'neutral' | null;
    reasoning: string | null;
  };
}

export interface NewsHitsSummary {
  total_hits: number;
  positive_news: number;
  negative_news: number;
  material_events: number;
  avg_sentiment: number | null;
}

export interface MacroBackdropEvent {
  id: number;
  source: string;
  headline: string;
  published_at: string | null;
  category: string | null;
  severity: 'high' | 'medium' | 'low' | null;
  regions: string[];
  commodities_affected: string[];
  expected_direction: Record<string, 'bullish' | 'bearish' | 'neutral'>;
  reasoning: string | null;
  matched_commodities: string[];
  company_impact: 'bullish' | 'bearish' | 'neutral';
}

export interface MacroBackdrop {
  enabled: boolean;
  commodities: string[];
  summary?: {
    total: number;
    bullish: number;
    bearish: number;
    net_score: number;
    bias: 'bullish' | 'bearish' | 'neutral';
  };
  events?: MacroBackdropEvent[];
  source_note?: string;
}

export interface CompanyNewsResponse {
  ticker: string;
  exchange: string;
  period_days: number;
  summary: NewsHitsSummary;
  news_hits: NewsHit[];
  macro_backdrop?: MacroBackdrop;
}

export interface RecentNewsHit {
  id: number;
  ticker: string;
  exchange: string;
  company_name: string | null;
  source_provider: string;
  article_title: string;
  article_date: string;
  sentiment_label: string | null;
  sentiment_score: number | null;
  event_type: string | null;
  event_significance: string | null;
  stock_impact_prediction: string | null;
  source_url: string | null;
}

export interface RecentNewsResponse {
  period_days: number;
  total_hits: number;
  news_hits: RecentNewsHit[];
}

export interface NewsSource {
  id: string;
  name: string;
  region: string;
  focus: string;
}

export interface NewsSourcesResponse {
  total_sources: number;
  sources: NewsSource[];
  categories: {
    global: NewsSource[];
    australia: NewsSource[];
    africa: NewsSource[];
  };
}

export interface TopCompany {
  ticker: string;
  exchange: string;
  hits: number;
  avg_sentiment: number | null;
}

export interface NewsStatsResponse {
  period_days: number;
  overview: {
    total_hits: number;
    unique_companies: number;
    llm_processed: number;
    positive_news: number;
    negative_news: number;
    material_events: number;
  };
  top_companies: TopCompany[];
  event_breakdown: Record<string, number>;
  source_breakdown: Record<string, number>;
}

// API Functions

/**
 * Get news hits for a specific company
 */
export async function getCompanyNewsHits(
  ticker: string,
  exchange: string = 'ASX',
  days: number = 90,
  limit: number = 50,
  eventType?: string,
  sentiment?: 'positive' | 'negative' | 'neutral'
): Promise<CompanyNewsResponse> {
  const params = new URLSearchParams({
    exchange,
    days: days.toString(),
    limit: limit.toString(),
  });
  
  if (eventType) params.append('event_type', eventType);
  if (sentiment) params.append('sentiment', sentiment);
  
  const response = await fetch(
    `${API_BASE_URL}/api/v1/news-hits/company/${ticker}?${params}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch news hits for ${ticker}`);
  }
  
  return response.json();
}

/**
 * Get recent news hits across all companies
 */
export async function getRecentNewsHits(
  days: number = 7,
  limit: number = 100,
  exchange?: string
): Promise<RecentNewsResponse> {
  const params = new URLSearchParams({
    days: days.toString(),
    limit: limit.toString(),
  });
  
  if (exchange) params.append('exchange', exchange);
  
  const response = await fetch(
    `${API_BASE_URL}/api/v1/news-hits/recent?${params}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch recent news hits');
  }
  
  return response.json();
}

/**
 * Get news hits statistics
 */
export async function getNewsStats(days: number = 30, exchange?: string): Promise<NewsStatsResponse> {
  const params = new URLSearchParams({ days: String(days) });
  if (exchange) params.set('exchange', exchange);
  const response = await fetch(
    `${API_BASE_URL}/api/v1/news-hits/stats?${params.toString()}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch news stats');
  }
  
  return response.json();
}

/**
 * Get available news sources
 */
export async function getNewsSources(): Promise<NewsSourcesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/news-hits/sources`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch news sources');
  }
  
  return response.json();
}

/**
 * Trigger fetch of external news (admin function)
 */
export async function fetchExternalNews(
  sources?: string[],
  limitPerSource: number = 20
): Promise<{
  sources_fetched: number;
  articles_found: number;
  articles_stored: number;
  status: string;
}> {
  const params = new URLSearchParams({
    limit_per_source: limitPerSource.toString(),
  });
  
  if (sources) {
    sources.forEach(s => params.append('sources', s));
  }
  
  const response = await fetch(
    `${API_BASE_URL}/api/v1/news-hits/fetch-external-news?${params}`,
    { method: 'POST' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch external news');
  }
  
  return response.json();
}

/**
 * Process news with LLM (admin function)
 */
export async function processNewsWithLLM(
  batchSize: number = 20
): Promise<{
  articles_processed: number;
  news_hits_created: number;
  companies_matched: number;
  status: string;
}> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/news-hits/process-external-news-with-llm?batch_size=${batchSize}`,
    { method: 'POST' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to process news with LLM');
  }
  
  return response.json();
}

// Helper functions

export function getSentimentColor(label: string | null): string {
  switch (label) {
    case 'very_positive':
      return 'text-green-400';
    case 'positive':
      return 'text-green-300';
    case 'neutral':
      return 'text-slate-400';
    case 'negative':
      return 'text-red-300';
    case 'very_negative':
      return 'text-red-400';
    default:
      return 'text-slate-500';
  }
}

export function getSentimentBgColor(label: string | null): string {
  switch (label) {
    case 'very_positive':
      return 'bg-green-500/20 border-green-500/30';
    case 'positive':
      return 'bg-green-500/10 border-green-500/20';
    case 'neutral':
      return 'bg-slate-500/10 border-slate-500/20';
    case 'negative':
      return 'bg-red-500/10 border-red-500/20';
    case 'very_negative':
      return 'bg-red-500/20 border-red-500/30';
    default:
      return 'bg-slate-800/50 border-slate-700';
  }
}

export function getImpactIcon(prediction: string | null): string {
  switch (prediction) {
    case 'bullish':
      return '📈';
    case 'bearish':
      return '📉';
    case 'neutral':
      return '➖';
    default:
      return '❓';
  }
}

export function formatEventType(eventType: string | null): string {
  if (!eventType) return 'Unknown';
  return eventType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getSourceIcon(provider: string): string {
  const icons: Record<string, string> = {
    asx: '🇦🇺',
    tsx: '🇨🇦',
    jse: '🇿🇦',
    lse: '🇬🇧',
    nyse: '🇺🇸',
    mining_com: '⛏️',
    northern_miner: '📰',
    australian_mining: '🦘',
    junior_mining: '🔍',
    mining_review_africa: '🌍',
    miningmx: '🌍',
    afr: '🇦🇺',
  };
  return icons[provider] || '📄';
}
