'use client';

import React, { useState, useEffect } from 'react';
import { 
  Newspaper, TrendingUp, TrendingDown, Minus, Filter, RefreshCw,
  Calendar, Building2, Globe, ChevronDown, ChevronRight, ExternalLink,
  Zap, AlertTriangle, CheckCircle, Clock, Search, BarChart3
} from 'lucide-react';
import {
  getNewsStats,
  getRecentNewsHits,
  getNewsSources,
  getSentimentColor,
  getSentimentBgColor,
  getImpactIcon,
  formatEventType,
  getSourceIcon,
  NewsStatsResponse,
  RecentNewsHit,
  NewsSource
} from '@/services/newsHits';

export default function NewsHitsPage() {
  const [stats, setStats] = useState<NewsStatsResponse | null>(null);
  const [recentNews, setRecentNews] = useState<RecentNewsHit[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [searchTicker, setSearchTicker] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDays, selectedExchange]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, newsData, sourcesData] = await Promise.all([
        getNewsStats(selectedDays),
        getRecentNewsHits(selectedDays, 50, selectedExchange || undefined),
        getNewsSources(),
      ]);
      
      setStats(statsData);
      setRecentNews(newsData.news_hits);
      setSources(sourcesData.sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news data');
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = searchTicker
    ? recentNews.filter(n => n.ticker.toLowerCase().includes(searchTicker.toLowerCase()))
    : recentNews;

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Newspaper className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">News Hits</h1>
                <p className="text-sm text-slate-400">Mining news from multiple sources with AI analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Period Filter */}
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              
              {/* Exchange Filter */}
              <select
                value={selectedExchange || ''}
                onChange={(e) => setSelectedExchange(e.target.value || null)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Exchanges</option>
                <option value="ASX">ASX</option>
                <option value="TSX">TSX</option>
                <option value="JSE">JSE</option>
                <option value="LSE">LSE</option>
                <option value="NYSE">NYSE</option>
              </select>
              
              {/* Refresh */}
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <StatCard 
              label="Total News Hits" 
              value={stats.overview.total_hits} 
              icon={<Newspaper className="w-5 h-5" />}
              color="amber"
            />
            <StatCard 
              label="Companies" 
              value={stats.overview.unique_companies} 
              icon={<Building2 className="w-5 h-5" />}
              color="blue"
            />
            <StatCard 
              label="LLM Analyzed" 
              value={stats.overview.llm_processed} 
              icon={<Zap className="w-5 h-5" />}
              color="purple"
            />
            <StatCard 
              label="Positive" 
              value={stats.overview.positive_news} 
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <StatCard 
              label="Negative" 
              value={stats.overview.negative_news} 
              icon={<TrendingDown className="w-5 h-5" />}
              color="red"
            />
            <StatCard 
              label="Material Events" 
              value={stats.overview.material_events} 
              icon={<AlertTriangle className="w-5 h-5" />}
              color="orange"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main News Feed */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Recent News
                </h2>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ticker..."
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 w-40"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading news...
                  </div>
                ) : filteredNews.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No news found
                  </div>
                ) : (
                  filteredNews.map((news) => (
                    <NewsHitCard key={news.id} news={news} formatDate={formatDate} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Companies */}
            {stats && stats.top_companies.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  Most Mentioned
                </h3>
                <div className="space-y-2">
                  {stats.top_companies.slice(0, 8).map((company, idx) => (
                    <div key={company.ticker} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm w-5">{idx + 1}.</span>
                        <span className="font-mono font-semibold text-amber-400">{company.ticker}</span>
                        <span className="text-slate-500 text-xs">{company.exchange}</span>
                      </div>
                      <span className="text-slate-300 text-sm">{company.hits} hits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Breakdown */}
            {stats && Object.keys(stats.event_breakdown).length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-amber-400" />
                  Event Types
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.event_breakdown)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">{formatEventType(type)}</span>
                        <span className="text-slate-300 text-sm font-mono">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Source Breakdown */}
            {stats && Object.keys(stats.source_breakdown || {}).length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  News Sources
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.source_breakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([source, count]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm flex items-center gap-2">
                          <span>{getSourceIcon(source)}</span>
                          {source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-slate-300 text-sm font-mono">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Available Sources */}
            {sources.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {sources.length} News Sources Available
                </h3>
                <div className="text-xs text-slate-500 space-y-1">
                  {sources.slice(0, 6).map(s => (
                    <div key={s.id} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{s.name}</span>
                    </div>
                  ))}
                  {sources.length > 6 && (
                    <div className="text-slate-600">+{sources.length - 6} more...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  color: 'amber' | 'blue' | 'purple' | 'green' | 'red' | 'orange';
}) {
  const colorClasses = {
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
    </div>
  );
}

// News Hit Card Component
function NewsHitCard({ 
  news, 
  formatDate 
}: { 
  news: RecentNewsHit; 
  formatDate: (date: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`p-4 hover:bg-slate-800/30 transition-colors cursor-pointer ${
        getSentimentBgColor(news.sentiment_label)
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <span className="text-lg">{getSourceIcon(news.source_provider)}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-amber-400">{news.ticker}</span>
            <span className="text-xs text-slate-500">{news.exchange}</span>
            {news.event_type && (
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                {formatEventType(news.event_type)}
              </span>
            )}
            {news.event_significance === 'material' && (
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">
                Material
              </span>
            )}
          </div>
          
          <h3 className="text-white font-medium text-sm leading-tight mb-1 line-clamp-2">
            {news.article_title}
          </h3>
          
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">{formatDate(news.article_date)}</span>
            {news.sentiment_label && (
              <span className={`flex items-center gap-1 ${getSentimentColor(news.sentiment_label)}`}>
                {news.sentiment_label === 'positive' || news.sentiment_label === 'very_positive' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : news.sentiment_label === 'negative' || news.sentiment_label === 'very_negative' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <Minus className="w-3 h-3" />
                )}
                {news.sentiment_label.replace('_', ' ')}
              </span>
            )}
            {news.stock_impact_prediction && (
              <span className="text-slate-400">
                {getImpactIcon(news.stock_impact_prediction)} {news.stock_impact_prediction}
              </span>
            )}
          </div>
        </div>
        
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 text-sm text-slate-400">
          <div className="flex items-center gap-4">
            <span>Source: {news.source_provider.replace(/_/g, ' ')}</span>
            {news.sentiment_score !== null && (
              <span>Sentiment Score: {news.sentiment_score.toFixed(2)}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
