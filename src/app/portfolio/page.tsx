'use client';

import React, { useState } from 'react';
import {
  Plus, TrendingUp, TrendingDown,
  PieChart, BarChart3, DollarSign, Percent, Briefcase
} from 'lucide-react';

// Portfolio data will be loaded from `/api/v1/trading/accounts/{id}/holdings`
// once the endpoint is wired up to this page. Until then we show an empty state
// so users are not misled by mock holdings.
interface Holding {
  ticker: string;
  name: string;
  commodity: string;
  shares: number;
  avgCost: number;
  currentPrice: number | null;
  value: number | null;
  cost: number;
  returnAmount: number | null;
  returnPercent: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  weight: number | null;
}

interface Portfolio {
  name: string;
  totalValue: number | null;
  totalCost: number;
  totalReturn: number | null;
  totalReturnPercent: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  holdings: Holding[];
}

const NA = <span className="text-metallic-500">N/A</span>;
const fmtMoney = (v: number | null) => v == null ? NA : <>${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>;
const fmtPct = (v: number | null) => v == null ? NA : <>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</>;

export default function PortfolioPage() {
  // Start with an empty portfolio. User adds holdings via "Add Holding".
  // TODO: fetch from /api/v1/trading/accounts when integrated.
  const [portfolio] = useState<Portfolio>({
    name: 'My Mining Portfolio',
    totalValue: null,
    totalCost: 0,
    totalReturn: null,
    totalReturnPercent: null,
    dayChange: null,
    dayChangePercent: null,
    holdings: [],
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const isPositiveTotal = (portfolio.totalReturn ?? 0) >= 0;
  const isPositiveDay = (portfolio.dayChange ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-metallic-100">{portfolio.name}</h1>
              <p className="text-metallic-400 text-sm">Track your mining investments</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Holding
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-metallic-400">Total Value</span>
              <DollarSign className="w-5 h-5 text-metallic-600" />
            </div>
            <div className="text-3xl font-bold text-metallic-100">{fmtMoney(portfolio.totalValue)}</div>
            <div className={`flex items-center gap-1 mt-1 ${isPositiveDay ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio.dayChange != null && (isPositiveDay ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />)}
              <span className="text-sm">
                {portfolio.dayChange == null ? 'No day change data' : (
                  <>{isPositiveDay ? '+' : ''}${portfolio.dayChange.toLocaleString()} ({portfolio.dayChangePercent?.toFixed(2)}%) today</>
                )}
              </span>
            </div>
          </div>

          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-metallic-400">Total Return</span>
              <Percent className="w-5 h-5 text-metallic-600" />
            </div>
            <div className={`text-3xl font-bold ${portfolio.totalReturn == null ? 'text-metallic-100' : isPositiveTotal ? 'text-green-400' : 'text-red-400'}`}>
              {fmtMoney(portfolio.totalReturn)}
            </div>
            <div className={`text-sm ${portfolio.totalReturnPercent == null ? 'text-metallic-500' : isPositiveTotal ? 'text-green-400' : 'text-red-400'}`}>
              {fmtPct(portfolio.totalReturnPercent)} all time
            </div>
          </div>

          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-metallic-400">Cost Basis</span>
              <BarChart3 className="w-5 h-5 text-metallic-600" />
            </div>
            <div className="text-3xl font-bold text-metallic-100">
              ${portfolio.totalCost.toLocaleString()}
            </div>
            <div className="text-sm text-metallic-500">
              {portfolio.holdings.length} holdings
            </div>
          </div>

          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-metallic-400">Allocation</span>
              <PieChart className="w-5 h-5 text-metallic-600" />
            </div>
            {portfolio.holdings.length === 0 ? (
              <p className="text-sm text-metallic-500 mt-3">N/A</p>
            ) : (
              <div className="space-y-2 mt-3">
                {portfolio.holdings.slice(0, 4).map((h) => (
                  <div key={h.ticker} className="flex items-center gap-2">
                    <span className="text-xs text-metallic-400 flex-1">{h.ticker}</span>
                    <span className="text-xs text-metallic-300">{h.weight == null ? 'N/A' : `${h.weight.toFixed(1)}%`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Holdings Table or Empty State */}
        <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-metallic-800">
            <h2 className="text-lg font-semibold text-metallic-100">Holdings</h2>
          </div>
          {portfolio.holdings.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-metallic-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-metallic-100 mb-2">No holdings yet</h3>
              <p className="text-metallic-400 mb-6 max-w-md mx-auto">
                Add your first position to start tracking performance, returns, and allocation across your mining portfolio.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Holding
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-metallic-800/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-metallic-400">Company</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Shares</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Avg Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Price</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Day</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Value</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Return</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((h) => (
                    <tr key={h.ticker} className="border-b border-metallic-800 hover:bg-metallic-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-metallic-100">{h.ticker}</div>
                        <div className="text-xs text-metallic-500">{h.name}</div>
                      </td>
                      <td className="py-4 px-4 text-right text-metallic-300">{h.shares.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-metallic-300">${h.avgCost.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right text-metallic-100">{fmtMoney(h.currentPrice)}</td>
                      <td className="py-4 px-4 text-right">{fmtPct(h.dayChangePercent)}</td>
                      <td className="py-4 px-4 text-right text-metallic-100">{fmtMoney(h.value)}</td>
                      <td className="py-4 px-4 text-right">{fmtMoney(h.returnAmount)} <span className="text-xs">({fmtPct(h.returnPercent)})</span></td>
                      <td className="py-4 px-4 text-right text-metallic-400">{h.weight == null ? NA : `${h.weight.toFixed(1)}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Section */}
        <div className="mt-8 bg-metallic-900 border border-metallic-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-metallic-100">Performance</h2>
            <div className="flex items-center gap-2">
              {['1W', '1M', '3M', '6M', '1Y', 'All'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 text-sm rounded-lg bg-metallic-800 text-metallic-400 hover:bg-metallic-700 transition-colors"
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 rounded-lg bg-metallic-800/30 flex items-center justify-center">
            <span className="text-metallic-500">N/A — performance chart will appear once you add holdings.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
