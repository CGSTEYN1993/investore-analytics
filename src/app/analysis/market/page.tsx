'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, TrendingDown, RefreshCw, Loader2, Search, 
  ArrowUpRight, ArrowDownRight, Building2, DollarSign,
  BarChart3, Activity, Gem, Fuel, Zap, Factory, ChevronDown,
  Filter, Clock, AlertCircle, Globe, ArrowLeft, MapPin
} from 'lucide-react';
import marketService, { ExchangeOverview } from '@/services/marketService';
import { 
  ASXStockQuote,
  CommodityPrice,
  MarketCapCategory,
  MARKET_CAP_LABELS,
  COMMODITY_CATEGORY_LABELS,
  formatCurrency,
  formatLargeNumber,
  formatVolume,
  formatPercent,
  getChangeColor,
  getMarketCapColor,
  getCommodityCategoryColor,
} from '@/types/market';

// ========== Exchange Configuration ==========
const EXCHANGES = [
  { code: 'ASX', name: 'Australian Securities Exchange', flag: '🇦🇺', currency: 'AUD' },
  { code: 'TSX', name: 'Toronto Stock Exchange', flag: '🇨🇦', currency: 'CAD' },
  { code: 'TSXV', name: 'TSX Venture Exchange', flag: '🇨🇦', currency: 'CAD' },
  { code: 'CSE', name: 'Canadian Securities Exchange', flag: '🇨🇦', currency: 'CAD' },
  { code: 'JSE', name: 'Johannesburg Stock Exchange', flag: '🇿🇦', currency: 'ZAR' },
  { code: 'NYSE', name: 'New York Stock Exchange', flag: '🇺🇸', currency: 'USD' },
  { code: 'LSE', name: 'London Stock Exchange', flag: '🇬🇧', currency: 'GBP' },
];

