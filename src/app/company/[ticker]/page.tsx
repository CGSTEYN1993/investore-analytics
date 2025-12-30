'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, ExternalLink, MapPin, Building2, Calendar, TrendingUp, TrendingDown,
  Bookmark, BookmarkCheck, Bell, Share2, FileText, Hammer, Globe, ChevronRight,
  BarChart3, DollarSign, Users, Layers, Download, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

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

export default function CompanyProfile() {
  const params = useParams();
  const ticker = (params.ticker as string)?.toUpperCase() || '';
  
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const fetchCompanyData = async () => {
    if (!ticker) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch market data and announcements in parallel
      const [quoteRes, announcementsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/market/quote/${ticker}`).catch(() => null),
        fetch(`${API_URL}/api/v1/announcements/company/${ticker}?days_back=90&limit=20`).catch(() => null)
      ]);
      
      let marketData: MarketData | null = null;
      let announcements: Announcement[] = [];
      let companyName = ticker;
      let commodity = 'Unknown';
      let exchange = 'ASX';
      
      // Parse market data
      if (quoteRes && quoteRes.ok) {
        const quote = await quoteRes.json();
        companyName = quote.name || ticker;
        commodity = quote.commodity || 'Unknown';
        exchange = quote.exchange || 'ASX';
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
      
      setCompanyData({
        ticker,
        exchange,
        name: companyName,
        commodity,
        marketData,
        announcements,
      });
      
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError('Unable to fetch company data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [ticker]);

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

  const { marketData, announcements, name, exchange, commodity } = companyData;
  const commodityColor = getCommodityColor(commodity);
  const isPositive = marketData ? marketData.changePercent >= 0 : true;

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
              {/* Company Logo/Symbol */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: commodityColor }}
              >
                {commodity.substring(0, 2)}
              </div>
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
                  <button
                    onClick={fetchCompanyData}
                    className="flex items-center gap-1 text-primary-400 hover:text-primary-300"
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
                {name} ({ticker}) is an {exchange}-listed mining company focused on {commodity} exploration and production.
              </p>
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

            {/* Price Chart Placeholder */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100">Price Chart</h2>
                <div className="flex items-center gap-2">
                  {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((period) => (
                    <button
                      key={period}
                      className="px-3 py-1 text-sm rounded-lg bg-metallic-800 text-metallic-400 hover:bg-metallic-700 transition-colors"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              {/* Chart placeholder - would integrate actual charting library */}
              <div 
                className="h-64 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${commodityColor}10` }}
              >
                <span className="text-metallic-500">Interactive chart would display here</span>
              </div>
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
