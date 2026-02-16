'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, Building2, MapPin, TrendingUp, TrendingDown,
  Search, ChevronRight, Gem, FileText, Clock,
  Sparkles, MessageSquare, Target, AlertTriangle, Bell, Activity,
  BarChart3, Briefcase, Bookmark, Database, Layers, Factory, Hammer, Map,
  RefreshCw, DollarSign, Fuel, Zap
} from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_BASE = RAILWAY_API_URL;

// Interface for dynamic stats from API
interface ExchangeDetail {
  name: string;
  count: number;
}

interface SpatialSummary {
  total_companies: number;
  by_exchange: Record<string, number>;
  by_commodity: [string, number][];
  total_countries: number;
  exchange_details?: ExchangeDetail[];
}

// Interface for commodity prices
interface CommodityPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  currency: string;
  category: string;
}

// Interface for recent announcements
interface RecentAnnouncement {
  id: number;
  ticker: string;
  exchange: string;
  article_title: string;
  article_date: string;
  event_type: string | null;
  sentiment_label: string | null;
}

// AI Research Analyst features from the design
const aiFeatures = [
  {
    id: 'announcement-interpreter',
    title: 'Announcement Interpreter',
    description: 'AI parses dense technical reports and extracts key metrics, drill results, and resource updates in seconds.',
    icon: FileText,
    badge: 'Save 5+ hours per week',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'natural-language-search',
    title: 'Natural Language Search',
    description: "Ask questions like 'Show me gold explorers in Canada with >1M oz resource trading below $50/oz'",
    icon: MessageSquare,
    badge: 'No complex filters needed',
    badgeColor: 'bg-cyan-500/20 text-cyan-400',
  },
  {
    id: 'valuation-explainer',
    title: 'Valuation Explainer',
    description: 'AI explains why Company X trades at 0.4x NAV vs peer average 0.7x — instant investment thesis.',
    icon: Target,
    badge: 'Understand the discount',
    badgeColor: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'risk-detection',
    title: 'Risk Detection',
    description: 'Auto-detect red flags: jurisdiction risk, management changes, dilution patterns, insider selling.',
    icon: AlertTriangle,
    badge: 'Protect your capital',
    badgeColor: 'bg-red-500/20 text-red-400',
    iconColor: 'text-red-400',
  },
  {
    id: 'opportunity-alerts',
    title: 'Opportunity Alerts',
    description: 'Get notified when a company announces results that historically lead to significant re-rates.',
    icon: Bell,
    badge: 'Be first to act',
    badgeColor: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'sentiment-scoring',
    title: 'Sentiment Scoring',
    description: 'Aggregate news, social media, and insider activity into a daily sentiment score for each stock.',
    icon: Activity,
    badge: 'Gauge market mood',
    badgeColor: 'bg-blue-500/20 text-blue-400',
  },
];

// Spatial Explorer sub-categories (renamed from Global Spatial View)
const spatialCategories = [
  {
    id: 'global-map',
    title: 'Global Map View',
    description: 'Interactive world map of all projects',
    href: '/analysis/global',
    icon: Globe,
  },
  {
    id: 'by-exchange',
    title: 'By Exchange',
    description: 'TSX, ASX, NYSE, JSE, and more',
    href: '/analysis/exchanges',
    icon: Building2,
  },
  {
    id: 'by-commodity',
    title: 'By Commodity',
    description: '30+ commodities tracked',
    href: '/analysis/commodities',
    icon: Gem,
  },
  {
    id: 'by-country',
    title: 'By Country',
    description: 'Filter by jurisdiction',
    href: '/analysis/countries',
    icon: MapPin,
  },
];

// GeoScience sub-categories (NEW - promoted to main modal)
const geoscienceCategories = [
  {
    id: 'australia',
    title: 'Australia',
    description: 'Geoscience Australia data',
    href: '/analysis/australia',
    icon: Map,
    flag: '🇦🇺',
  },
  {
    id: 'canada',
    title: 'Canada',
    description: 'NRCan geological surveys',
    href: '/analysis/geoscience/canada',
    icon: Map,
    flag: '🇨🇦',
  },
  {
    id: 'usa',
    title: 'United States',
    description: 'USGS mineral resources',
    href: '/analysis/geoscience/usa',
    icon: Map,
    flag: '🇺🇸',
  },
  {
    id: 'south-africa',
    title: 'South Africa',
    description: 'CGS mining data',
    href: '/analysis/geoscience/south-africa',
    icon: Map,
    flag: '🇿🇦',
  },
];

