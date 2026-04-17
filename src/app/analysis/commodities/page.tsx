'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, ChevronRight, TrendingUp, TrendingDown, Building2, Loader2, RefreshCw } from 'lucide-react';
import { getCommodityColor, COMMODITY_COLORS } from '@/lib/subscription-tiers';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

const API_URL = RAILWAY_API_URL;

interface Commodity {
  symbol: string;
  name: string;
  companies: number | null;
  change: number | null;
}

interface CommodityCategory {
  name: string;
  commodities: Commodity[];
}

// Fallback static data (used when API unavailable). Values are null so the UI
// renders "N/A" rather than misleading zeros until the API responds.
const fallbackCategories: CommodityCategory[] = [
  {
    name: 'Precious Metals',
    commodities: [
      { symbol: 'Au', name: 'Gold', companies: null, change: null },
      { symbol: 'Ag', name: 'Silver', companies: null, change: null },
      { symbol: 'Pt', name: 'Platinum', companies: null, change: null },
      { symbol: 'Pd', name: 'Palladium', companies: null, change: null },
    ],
  },
  {
    name: 'Base Metals',
    commodities: [
      { symbol: 'Cu', name: 'Copper', companies: null, change: null },
      { symbol: 'Zn', name: 'Zinc', companies: null, change: null },
      { symbol: 'Ni', name: 'Nickel', companies: null, change: null },
      { symbol: 'Pb', name: 'Lead', companies: null, change: null },
      { symbol: 'Sn', name: 'Tin', companies: null, change: null },
    ],
  },
  {
    name: 'Battery Metals',
    commodities: [
      { symbol: 'Li', name: 'Lithium', companies: null, change: null },
      { symbol: 'Co', name: 'Cobalt', companies: null, change: null },
      { symbol: 'C', name: 'Graphite', companies: null, change: null },
      { symbol: 'Mn', name: 'Manganese', companies: null, change: null },
      { symbol: 'V', name: 'Vanadium', companies: null, change: null },
    ],
  },
  {
    name: 'Bulk Commodities',
    commodities: [
      { symbol: 'Fe', name: 'Iron Ore', companies: null, change: null },
      { symbol: 'Coal', name: 'Coal', companies: null, change: null },
      { symbol: 'K', name: 'Potash', companies: null, change: null },
    ],
  },
  {
    name: 'Specialty & Critical',
    commodities: [
      { symbol: 'U', name: 'Uranium', companies: null, change: null },
      { symbol: 'REE', name: 'Rare Earths', companies: null, change: null },
      { symbol: 'W', name: 'Tungsten', companies: null, change: null },
      { symbol: 'Mo', name: 'Molybdenum', companies: null, change: null },
    ],
  },
  {
    name: 'Gems & Industrial',
    commodities: [
      { symbol: '💎', name: 'Diamonds', companies: null, change: null },
      { symbol: 'Ti', name: 'Titanium', companies: null, change: null },
      { symbol: 'Cr', name: 'Chromium', companies: null, change: null },
    ],
  },
];

function CommodityCard({ commodity }: { commodity: Commodity }) {
  const change = commodity.change;
  const isPositive = (change ?? 0) >= 0;
  const color = getCommodityColor(commodity.name);

  // URL-safe commodity name for routing
  const commoditySlug = commodity.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      href={`/analysis/commodities/${commoditySlug}`}
      className="group relative bg-metallic-900 border border-metallic-800 rounded-xl p-5 hover:border-primary-500/50 transition-all hover:bg-metallic-800/50"
    >
      <div
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {commodity.symbol.slice(0, 2)}
          </div>
          <div>
            <h3 className="font-semibold text-metallic-100 group-hover:text-primary-400 transition-colors">
              {commodity.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-metallic-500">
              <Building2 className="w-3 h-3" />
              {commodity.companies == null
                ? <span className="text-metallic-500">N/A</span>
                : <>{commodity.companies.toLocaleString()} companies</>}
            </div>
          </div>
        </div>
        {change != null && change !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
      </div>

      {/* Intentionally no mini chart — the previous sparkline used Math.random()
          which was misleading. A real price history chart can be added here once
          commodity price history is wired up. */}
      <div className="h-12 flex items-center justify-center text-[10px] text-metallic-600">
        Price history: N/A
      </div>
      
      <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-metallic-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export default function CommoditiesAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [commodityCategories, setCommodityCategories] = useState<CommodityCategory[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompanies, setTotalCompanies] = useState(0);

  const fetchCommodityData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/v1/spatial/commodities/analysis`);
      if (!response.ok) throw new Error('Failed to fetch commodity data');
      
      const data = await response.json();
      
      if (data.categories && data.categories.length > 0) {
        setCommodityCategories(data.categories);
        // Calculate total companies
        const total = data.categories.reduce((sum: number, cat: CommodityCategory) =>
          sum + cat.commodities.reduce((catSum: number, comm: Commodity) => catSum + (comm.companies ?? 0), 0), 0
        );
        setTotalCompanies(total);
      }
    } catch (err) {
      console.error('Error fetching commodity data:', err);
      setError('Unable to fetch live data. Showing cached data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodityData();
  }, []);

  // Filter commodities based on search and category
  const filteredCategories = commodityCategories
    .map(category => ({
      ...category,
      commodities: category.commodities.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => 
      (!selectedCategory || category.name === selectedCategory) &&
      category.commodities.length > 0
    );

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-metallic-100">Analysis by Commodity</h1>
              <p className="text-metallic-400 text-sm">
                Explore mining companies by commodity type
                {totalCompanies > 0 && (
                  <span className="ml-2 text-primary-400">• {totalCompanies.toLocaleString()} total company listings</span>
                )}
              </p>
            </div>
            <button
              onClick={fetchCommodityData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
              {error}
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-metallic-500" />
              <input
                type="text"
                placeholder="Search commodities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700'
                }`}
              >
                All
              </button>
              {commodityCategories.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
            <p className="text-metallic-400">Loading commodity data from database...</p>
          </div>
        ) : (
          <>
            {filteredCategories.map(category => (
              <section key={category.name} className="mb-10">
                <h2 className="text-lg font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                  {category.name}
                  <span className="text-sm font-normal text-metallic-500">
                    ({category.commodities.length} commodities, {category.commodities.reduce((sum, c) => sum + (c.companies ?? 0), 0).toLocaleString()} companies)
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.commodities.map(commodity => (
                    <CommodityCard key={commodity.symbol} commodity={commodity} />
                  ))}
                </div>
              </section>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-metallic-400">No commodities found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
