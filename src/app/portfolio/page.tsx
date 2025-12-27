'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, Trash2, Edit2, TrendingUp, TrendingDown, MoreVertical,
  PieChart, BarChart3, DollarSign, Percent, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Mock portfolio data
const mockPortfolio = {
  name: 'My Mining Portfolio',
  totalValue: 125430.50,
  totalCost: 98750.00,
  totalReturn: 26680.50,
  totalReturnPercent: 27.01,
  dayChange: 1532.40,
  dayChangePercent: 1.24,
  holdings: [
    {
      ticker: 'NEM',
      name: 'Newmont Corporation',
      commodity: 'Au',
      shares: 500,
      avgCost: 38.50,
      currentPrice: 42.85,
      value: 21425.00,
      cost: 19250.00,
      return: 2175.00,
      returnPercent: 11.30,
      dayChange: 1.23,
      dayChangePercent: 2.95,
      weight: 17.1,
    },
    {
      ticker: 'FCX',
      name: 'Freeport-McMoRan',
      commodity: 'Cu',
      shares: 800,
      avgCost: 35.20,
      currentPrice: 41.30,
      value: 33040.00,
      cost: 28160.00,
      return: 4880.00,
      returnPercent: 17.33,
      dayChange: 0.85,
      dayChangePercent: 2.10,
      weight: 26.3,
    },
    {
      ticker: 'ALB',
      name: 'Albemarle Corporation',
      commodity: 'Li',
      shares: 200,
      avgCost: 125.00,
      currentPrice: 98.45,
      value: 19690.00,
      cost: 25000.00,
      return: -5310.00,
      returnPercent: -21.24,
      dayChange: -2.15,
      dayChangePercent: -2.14,
      weight: 15.7,
    },
    {
      ticker: 'BHP',
      name: 'BHP Group',
      commodity: 'Fe',
      shares: 400,
      avgCost: 58.30,
      currentPrice: 62.15,
      value: 24860.00,
      cost: 23320.00,
      return: 1540.00,
      returnPercent: 6.60,
      dayChange: 0.45,
      dayChangePercent: 0.73,
      weight: 19.8,
    },
    {
      ticker: 'CCJ',
      name: 'Cameco Corporation',
      commodity: 'U',
      shares: 600,
      avgCost: 28.70,
      currentPrice: 44.03,
      value: 26418.00,
      cost: 17220.00,
      return: 9198.00,
      returnPercent: 53.41,
      dayChange: 1.82,
      dayChangePercent: 4.31,
      weight: 21.1,
    },
  ],
};

function HoldingRow({ holding }: { holding: typeof mockPortfolio.holdings[0] }) {
  const isPositiveReturn = holding.return >= 0;
  const isPositiveDay = holding.dayChange >= 0;
  const commodityColor = getCommodityColor(holding.commodity);

  return (
    <tr className="border-b border-metallic-800 hover:bg-metallic-800/30 transition-colors">
      <td className="py-4 px-4">
        <Link href={`/company/${holding.ticker}`} className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: commodityColor }}
          >
            {holding.commodity}
          </div>
          <div>
            <div className="font-medium text-metallic-100 hover:text-primary-400">{holding.ticker}</div>
            <div className="text-xs text-metallic-500">{holding.name}</div>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 text-right text-metallic-300">{holding.shares.toLocaleString()}</td>
      <td className="py-4 px-4 text-right text-metallic-300">${holding.avgCost.toFixed(2)}</td>
      <td className="py-4 px-4 text-right text-metallic-100">${holding.currentPrice.toFixed(2)}</td>
      <td className="py-4 px-4 text-right">
        <div className={`flex items-center justify-end gap-1 ${isPositiveDay ? 'text-green-400' : 'text-red-400'}`}>
          {isPositiveDay ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {isPositiveDay ? '+' : ''}{holding.dayChangePercent.toFixed(2)}%
        </div>
      </td>
      <td className="py-4 px-4 text-right text-metallic-100">${holding.value.toLocaleString()}</td>
      <td className="py-4 px-4 text-right">
        <div className={isPositiveReturn ? 'text-green-400' : 'text-red-400'}>
          ${Math.abs(holding.return).toLocaleString()}
          <div className="text-xs">({isPositiveReturn ? '+' : ''}{holding.returnPercent.toFixed(2)}%)</div>
        </div>
      </td>
      <td className="py-4 px-4 text-right text-metallic-400">{holding.weight.toFixed(1)}%</td>
      <td className="py-4 px-4">
        <button className="p-1 rounded hover:bg-metallic-700 text-metallic-500">
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

export default function PortfolioPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const portfolio = mockPortfolio;
  const isPositiveTotal = portfolio.totalReturn >= 0;
  const isPositiveDay = portfolio.dayChange >= 0;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Total Value */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-metallic-400">Total Value</span>
              <DollarSign className="w-5 h-5 text-metallic-600" />
            </div>
            <div className="text-3xl font-bold text-metallic-100">
              ${portfolio.totalValue.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 mt-1 ${isPositiveDay ? 'text-green-400' : 'text-red-400'}`}>
              {isPositiveDay ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm">
                {isPositiveDay ? '+' : ''}${portfolio.dayChange.toLocaleString()} ({portfolio.dayChangePercent.toFixed(2)}%) today
              </span>
            </div>
          </div>

          {/* Total Return */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-metallic-400">Total Return</span>
              <Percent className="w-5 h-5 text-metallic-600" />
            </div>
            <div className={`text-3xl font-bold ${isPositiveTotal ? 'text-green-400' : 'text-red-400'}`}>
              {isPositiveTotal ? '+' : ''}${portfolio.totalReturn.toLocaleString()}
            </div>
            <div className={`text-sm ${isPositiveTotal ? 'text-green-400' : 'text-red-400'}`}>
              {isPositiveTotal ? '+' : ''}{portfolio.totalReturnPercent.toFixed(2)}% all time
            </div>
          </div>

          {/* Cost Basis */}
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

          {/* Allocation Chart */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-metallic-400">Allocation</span>
              <PieChart className="w-5 h-5 text-metallic-600" />
            </div>
            {/* Mini allocation bars */}
            <div className="space-y-2 mt-3">
              {portfolio.holdings.slice(0, 4).map((h) => (
                <div key={h.ticker} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: getCommodityColor(h.commodity) }}
                  />
                  <span className="text-xs text-metallic-400 flex-1">{h.ticker}</span>
                  <span className="text-xs text-metallic-300">{h.weight.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-metallic-800">
            <h2 className="text-lg font-semibold text-metallic-100">Holdings</h2>
          </div>
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
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => (
                  <HoldingRow key={holding.ticker} holding={holding} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
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
            <span className="text-metallic-500">Portfolio performance chart would display here</span>
          </div>
        </div>
      </div>
    </div>
  );
}