// ========== Exchange Tab Button ==========
function ExchangeTab({ 
  exchange, 
  isActive, 
  onClick, 
  count 
}: { 
  exchange: typeof EXCHANGES[0]; 
  isActive: boolean; 
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
        isActive 
          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
          : 'bg-metallic-800/50 text-metallic-400 hover:text-metallic-200 hover:bg-metallic-800 border border-transparent'
      }`}
    >
      <span className="text-base">{exchange.flag}</span>
      <span>{exchange.code}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-metallic-500">({count})</span>
      )}
    </button>
  );
}

// ========== Stock Card Component ==========
function StockCard({ stock, onClick, isSelected }: { 
  stock: ASXStockQuote; 
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const isPositive = stock.changePercent >= 0;
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-metallic-900 border rounded-xl p-4 transition-all hover:scale-[1.01] ${
        isSelected 
          ? 'border-primary-500 ring-1 ring-primary-500/30' 
          : 'border-metallic-800 hover:border-metallic-700'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-metallic-100">{stock.symbol}</h3>
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ 
                backgroundColor: `${getMarketCapColor(stock.marketCapCategory)}20`,
                color: getMarketCapColor(stock.marketCapCategory)
              }}
            >
              {stock.marketCapCategory === 'large_cap' ? 'L' : stock.marketCapCategory === 'mid_cap' ? 'M' : 'S'}
            </span>
          </div>
          <p className="text-xs text-metallic-500 truncate max-w-[120px]">{stock.name}</p>
        </div>
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {formatPercent(stock.changePercent)}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-metallic-100">
            ${stock.price?.toFixed(2) || 'N/A'}
          </p>
          <p className="text-xs text-metallic-500">
            {stock.commodity}
          </p>
        </div>
        <div className="text-right text-xs text-metallic-500">
          <p>Vol: {formatVolume(stock.volume)}</p>
          <p>Cap: {formatLargeNumber(stock.marketCap)}</p>
        </div>
      </div>
    </button>
  );
}

// ========== Commodity Card Component ==========
function CommodityCard({ commodity }: { commodity: CommodityPrice }) {
  const isPositive = commodity.changePercent >= 0;
  
  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-lg p-3 hover:border-metallic-700 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-metallic-100 text-sm">{commodity.name}</span>
        <span 
          className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}
        >
          {formatPercent(commodity.changePercent)}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-lg font-bold text-metallic-100">
          ${commodity.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-xs text-metallic-500">/{commodity.unit}</span>
      </div>
    </div>
  );
}

// ========== Top Movers Section ==========
function TopMoversSection({ 
  title, 
  stocks, 
  type,
  icon: Icon
}: { 
  title: string; 
  stocks: ASXStockQuote[]; 
  type: 'gainers' | 'losers' | 'active';
  icon: React.ElementType;
}) {
  const colorClass = type === 'gainers' ? 'text-green-400' : type === 'losers' ? 'text-red-400' : 'text-blue-400';
  
  return (
    <div>
      <h4 className={`text-sm font-medium ${colorClass} mb-3 flex items-center gap-2`}>
        <Icon className="w-4 h-4" />
        {title}
      </h4>
      <div className="space-y-2">
        {stocks.slice(0, 5).map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-metallic-800/50 last:border-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-metallic-100">{stock.symbol}</span>
              <span className="text-xs text-metallic-500">{stock.commodity}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-metallic-100">${stock.price?.toFixed(2)}</span>
              <span className={`ml-2 text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercent(stock.changePercent)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== Market Cap Tab Button ==========
function MarketCapTab({ 
  category, 
  isActive, 
  onClick, 
  count 
}: { 
  category: MarketCapCategory | 'all'; 
  isActive: boolean; 
  onClick: () => void;
  count?: number;
}) {
  const label = category === 'all' ? 'All Stocks' : MARKET_CAP_LABELS[category];
  const color = category === 'all' ? '#94a3b8' : getMarketCapColor(category);
  
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
        isActive 
          ? 'bg-metallic-800 text-metallic-100' 
          : 'text-metallic-400 hover:text-metallic-200 hover:bg-metallic-800/50'
      }`}
    >
      <div 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
      {count !== undefined && (
        <span className="text-xs text-metallic-500">({count})</span>
      )}
    </button>
  );
}

// ========== Main Page Component ==========
export default function MarketPage() {
  const [selectedExchange, setSelectedExchange] = useState<string>('ASX');
  const [selectedCapCategory, setSelectedCapCategory] = useState<MarketCapCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // Fetch exchanges with counts
  const { data: exchangesData } = useQuery({
    queryKey: ['exchanges'],
    queryFn: () => marketService.getExchanges(),
    staleTime: 300000, // 5 min cache
  });

  // Fetch ASX dashboard for real-time data when ASX is selected
  const { data: dashboard, isLoading: isLoadingASX, error: asxError, refetch: refetchASX, isFetching: isFetchingASX } = useQuery({
    queryKey: ['market-dashboard'],
    queryFn: () => marketService.getDashboard(),
    refetchInterval: 60000,
    staleTime: 30000,
    enabled: selectedExchange === 'ASX',
  });

  // Fetch exchange-specific data for non-ASX exchanges
  const { data: exchangeData, isLoading: isLoadingExchange, error: exchangeError, refetch: refetchExchange, isFetching: isFetchingExchange } = useQuery({
    queryKey: ['exchange-overview', selectedExchange],
    queryFn: () => marketService.getExchangeOverview(selectedExchange),
    refetchInterval: 120000,
    staleTime: 60000,
    enabled: selectedExchange !== 'ASX',
  });

  // Determine which data to use based on selected exchange
  const isASX = selectedExchange === 'ASX';
  const isLoading = isASX ? isLoadingASX : isLoadingExchange;
  const isFetching = isASX ? isFetchingASX : isFetchingExchange;
  const error = isASX ? asxError : exchangeError;
  const refetch = isASX ? refetchASX : refetchExchange;

  // Extract data from dashboard or exchange data
  const miningData = isASX ? dashboard?.mining : exchangeData;
  const topMovers = isASX ? dashboard?.topMovers : exchangeData?.topMovers;
  const commodityData = dashboard?.commodities;

  const currentExchange = EXCHANGES.find(e => e.code === selectedExchange) || EXCHANGES[0];
  const exchangeCounts = exchangesData?.exchanges?.reduce((acc, ex) => {
    acc[ex.code] = ex.count;
    return acc;
  }, {} as Record<string, number>) || {};

  // Filter stocks by market cap and search
  const filteredStocks = useMemo(() => {
    if (!miningData?.byMarketCap) return [];
    
    let stocks: ASXStockQuote[] = [];
    
    if (selectedCapCategory === 'all') {
      stocks = [
        ...(miningData.byMarketCap.large_cap?.stocks || []),
        ...(miningData.byMarketCap.mid_cap?.stocks || []),
        ...(miningData.byMarketCap.small_cap?.stocks || []),
      ];
    } else {
      stocks = miningData.byMarketCap[selectedCapCategory]?.stocks || [];
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      stocks = stocks.filter(s => 
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.commodity.toLowerCase().includes(query)
      );
    }
    
    return stocks.sort((a, b) => b.marketCap - a.marketCap);
  }, [miningData, selectedCapCategory, searchQuery]);

  // Get movers for selected category
  const categoryMovers = useMemo(() => {
    if (!topMovers) return null;
    
    // For non-ASX exchanges, topMovers has a different structure
    if ('gainers' in topMovers && !('overall' in topMovers)) {
      return topMovers as { gainers: ASXStockQuote[]; losers: ASXStockQuote[]; mostActive: ASXStockQuote[] };
    }
    
    // For ASX dashboard format
    const asxMovers = topMovers as { overall?: { gainers: ASXStockQuote[]; losers: ASXStockQuote[]; mostActive: ASXStockQuote[] }; byMarketCap?: Record<string, { gainers: ASXStockQuote[]; losers: ASXStockQuote[]; mostActive: ASXStockQuote[] }> };
    
    if (selectedCapCategory === 'all') {
      return asxMovers.overall;
    }
    return asxMovers.byMarketCap?.[selectedCapCategory];
  }, [topMovers, selectedCapCategory]);

  if (error) {
    return (
      <div className="min-h-screen bg-metallic-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Market Data</h2>
            <p className="text-metallic-400 mb-4">{(error as Error).message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="border-b border-metallic-800 bg-metallic-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-metallic-100 flex items-center gap-2">
                <span className="text-2xl">{currentExchange.flag}</span>
                {currentExchange.name}
              </h1>
              <p className="text-sm text-metallic-500">
                {isASX ? 'Real-time data from ASX via Markit Digital' : `Mining companies on ${currentExchange.code}`}
                {miningData?.timestamp && (
                  <span className="ml-2">
                    • Updated {new Date(miningData.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analysis/global"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 text-metallic-300 rounded-lg hover:bg-metallic-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Global View
              </Link>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Exchange Selector Tabs */}
          <div className="flex flex-wrap gap-2 pb-2">
            {EXCHANGES.map((exchange) => (
              <ExchangeTab
                key={exchange.code}
                exchange={exchange}
                isActive={selectedExchange === exchange.code}
                onClick={() => {
                  setSelectedExchange(exchange.code);
                  setSelectedCapCategory('all');
                  setSearchQuery('');
                }}
                count={exchangeCounts[exchange.code]}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-metallic-400">Loading market data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            {miningData?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <p className="text-xs text-metallic-500 mb-1">Stocks Tracked</p>
                  <p className="text-xl font-bold text-metallic-100">{miningData.summary.totalStocks}</p>
                </div>
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <p className="text-xs text-metallic-500 mb-1">Total Market Cap</p>
                  <p className="text-xl font-bold text-metallic-100">{formatLargeNumber(miningData.summary.totalMarketCap)}</p>
                </div>
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <p className="text-xs text-metallic-500 mb-1">Total Volume</p>
                  <p className="text-xl font-bold text-metallic-100">{formatVolume(miningData.summary.totalVolume)}</p>
                </div>
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <p className="text-xs text-metallic-500 mb-1">Avg Change</p>
                  <p className={`text-xl font-bold ${miningData.summary.averageChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(miningData.summary.averageChange)}
                  </p>
                </div>
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <p className="text-xs text-metallic-500 mb-1">Gainers</p>
                  <p className="text-xl font-bold text-green-400">{miningData.summary.gainers}</p>
                </div>
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <p className="text-xs text-metallic-500 mb-1">Losers</p>
                  <p className="text-xl font-bold text-red-400">{miningData.summary.losers}</p>
                </div>
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <p className="text-xs text-metallic-500 mb-1">Unchanged</p>
                  <p className="text-xl font-bold text-metallic-400">{miningData.summary.unchanged}</p>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - Stocks */}
              <div className="lg:col-span-2 space-y-6">
                {/* Market Cap Tabs & Search */}
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      <MarketCapTab 
                        category="all" 
                        isActive={selectedCapCategory === 'all'}
                        onClick={() => setSelectedCapCategory('all')}
                        count={miningData?.summary?.totalStocks}
                      />
                      <MarketCapTab 
                        category="large_cap" 
                        isActive={selectedCapCategory === 'large_cap'}
                        onClick={() => setSelectedCapCategory('large_cap')}
                        count={miningData?.byMarketCap?.large_cap?.count}
                      />
                      <MarketCapTab 
                        category="mid_cap" 
                        isActive={selectedCapCategory === 'mid_cap'}
                        onClick={() => setSelectedCapCategory('mid_cap')}
                        count={miningData?.byMarketCap?.mid_cap?.count}
                      />
                      <MarketCapTab 
                        category="small_cap" 
                        isActive={selectedCapCategory === 'small_cap'}
                        onClick={() => setSelectedCapCategory('small_cap')}
                        count={miningData?.byMarketCap?.small_cap?.count}
                      />
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                      <input
                        type="text"
                        placeholder="Search stocks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:border-primary-500 w-full md:w-64"
                      />
                    </div>
                  </div>
                </div>

                {/* Top Movers Panel */}
                {categoryMovers && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
                    <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-500" />
                      Top Movers {selectedCapCategory !== 'all' && `- ${MARKET_CAP_LABELS[selectedCapCategory]}`}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <TopMoversSection 
                        title="Biggest Gainers" 
                        stocks={categoryMovers.gainers || []} 
                        type="gainers"
                        icon={TrendingUp}
                      />
                      <TopMoversSection 
                        title="Biggest Losers" 
                        stocks={categoryMovers.losers || []} 
                        type="losers"
                        icon={TrendingDown}
                      />
                      <TopMoversSection 
                        title="Most Active" 
                        stocks={categoryMovers.mostActive || []} 
                        type="active"
                        icon={BarChart3}
                      />
                    </div>
                  </div>
                )}

                {/* Stocks Grid */}
                <div>
                  <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-500" />
                    {selectedCapCategory === 'all' ? `${selectedExchange} Mining Stocks` : MARKET_CAP_LABELS[selectedCapCategory]}
                    <span className="text-sm font-normal text-metallic-500">({filteredStocks.length})</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredStocks.slice(0, 20).map((stock) => (
                      <StockCard
                        key={stock.symbol}
                        stock={stock}
                        onClick={() => setSelectedStock(stock.symbol)}
                        isSelected={selectedStock === stock.symbol}
                      />
                    ))}
                  </div>
                  {filteredStocks.length > 20 && (
                    <p className="text-center text-metallic-500 mt-4">
                      Showing 20 of {filteredStocks.length} stocks
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar - Commodities */}
              <div className="space-y-6">
                {/* Commodity Summary */}
                {commodityData?.summary && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                    <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                      <Gem className="w-5 h-5 text-amber-400" />
                      Commodity Markets
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-metallic-500">Tracked</p>
                        <p className="text-lg font-bold text-metallic-100">{commodityData.summary.totalCommodities}</p>
                      </div>
                      <div>
                        <p className="text-xs text-metallic-500">Up</p>
                        <p className="text-lg font-bold text-green-400">{commodityData.summary.gainers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-metallic-500">Down</p>
                        <p className="text-lg font-bold text-red-400">{commodityData.summary.losers}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Commodity Movers */}
                {commodityData?.movers && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                    <h4 className="font-medium text-metallic-100 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Commodity Movers
                    </h4>
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-green-400 font-medium">Top Gainers</p>
                      {commodityData.movers.gainers?.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex justify-between items-center text-sm">
                          <span className="text-metallic-300">{c.name}</span>
                          <span className="text-green-400">{formatPercent(c.changePercent)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-red-400 font-medium">Top Losers</p>
                      {commodityData.movers.losers?.slice(0, 3).map((c) => (
                        <div key={c.id} className="flex justify-between items-center text-sm">
                          <span className="text-metallic-300">{c.name}</span>
                          <span className="text-red-400">{formatPercent(c.changePercent)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Precious Metals */}
                {commodityData?.byCategory?.precious_metals && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                    <h4 className="font-medium text-metallic-100 mb-3 flex items-center gap-2">
                      <Gem className="w-4 h-4 text-amber-400" />
                      Precious Metals
                    </h4>
                    <div className="space-y-2">
                      {commodityData.byCategory.precious_metals.map((c) => (
                        <CommodityCard key={c.id} commodity={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Base Metals */}
                {commodityData?.byCategory?.base_metals && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                    <h4 className="font-medium text-metallic-100 mb-3 flex items-center gap-2">
                      <Factory className="w-4 h-4 text-blue-400" />
                      Base Metals
                    </h4>
                    <div className="space-y-2">
                      {commodityData.byCategory.base_metals.slice(0, 4).map((c) => (
                        <CommodityCard key={c.id} commodity={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Battery Metals */}
                {commodityData?.byCategory?.battery_metals && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                    <h4 className="font-medium text-metallic-100 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      Battery Metals
                    </h4>
                    <div className="space-y-2">
                      {commodityData.byCategory.battery_metals.map((c) => (
                        <CommodityCard key={c.id} commodity={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Energy */}
                {commodityData?.byCategory?.energy && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                    <h4 className="font-medium text-metallic-100 mb-3 flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-red-400" />
                      Energy
                    </h4>
                    <div className="space-y-2">
                      {commodityData.byCategory.energy.map((c) => (
                        <CommodityCard key={c.id} commodity={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bulk Commodities */}
                {commodityData?.byCategory?.bulk && (
                  <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
                    <h4 className="font-medium text-metallic-100 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      Bulk Commodities
                    </h4>
                    <div className="space-y-2">
                      {commodityData.byCategory.bulk.map((c) => (
                        <CommodityCard key={c.id} commodity={c} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
