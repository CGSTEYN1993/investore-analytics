'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, ExternalLink, MapPin, Building2, Calendar, TrendingUp, TrendingDown,
  Bookmark, BookmarkCheck, Bell, Share2, FileText, Hammer, Globe, ChevronRight,
  BarChart3, DollarSign, Users, Layers, Download, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';
import { formatPrice } from '@/lib/utils';
import CompanyGeoscienceWidget from '@/components/dashboard/CompanyGeoscienceWidget';import CompanyMiningDataWidget from '@/components/mining/CompanyMiningDataWidget';
import StockBriefPanel from '@/components/company/StockBriefPanel';
import DrillIntercepts from '@/components/company/DrillIntercepts';
// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

import { RAILWAY_API_URL } from '@/lib/public-api-url';
const API_URL = RAILWAY_API_URL;

interface Announcement {
  id: string;
  symbol: string;
  title: string;
  announcement_type: string;
  date: string;
  url: string | null;
  sentiment: string;
  is_price_sensitive: boolean;
}

interface MarketData {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  avgVolume: number;
  sharesOutstanding?: number;
  dividend?: number;
  dividendYield?: number;
  eps?: number;
  peRatio?: number;
}

interface CompanyData {
  ticker: string;
  exchange: string;
  name: string;
  commodity: string;
  marketData: MarketData | null;
  announcements: Announcement[];
  website?: string;
  logoUrl?: string;
  asxUrl?: string;
  description?: string;
}

function StatCard({ label, value, subValue, icon: Icon, trend }: { 
  label: string; 
  value: string; 
  subValue?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-metallic-500 uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 text-metallic-600" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-metallic-100">{value}</span>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
          </span>
        )}
      </div>
      {subValue && <span className="text-xs text-metallic-500">{subValue}</span>}
    </div>
  );
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'very_positive': return 'bg-green-500/20 text-green-400';
    case 'positive': return 'bg-green-500/10 text-green-400';
    case 'negative': return 'bg-red-500/10 text-red-400';
    case 'very_negative': return 'bg-red-500/20 text-red-400';
    default: return 'bg-metallic-700 text-metallic-400';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'drilling_results': return 'bg-blue-500/20 text-blue-400';
    case 'resource_estimate': return 'bg-purple-500/20 text-purple-400';
    case 'production_report': return 'bg-green-500/20 text-green-400';
    case 'quarterly_report': return 'bg-yellow-500/20 text-yellow-400';
    case 'capital_raise': return 'bg-orange-500/20 text-orange-400';
    case 'feasibility_study': return 'bg-cyan-500/20 text-cyan-400';
    default: return 'bg-metallic-700 text-metallic-400';
  }
}

const LASSONDE_STAGES = [
  'Concept/Prospecting',
  'Discovery',
  'Resource Definition',
  'Development',
  'Production',
];

function getLassondeIndex(stage: string): number {
  const idx = LASSONDE_STAGES.findIndex(s => s.toLowerCase() === stage.toLowerCase());
  return idx >= 0 ? idx : 0;
}

interface ChartCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  symbol: string;
  period: string;
  candles: ChartCandle[];
  source: string;
}

interface CapitalRaising {
  id: number;
  announcement_date: string;
  raising_type: string;
  amount_raised: number | null;
  price_per_share: number | null;
  shares_issued: number | null;
  discount_percent: number | null;
}

interface LassondeSignals {
  drilling_count: number;
  intercepts_count: number;
  resources_count: number;
  economics_count: number;
  feasibility_events: number;
  production_events: number;
}

interface LassondeProject {
  project_name: string;
  drilling_count: number;
  stage: string;
}

interface LassondeResponse {
  ticker: string;
  stage: string;
  confidence: 'high' | 'medium' | 'low';
  signals: LassondeSignals;
  projects: LassondeProject[];
}

/**
 * Format a market cap with the smallest sensible unit.
 *  - ≥ $1B  → "$X.XXB"
 *  - ≥ $1M  → "$X.XXM"
 *  - ≥ $1K  → "$XXXK"
 *  - else   → exact dollars (e.g. "$842")
 * Avoids the "$0.0B" rounding that hides micro-cap values.
 */
function formatMarketCap(value: number): string {
  if (!value || value <= 0) return 'N/A';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Chart-overlay helpers — commodity & peer comparisons
// ---------------------------------------------------------------------------
/** Commodities the backend can chart via /market/commodities/{id}/history. */
const COMMODITY_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'gold', label: 'Gold' },
  { id: 'silver', label: 'Silver' },
  { id: 'platinum', label: 'Platinum' },
  { id: 'palladium', label: 'Palladium' },
  { id: 'copper', label: 'Copper' },
  { id: 'nickel', label: 'Nickel' },
  { id: 'zinc', label: 'Zinc' },
  { id: 'iron_ore', label: 'Iron Ore' },
  { id: 'lithium', label: 'Lithium' },
  { id: 'uranium', label: 'Uranium' },
  { id: 'crude_oil', label: 'Crude Oil' },
  { id: 'natural_gas', label: 'Natural Gas' },
];

/** Map a free-text commodity name (e.g. "Gold", "Iron Ore") to a backend id. */
function commodityNameToId(name: string | undefined | null): string | null {
  if (!name) return null;
  const norm = name.trim().toLowerCase().replace(/[^a-z]+/g, '_');
  const direct = COMMODITY_OPTIONS.find(c => c.id === norm);
  if (direct) return direct.id;
  const byLabel = COMMODITY_OPTIONS.find(c => c.label.toLowerCase() === name.trim().toLowerCase());
  return byLabel ? byLabel.id : null;
}

/** Distinct, color-blind friendly palette for overlay lines. */
const OVERLAY_COLORS = ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fb923c'];

