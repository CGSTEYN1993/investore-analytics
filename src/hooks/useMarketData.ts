/**
 * React Hooks for Market Data
 * 
 * Provides easy access to Finnhub stock market data with
 * loading states, error handling, and auto-refresh.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import marketService from '@/services/marketService';
import {
  StockQuote,
  CompanyOverview,
  Financials,
  Recommendations,
  NewsArticle,
  TopMovers,
} from '@/types/market';

// ========== Single Quote Hook ==========

interface UseQuoteResult {
  quote: StockQuote | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useQuote(symbol: string, autoRefresh = true, refreshInterval = 60000): UseQuoteResult {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchQuote = useCallback(async () => {
    if (!symbol) return;
    
    try {
      const data = await marketService.getQuote(symbol);
      setQuote(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quote');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchQuote();
    
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchQuote, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchQuote, autoRefresh, refreshInterval]);
  
  return { quote, isLoading, error, refresh: fetchQuote };
}

// ========== Multiple Quotes Hook ==========

interface UseMultipleQuotesResult {
  quotes: Record<string, StockQuote>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMultipleQuotes(symbols: string[], autoRefresh = true): UseMultipleQuotesResult {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchQuotes = useCallback(async () => {
    if (!symbols.length) return;
    
    try {
      const data = await marketService.getMultipleQuotes(symbols);
      setQuotes(data.quotes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes');
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchQuotes();
    
    if (autoRefresh) {
      const interval = setInterval(fetchQuotes, 60000);
      return () => clearInterval(interval);
    }
  }, [fetchQuotes, autoRefresh]);
  
  return { quotes, isLoading, error, refresh: fetchQuotes };
}

// ========== Company Overview Hook ==========

interface UseCompanyOverviewResult {
  overview: CompanyOverview | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCompanyOverview(symbol: string): UseCompanyOverviewResult {
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOverview = useCallback(async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    try {
      const data = await marketService.getOverview(symbol);
      setOverview(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company overview');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);
  
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);
  
  return { overview, isLoading, error, refresh: fetchOverview };
}

// ========== Financials Hook ==========

interface UseFinancialsResult {
  financials: Financials | null;
  isLoading: boolean;
  error: string | null;
}

export function useFinancials(symbol: string): UseFinancialsResult {
  const [financials, setFinancials] = useState<Financials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!symbol) return;
    
    setIsLoading(true);
    marketService.getFinancials(symbol)
      .then(data => {
        setFinancials(data);
        setError(null);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load financials');
      })
      .finally(() => setIsLoading(false));
  }, [symbol]);
  
  return { financials, isLoading, error };
}

// ========== Recommendations Hook ==========

interface UseRecommendationsResult {
  recommendations: Recommendations | null;
  isLoading: boolean;
  error: string | null;
}

export function useRecommendations(symbol: string): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!symbol) return;
    
    setIsLoading(true);
    marketService.getRecommendations(symbol)
      .then(data => {
        setRecommendations(data);
        setError(null);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      })
      .finally(() => setIsLoading(false));
  }, [symbol]);
  
  return { recommendations, isLoading, error };
}

// ========== Company News Hook ==========

interface UseCompanyNewsResult {
  news: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCompanyNews(symbol: string, days = 7): UseCompanyNewsResult {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchNews = useCallback(async () => {
    if (!symbol) return;
    
    try {
      const data = await marketService.getCompanyNews(symbol, days);
      setNews(data.articles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, days]);
  
  useEffect(() => {
    setIsLoading(true);
    fetchNews();
  }, [fetchNews]);
  
  return { news, isLoading, error, refresh: fetchNews };
}

// ========== Mining Sector Hook ==========

interface UseMiningOverviewResult {
  quotes: Record<string, StockQuote>;
  topMovers: TopMovers | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMiningOverview(): UseMiningOverviewResult {
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [topMovers, setTopMovers] = useState<TopMovers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      const [overviewData, moversData] = await Promise.all([
        marketService.getMiningOverview(),
        marketService.getTopMovers(),
      ]);
      
      setQuotes(overviewData.companies);
      setTopMovers(moversData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mining data');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    setIsLoading(true);
    fetchData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  return { quotes, topMovers, isLoading, error, refresh: fetchData };
}
