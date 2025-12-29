'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, ChevronDown, ArrowUpRight, ArrowDownRight,
  FileText, Calendar, Tag, Building2, Bell, ExternalLink,
  TrendingUp, TrendingDown, Newspaper, AlertCircle, Loader2, Sparkles, ArrowLeft
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

// Announcement types with colors
const announcementTypes = [
  { id: 'all', name: 'All News', color: '#9CA3AF' },
  { id: 'drilling', name: 'Drilling Results', color: '#10B981' },
  { id: 'resource', name: 'Resource Updates', color: '#3B82F6' },
  { id: 'financial', name: 'Financial Reports', color: '#F59E0B' },
  { id: 'corporate', name: 'Corporate News', color: '#8B5CF6' },
  { id: 'regulatory', name: 'Regulatory Filings', color: '#EF4444' },
  { id: 'operational', name: 'Operational Updates', color: '#06B6D4' },
  { id: 'general', name: 'General', color: '#6B7280' },
];

// Map commodity names to short codes
const commodityToCode = (commodity: string): string => {
  const map: Record<string, string> = {
    'gold': 'Au', 'Gold': 'Au',
    'silver': 'Ag', 'Silver': 'Ag',
    'copper': 'Cu', 'Copper': 'Cu',
    'lithium': 'Li', 'Lithium': 'Li',
    'nickel': 'Ni', 'Nickel': 'Ni',
    'uranium': 'U', 'Uranium': 'U',
    'zinc': 'Zn', 'Zinc': 'Zn',
    'iron': 'Fe', 'Iron': 'Fe', 'Iron Ore': 'Fe',
    'coal': 'C', 'Coal': 'C',
    'rare earths': 'REE', 'Rare Earths': 'REE',
    'cobalt': 'Co', 'Cobalt': 'Co',
    'platinum': 'Pt', 'Platinum': 'Pt',
    'palladium': 'Pd', 'Palladium': 'Pd',
  };
  return map[commodity] || commodity?.substring(0, 2) || 'Au';
};

// Announcement type interface
interface Announcement {
  id: string | number;
  company: string;
  ticker: string;
  commodity: string;
  type: string;
  title: string;
  summary: string;
  date: string;
  time: string;
  priceChange: number;
  source: string;
  isBreaking: boolean;
  url?: string;
}

