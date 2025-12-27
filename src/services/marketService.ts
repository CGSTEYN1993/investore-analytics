/**
 * Market Data API Service
 * 
 * Client for fetching ASX stock quotes, commodity prices,
 * market cap analysis, and top movers data.
 * 
 * Primary: ASX via Markit Digital API
 * Fallback: Finnhub API
 */

import {
  ASXStockQuote,
  MiningOverview,
  TopMovers,
  CommodityPrice,
  CommodityOverview,
  MarketDashboard,
  MiningTickersResponse,
  MarketCapCategory,
  NewsArticle,
  CompanyProfile,
} from '@/types/market';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-4faa7.up.railway.app';
const MARKET_ENDPOINT = `${API_BASE_URL}/api/v1/market`;

/**
 * Generic fetch wrapper with error handling
 */
async function fetchMarket<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }
  
  const queryString = searchParams.toString();
  const url = `${MARKET_ENDPOINT}${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Market Data API Service
 */
export const marketService = {
  // ========== Stock Quotes (ASX Primary) ==========
  
  /**
   * Get real-time quote for a single ASX stock
   */
  async getQuote(symbol: string): Promise<ASXStockQuote> {
    return fetchMarket<ASXStockQuote>(`/quote/${symbol.toUpperCase()}`);
  },
  
  /**
   * Get quotes for multiple stocks with optional market cap filter
   */
  async getMultipleQuotes(
    symbols: string[], 
    marketCap: MarketCapCategory | 'all' = 'all'
  ): Promise<{ quotes: ASXStockQuote[]; count: number; filter: string }> {
    return fetchMarket(`/quotes`, { 
      symbols: symbols.join(','),
      market_cap: marketCap
    });
  },
  
  // ========== Mining Sector ==========
  
  /**
   * Get comprehensive mining sector overview
   */
  async getMiningOverview(): Promise<MiningOverview> {
    return fetchMarket<MiningOverview>('/mining/overview');
  },
  
  /**
   * Get stocks grouped by market cap category
   */
  async getStocksByMarketCap(category: MarketCapCategory | 'all' = 'all'): Promise<{
    categories?: Record<MarketCapCategory, ASXStockQuote[]>;
    category?: string;
    stocks?: ASXStockQuote[];
    count?: number;
    timestamp: string;
  }> {
    return fetchMarket('/mining/by-market-cap', { category });
  },
  
  /**
   * Get top gainers, losers, and most active stocks
   */
  async getTopMovers(
    category: MarketCapCategory | 'all' = 'all', 
    limit = 5
  ): Promise<TopMovers> {
    return fetchMarket<TopMovers>('/mining/top-movers', { category, limit });
  },
  
  /**
   * Get list of tracked mining tickers
   */
  async getMiningTickers(): Promise<MiningTickersResponse> {
    return fetchMarket<MiningTickersResponse>('/mining/tickers');
  },
  
  // ========== Commodities ==========
  
  /**
   * Get all commodity prices
   */
  async getAllCommodities(): Promise<{ commodities: CommodityPrice[]; count: number; timestamp: string }> {
    return fetchMarket('/commodities');
  },
  
  /**
   * Get commodity market overview
   */
  async getCommodityOverview(): Promise<CommodityOverview> {
    return fetchMarket<CommodityOverview>('/commodities/overview');
  },
  
  /**
   * Get commodities grouped by category
   */
  async getCommoditiesByCategory(): Promise<{
    categories: Record<string, CommodityPrice[]>;
    timestamp: string;
  }> {
    return fetchMarket('/commodities/by-category');
  },
  
  /**
   * Get top commodity movers
   */
  async getCommodityMovers(): Promise<{
    gainers: CommodityPrice[];
    losers: CommodityPrice[];
    timestamp: string;
  }> {
    return fetchMarket('/commodities/movers');
  },
  
  /**
   * Get price for a specific commodity
   */
  async getCommodityPrice(commodityId: string): Promise<CommodityPrice> {
    return fetchMarket<CommodityPrice>(`/commodities/${commodityId.toLowerCase()}`);
  },
  
  // ========== Dashboard (Combined) ==========
  
  /**
   * Get complete market dashboard in one request
   */
  async getDashboard(): Promise<MarketDashboard> {
    return fetchMarket<MarketDashboard>('/dashboard');
  },
  
  // ========== Finnhub Fallback ==========
  
  /**
   * Get quote from Finnhub (for non-ASX stocks)
   */
  async getFinnhubQuote(symbol: string): Promise<ASXStockQuote> {
    return fetchMarket<ASXStockQuote>(`/finnhub/quote/${symbol.toUpperCase()}`);
  },
  
  /**
   * Get Finnhub mining sector overview
   */
  async getFinnhubOverview(): Promise<any> {
    return fetchMarket('/finnhub/overview');
  },
  
  /**
   * Get Finnhub tickers (global)
   */
  async getFinnhubTickers(): Promise<any> {
    return fetchMarket('/finnhub/tickers');
  },
  
  // ========== Company Information ==========
  
  /**
   * Get company profile
   */
  async getProfile(symbol: string): Promise<CompanyProfile> {
    return fetchMarket<CompanyProfile>(`/profile/${symbol.toUpperCase()}`);
  },
  
  // ========== News ==========
  
  /**
   * Get company-specific news
   */
  async getCompanyNews(symbol: string, days = 7): Promise<{ 
    symbol: string; 
    articles: NewsArticle[]; 
    count: number 
  }> {
    return fetchMarket(`/news/${symbol.toUpperCase()}`, { days });
  },
  
  /**
   * Get general market news
   */
  async getMarketNews(category = 'general'): Promise<{ 
    category: string; 
    articles: NewsArticle[]; 
    count: number 
  }> {
    return fetchMarket('/news', { category });
  },
};

export default marketService;
