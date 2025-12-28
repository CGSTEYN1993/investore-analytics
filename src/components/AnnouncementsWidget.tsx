'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  TrendingUp,
  FileText,
  AlertTriangle,
  ExternalLink,
  Loader2,
  ChevronDown,
  Filter,
  Sparkles,
  Search,
  Calendar
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';

interface Announcement {
  id: string;
  symbol: string;
  exchange: string;
  title: string;
  announcement_type: string;
  date: string;
  url: string;
  sentiment: string;
  relevance_score: number;
  is_price_sensitive: boolean;
  key_metrics: {
    grades?: { value: number; unit: string; commodity: string }[];
    intervals?: number[];
    tonnages?: number[];
    ounces?: number[];
  };
}

interface PromisingStock {
  symbol: string;
  company_name: string;
  exchange: string;
  title: string;
  announcement_type: string;
  sentiment: string;
  relevance_score: number;
  date: string;
  url: string;
  is_price_sensitive: boolean;
  primary_commodity: string;
  company_type: string;
}

interface AnnouncementsSummary {
  exchange: string;
  days_analyzed: number;
  total_announcements: number;
  price_sensitive_count: number;
  by_type: Record<string, number>;
  by_sentiment: Record<string, number>;
  promising_count: number;
}

// Sentiment color mapping
const sentimentColors: Record<string, string> = {
  very_positive: 'bg-green-100 text-green-800',
  positive: 'bg-emerald-100 text-emerald-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-orange-100 text-orange-800',
  very_negative: 'bg-red-100 text-red-800',
};

// Announcement type icons
const typeIcons: Record<string, string> = {
  drilling_results: '🎯',
  resource_estimate: '📊',
  feasibility_study: '📋',
  production_report: '⛏️',
  quarterly_report: '📈',
  capital_raise: '💰',
  acquisition: '🤝',
  joint_venture: '🤝',
  permit_approval: '✅',
  trading_halt: '⚠️',
  general: '📄',
};

interface AnnouncementsWidgetProps {
  exchange?: string;
  showPromisingOnly?: boolean;
  maxItems?: number;
}

export function AnnouncementsWidget({
  exchange = 'ASX',
  showPromisingOnly = false,
  maxItems = 10,
}: AnnouncementsWidgetProps) {
  const [summary, setSummary] = useState<AnnouncementsSummary | null>(null);
  const [promising, setPromising] = useState<PromisingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysBack, setDaysBack] = useState(14);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [summaryRes, promisingRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/announcements/summary?exchange=${exchange}&days_back=${daysBack}`),
          fetch(`${API_BASE}/api/v1/announcements/promising?exchange=${exchange}&days_back=${daysBack}&limit=${maxItems}`),
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }

        if (promisingRes.ok) {
          const data = await promisingRes.json();
          setPromising(data.promising_stocks || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [exchange, daysBack, maxItems]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            {exchange} Announcements & Insights
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 p-4 border-b bg-gray-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {summary.total_announcements}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {summary.price_sensitive_count}
            </div>
            <div className="text-xs text-gray-500">Price Sensitive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.promising_count}
            </div>
            <div className="text-xs text-gray-500">Promising</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {summary.by_type?.drilling_results || 0}
            </div>
            <div className="text-xs text-gray-500">Drilling Results</div>
          </div>
        </div>
      )}

      {/* Sentiment Breakdown */}
      {summary?.by_sentiment && (
        <div className="px-4 py-2 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Sentiment:</span>
            {Object.entries(summary.by_sentiment).map(([sentiment, count]) => (
              <span
                key={sentiment}
                className={`px-2 py-0.5 rounded text-xs ${sentimentColors[sentiment] || 'bg-gray-100'}`}
              >
                {sentiment.replace('_', ' ')}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Promising Stocks */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {promising.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No promising announcements found</p>
          </div>
        ) : (
          promising.map((stock) => (
            <div key={stock.symbol + stock.date} className="p-3 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">
                      {stock.symbol}
                    </span>
                    <span className="text-xs text-gray-500">
                      {stock.company_name}
                    </span>
                    {stock.is_price_sensitive && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {stock.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg">
                      {typeIcons[stock.announcement_type] || '📄'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {stock.announcement_type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        sentimentColors[stock.sentiment] || 'bg-gray-100'
                      }`}
                    >
                      {stock.sentiment.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(stock.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: `conic-gradient(#3b82f6 ${stock.relevance_score * 100}%, #e5e7eb ${stock.relevance_score * 100}%)`,
                    }}
                  >
                    <span className="bg-white rounded-full w-8 h-8 flex items-center justify-center text-xs">
                      {Math.round(stock.relevance_score * 100)}
                    </span>
                  </div>
                  <a
                    href={stock.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-gray-50 text-center">
        <span className="text-xs text-gray-500">
          Data from {exchange} company announcements • Updated in real-time
        </span>
      </div>
    </div>
  );
}

// Company Announcements Component
interface CompanyAnnouncementsProps {
  symbol: string;
  daysBack?: number;
  limit?: number;
}

export function CompanyAnnouncements({
  symbol,
  daysBack = 30,
  limit = 10,
}: CompanyAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    async function fetchAnnouncements() {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/api/v1/announcements/company/${symbol}?days_back=${daysBack}&limit=${limit}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements || []);
          setCompanyName(data.company_name || symbol);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    }

    if (symbol) {
      fetchAnnouncements();
    }
  }, [symbol, daysBack, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">
            {companyName} ({symbol}) - Recent Announcements
          </h3>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No recent announcements
        </div>
      ) : (
        <div className="divide-y max-h-80 overflow-y-auto">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-3 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[ann.announcement_type] || '📄'}</span>
                    {ann.is_price_sensitive && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        Price Sensitive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{ann.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className={`px-2 py-0.5 rounded ${sentimentColors[ann.sentiment]}`}>
                      {ann.sentiment}
                    </span>
                    <span>
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(ann.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <a
                  href={ann.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 ml-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnnouncementsWidget;
