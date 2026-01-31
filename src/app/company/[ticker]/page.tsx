'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, ExternalLink, MapPin, Building2, Calendar, TrendingUp, TrendingDown,
  Bookmark, BookmarkCheck, Bell, Share2, FileText, Hammer, Globe, ChevronRight,
  BarChart3, DollarSign, Users, Layers, Download, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';
import CompanyGeoscienceWidget from '@/components/dashboard/CompanyGeoscienceWidget';import CompanyMiningDataWidget from '@/components/mining/CompanyMiningDataWidget';
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

export default function CompanyProfile() {
  const params = useParams();
  const ticker = (params.ticker as string)?.toUpperCase() || '';
  
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
        fetch(`${API_URL}/api/v1/market/company/${ticker}/details`).catch(() => null),
        fetch(`${API_URL}/api/v1/announcements/company/${ticker}?days_back=90&limit=20`).catch(() => null),
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
        announcements = annData.announcements || [];
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                    ${marketData.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>${Math.abs(marketData.change).toFixed(2)}</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">About</h2>
              <p className="text-metallic-400 leading-relaxed">
                {description || `${name} (${ticker}) is an ${exchange}-listed mining company focused on ${commodity} exploration and production.`}
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
                    value={marketData.marketCap > 0 ? `$${(marketData.marketCap / 1e9).toFixed(1)}B` : 'N/A'}
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
                    value={marketData.high52w > 0 ? `$${marketData.low52w.toFixed(2)} - $${marketData.high52w.toFixed(2)}` : 'N/A'}
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
              <div className="flex items-center gap-4 mb-4 text-sm">
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
              
              {/* Chart */}
              <div className={showVolume ? "h-96" : "h-80"}>
                {chartLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : plotData ? (
                  <Plot
                    data={[
                      // Main price trace (line or candlestick)
                      chartType === 'candlestick' ? {
                        x: plotData.dates,
                        open: plotData.opens,
                        high: plotData.highs,
                        low: plotData.lows,
                        close: plotData.closes,
                        type: 'candlestick' as const,
                        name: 'Price',
                        increasing: { line: { color: '#22c55e' } },
                        decreasing: { line: { color: '#ef4444' } },
                        yaxis: 'y2',
                      } : {
                        x: plotData.dates,
                        y: plotData.closes,
                        type: 'scatter' as const,
                        mode: 'lines' as const,
                        fill: 'tozeroy' as const,
                        name: 'Price',
                        line: { 
                          color: plotData.isPositive ? '#22c55e' : '#ef4444',
                          width: 2,
                        },
                        fillcolor: plotData.isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        hovertemplate: '%{x}<br>$%{y:.4f}<extra></extra>',
                        yaxis: 'y2',
                      },
                      // Volume bars
                      ...(showVolume ? [{
                        x: plotData.dates,
                        y: plotData.volumes,
                        type: 'bar' as const,
                        name: 'Volume',
                        marker: {
                          color: plotData.closes.map((close, i) => 
                            i > 0 && close >= plotData.closes[i - 1] ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                          ),
                        },
                        yaxis: 'y',
                        hovertemplate: '%{x}<br>Vol: %{y:,.0f}<extra></extra>',
                      }] : []),
                      // Capital raisings markers
                      ...(showCapitalRaisings && plotData.capitalRaisings.length > 0 ? [{
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
                          size: 14,
                          color: '#f59e0b',
                          line: { color: '#ffffff', width: 1 },
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
                      margin: { l: 60, r: 20, t: 20, b: 40 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      xaxis: {
                        showgrid: false,
                        color: '#6b7280',
                        tickformat: chartPeriod === '1D' ? '%H:%M' : '%b %d',
                        rangeslider: { visible: false },
                      },
                      yaxis: {
                        showgrid: false,
                        color: '#6b7280',
                        domain: showVolume ? [0, 0.25] : [0, 0],
                        showticklabels: showVolume,
                        title: showVolume ? { text: 'Volume' } : undefined,
                      },
                      yaxis2: {
                        showgrid: true,
                        gridcolor: 'rgba(107, 114, 128, 0.2)',
                        color: '#6b7280',
                        tickprefix: '$',
                        domain: showVolume ? [0.3, 1] : [0, 1],
                        side: 'right',
                      },
                      hovermode: 'x unified',
                      hoverlabel: {
                        bgcolor: '#1f2937',
                        bordercolor: '#374151',
                        font: { color: '#f3f4f6' },
                      },
                      showlegend: false,
                      legend: {
                        x: 0,
                        y: 1.1,
                        orientation: 'h',
                        font: { color: '#9ca3af' },
                      },
                    }}
                    config={{
                      displayModeBar: false,
                      responsive: true,
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
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
                          <span className="text-metallic-400">{cr.announcement_date.split('T')[0]}</span>
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
                            <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(ann.announcement_type)}`}>
                              {ann.announcement_type.replace(/_/g, ' ')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(ann.sentiment)}`}>
                              {ann.sentiment.replace(/_/g, ' ')}
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
                    <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(announcements[0].announcement_type)}`}>
                      {announcements[0].announcement_type.replace(/_/g, ' ')}
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
                        <span className={`text-xs px-2 py-0.5 rounded ${getSentimentColor(ann.sentiment)}`}>
                          {ann.sentiment.replace(/_/g, ' ')}
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