export default function CompanyProfile() {
  const params = useParams();
  const searchParams = useSearchParams();
  const ticker = (params.ticker as string)?.toUpperCase() || '';
  const exchangeParam = (searchParams?.get('exchange') || '').toUpperCase();
  const exchangeQuery = exchangeParam ? `?exchange=${encodeURIComponent(exchangeParam)}` : '';
  
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartPeriod, setChartPeriod] = useState('1M');
  const [chartLoading, setChartLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [showVolume, setShowVolume] = useState(true);
  const [capitalRaisings, setCapitalRaisings] = useState<CapitalRaising[]>([]);
  const [showCapitalRaisings, setShowCapitalRaisings] = useState(true);
  const [lassondeData, setLassondeData] = useState<LassondeResponse | null>(null);
  const [lassondeLoading, setLassondeLoading] = useState(false);

  // ── Comparison overlays (commodity + peers) ─────────────────────────────
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null);
  const [commodityOverlay, setCommodityOverlay] = useState<{ id: string; label: string; candles: ChartCandle[] } | null>(null);
  const [peerTickers, setPeerTickers] = useState<string[]>([]);
  const [peerOverlays, setPeerOverlays] = useState<Record<string, ChartCandle[]>>({});
  const [peerInput, setPeerInput] = useState('');
  const [overlayLoading, setOverlayLoading] = useState(false);

  const fetchCapitalRaisings = async () => {
    if (!ticker) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/market/stock/${ticker}/capital-raisings`);
      if (res.ok) {
        const data = await res.json();
        setCapitalRaisings(data.capital_raisings || []);
      }
    } catch (err) {
      console.error('Error fetching capital raisings:', err);
    }
  };

  const fetchChartData = async (period: string) => {
    if (!ticker) return;
    
    setChartLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/market/chart/${ticker}?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Chart data for ${ticker}:`, data.source, data.count || data.candles?.length, 'candles');
        setChartData(data);
      } else {
        console.error('Chart API error:', res.status);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    if (!ticker) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch market data, company details, and announcements in parallel
      setLassondeLoading(true);
      const [quoteRes, detailsRes, announcementsRes, lassondeRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/market/quote/${ticker}`).catch(() => null),
        fetch(`${API_URL}/api/v1/market/company/${ticker}/details${exchangeQuery}`).catch(() => null),
        fetch(`${API_URL}/api/v1/announcements/company/${ticker}?days_back=90&limit=20${exchangeParam ? `&exchange=${encodeURIComponent(exchangeParam)}` : ''}`).catch(() => null),
        fetch(`${API_URL}/api/v1/mining/company/${ticker}/lassonde`).catch(() => null)
      ]);
      
      let marketData: MarketData | null = null;
      let announcements: Announcement[] = [];
      let companyName = ticker;
      let commodity = 'Unknown';
      let exchange = 'ASX';
      let website: string | undefined;
      let logoUrl: string | undefined;
      let asxUrl: string | undefined;
      let description: string | undefined;
      
      // Parse company details
      if (detailsRes && detailsRes.ok) {
        const details = await detailsRes.json();
        website = details.website || undefined;
        logoUrl = details.logoUrl || undefined;
        asxUrl = details.asxUrl || undefined;
        description = details.description || undefined;
        // Use details for name/commodity if available
        if (details.name) companyName = details.name;
        if (details.commodity) commodity = details.commodity;
        if (details.exchange) exchange = details.exchange;
      }
      
      // Parse market data
      if (quoteRes && quoteRes.ok) {
        const quote = await quoteRes.json();
        // Only override if not already set from details
        if (!companyName || companyName === ticker) companyName = quote.name || ticker;
        if (commodity === 'Unknown') commodity = quote.commodity || 'Unknown';
        if (!exchange) exchange = quote.exchange || 'ASX';
        marketData = {
          price: quote.price || 0,
          change: quote.change || 0,
          changePercent: quote.changePercent || 0,
          volume: quote.volume || 0,
          marketCap: quote.marketCap || 0,
          high52w: quote.fiftyTwoWeekHigh || 0,
          low52w: quote.fiftyTwoWeekLow || 0,
          avgVolume: quote.averageVolume || 0,
          sharesOutstanding: quote.sharesOutstanding,
          dividend: quote.dividend,
          dividendYield: quote.dividendYield,
          eps: quote.eps,
          peRatio: quote.peRatio,
        };
      }
      
      // Parse announcements
      if (announcementsRes && announcementsRes.ok) {
        const annData = await announcementsRes.json();
        // Normalize announcement fields to prevent null access crashes
        announcements = (annData.announcements || []).map((ann: any) => ({
          ...ann,
          id: ann.id || '',
          title: ann.title || 'Untitled',
          announcement_type: ann.announcement_type || 'other',
          sentiment: ann.sentiment || 'neutral',
          date: ann.date || '',
          url: ann.url || null,
          is_price_sensitive: ann.is_price_sensitive || false,
        }));
      }

      // Parse Lassonde curve position
      if (lassondeRes && lassondeRes.ok) {
        const lassonde = await lassondeRes.json();
        setLassondeData(lassonde);
      } else {
        setLassondeData(null);
      }
      
      setCompanyData({
        ticker,
        exchange,
        name: companyName,
        commodity,
        marketData,
        announcements,
        website,
        logoUrl,
        asxUrl,
        description,
      });
      
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError('Unable to fetch company data');
      setLassondeData(null);
    } finally {
      setLoading(false);
      setLassondeLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
    fetchChartData(chartPeriod);
    fetchCapitalRaisings();
  }, [ticker]);

  // Fetch new chart data when period changes
  useEffect(() => {
    if (ticker) {
      fetchChartData(chartPeriod);
    }
  }, [chartPeriod]);

  // ── Fetch commodity overlay candles when commodity / period changes ───
  useEffect(() => {
    if (!selectedCommodity) {
      setCommodityOverlay(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setOverlayLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/v1/market/commodities/${selectedCommodity}/history?period=${chartPeriod}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const label = COMMODITY_OPTIONS.find(c => c.id === selectedCommodity)?.label || selectedCommodity;
        const candles: ChartCandle[] = (data.candles || []).map((c: any) => ({
          timestamp: c.timestamp,
          open: c.open ?? c.close,
          high: c.high ?? c.close,
          low: c.low ?? c.close,
          close: c.close,
          volume: c.volume || 0,
        }));
        setCommodityOverlay({ id: selectedCommodity, label, candles });
      } catch (err) {
        console.warn('Commodity overlay fetch failed:', err);
        if (!cancelled) setCommodityOverlay(null);
      } finally {
        if (!cancelled) setOverlayLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedCommodity, chartPeriod]);

  // ── Fetch peer overlay candles when peer list / period changes ────────
  useEffect(() => {
    if (peerTickers.length === 0) {
      setPeerOverlays({});
      return;
    }
    let cancelled = false;
    (async () => {
      setOverlayLoading(true);
      try {
        const results = await Promise.all(peerTickers.map(async (t) => {
          try {
            const res = await fetch(`${API_URL}/api/v1/market/chart/${t}?period=${chartPeriod}`);
            if (!res.ok) return [t, [] as ChartCandle[]] as const;
            const data = await res.json();
            return [t, (data.candles || []) as ChartCandle[]] as const;
          } catch {
            return [t, [] as ChartCandle[]] as const;
          }
        }));
        if (cancelled) return;
        const next: Record<string, ChartCandle[]> = {};
        for (const [t, candles] of results) next[t] = candles;
        setPeerOverlays(next);
      } finally {
        if (!cancelled) setOverlayLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [peerTickers, chartPeriod]);

  // Prepare chart data for Plotly with OHLCV support
  const plotData = useMemo(() => {
    if (!chartData || !chartData.candles || chartData.candles.length === 0) {
      return null;
    }
    
    const dates = chartData.candles.map(c => c.timestamp);
    const opens = chartData.candles.map(c => c.open);
    const highs = chartData.candles.map(c => c.high);
    const lows = chartData.candles.map(c => c.low);
    const closes = chartData.candles.map(c => c.close);
    const volumes = chartData.candles.map(c => c.volume);
    
    // Calculate if trend is up or down
    const firstClose = closes[0] || 0;
    const lastClose = closes[closes.length - 1] || 0;
    const isPositive = lastClose >= firstClose;
    
    // Find capital raisings that fall within the chart period
    const chartStart = new Date(dates[0]);
    const chartEnd = new Date(dates[dates.length - 1]);
    
    const relevantRaisings = capitalRaisings.filter(cr => {
      const crDate = new Date(cr.announcement_date);
      return crDate >= chartStart && crDate <= chartEnd;
    });
    
    return {
      dates,
      opens,
      highs,
      lows,
      closes,
      volumes,
      isPositive,
      change: lastClose - firstClose,
      changePercent: firstClose > 0 ? ((lastClose - firstClose) / firstClose) * 100 : 0,
      capitalRaisings: relevantRaisings,
      maxVolume: Math.max(...volumes),
      minPrice: Math.min(...lows),
      maxPrice: Math.max(...highs),
    };
  }, [chartData, capitalRaisings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-metallic-400">Loading {ticker} data...</p>
        </div>
      </div>
    );
  }

  if (error || !companyData) {
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Company not found'}</p>
          <button
            onClick={fetchCompanyData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { marketData, announcements, name, exchange, commodity, website, logoUrl, asxUrl, description } = companyData;
  const commodityColor = getCommodityColor(commodity);
  const isPositive = marketData ? marketData.changePercent >= 0 : true;
  const lassondeIndex = lassondeData ? getLassondeIndex(lassondeData.stage) : 0;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-metallic-500 mb-4">
            <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/analysis/commodities" className="hover:text-primary-400">{commodity}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-metallic-300">{ticker}</span>
          </div>

          {/* Company Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              {logoUrl && !logoError ? (
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={logoUrl} 
                    alt={`${name} logo`}
                    className="w-12 h-12 object-contain"
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: commodityColor }}
                >
                  {ticker.substring(0, 2)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-metallic-100">{name}</h1>
                  <span className="px-2 py-1 bg-metallic-800 rounded text-sm text-metallic-400">
                    {ticker}:{exchange}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-metallic-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {commodity}
                  </span>
                  {/* Website Link */}
                  {website && (
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-400 hover:text-primary-300"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {/* ASX Link as fallback */}
                  {!website && asxUrl && (
                    <a
                      href={asxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-400 hover:text-primary-300"
                    >
                      <Globe className="w-4 h-4" />
                      ASX Page
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={fetchCompanyData}
                    className="flex items-center gap-1 text-metallic-500 hover:text-metallic-300"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center gap-4">
              {/* Current Price */}
              {marketData && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-metallic-100">
                    ${formatPrice(marketData.price)}
                  </div>
                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>${formatPrice(Math.abs(marketData.change))}</span>
                    <span>({isPositive ? '+' : ''}{marketData.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isWatchlisted 
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' 
                      : 'bg-metallic-800 border-metallic-700 text-metallic-400 hover:bg-metallic-700'
                  }`}
                >
                  {isWatchlisted ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button className="p-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-400 hover:bg-metallic-700 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-400 hover:bg-metallic-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">About</h2>
              <p className="text-metallic-400 leading-relaxed">
                {description || `${name} (${ticker}) is an ${exchange}-listed company focused on ${commodity} exploration and development.`}
              </p>
              {/* External Links */}
              <div className="mt-4 flex flex-wrap gap-3">
                {website && (
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Company Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <a
                  href={`https://www2.asx.com.au/markets/company/${ticker}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-metallic-800 text-metallic-300 rounded-lg hover:bg-metallic-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  ASX Listing
                </a>
                <a
                  href={`https://www.google.com/finance/quote/${ticker}:ASX`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-metallic-800 text-metallic-300 rounded-lg hover:bg-metallic-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Finance
                </a>
              </div>
            </section>

            {/* Market Data Grid */}
            {marketData && (
              <section>
                <h2 className="text-lg font-semibold text-metallic-100 mb-4">Market Data</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard 
                    label="Market Cap" 
                    value={formatMarketCap(marketData.marketCap)}
                    icon={Building2}
                  />
                  <StatCard 
                    label="Volume" 
                    value={marketData.volume.toLocaleString()}
                    subValue={marketData.avgVolume > 0 ? `Avg: ${(marketData.avgVolume / 1e6).toFixed(1)}M` : undefined}
                    icon={BarChart3}
                  />
                  <StatCard 
                    label="52W Range" 
                    value={marketData.high52w > 0 ? `$${formatPrice(marketData.low52w)} - $${formatPrice(marketData.high52w)}` : 'N/A'}
                    icon={TrendingUp}
                  />
                  {marketData.sharesOutstanding && (
                    <StatCard 
                      label="Shares Outstanding" 
                      value={`${(marketData.sharesOutstanding / 1e9).toFixed(2)}B`}
                      icon={Users}
                    />
                  )}
                  {marketData.dividend !== undefined && marketData.dividend > 0 && (
                    <StatCard 
                      label="Dividend" 
                      value={`$${marketData.dividend.toFixed(2)}`}
                      subValue={marketData.dividendYield ? `Yield: ${marketData.dividendYield.toFixed(2)}%` : undefined}
                      icon={DollarSign}
                    />
                  )}
                  <StatCard 
                    label="Exchange" 
                    value={exchange}
                    subValue={ticker}
                    icon={Globe}
                  />
                </div>
              </section>
            )}

            {/* Price Chart */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-metallic-100">Price Chart</h2>
                  {plotData && (
                    <div className={`text-sm ${plotData.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {plotData.isPositive ? '+' : ''}{plotData.changePercent.toFixed(2)}% ({chartPeriod})
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Chart type toggle */}
                  <div className="flex items-center gap-1 mr-2">
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-2 py-1 text-xs rounded-l-lg border transition-colors ${
                        chartType === 'line'
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-metallic-800 text-metallic-400 border-metallic-700 hover:bg-metallic-700'
                      }`}
                      title="Line Chart"
                    >
                      Line
                    </button>
                    <button
                      onClick={() => setChartType('candlestick')}
                      className={`px-2 py-1 text-xs rounded-r-lg border-t border-r border-b transition-colors ${
                        chartType === 'candlestick'
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-metallic-800 text-metallic-400 border-metallic-700 hover:bg-metallic-700'
                      }`}
                      title="Candlestick Chart"
                    >
                      Candle
                    </button>
                  </div>
                  {/* Period buttons */}
                  {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        chartPeriod === period
                          ? 'bg-primary-500 text-white'
                          : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart toggles */}
              <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVolume}
                    onChange={(e) => setShowVolume(e.target.checked)}
                    className="rounded bg-metallic-800 border-metallic-700 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-metallic-400">Volume Bars</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCapitalRaisings}
                    onChange={(e) => setShowCapitalRaisings(e.target.checked)}
                    className="rounded bg-metallic-800 border-metallic-700 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-metallic-400">Capital Raisings ({capitalRaisings.length})</span>
                </label>
              </div>

              {/* Comparison overlays — commodity & peers */}
              <div className="flex items-start gap-3 mb-4 text-sm flex-wrap">
                {/* Commodity selector */}
                <div className="flex items-center gap-2">
                  <span className="text-metallic-500 text-xs uppercase tracking-wide">Commodity:</span>
                  <select
                    value={selectedCommodity || ''}
                    onChange={(e) => setSelectedCommodity(e.target.value || null)}
                    className="bg-metallic-800 border border-metallic-700 rounded-lg px-2 py-1 text-xs text-metallic-200 focus:outline-none focus:border-primary-500"
                    title="Overlay a commodity price (normalized to % change)"
                  >
                    <option value="">— None —</option>
                    {COMMODITY_OPTIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  {commodityOverlay && commodityOverlay.candles.length === 0 && (
                    <span className="text-amber-400 text-xs">No data for {commodityOverlay.label}</span>
                  )}
                </div>

                {/* Peer adder */}
                <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                  <span className="text-metallic-500 text-xs uppercase tracking-wide">Peers:</span>
                  <input
                    type="text"
                    value={peerInput}
                    onChange={(e) => setPeerInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = peerInput.trim().toUpperCase();
                        if (v && v !== ticker && !peerTickers.includes(v) && peerTickers.length < OVERLAY_COLORS.length - 1) {
                          setPeerTickers([...peerTickers, v]);
                          setPeerInput('');
                        }
                      }
                    }}
                    placeholder="Add ticker (e.g. BHP)…"
                    className="bg-metallic-800 border border-metallic-700 rounded-lg px-2 py-1 text-xs text-metallic-200 focus:outline-none focus:border-primary-500 w-32"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = peerInput.trim().toUpperCase();
                      if (v && v !== ticker && !peerTickers.includes(v) && peerTickers.length < OVERLAY_COLORS.length - 1) {
                        setPeerTickers([...peerTickers, v]);
                        setPeerInput('');
                      }
                    }}
                    className="px-2 py-1 text-xs rounded-lg bg-primary-500/20 border border-primary-500/40 text-primary-300 hover:bg-primary-500/30"
                  >
                    Add
                  </button>
                  {peerTickers.map((t, i) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-metallic-800 border border-metallic-700"
                      style={{ borderColor: OVERLAY_COLORS[i + 1] || OVERLAY_COLORS[0] }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: OVERLAY_COLORS[i + 1] || OVERLAY_COLORS[0] }} />
                      <span className="text-metallic-200">{t}</span>
                      <button
                        type="button"
                        onClick={() => setPeerTickers(peerTickers.filter(p => p !== t))}
                        className="text-metallic-500 hover:text-red-400 ml-1"
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {overlayLoading && <Loader2 className="w-3 h-3 text-metallic-500 animate-spin" />}
                </div>
              </div>
              
              {/* Chart */}
              <div className={showVolume ? "h-96" : "h-80"}>
                {chartLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : plotData ? (
                  (() => {
                    // ── Detect comparison overlays (commodity + peers) ─────
                    const peerEntries = peerTickers
                      .map((t, i) => ({ ticker: t, candles: peerOverlays[t] || [], color: OVERLAY_COLORS[i + 1] || OVERLAY_COLORS[0] }))
                      .filter(p => p.candles.length > 0);
                    const commodityEntry = commodityOverlay && commodityOverlay.candles.length > 0
                      ? { label: commodityOverlay.label, candles: commodityOverlay.candles, color: OVERLAY_COLORS[0] }
                      : null;
                    const hasOverlays = !!commodityEntry || peerEntries.length > 0;

                    // Helper: normalize a candle series to % change from first close.
                    const normalize = (candles: ChartCandle[]) => {
                      if (candles.length === 0) return { x: [] as string[], y: [] as number[] };
                      const first = candles.find(c => c.close)?.close || candles[0].close || 1;
                      return {
                        x: candles.map(c => c.timestamp),
                        y: candles.map(c => ((c.close / first) - 1) * 100),
                      };
                    };

                    // ── Compute a tight, TradingView-style y-axis range that
                    // EXCLUDES zero so small price moves are clearly visible.
                    // We use the actual high/low of the visible candles plus a
                    // small symmetric padding (3% of the move, 0.5% of price).
                    const priceLo = Math.min(plotData.minPrice, ...plotData.closes);
                    const priceHi = Math.max(plotData.maxPrice, ...plotData.closes);
                    const span = Math.max(priceHi - priceLo, priceHi * 0.005);
                    const pad = span * 0.08;
                    const yMin = Math.max(0, priceLo - pad);
                    const yMax = priceHi + pad;

                    // Decimal precision scales with magnitude — sub-cent stocks
                    // need 4 dp, mid-cap dollar prices need 2.
                    const dp = priceHi >= 100 ? 2 : priceHi >= 10 ? 2 : priceHi >= 1 ? 2 : priceHi >= 0.1 ? 3 : 4;
                    const tickFmt = `,.${dp}f`;
                    const hoverFmt = `,.${dp}f`;

                    const lineColor = plotData.isPositive ? '#26a69a' : '#ef5350'; // TradingView green/red
                    const fillColor = plotData.isPositive
                      ? 'rgba(38, 166, 154, 0.12)'
                      : 'rgba(239, 83, 80, 0.12)';

                    // ── Normalized-mode (when overlays are active) ────────
                    // Switch the y-axis to "% change from period start" so all
                    // series share one scale regardless of price magnitude.
                    const primaryNorm = normalize(
                      plotData.dates.map((d, i) => ({
                        timestamp: d, open: plotData.opens[i], high: plotData.highs[i],
                        low: plotData.lows[i], close: plotData.closes[i], volume: plotData.volumes[i],
                      }))
                    );
                    let normYMin = 0;
                    let normYMax = 0;
                    if (hasOverlays) {
                      const allY: number[] = [...primaryNorm.y];
                      if (commodityEntry) allY.push(...normalize(commodityEntry.candles).y);
                      for (const p of peerEntries) allY.push(...normalize(p.candles).y);
                      const lo = Math.min(...allY);
                      const hi = Math.max(...allY);
                      const nspan = Math.max(hi - lo, 1);
                      const npad = nspan * 0.1;
                      normYMin = lo - npad;
                      normYMax = hi + npad;
                    }

                    const lastClose = plotData.closes[plotData.closes.length - 1];
                    const lastPct = primaryNorm.y[primaryNorm.y.length - 1] || 0;

                    return (
                  <Plot
                    data={[
                      // ── Primary price trace ──────────────────────────────
                      hasOverlays ? {
                        // Normalized % line for the active company
                        x: primaryNorm.x,
                        y: primaryNorm.y,
                        type: 'scatter' as const,
                        mode: 'lines' as const,
                        name: ticker,
                        line: { color: lineColor, width: 2, shape: 'spline' as const, smoothing: 0.3 },
                        hovertemplate: `<b>${ticker}</b> %{y:+.2f}%<extra></extra>`,
                        yaxis: 'y2',
                      } : (chartType === 'candlestick' ? {
                        x: plotData.dates,
                        open: plotData.opens,
                        high: plotData.highs,
                        low: plotData.lows,
                        close: plotData.closes,
                        type: 'candlestick' as const,
                        name: 'Price',
                        increasing: { line: { color: '#26a69a', width: 1 } },
                        decreasing: { line: { color: '#ef5350', width: 1 } },
                        whiskerwidth: 0,
                        yaxis: 'y2',
                      } : {
                        x: plotData.dates,
                        y: plotData.closes,
                        type: 'scatter' as const,
                        mode: 'lines' as const,
                        fill: 'tozeroy' as const,
                        name: 'Price',
                        line: {
                          color: lineColor,
                          width: 1.75,
                          shape: 'spline' as const,
                          smoothing: 0.3,
                        },
                        fillcolor: fillColor,
                        hovertemplate: `$%{y:${hoverFmt}}<extra></extra>`,
                        yaxis: 'y2',
                      }),
                      // ── Commodity overlay (normalized) ───────────────────
                      ...(commodityEntry ? [(() => {
                        const n = normalize(commodityEntry.candles);
                        return {
                          x: n.x,
                          y: n.y,
                          type: 'scatter' as const,
                          mode: 'lines' as const,
                          name: commodityEntry.label,
                          line: { color: commodityEntry.color, width: 1.5, dash: 'dash' as const, shape: 'spline' as const, smoothing: 0.3 },
                          hovertemplate: `<b>${commodityEntry.label}</b> %{y:+.2f}%<extra></extra>`,
                          yaxis: 'y2',
                        };
                      })()] : []),
                      // ── Peer overlays (normalized) ───────────────────────
                      ...peerEntries.map(p => {
                        const n = normalize(p.candles);
                        return {
                          x: n.x,
                          y: n.y,
                          type: 'scatter' as const,
                          mode: 'lines' as const,
                          name: p.ticker,
                          line: { color: p.color, width: 1.5, shape: 'spline' as const, smoothing: 0.3 },
                          hovertemplate: `<b>${p.ticker}</b> %{y:+.2f}%<extra></extra>`,
                          yaxis: 'y2',
                        };
                      }),
                      // ── Volume bars (suppressed in overlay mode) ─────────
                      ...(showVolume && !hasOverlays ? [{
                        x: plotData.dates,
                        y: plotData.volumes,
                        type: 'bar' as const,
                        name: 'Volume',
                        marker: {
                          color: plotData.closes.map((close, i) =>
                            i > 0 && close >= plotData.closes[i - 1] ? 'rgba(38, 166, 154, 0.55)' : 'rgba(239, 83, 80, 0.55)'
                          ),
                          line: { width: 0 },
                        },
                        yaxis: 'y',
                        hovertemplate: 'Vol %{y:,.0f}<extra></extra>',
                      }] : []),
                      // Capital raisings markers (only in price mode)
                      ...(showCapitalRaisings && !hasOverlays && plotData.capitalRaisings.length > 0 ? [{
                        x: plotData.capitalRaisings.map(cr => cr.announcement_date),
                        y: plotData.capitalRaisings.map(cr => {
                          // Find the close price on that date
                          const idx = plotData.dates.findIndex(d => d.startsWith(cr.announcement_date.split('T')[0]));
                          return idx >= 0 ? plotData.closes[idx] : plotData.closes[plotData.closes.length - 1];
                        }),
                        type: 'scatter' as const,
                        mode: 'markers' as const,
                        name: 'Capital Raising',
                        marker: {
                          symbol: 'triangle-down',
                          size: 12,
                          color: '#f59e0b',
                          line: { color: '#0f172a', width: 1 },
                        },
                        yaxis: 'y2',
                        text: plotData.capitalRaisings.map(cr =>
                          `${cr.raising_type}${cr.amount_raised ? ` $${(cr.amount_raised / 1e6).toFixed(1)}M` : ''}`
                        ),
                        hovertemplate: '%{text}<br>%{x}<extra>Capital Raising</extra>',
                      }] : []),
                    ]}
                    layout={{
                      autosize: true,
                      margin: { l: 12, r: 64, t: 8, b: 36 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      dragmode: 'pan',
                      xaxis: {
                        showgrid: true,
                        gridcolor: 'rgba(148, 163, 184, 0.06)',
                        gridwidth: 1,
                        color: '#94a3b8',
                        tickfont: { size: 10, color: '#94a3b8' },
                        tickformat: chartPeriod === '1D' ? '%H:%M' : chartPeriod === '5Y' || chartPeriod === '1Y' ? '%b %Y' : '%b %d',
                        rangeslider: { visible: false },
                        showspikes: true,
                        spikemode: 'across',
                        spikesnap: 'cursor',
                        spikecolor: 'rgba(148, 163, 184, 0.4)',
                        spikethickness: 1,
                        spikedash: 'dot',
                        showline: false,
                        zeroline: false,
                        fixedrange: false,
                      },
                      yaxis: {
                        showgrid: false,
                        color: '#94a3b8',
                        tickfont: { size: 10, color: '#64748b' },
                        domain: (showVolume && !hasOverlays) ? [0, 0.22] : [0, 0],
                        showticklabels: showVolume && !hasOverlays,
                        zeroline: false,
                        fixedrange: true,
                      },
                      yaxis2: hasOverlays ? {
                        showgrid: true,
                        gridcolor: 'rgba(148, 163, 184, 0.08)',
                        gridwidth: 1,
                        color: '#94a3b8',
                        tickfont: { size: 11, color: '#cbd5e1' },
                        ticksuffix: '%',
                        tickformat: '+,.1f',
                        domain: [0, 1],
                        side: 'right',
                        autorange: false,
                        range: [normYMin, normYMax],
                        zeroline: true,
                        zerolinecolor: 'rgba(148, 163, 184, 0.25)',
                        zerolinewidth: 1,
                        showline: false,
                        showspikes: true,
                        spikemode: 'across',
                        spikesnap: 'cursor',
                        spikecolor: 'rgba(148, 163, 184, 0.4)',
                        spikethickness: 1,
                        spikedash: 'dot',
                        nticks: 6,
                        fixedrange: false,
                      } : {
                        showgrid: true,
                        gridcolor: 'rgba(148, 163, 184, 0.08)',
                        gridwidth: 1,
                        color: '#94a3b8',
                        tickfont: { size: 11, color: '#cbd5e1' },
                        tickprefix: '$',
                        tickformat: tickFmt,
                        domain: showVolume ? [0.27, 1] : [0, 1],
                        side: 'right',
                        autorange: false,
                        range: [yMin, yMax],
                        zeroline: false,
                        showline: false,
                        showspikes: true,
                        spikemode: 'across',
                        spikesnap: 'cursor',
                        spikecolor: 'rgba(148, 163, 184, 0.4)',
                        spikethickness: 1,
                        spikedash: 'dot',
                        nticks: 6,
                        fixedrange: false,
                      },
                      hovermode: 'x unified',
                      hoverlabel: {
                        bgcolor: 'rgba(15, 23, 42, 0.95)',
                        bordercolor: 'rgba(148, 163, 184, 0.3)',
                        font: { color: '#f1f5f9', size: 11, family: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
                      },
                      showlegend: hasOverlays,
                      legend: hasOverlays ? {
                        orientation: 'h' as const,
                        x: 0,
                        y: 1.06,
                        xanchor: 'left' as const,
                        font: { size: 10, color: '#cbd5e1' },
                        bgcolor: 'rgba(0,0,0,0)',
                      } : undefined,
                      shapes: hasOverlays ? [] : [
                        // Last-price reference line — TradingView staple.
                        {
                          type: 'line',
                          xref: 'paper',
                          x0: 0,
                          x1: 1,
                          yref: 'y2',
                          y0: plotData.closes[plotData.closes.length - 1],
                          y1: plotData.closes[plotData.closes.length - 1],
                          line: {
                            color: lineColor,
                            width: 1,
                            dash: 'dot',
                          },
                        },
                      ],
                      annotations: hasOverlays ? [
                        // % change label for the active ticker pinned right.
                        {
                          xref: 'paper',
                          x: 1,
                          xanchor: 'left',
                          yref: 'y2',
                          y: lastPct,
                          yanchor: 'middle',
                          text: ` ${lastPct >= 0 ? '+' : ''}${lastPct.toFixed(2)}% `,
                          showarrow: false,
                          font: { size: 10, color: '#0f172a', family: 'ui-monospace, monospace' },
                          bgcolor: lineColor,
                          bordercolor: lineColor,
                          borderwidth: 0,
                          borderpad: 2,
                        },
                      ] : [
                        // Last-price label pinned to right axis.
                        {
                          xref: 'paper',
                          x: 1,
                          xanchor: 'left',
                          yref: 'y2',
                          y: lastClose,
                          yanchor: 'middle',
                          text: ` $${lastClose.toFixed(dp)} `,
                          showarrow: false,
                          font: { size: 10, color: '#0f172a', family: 'ui-monospace, monospace' },
                          bgcolor: lineColor,
                          bordercolor: lineColor,
                          borderwidth: 0,
                          borderpad: 2,
                        },
                      ],
                    }}
                    config={{
                      displayModeBar: false,
                      responsive: true,
                      scrollZoom: true,
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                    );
                  })()
                ) : (
                  <div 
                    className="h-full rounded-lg flex flex-col items-center justify-center gap-2"
                    style={{ backgroundColor: `${commodityColor}10` }}
                  >
                    <span className="text-metallic-500">
                      {chartData?.source === 'none' 
                        ? 'Chart data temporarily unavailable' 
                        : 'Loading chart data...'}
                    </span>
                    <button
                      onClick={() => fetchChartData(chartPeriod)}
                      className="text-sm text-primary-400 hover:text-primary-300"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
              
              {chartData?.source && chartData.candles.length > 0 && (
                <div className="mt-2 flex items-center justify-between text-xs text-metallic-600">
                  <span>{chartData.candles.length} data points</span>
                  <span>Source: {chartData.source}</span>
                </div>
              )}
              
              {/* Capital Raisings Table */}
              {showCapitalRaisings && capitalRaisings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-metallic-800">
                  <h3 className="text-sm font-medium text-metallic-300 mb-2">Capital Raisings</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {capitalRaisings.slice(0, 5).map((cr, i) => (
                      <div key={cr.id || i} className="flex items-center justify-between text-xs bg-metallic-800/50 rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400">▼</span>
                          <span className="text-metallic-400">{cr.announcement_date?.split('T')[0] ?? 'N/A'}</span>
                          <span className="text-metallic-300">{cr.raising_type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {cr.amount_raised && (
                            <span className="text-green-400">${(cr.amount_raised / 1e6).toFixed(1)}M</span>
                          )}
                          {cr.price_per_share && (
                            <span className="text-metallic-400">${cr.price_per_share.toFixed(3)}/sh</span>
                          )}
                          {cr.discount_percent && (
                            <span className="text-red-400">-{cr.discount_percent.toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Extracted Mining Data Section */}
            <CompanyMiningDataWidget symbol={ticker} className="bg-metallic-900 border border-metallic-800 rounded-xl" />

            {/* Multi-factor data coverage / stock brief */}
            <StockBriefPanel ticker={ticker} exchange={exchangeParam || companyData?.exchange || 'ASX'} />

            {/* Drill intercepts (last 5 years) */}
            <DrillIntercepts ticker={ticker} />

            {/* Lassonde Curve Section */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100">Lassonde Curve Position</h2>
                {lassondeData && (
                  <span className={`text-xs px-2 py-1 rounded ${lassondeData.confidence === 'high' ? 'bg-green-500/20 text-green-400' : lassondeData.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {lassondeData.confidence} confidence
                  </span>
                )}
              </div>

              {lassondeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                </div>
              ) : lassondeData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-metallic-400">
                    <span>{lassondeData.stage}</span>
                    <span>{lassondeData.ticker}</span>
                  </div>

                  <div className="relative">
                    <div className="h-2 rounded-full bg-metallic-800" />
                    <div
                      className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500"
                      style={{ width: `${((lassondeIndex + 1) / LASSONDE_STAGES.length) * 100}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
                      {LASSONDE_STAGES.map((stage, idx) => (
                        <div
                          key={stage}
                          className={`w-3 h-3 rounded-full border ${idx <= lassondeIndex ? 'bg-primary-400 border-primary-300' : 'bg-metallic-700 border-metallic-600'}`}
                          title={stage}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-metallic-400">
                    <div className="bg-metallic-800/50 rounded-lg px-3 py-2">Drilling: <span className="text-metallic-200">{lassondeData.signals.drilling_count}</span></div>
                    <div className="bg-metallic-800/50 rounded-lg px-3 py-2">Intercepts: <span className="text-metallic-200">{lassondeData.signals.intercepts_count}</span></div>
                    <div className="bg-metallic-800/50 rounded-lg px-3 py-2">Resources: <span className="text-metallic-200">{lassondeData.signals.resources_count}</span></div>
                    <div className="bg-metallic-800/50 rounded-lg px-3 py-2">Economics: <span className="text-metallic-200">{lassondeData.signals.economics_count}</span></div>
                    <div className="bg-metallic-800/50 rounded-lg px-3 py-2">Feasibility: <span className="text-metallic-200">{lassondeData.signals.feasibility_events}</span></div>
                    <div className="bg-metallic-800/50 rounded-lg px-3 py-2">Production: <span className="text-metallic-200">{lassondeData.signals.production_events}</span></div>
                  </div>

                  {lassondeData.projects && lassondeData.projects.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-metallic-300 mb-2">Project Placement</h3>
                      <div className="space-y-2">
                        {lassondeData.projects.slice(0, 5).map((proj) => (
                          <div key={proj.project_name} className="flex items-center justify-between text-xs bg-metallic-800/50 rounded px-3 py-2">
                            <span className="text-metallic-200">{proj.project_name}</span>
                            <span className="text-metallic-400">{proj.stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-metallic-500">No Lassonde data available for {ticker}.</p>
              )}
            </section>

            {/* All Announcements Section */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100">All Announcements</h2>
                <span className="text-sm text-metallic-500">{announcements.length} found</span>
              </div>
              {announcements.length === 0 ? (
                <p className="text-metallic-500 text-center py-8">No announcements found for {ticker}</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {announcements.map((ann, i) => (
                    <a
                      key={ann.id || i}
                      href={ann.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors border border-metallic-700/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-metallic-200 mb-2">{ann.title}</div>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-xs text-metallic-500">{ann.date}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(ann.announcement_type || 'other')}`}>
                              {(ann.announcement_type || 'other').replace(/_/g, ' ')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(ann.sentiment || 'neutral')}`}>
                              {(ann.sentiment || 'neutral').replace(/_/g, ' ')}
                            </span>
                            {ann.is_price_sensitive && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                Price Sensitive
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-metallic-500 flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </section>

            {/* Geoscience Australia Intelligence Section */}
            <CompanyGeoscienceWidget symbol={ticker} showFullDetails={false} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Latest Announcement */}
            {announcements.length > 0 && (
              <section className="bg-gradient-to-br from-primary-500/10 to-metallic-900 border border-primary-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-metallic-100">Latest Announcement</h2>
                  <FileText className="w-5 h-5 text-primary-400" />
                </div>
                <a
                  href={announcements[0].url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="text-sm font-medium text-metallic-100 mb-2 line-clamp-3">
                    {announcements[0].title}
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className="text-xs text-metallic-400">{announcements[0].date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(announcements[0].announcement_type || 'other')}`}>
                      {(announcements[0].announcement_type || 'other').replace(/_/g, ' ')}
                    </span>
                    {announcements[0].is_price_sensitive && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                        ⚠ Price Sensitive
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    Read full announcement <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              </section>
            )}

            {/* Recent Announcements */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100">Recent Announcements</h2>
                <FileText className="w-5 h-5 text-metallic-500" />
              </div>
              {announcements.length === 0 ? (
                <p className="text-metallic-500 text-sm text-center py-4">No recent announcements</p>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(1, 6).map((ann, i) => (
                    <a
                      key={ann.id || i}
                      href={ann.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                    >
                      <div className="text-sm font-medium text-metallic-200 line-clamp-2">{ann.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-metallic-500">{ann.date}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(ann.sentiment || 'neutral')}`}>
                          {(ann.sentiment || 'neutral').replace(/_/g, ' ')}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {announcements.length > 5 && (
                <button 
                  onClick={() => document.getElementById('all-announcements')?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-center text-sm text-primary-400 hover:text-primary-300 mt-4 w-full"
                >
                  View all {announcements.length} announcements →
                </button>
              )}
            </section>

            {/* Quick Actions */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/analysis/compare?companies=${ticker}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">Compare with peers</span>
                </Link>
                <Link
                  href={`/analysis/map?company=${ticker}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">View on map</span>
                </Link>
                <Link
                  href="/analysis/geoscience"
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                >
                  <Layers className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">Geoscience Australia data</span>
                </Link>
                <Link
                  href={`/analysis/announcements?company=${ticker}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                >
                  <FileText className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">Search announcements</span>
                </Link>
                <button
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors w-full"
                >
                  <Download className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">Export company data</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
