'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Newspaper, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

interface NewsItem {
  id: number;
  ticker: string;
  exchange: string;
  article_title: string;
  article_date: string;
  sentiment_label: string | null;
  event_type: string | null;
  source_url: string | null;
}

/**
 * NewsTicker — Scrolling news feed bar at the bottom of the analysis page.
 * Clicking a headline opens a modal preview; clicking "View All" navigates
 * to the full News & Announcements page.
 */
export default function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(`${RAILWAY_API_URL}/api/v1/news-hits/recent?days=3&limit=30`);
      if (res.ok) {
        const data = await res.json();
        setNewsItems(data.news_hits || []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchNews]);

  const getSentimentColor = (label: string | null) => {
    switch (label) {
      case 'positive':
      case 'very_positive':
        return 'text-emerald-400';
      case 'negative':
      case 'very_negative':
        return 'text-red-400';
      default:
        return 'text-metallic-400';
    }
  };

  const getSentimentDot = (label: string | null) => {
    switch (label) {
      case 'positive':
      case 'very_positive':
        return 'bg-emerald-400';
      case 'negative':
      case 'very_negative':
        return 'bg-red-400';
      default:
        return 'bg-metallic-500';
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (newsItems.length === 0) return null;

  // Triple the items for seamless loop
  const tickerItems = [...newsItems, ...newsItems, ...newsItems];

  return (
    <>
      {/* News Ticker Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-[45] transition-transform duration-300 ${collapsed ? 'translate-y-[calc(100%-28px)]' : ''}`}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-1 bg-metallic-900 border border-metallic-700 border-b-0 rounded-t-lg text-xs text-metallic-400 hover:text-metallic-200 flex items-center gap-1 transition-colors"
        >
          <Newspaper className="w-3 h-3" />
          News Feed
          {collapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <div className="bg-metallic-950 border-t border-metallic-800 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center h-8 px-3">
            <div className="flex items-center gap-2 flex-shrink-0 pr-3 border-r border-metallic-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-metallic-300 uppercase tracking-wider">Live</span>
            </div>

            {/* Scrolling ticker */}
            <div className="flex-1 overflow-hidden ml-3">
              <div className="animate-news-ticker flex whitespace-nowrap">
                {tickerItems.map((item, idx) => (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-2 mx-4 text-xs hover:opacity-80 transition-opacity group"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getSentimentDot(item.sentiment_label)}`} />
                    <span className="font-mono font-bold text-primary-400">{item.ticker}</span>
                    <span className={`truncate max-w-[280px] ${getSentimentColor(item.sentiment_label)} group-hover:text-metallic-100`}>
                      {item.article_title}
                    </span>
                    <span className="text-metallic-600 flex-shrink-0">{formatTime(item.article_date)}</span>
                    <span className="text-metallic-800 flex-shrink-0">|</span>
                  </button>
                ))}
              </div>
            </div>

            {/* View all link */}
            <Link
              href="/news"
              className="flex-shrink-0 ml-3 pl-3 border-l border-metallic-800 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              All News
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* News Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-metallic-900 border border-metallic-700 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getSentimentDot(selectedItem.sentiment_label)}`} />
                <span className="font-mono font-bold text-primary-400 text-lg">{selectedItem.ticker}</span>
                <span className="text-xs text-metallic-500 bg-metallic-800 px-2 py-0.5 rounded">
                  {selectedItem.exchange}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 hover:bg-metallic-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-metallic-400" />
              </button>
            </div>

            <h3 className="text-metallic-100 font-semibold text-base leading-snug mb-3">
              {selectedItem.article_title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
              <span className="text-metallic-500">{formatTime(selectedItem.article_date)}</span>
              {selectedItem.event_type && (
                <span className="px-2 py-0.5 bg-metallic-800 text-metallic-300 rounded">
                  {selectedItem.event_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              )}
              {selectedItem.sentiment_label && (
                <span className={`px-2 py-0.5 rounded ${
                  selectedItem.sentiment_label.includes('positive') ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedItem.sentiment_label.includes('negative') ? 'bg-red-500/20 text-red-400' :
                  'bg-metallic-700 text-metallic-300'
                }`}>
                  {selectedItem.sentiment_label.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/company/${selectedItem.ticker}`}
                className="flex-1 text-center py-2.5 bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setSelectedItem(null)}
              >
                View Company Profile
              </Link>
              <Link
                href="/news"
                className="flex-1 text-center py-2.5 bg-metallic-800 text-metallic-300 hover:bg-metallic-700 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setSelectedItem(null)}
              >
                All News & Announcements
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes newsTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-news-ticker {
          animation: newsTicker 60s linear infinite;
        }
        .animate-news-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}
