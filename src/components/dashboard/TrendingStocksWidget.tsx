'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Flame, TrendingUp, TrendingDown, Minus, Newspaper, ExternalLink } from 'lucide-react';

interface TrendingStock {
  ticker: string;
  company_name: string;
  exchange: string;
  buzz_score: number;
  mentions_7d: number;
  mentions_30d: number;
  avg_sentiment: number;
  news_momentum: number;
  trending_direction: 'up' | 'down' | 'stable';
  price_change_percent?: number;
  recent_headlines?: string[];
}

interface TrendingStocksWidgetProps {
  maxItems?: number;
  showHeadlines?: boolean;
  onTickerClick?: (ticker: string, exchange: string) => void;
}

const TrendingStocksWidget: React.FC<TrendingStocksWidgetProps> = ({
  maxItems = 5,
  showHeadlines = true,
  onTickerClick,
}) => {
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTrendingStocks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/mining-news/trending?limit=${maxItems}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending stocks');
      }
      
      const data = await response.json();
      setTrendingStocks(data.trending || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching trending stocks:', err);
      setError('Unable to load trending stocks');
      // Use mock data for demo
      setTrendingStocks(getMockData());
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    fetchTrendingStocks();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrendingStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTrendingStocks]);

  const getHeatLevel = (buzzScore: number): { label: string; color: string; flames: number } => {
    if (buzzScore >= 80) return { label: 'Very Hot', color: 'text-red-500', flames: 3 };
    if (buzzScore >= 60) return { label: 'Hot', color: 'text-orange-500', flames: 2 };
    if (buzzScore >= 40) return { label: 'Warming', color: 'text-yellow-500', flames: 1 };
    return { label: 'Normal', color: 'text-slate-400', flames: 0 };
  };

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment > 0.3) return 'text-green-400';
    if (sentiment < -0.3) return 'text-red-400';
    return 'text-slate-400';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleTickerClick = (ticker: string, exchange: string) => {
    if (onTickerClick) {
      onTickerClick(ticker, exchange);
    } else {
      // Default: navigate to company page
      window.location.href = `/companies/${ticker}`;
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-white">Hot in the News</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-white">Hot in the News</h3>
        </div>
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-yellow-500 mb-3 flex items-center gap-1">
          ⚠️ {error} - Showing sample data
        </div>
      )}

      {/* Trending Stocks List */}
      <div className="space-y-3">
        {trendingStocks.map((stock, index) => {
          const heat = getHeatLevel(stock.buzz_score);
          
          return (
            <div
              key={`${stock.ticker}-${stock.exchange}`}
              className="bg-slate-900/50 rounded-lg p-3 hover:bg-slate-900/80 transition-colors cursor-pointer border border-slate-700/50"
              onClick={() => handleTickerClick(stock.ticker, stock.exchange)}
            >
              {/* Stock Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4">{index + 1}.</span>
                  <span className="font-bold text-white">{stock.ticker}</span>
                  <span className="text-xs text-slate-500">({stock.exchange})</span>
                  {getTrendIcon(stock.trending_direction)}
                </div>
                
                {/* Heat Indicator */}
                <div className="flex items-center gap-1">
                  {heat.flames > 0 && (
                    <div className="flex">
                      {[...Array(heat.flames)].map((_, i) => (
                        <Flame key={i} className={`w-4 h-4 ${heat.color}`} />
                      ))}
                    </div>
                  )}
                  <span className={`text-sm font-medium ${heat.color}`}>
                    {stock.buzz_score.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Company Name */}
              <div className="text-sm text-slate-300 mb-2 truncate">
                {stock.company_name}
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    <span className="text-white font-medium">{stock.mentions_7d}</span> mentions (7d)
                  </span>
                  <span className={getSentimentColor(stock.avg_sentiment)}>
                    Sentiment: {stock.avg_sentiment > 0 ? '+' : ''}{(stock.avg_sentiment * 100).toFixed(0)}%
                  </span>
                </div>
                {stock.price_change_percent !== undefined && (
                  <span className={stock.price_change_percent >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {stock.price_change_percent >= 0 ? '+' : ''}{stock.price_change_percent.toFixed(1)}%
                  </span>
                )}
              </div>

              {/* Recent Headlines (optional) */}
              {showHeadlines && stock.recent_headlines && stock.recent_headlines.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Latest:</div>
                  <div className="text-xs text-slate-300 truncate">
                    "{stock.recent_headlines[0]}"
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {trendingStocks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-700">
          <button
            className="w-full flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            onClick={() => window.location.href = '/news'}
          >
            View All Mining News
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// Mock data for demo/fallback
const getMockData = (): TrendingStock[] => [
  {
    ticker: 'BHP',
    company_name: 'BHP Group Limited',
    exchange: 'ASX',
    buzz_score: 85,
    mentions_7d: 47,
    mentions_30d: 156,
    avg_sentiment: 0.65,
    news_momentum: 1.2,
    trending_direction: 'up',
    price_change_percent: 2.3,
    recent_headlines: ['BHP announces record copper production at Escondida'],
  },
  {
    ticker: 'NEM',
    company_name: 'Newmont Corporation',
    exchange: 'NYSE',
    buzz_score: 72,
    mentions_7d: 38,
    mentions_30d: 112,
    avg_sentiment: 0.45,
    news_momentum: 0.8,
    trending_direction: 'up',
    price_change_percent: 1.8,
    recent_headlines: ['Newmont eyes Australian gold expansion'],
  },
  {
    ticker: 'SFR',
    company_name: 'Sandfire Resources',
    exchange: 'ASX',
    buzz_score: 68,
    mentions_7d: 29,
    mentions_30d: 78,
    avg_sentiment: 0.55,
    news_momentum: 0.6,
    trending_direction: 'up',
    price_change_percent: 3.1,
    recent_headlines: ['Sandfire DeGrussa production exceeds expectations'],
  },
  {
    ticker: 'RIO',
    company_name: 'Rio Tinto',
    exchange: 'ASX',
    buzz_score: 62,
    mentions_7d: 34,
    mentions_30d: 145,
    avg_sentiment: 0.25,
    news_momentum: -0.2,
    trending_direction: 'stable',
    price_change_percent: -0.5,
    recent_headlines: ['Rio Tinto faces regulatory scrutiny over Guinea project'],
  },
  {
    ticker: '29M',
    company_name: '29Metals Limited',
    exchange: 'ASX',
    buzz_score: 54,
    mentions_7d: 18,
    mentions_30d: 45,
    avg_sentiment: 0.35,
    news_momentum: 0.4,
    trending_direction: 'up',
    price_change_percent: 4.2,
    recent_headlines: ['29Metals Capricorn Copper resumes operations'],
  },
];

export default TrendingStocksWidget;
