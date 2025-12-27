'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, Trash2, Bell, BellOff, MoreVertical, Search, Filter,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Eye, Star
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Mock watchlist data
const mockWatchlists = [
  {
    id: 1,
    name: 'Gold Explorers',
    companies: [
      { ticker: 'NGD', name: 'New Gold Inc', commodity: 'Au', price: 1.85, change: 5.71, alertSet: true },
      { ticker: 'EQX', name: 'Equinox Gold', commodity: 'Au', price: 5.42, change: -2.34, alertSet: false },
      { ticker: 'KGC', name: 'Kinross Gold', commodity: 'Au', price: 8.15, change: 3.18, alertSet: true },
    ],
  },
  {
    id: 2,
    name: 'Battery Metals',
    companies: [
      { ticker: 'LAC', name: 'Lithium Americas', commodity: 'Li', price: 4.28, change: -4.25, alertSet: true },
      { ticker: 'SGML', name: 'Sigma Lithium', commodity: 'Li', price: 12.35, change: 8.42, alertSet: false },
      { ticker: 'ERO', name: 'Ero Copper', commodity: 'Cu', price: 18.92, change: 1.85, alertSet: false },
    ],
  },
  {
    id: 3,
    name: 'Uranium Plays',
    companies: [
      { ticker: 'CCJ', name: 'Cameco Corp', commodity: 'U', price: 44.03, change: 4.31, alertSet: true },
      { ticker: 'NXE', name: 'NexGen Energy', commodity: 'U', price: 7.85, change: 6.23, alertSet: true },
      { ticker: 'DNN', name: 'Denison Mines', commodity: 'U', price: 2.15, change: 3.87, alertSet: false },
    ],
  },
];

function WatchlistCompanyRow({ company, onRemove }: { 
  company: typeof mockWatchlists[0]['companies'][0];
  onRemove: () => void;
}) {
  const [alertEnabled, setAlertEnabled] = useState(company.alertSet);
  const isPositive = company.change >= 0;
  const commodityColor = getCommodityColor(company.commodity);

  return (
    <div className="flex items-center justify-between p-4 border-b border-metallic-800 last:border-b-0 hover:bg-metallic-800/30 transition-colors">
      <Link href={`/company/${company.ticker}`} className="flex items-center gap-3 flex-1">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: commodityColor }}
        >
          {company.commodity}
        </div>
        <div>
          <div className="font-medium text-metallic-100 hover:text-primary-400">{company.ticker}</div>
          <div className="text-xs text-metallic-500">{company.name}</div>
        </div>
      </Link>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-medium text-metallic-100">${company.price.toFixed(2)}</div>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isPositive ? '+' : ''}{company.change.toFixed(2)}%
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              alertEnabled 
                ? 'bg-primary-500/20 text-primary-400' 
                : 'bg-metallic-800 text-metallic-500 hover:bg-metallic-700'
            }`}
            title={alertEnabled ? 'Alerts enabled' : 'Enable alerts'}
          >
            {alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onRemove}
            className="p-2 rounded-lg bg-metallic-800 text-metallic-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Remove from watchlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WatchlistCard({ watchlist, onDelete }: { 
  watchlist: typeof mockWatchlists[0];
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const gainers = watchlist.companies.filter(c => c.change >= 0).length;
  const losers = watchlist.companies.length - gainers;

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-metallic-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-semibold text-metallic-100">{watchlist.name}</h3>
            <div className="flex items-center gap-3 text-xs text-metallic-500">
              <span>{watchlist.companies.length} companies</span>
              <span className="text-green-400">↑{gainers}</span>
              <span className="text-red-400">↓{losers}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg hover:bg-metallic-700 text-metallic-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-metallic-700 text-metallic-500">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Companies */}
      {isExpanded && (
        <div className="border-t border-metallic-800">
          {watchlist.companies.map((company) => (
            <WatchlistCompanyRow 
              key={company.ticker} 
              company={company}
              onRemove={() => {}}
            />
          ))}
          <div className="p-3 border-t border-metallic-800">
            <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
              <Plus className="w-4 h-4" />
              Add company
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WatchlistPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlists, setWatchlists] = useState(mockWatchlists);

  const allCompanies = watchlists.flatMap(w => w.companies);
  const topGainers = [...allCompanies].sort((a, b) => b.change - a.change).slice(0, 3);
  const topLosers = [...allCompanies].sort((a, b) => a.change - b.change).slice(0, 3);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-metallic-100">Watchlists</h1>
              <p className="text-metallic-400 text-sm">Track companies you&apos;re interested in</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                <input
                  type="text"
                  placeholder="Search watchlists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-64"
                />
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Watchlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Watchlists Column */}
          <div className="lg:col-span-2 space-y-6">
            {watchlists.map((watchlist) => (
              <WatchlistCard 
                key={watchlist.id} 
                watchlist={watchlist}
                onDelete={() => setWatchlists(w => w.filter(wl => wl.id !== watchlist.id))}
              />
            ))}

            {watchlists.length === 0 && (
              <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-12 text-center">
                <Eye className="w-12 h-12 text-metallic-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-metallic-100 mb-2">No watchlists yet</h3>
                <p className="text-metallic-400 mb-6">Create your first watchlist to start tracking companies</p>
                <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Create Watchlist
                </button>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Total Watchlists</span>
                  <span className="font-medium text-metallic-100">{watchlists.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Companies Tracked</span>
                  <span className="font-medium text-metallic-100">{allCompanies.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-metallic-400">Active Alerts</span>
                  <span className="font-medium text-metallic-100">
                    {allCompanies.filter(c => c.alertSet).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Movers */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4">Top Gainers</h3>
              <div className="space-y-3">
                {topGainers.map((company) => (
                  <Link
                    key={company.ticker}
                    href={`/company/${company.ticker}`}
                    className="flex items-center justify-between hover:bg-metallic-800/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: getCommodityColor(company.commodity) }}
                      >
                        {company.commodity}
                      </div>
                      <span className="text-sm text-metallic-300">{company.ticker}</span>
                    </div>
                    <span className="text-sm text-green-400">+{company.change.toFixed(2)}%</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4">Top Losers</h3>
              <div className="space-y-3">
                {topLosers.map((company) => (
                  <Link
                    key={company.ticker}
                    href={`/company/${company.ticker}`}
                    className="flex items-center justify-between hover:bg-metallic-800/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: getCommodityColor(company.commodity) }}
                      >
                        {company.commodity}
                      </div>
                      <span className="text-sm text-metallic-300">{company.ticker}</span>
                    </div>
                    <span className="text-sm text-red-400">{company.change.toFixed(2)}%</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
