'use client';

import React, { useEffect, useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Newspaper, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface NewsBuzzData {
  ticker: string;
  company_name: string;
  buzz_score: number;
  mentions_7d: number;
  mentions_30d: number;
  avg_sentiment: number;
  news_momentum: number;
  trending_direction: 'up' | 'down' | 'stable';
  price_correlation?: number;
  recent_articles: {
    title: string;
    url: string;
    source: string;
    published_date: string;
    sentiment_score?: number;
  }[];
}

interface NewsBuzzBadgeProps {
  ticker: string;
  exchange?: string;
  variant?: 'badge' | 'card' | 'inline';
  showArticles?: boolean;
  maxArticles?: number;
}

const NewsBuzzBadge: React.FC<NewsBuzzBadgeProps> = ({
  ticker,
  exchange = 'ASX',
  variant = 'badge',
  showArticles = false,
  maxArticles = 5,
}) => {
  const [buzzData, setBuzzData] = useState<NewsBuzzData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuzzData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/mining-news/buzz/${ticker}?exchange=${exchange}`);
        
        if (response.ok) {
          const data = await response.json();
          setBuzzData(data);
        } else if (response.status === 404) {
          setBuzzData(null); // Company not found in news
        } else {
          throw new Error('Failed to fetch buzz data');
        }
      } catch (err) {
        console.error('Error fetching buzz data:', err);
        setError('Unable to load news data');
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchBuzzData();
    }
  }, [ticker, exchange]);

  const getHeatLevel = (buzzScore: number) => {
    if (buzzScore >= 80) return { label: 'Very Hot', color: 'bg-red-500/20 text-red-400 border-red-500/30', flames: 3 };
    if (buzzScore >= 60) return { label: 'Hot', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', flames: 2 };
    if (buzzScore >= 40) return { label: 'Active', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', flames: 1 };
    return { label: 'Normal', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', flames: 0 };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  };

  // Loading state
  if (loading) {
    if (variant === 'badge') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-700/50 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full bg-slate-600 animate-pulse"></span>
          Loading...
        </span>
      );
    }
    return null;
  }

  // No data or low buzz - don't show badge
  if (!buzzData || buzzData.buzz_score < 20) {
    return null;
  }

  const heat = getHeatLevel(buzzData.buzz_score);

  // Badge variant - simple inline badge
  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${heat.color}`}>
        {heat.flames > 0 && (
          <span className="flex">
            {[...Array(Math.min(heat.flames, 3))].map((_, i) => (
              <Flame key={i} className="w-3 h-3" />
            ))}
          </span>
        )}
        <span>{heat.label}</span>
        <span className="text-slate-400">({buzzData.mentions_7d} mentions)</span>
      </span>
    );
  }

  // Inline variant - compact info line
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${heat.color}`}>
        <div className="flex items-center gap-1">
          {heat.flames > 0 && (
            <span className="flex">
              {[...Array(heat.flames)].map((_, i) => (
                <Flame key={i} className="w-4 h-4" />
              ))}
            </span>
          )}
          <span className="font-medium">{heat.label} in News</span>
        </div>
        <span className="text-sm text-slate-300">
          {buzzData.mentions_7d} mentions this week
        </span>
        <span className={`text-sm ${buzzData.avg_sentiment > 0 ? 'text-green-400' : buzzData.avg_sentiment < 0 ? 'text-red-400' : 'text-slate-400'}`}>
          {buzzData.avg_sentiment > 0 ? '↑' : buzzData.avg_sentiment < 0 ? '↓' : '→'} 
          {Math.abs(buzzData.avg_sentiment * 100).toFixed(0)}% sentiment
        </span>
      </div>
    );
  }

  // Card variant - full expandable card
  return (
    <div className={`rounded-lg border ${heat.color} overflow-hidden`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
        onClick={() => showArticles && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {/* Heat indicator */}
          <div className="flex items-center gap-1">
            {heat.flames > 0 && (
              <span className="flex">
                {[...Array(heat.flames)].map((_, i) => (
                  <Flame key={i} className="w-5 h-5" />
                ))}
              </span>
            )}
          </div>
          
          {/* Main info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{heat.label} in the News</span>
              <span className="text-sm text-slate-400">
                Buzz Score: {buzzData.buzz_score.toFixed(0)}/100
              </span>
            </div>
            <div className="text-sm text-slate-400 flex items-center gap-3 mt-1">
              <span>{buzzData.mentions_7d} mentions (7d)</span>
              <span>{buzzData.mentions_30d} mentions (30d)</span>
              <span className={buzzData.avg_sentiment > 0 ? 'text-green-400' : buzzData.avg_sentiment < 0 ? 'text-red-400' : ''}>
                Sentiment: {buzzData.avg_sentiment > 0 ? '+' : ''}{(buzzData.avg_sentiment * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Expand button */}
        {showArticles && buzzData.recent_articles?.length > 0 && (
          <button className="p-1 hover:bg-slate-700/50 rounded">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* Expanded articles section */}
      {expanded && showArticles && buzzData.recent_articles?.length > 0 && (
        <div className="border-t border-slate-700/50">
          <div className="p-3">
            <div className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              Recent Articles
            </div>
            <div className="space-y-2">
              {buzzData.recent_articles.slice(0, maxArticles).map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2 rounded hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{formatDate(article.published_date)}</span>
                      {article.sentiment_score !== undefined && (
                        <>
                          <span>•</span>
                          <span className={
                            article.sentiment_score > 0.3 ? 'text-green-400' :
                            article.sentiment_score < -0.3 ? 'text-red-400' : ''
                          }>
                            {article.sentiment_score > 0 ? '👍' : article.sentiment_score < 0 ? '👎' : '➖'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 flex-shrink-0 mt-1" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Price correlation indicator (if available) */}
      {buzzData.price_correlation !== undefined && Math.abs(buzzData.price_correlation) > 0.3 && (
        <div className="px-3 pb-2">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>Price Correlation:</span>
            <span className={buzzData.price_correlation > 0 ? 'text-green-400' : 'text-red-400'}>
              {buzzData.price_correlation > 0 ? '📈 Positive' : '📉 Negative'} 
              ({(buzzData.price_correlation * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsBuzzBadge;
