/**
 * Market Data Types
 * 
 * Types for ASX stock quotes, commodity prices, market cap categories,
 * and top movers data.
 */

// ========== Market Cap Categories ==========

export type MarketCapCategory = 'large_cap' | 'mid_cap' | 'small_cap';

export const MARKET_CAP_LABELS: Record<MarketCapCategory, string> = {
  large_cap: 'Large Cap (>$10B)',
  mid_cap: 'Mid Cap ($2B-$10B)',
  small_cap: 'Small Cap (<$2B)',
};

// ========== Stock Quote (ASX Primary) ==========

export interface ASXStockQuote {
  symbol: string;
  name: string;
  exchange: string;
  commodity: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  marketCapCategory: MarketCapCategory;
  sector: string;
  currency: string;
  dataSource: string;
  
  // Optional fields from detailed query
  bid?: number;
  ask?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  averageVolume?: number;
  eps?: number;
  peRatio?: number;
  dividendYield?: number;
}

// ========== Commodity Types ==========

export type CommodityCategory = 'precious_metals' | 'base_metals' | 'bulk' | 'battery_metals' | 'energy';

export const COMMODITY_CATEGORY_LABELS: Record<CommodityCategory, string> = {
  precious_metals: 'Precious Metals',
  base_metals: 'Base Metals',
  bulk: 'Bulk Commodities',
  battery_metals: 'Battery Metals',
  energy: 'Energy',
};

export interface CommodityPrice {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  currency: string;
  category: CommodityCategory;
  timestamp: string;
}

// ========== Mining Sector Overview ==========

export interface SectorSummary {
  totalStocks: number;
  totalMarketCap: number;
  totalVolume: number;
  averageChange: number;
  gainers: number;
  losers: number;
  unchanged: number;
}

export interface MarketCapCategoryData {
  count: number;
  stocks: ASXStockQuote[];
}

export interface MiningOverview {
  summary: SectorSummary;
  byMarketCap: {
    large_cap: MarketCapCategoryData;
    mid_cap: MarketCapCategoryData;
    small_cap: MarketCapCategoryData;
  };
  timestamp: string;
  dataSource: string;
}

// ========== Top Movers ==========

export interface CategoryMovers {
  gainers: ASXStockQuote[];
  losers: ASXStockQuote[];
  mostActive: ASXStockQuote[];
}

export interface TopMovers {
  overall: CategoryMovers;
  byMarketCap: {
    large_cap: CategoryMovers;
    mid_cap: CategoryMovers;
    small_cap: CategoryMovers;
  };
  timestamp: string;
}

// ========== Commodity Overview ==========

export interface CommoditySummary {
  totalCommodities: number;
  gainers: number;
  losers: number;
  averageChange: number;
}

export interface CommodityMovers {
  gainers: CommodityPrice[];
  losers: CommodityPrice[];
  timestamp: string;
}

export interface CommodityOverview {
  summary: CommoditySummary;
  byCategory: {
    precious_metals: CommodityPrice[];
    base_metals: CommodityPrice[];
    bulk: CommodityPrice[];
    battery_metals: CommodityPrice[];
    energy: CommodityPrice[];
  };
  movers: CommodityMovers;
  timestamp: string;
}

// ========== Market Dashboard (Combined) ==========

export interface MarketDashboard {
  mining: MiningOverview;
  topMovers: TopMovers;
  commodities: CommodityOverview;
  timestamp: string;
  dataSource: string;
}

// ========== Mining Tickers ==========

export interface MiningTicker {
  symbol: string;
  name: string;
  commodity: string;
  exchange: string;
}

export interface MiningTickersResponse {
  tickers: MiningTicker[];
  count: number;
  exchanges: string[];
  timestamp: string;
}

// ========== Legacy Types (for backwards compatibility) ==========

export interface StockQuote {
  symbol: string;
  current: number;
  high: number;
  low: number;
  open: number;
  previous_close: number;
  change: number;
  change_percent: number;
  timestamp?: string;
  source: string;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  ipo_date?: string;
  market_cap: number;
  shares_outstanding?: number;
  industry: string;
  logo?: string;
  phone?: string;
  website?: string;
  source: string;
}

export interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime?: string;
  category?: string;
  related?: string;
}

// ========== Helper Functions ==========

export function formatCurrency(value: number | undefined, currency = 'AUD'): string {
  if (value === undefined || value === null) return 'N/A';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatLargeNumber(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatVolume(value: number | undefined): string {
  if (value === undefined || value === null) return 'N/A';
  
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercent(value: number | undefined, decimals = 2): string {
  if (value === undefined || value === null) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function getChangeColor(change: number): string {
  if (change > 0) return '#22c55e'; // green
  if (change < 0) return '#ef4444'; // red
  return '#94a3b8'; // gray
}

export function getCommodityCategoryColor(category: CommodityCategory): string {
  const colors: Record<CommodityCategory, string> = {
    precious_metals: '#fbbf24', // amber
    base_metals: '#3b82f6', // blue
    bulk: '#6b7280', // gray
    battery_metals: '#22c55e', // green
    energy: '#ef4444', // red
  };
  return colors[category] || '#94a3b8';
}

export function getMarketCapColor(category: MarketCapCategory): string {
  const colors: Record<MarketCapCategory, string> = {
    large_cap: '#3b82f6', // blue
    mid_cap: '#8b5cf6', // purple
    small_cap: '#f59e0b', // amber
  };
  return colors[category] || '#94a3b8';
}
