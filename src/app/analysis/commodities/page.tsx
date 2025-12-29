'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, ChevronRight, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { getCommodityColor, COMMODITY_COLORS } from '@/lib/subscription-tiers';

// Commodity categories
const commodityCategories = [
  {
    name: 'Precious Metals',
    commodities: [
      { symbol: 'Au', name: 'Gold', companies: 1250, change: 2.4 },
      { symbol: 'Ag', name: 'Silver', companies: 480, change: 1.8 },
      { symbol: 'Pt', name: 'Platinum', companies: 85, change: -0.5 },
      { symbol: 'Pd', name: 'Palladium', companies: 65, change: -1.2 },
    ],
  },
  {
    name: 'Base Metals',
    commodities: [
      { symbol: 'Cu', name: 'Copper', companies: 890, change: 3.1 },
      { symbol: 'Zn', name: 'Zinc', companies: 320, change: 0.8 },
      { symbol: 'Ni', name: 'Nickel', companies: 275, change: 1.5 },
      { symbol: 'Pb', name: 'Lead', companies: 180, change: -0.3 },
    ],
  },
  {
    name: 'Battery Metals',
    commodities: [
      { symbol: 'Li', name: 'Lithium', companies: 420, change: 5.2 },
      { symbol: 'Co', name: 'Cobalt', companies: 145, change: 2.8 },
      { symbol: 'Graphite', name: 'Graphite', companies: 110, change: 1.9 },
      { symbol: 'Mn', name: 'Manganese', companies: 95, change: 0.6 },
      { symbol: 'V', name: 'Vanadium', companies: 45, change: 3.4 },
    ],
  },
  {
    name: 'Bulk Commodities',
    commodities: [
      { symbol: 'Fe', name: 'Iron Ore', companies: 580, change: -0.8 },
      { symbol: 'Coal', name: 'Coal', companies: 320, change: -2.1 },
      { symbol: 'Potash', name: 'Potash', companies: 75, change: 1.2 },
    ],
  },
  {
    name: 'Specialty & Critical',
    commodities: [
      { symbol: 'U', name: 'Uranium', companies: 185, change: 8.5 },
      { symbol: 'REE', name: 'Rare Earths', companies: 120, change: 4.2 },
      { symbol: 'W', name: 'Tungsten', companies: 35, change: 1.1 },
      { symbol: 'Sn', name: 'Tin', companies: 65, change: 0.9 },
      { symbol: 'Mo', name: 'Molybdenum', companies: 55, change: 2.3 },
    ],
  },
  {
    name: 'Gems & Industrial',
    commodities: [
      { symbol: 'Diamond', name: 'Diamonds', companies: 95, change: -0.4 },
      { symbol: 'Ti', name: 'Titanium', companies: 40, change: 0.7 },
      { symbol: 'Cr', name: 'Chromium', companies: 30, change: 1.5 },
    ],
  },
];

function CommodityCard({ commodity }: { commodity: typeof commodityCategories[0]['commodities'][0] }) {
  const color = getCommodityColor(commodity.symbol);
  const isPositive = commodity.change >= 0;
  
  return (
    <Link
      href={`/analysis/commodities/${commodity.symbol.toLowerCase()}`}
      className="group relative bg-metallic-900 border border-metallic-800 rounded-xl p-5 hover:border-primary-500/50 transition-all hover:bg-metallic-800/50"
    >
      {/* Commodity color indicator */}
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
              {commodity.companies.toLocaleString()} companies
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isPositive ? '+' : ''}{commodity.change}%
        </div>
      </div>
      
      {/* Mini chart placeholder - would be actual data */}
      <div className="h-12 flex items-end gap-0.5">
        {[...Array(20)].map((_, i) => {
          const height = Math.random() * 100;
          return (
            <div
              key={i}
              className="flex-1 rounded-t transition-all group-hover:opacity-80"
              style={{ 
                height: `${height}%`, 
                backgroundColor: color,
                opacity: 0.3 + (i / 30)
              }}
            />
          );
        })}
      </div>
      
      <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-metallic-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

export default function CommoditiesAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-metallic-800/80 hover:bg-metallic-700 border border-metallic-700 rounded-md text-sm text-metallic-300 hover:text-metallic-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-metallic-100">Analysis by Commodity</h1>
              <p className="text-metallic-400 text-sm">Explore mining companies by commodity type</p>
            </div>
          </div>

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCategories.map(category => (
          <section key={category.name} className="mb-10">
            <h2 className="text-lg font-semibold text-metallic-100 mb-4 flex items-center gap-2">
              {category.name}
              <span className="text-sm font-normal text-metallic-500">
                ({category.commodities.length} commodities)
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
      </div>
    </div>
  );
}
