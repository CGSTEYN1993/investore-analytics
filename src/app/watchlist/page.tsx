'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Bell, BellOff, MoreVertical, Search,
  ArrowUpRight, ArrowDownRight, Eye, Star
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Watchlist data will be loaded from the `/api/v1/trading/watchlists` endpoint once
// the API is available. Until then we show an empty state rather than mock data.
interface WatchlistCompany {
  ticker: string;
  name: string;
  commodity: string;
  price: number | null;
  change: number | null;
  alertSet: boolean;
}

interface Watchlist {
  id: number;
  name: string;
  companies: WatchlistCompany[];
}

const NA = <span className="text-metallic-500">N/A</span>;

function formatPrice(p: number | null) {
  return p == null ? NA : <>${p.toFixed(2)}</>;
}

function formatChange(c: number | null) {
  if (c == null) return <span className="text-sm text-metallic-500">N/A</span>;
  const isPositive = c >= 0;
  return (
    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {isPositive ? '+' : ''}{c.toFixed(2)}%
    </div>
  );
}

function WatchlistCompanyRow({ company, onRemove }: {
  company: WatchlistCompany;
  onRemove: () => void;
}) {
  const [alertEnabled, setAlertEnabled] = useState(company.alertSet);
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
          <div className="font-medium text-metallic-100">{formatPrice(company.price)}</div>
          {formatChange(company.change)}
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
  watchlist: Watchlist;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const gainers = watchlist.companies.filter(c => (c.change ?? 0) >= 0).length;
  const losers = watchlist.companies.filter(c => (c.change ?? 0) < 0).length;

  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
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
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg hover:bg-metallic-700 text-metallic-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-metallic-700 text-metallic-500">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-metallic-800">
          {watchlist.companies.length === 0 ? (
            <div className="p-6 text-center text-sm text-metallic-500">
              No companies yet. Click <span className="text-primary-400">Add company</span> below to start tracking.
            </div>
          ) : (
            watchlist.companies.map((company) => (
              <WatchlistCompanyRow
                key={company.ticker}
                company={company}
                onRemove={() => {}}
              />
            ))
          )}
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
  // Start with no watchlists — user creates their own.
  // TODO: replace with fetch('/api/v1/trading/watchlists') when the endpoint is live.
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);

  const allCompanies = watchlists.flatMap(w => w.companies);

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
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
                <p className="text-metallic-400 mb-6">Create your first watchlist to start tracking companies. Live price data will appear here once you add tickers.</p>
                <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  Create Watchlist
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
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

            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4">Top Gainers</h3>
              <p className="text-sm text-metallic-500">N/A — add companies to your watchlist to see the biggest daily gainers.</p>
            </div>

            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4">Top Losers</h3>
              <p className="text-sm text-metallic-500">N/A — add companies to your watchlist to see the biggest daily losers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