// Mining Analytics sub-categories
const analyticsCategories = [
  {
    id: 'commodity-prices',
    title: 'Commodity Prices',
    description: 'Spot prices & movers',
    href: '/analysis/prices',
    icon: DollarSign,
  },
  {
    id: 'market-data',
    title: 'Market Data',
    description: 'Real-time prices & volume',
    href: '/analysis/market',
    icon: TrendingUp,
  },
  {
    id: 'announcements',
    title: 'News & Announcements',
    description: 'Latest company news',
    href: '/news',
    icon: FileText,
  },
  {
    id: 'exploration',
    title: 'Exploration Data',
    description: 'Drilling & surveys',
    href: '/analysis/exploration',
    icon: Factory,
  },
  {
    id: 'project-stages',
    title: 'Project Stages',
    description: 'Explorer to producer',
    href: '/analysis/stages',
    icon: Hammer,
  },
  {
    id: 'compare',
    title: 'Peer Comparison',
    description: 'Side-by-side analysis',
    href: '/analysis/compare',
    icon: BarChart3,
  },
  {
    id: 'constraints',
    title: 'Legal Constraints',
    description: 'Heritage & environmental',
    href: '/analysis/constraints',
    icon: MapPin,
  },
];

export default function AnalysisDashboard() {
  const [dynamicStats, setDynamicStats] = useState<SpatialSummary | null>(null);
  const [commodities, setCommodities] = useState<CommodityPrice[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<RecentAnnouncement[]>([]);
  const [loadingCommodities, setLoadingCommodities] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  
  // Fetch all dynamic data from the API
  useEffect(() => {
    async function fetchAllData() {
      // Fetch spatial summary
      try {
        const response = await fetch(`${API_BASE}/api/v1/spatial/summary`);
        if (response.ok) {
          const data = await response.json();
          setDynamicStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch spatial summary:', err);
      }
      
      // Fetch commodity prices
      try {
        const response = await fetch(`${API_BASE}/api/v1/market/commodities`);
        if (response.ok) {
          const data = await response.json();
          setCommodities(data.commodities || []);
        }
      } catch (err) {
        console.error('Failed to fetch commodities:', err);
      } finally {
        setLoadingCommodities(false);
      }
      
      // Fetch recent announcements/news hits
      try {
        const response = await fetch(`${API_BASE}/api/v1/news-hits/recent?days=7&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setRecentAnnouncements(data.news_hits || []);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoadingAnnouncements(false);
      }
    }
    fetchAllData();
  }, []);

  // Helper to format time ago
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  // Helper to format event type
  const formatEventType = (eventType: string | null) => {
    if (!eventType) return 'News';
    return eventType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-metallic-100">Analysis Dashboard</h1>
              <p className="text-metallic-400 mt-1">Your complete mining intelligence platform</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 hover:bg-metallic-700 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                <span>Portfolio</span>
              </Link>
              <Link
                href="/watchlist"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 hover:bg-metallic-700 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>Watchlist</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
              <div className="text-2xl font-bold text-primary-400">
                {dynamicStats ? dynamicStats.total_companies.toLocaleString() : '1,000+'}
              </div>
              <div className="text-sm text-metallic-400">Companies Tracked</div>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50 group relative">
              <div className="text-2xl font-bold text-primary-400">
                {dynamicStats ? Object.keys(dynamicStats.by_exchange || {}).length : 6}
              </div>
              <div className="text-sm text-metallic-400">Exchanges</div>
              {/* Exchange breakdown tooltip */}
              {dynamicStats?.exchange_details && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-metallic-900 border border-metallic-700 rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10 pointer-events-none">
                  <div className="text-xs font-medium text-metallic-300 mb-2">Exchange Breakdown</div>
                  {dynamicStats.exchange_details.slice(0, 6).map((ex) => (
                    <div key={ex.name} className="flex justify-between text-xs py-0.5">
                      <span className="text-metallic-400">{ex.name}</span>
                      <span className="text-primary-400 font-medium">{ex.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
              <div className="text-2xl font-bold text-primary-400">
                {dynamicStats ? `${dynamicStats.total_countries}+` : '40+'}
              </div>
              <div className="text-sm text-metallic-400">Countries</div>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
              <div className="text-2xl font-bold text-primary-400">24/7</div>
              <div className="text-sm text-metallic-400">Data Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Four Main Modals */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Modal 1: Spatial Explorer (renamed from Global Spatial View) */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-colors group">
            <Link href="/analysis/global" className="block">
              <div className="p-6 border-b border-metallic-800 bg-gradient-to-br from-indigo-500/10 to-purple-600/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                    LIVE
                  </span>
                </div>
                <h2 className="text-xl font-bold text-metallic-100 group-hover:text-primary-400 transition-colors">
                  Spatial Explorer
                </h2>
                <p className="text-metallic-400 mt-2 text-sm">
                  Interactive maps with {dynamicStats ? dynamicStats.total_companies.toLocaleString() : '1,000'}+ mining projects. View companies by location, exchange, commodity, or country with real-time filtering.
                </p>
              </div>
            </Link>
            
            <div className="p-4 space-y-2">
              {spatialCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-metallic-800/70 transition-colors group/item"
                >
                  <div className="w-9 h-9 rounded-lg bg-metallic-800 flex items-center justify-center group-hover/item:bg-primary-500/20 transition-colors">
                    <cat.icon className="w-4 h-4 text-metallic-400 group-hover/item:text-primary-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-metallic-200 group-hover/item:text-primary-400 transition-colors">
                      {cat.title}
                    </div>
                    <div className="text-xs text-metallic-500">{cat.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-metallic-600 group-hover/item:text-primary-400 group-hover/item:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <Link
                href="/analysis/global"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                <MapPin className="w-4 h-4" />
                Open Interactive Map
              </Link>
            </div>
          </div>

          {/* Modal 2: GeoScience Data (NEW - promoted to main modal) */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-colors group">
            <Link href="/analysis/australia" className="block">
              <div className="p-6 border-b border-metallic-800 bg-gradient-to-br from-amber-500/10 to-orange-600/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                    GOVERNMENT DATA
                  </span>
                </div>
                <h2 className="text-xl font-bold text-metallic-100 group-hover:text-amber-400 transition-colors">
                  GeoScience Data
                </h2>
                <p className="text-metallic-400 mt-2 text-sm">
                  Access official government geological surveys, mineral occurrence databases, and mining tenement data from major mining jurisdictions worldwide.
                </p>
              </div>
            </Link>
            
            <div className="p-4 space-y-2">
              {geoscienceCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-metallic-800/70 transition-colors group/item"
                >
                  <div className="w-9 h-9 rounded-lg bg-metallic-800 flex items-center justify-center text-lg">
                    {cat.flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-metallic-200 group-hover/item:text-amber-400 transition-colors">
                      {cat.title}
                    </div>
                    <div className="text-xs text-metallic-500">{cat.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-metallic-600 group-hover/item:text-amber-400 group-hover/item:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <Link
                href="/analysis/australia"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                <Database className="w-4 h-4" />
                Explore GeoScience Data
              </Link>
            </div>
          </div>

          {/* Modal 3: Mining Analytics */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-colors group">
            <Link href="/analysis/market" className="block">
              <div className="p-6 border-b border-metallic-800 bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                    ANALYTICS
                  </span>
                </div>
                <h2 className="text-xl font-bold text-metallic-100 group-hover:text-cyan-400 transition-colors">
                  Mining Analytics
                </h2>
                <p className="text-metallic-400 mt-2 text-sm">
                  Comprehensive analysis tools including real-time market data, company announcements, peer comparison, and project stage filtering.
                </p>
              </div>
            </Link>
            
            <div className="p-4 space-y-2">
              {analyticsCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-metallic-800/70 transition-colors group/item"
                >
                  <div className="w-9 h-9 rounded-lg bg-metallic-800 flex items-center justify-center group-hover/item:bg-cyan-500/20 transition-colors">
                    <cat.icon className="w-4 h-4 text-metallic-400 group-hover/item:text-cyan-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-metallic-200 group-hover/item:text-cyan-400 transition-colors">
                        {cat.title}
                      </span>
                    </div>
                    <div className="text-xs text-metallic-500">{cat.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-metallic-600 group-hover/item:text-cyan-400 group-hover/item:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <Link
                href="/analysis/market"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Open Analytics Dashboard
              </Link>
            </div>
          </div>

          {/* Modal 4: AI Research Analyst */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors">
            <div className="p-6 border-b border-metallic-800 bg-gradient-to-br from-emerald-500/10 to-teal-600/10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Powered by AI
                </span>
              </div>
              <h2 className="text-xl font-bold text-metallic-100">
                AI Research Analyst
              </h2>
              <p className="text-metallic-400 mt-2 text-sm">
                While competitors give you raw data, InvestOre interprets it. Our AI reads announcements, flags opportunities, and explains mispriced stocks.
              </p>
            </div>
            
            <div className="p-4 space-y-2">
              {aiFeatures.slice(0, 4).map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/30 border border-metallic-700/50 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className={`w-4 h-4 ${feature.iconColor || 'text-emerald-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-metallic-200">{feature.title}</div>
                    <div className="text-xs text-metallic-500">{feature.badge}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 pt-0">
              <Link
                href="/analysis/ai-analyst"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Open AI Analyst
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section - Recent Activity & Search */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Announcements */}
          <div className="lg:col-span-2 bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-metallic-100">Recent Announcements</h3>
              <Link href="/news" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loadingAnnouncements ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-metallic-500" />
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <div className="text-center py-8 text-metallic-500">No recent announcements</div>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-metallic-800/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-metallic-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-metallic-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-primary-400">{item.ticker}.{item.exchange}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                          item.sentiment_label === 'positive' ? 'bg-green-500/20 text-green-400' :
                          item.sentiment_label === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-metallic-700 text-metallic-300'
                        }`}>
                          {formatEventType(item.event_type)}
                        </span>
                      </div>
                      <p className="text-sm text-metallic-200 truncate">{item.article_title}</p>
                    </div>
                    <div className="text-xs text-metallic-500 flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(item.article_date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commodity Prices Widget */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary-400" />
                Spot Prices
              </h3>
              <Link href="/analysis/prices" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                All prices
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loadingCommodities ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-metallic-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {commodities.slice(0, 8).map((commodity) => (
                  <div key={commodity.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-metallic-800/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-metallic-200">{commodity.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-metallic-100">
                        ${commodity.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        <span className="text-xs text-metallic-500">/{commodity.unit}</span>
                      </span>
                      <span className={`text-xs font-medium flex items-center gap-0.5 ${
                        commodity.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {commodity.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