function TypeBadge({ type }: { type: string }) {
  const typeConfig = announcementTypes.find(t => t.id === type);
  if (!typeConfig) {
    // Fallback for unmapped types
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
        {type}
      </span>
    );
  }

  return (
    <span 
      className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
    >
      {typeConfig.name}
    </span>
  );
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const isPositive = announcement.priceChange >= 0;
  const commodityColor = getCommodityColor(announcement.commodity);

  return (
    <div className={`bg-metallic-900 border rounded-xl p-6 transition-all hover:shadow-lg ${
      announcement.isBreaking ? 'border-amber-500/50' : 'border-metallic-800 hover:border-primary-500/50'
    }`}>
      {/* Breaking Badge */}
      {announcement.isBreaking && (
        <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-3">
          <AlertCircle className="w-4 h-4" />
          BREAKING NEWS
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/company/${announcement.ticker}`}>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity"
              style={{ backgroundColor: commodityColor }}
            >
              {announcement.commodity}
            </div>
          </Link>
          <div>
            <Link 
              href={`/company/${announcement.ticker}`}
              className="font-medium text-metallic-100 hover:text-primary-400 transition-colors"
            >
              {announcement.ticker}
            </Link>
            <span className="text-metallic-500 ml-2">• {announcement.company}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
          isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? '+' : ''}{announcement.priceChange}%
        </div>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-metallic-100 mb-2 line-clamp-2">
        {announcement.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-metallic-400 mb-4 line-clamp-2">
        {announcement.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TypeBadge type={announcement.type} />
          <div className="flex items-center gap-1.5 text-xs text-metallic-500">
            <Calendar className="w-3 h-3" />
            {announcement.date} {announcement.time}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-metallic-500">{announcement.source}</span>
          <button className="p-1.5 rounded-lg hover:bg-metallic-800 text-metallic-500 hover:text-metallic-300 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCommodity, setSelectedCommodity] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedExchange, setSelectedExchange] = useState('ASX');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [promisingStocks, setPromisingStocks] = useState<any[]>([]);
  const [feedAnnouncements, setFeedAnnouncements] = useState<any[]>([]);

  const commodities = ['all', 'Au', 'Ag', 'Cu', 'Li', 'Ni', 'U', 'Zn', 'Fe'];
  const exchanges = ['ASX', 'TSX', 'JSE', 'CSE', 'NYSE', 'LSE'];
  const dateRanges = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  // Convert date range to days
  const getDaysBack = (range: string) => {
    switch (range) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  // Map announcement types for filtering
  const mapTypeForFilter = (type: string): string => {
    const typeMap: Record<string, string> = {
      'drilling_results': 'drilling',
      'resource_estimate': 'resource',
      'quarterly_report': 'financial',
      'capital_raise': 'financial',
      'acquisition': 'corporate',
      'joint_venture': 'corporate',
      'permit_approval': 'regulatory',
      'trading_halt': 'regulatory',
      'production_report': 'operational',
      'feasibility_study': 'operational',
      'general': 'corporate'
    };
    return typeMap[type] || type;
  };

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const daysBack = getDaysBack(dateRange);
      
      try {
        // Use the new feed endpoint for real ASX data
        const [summaryRes, feedRes, promisingRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/announcements/summary?exchange=${selectedExchange}&days_back=${daysBack}`),
          fetch(`${API_BASE}/api/v1/announcements/feed?exchange=${selectedExchange}&days_back=${daysBack}&limit=50`),
          fetch(`${API_BASE}/api/v1/announcements/promising?exchange=${selectedExchange}&days_back=${daysBack}&limit=30`)
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }

        if (feedRes.ok) {
          const data = await feedRes.json();
          setFeedAnnouncements(data.announcements || []);
        }

        if (promisingRes.ok) {
          const data = await promisingRes.json();
          setPromisingStocks(data.promising_stocks || []);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedExchange, dateRange]);

  // Transform API announcements to display format
  const transformedAnnouncements: Announcement[] = feedAnnouncements.map((ann: any) => ({
    id: ann.id || ann.symbol + ann.date,
    company: ann.company_name,
    ticker: ann.symbol,
    commodity: commodityToCode(ann.commodity),
    type: mapTypeForFilter(ann.announcement_type),
    title: ann.title,
    summary: '',
    date: new Date(ann.date).toLocaleDateString(),
    time: new Date(ann.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    priceChange: ann.sentiment === 'very_positive' ? 15 : 
                 ann.sentiment === 'positive' ? 5 : 
                 ann.sentiment === 'negative' ? -5 : 
                 ann.sentiment === 'very_negative' ? -15 : 0,
    source: selectedExchange,
    isBreaking: ann.is_price_sensitive,
    url: ann.url,
  }));

  // Use transformed API data (no fallback to mock data)
  const allAnnouncements: Announcement[] = transformedAnnouncements;

  const filteredAnnouncements = allAnnouncements.filter(a => {
    const matchesSearch = 
      a.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || a.type === selectedType || a.type?.includes(selectedType);
    const matchesCommodity = selectedCommodity === 'all' || a.commodity === selectedCommodity;
    return matchesSearch && matchesType && matchesCommodity;
  });

  const breakingNews = allAnnouncements.filter(a => a.isBreaking);
  const todayCount = summary?.total_announcements || feedAnnouncements.length;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
                <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
                <span>/</span>
                <span className="text-metallic-300">Announcements</span>
              </div>
              <h1 className="text-2xl font-bold text-metallic-100">Latest Announcements</h1>
              <p className="text-metallic-400 text-sm">Real-time news and filings from mining companies</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Bell className="w-4 h-4" />
              Set Alerts
            </button>
          </div>

          {/* Exchange Selector */}
          <div className="flex gap-2 mb-4">
            {exchanges.map((exchange) => (
              <button
                key={exchange}
                onClick={() => setSelectedExchange(exchange)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedExchange === exchange
                    ? 'bg-primary-500 text-white'
                    : 'bg-metallic-800/50 text-metallic-400 hover:bg-metallic-700'
                }`}
              >
                {exchange}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-metallic-400 text-sm mb-1">
                <Newspaper className="w-4 h-4" />
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                Announcements
              </div>
              <p className="text-2xl font-bold text-metallic-100">{todayCount}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                <AlertCircle className="w-4 h-4" />
                Price Sensitive
              </div>
              <p className="text-2xl font-bold text-metallic-100">{summary?.price_sensitive_count || breakingNews.length}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                Promising Stocks
              </div>
              <p className="text-2xl font-bold text-metallic-100">{summary?.promising_count || promisingStocks.length}</p>
            </div>
            <div className="bg-metallic-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                Companies Tracked
              </div>
              <p className="text-2xl font-bold text-metallic-100">{summary?.companies_count || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {announcementTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type.id 
                  ? 'text-white' 
                  : 'bg-metallic-900 text-metallic-400 hover:bg-metallic-800'
              }`}
              style={selectedType === type.id ? { backgroundColor: type.color } : undefined}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
            <input
              type="text"
              placeholder="Search news, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {commodities.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All Commodities' : c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-metallic-900 border border-metallic-800 rounded-lg text-metallic-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
              <p className="text-metallic-400">Loading announcements from {selectedExchange}...</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))
          )}
        </div>

        {!loading && filteredAnnouncements.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-metallic-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-metallic-100 mb-2">No announcements found</h3>
            <p className="text-metallic-400">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Load More */}
        {filteredAnnouncements.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-metallic-900 border border-metallic-800 text-metallic-300 rounded-lg hover:bg-metallic-800 transition-colors">
              Load More Announcements
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
