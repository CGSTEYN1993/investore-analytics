'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, X, ArrowUpRight, ArrowDownRight, BarChart3,
  TrendingUp, DollarSign, Percent, Scale, ChevronDown, Download
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Mock company data for comparison
const availableCompanies = [
  { ticker: 'ABX', name: 'Barrick Gold', commodity: 'Au' },
  { ticker: 'NEM', name: 'Newmont Corp', commodity: 'Au' },
  { ticker: 'KGC', name: 'Kinross Gold', commodity: 'Au' },
  { ticker: 'FCX', name: 'Freeport-McMoRan', commodity: 'Cu' },
  { ticker: 'TECK', name: 'Teck Resources', commodity: 'Cu' },
  { ticker: 'BHP', name: 'BHP Group', commodity: 'Fe' },
  { ticker: 'RIO', name: 'Rio Tinto', commodity: 'Fe' },
  { ticker: 'LAC', name: 'Lithium Americas', commodity: 'Li' },
  { ticker: 'ALB', name: 'Albemarle', commodity: 'Li' },
  { ticker: 'CCJ', name: 'Cameco Corp', commodity: 'U' },
];

// Detailed company metrics
const companyMetrics: Record<string, {
  price: number;
  change: number;
  marketCap: string;
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
  divYield: number;
  debtEquity: number;
  roe: number;
  grossMargin: number;
  operatingMargin: number;
  revenue: string;
  eps: number;
  production: string;
  aisc: string;
  reserves: string;
  resources: string;
}> = {
  'ABX': {
    price: 22.45,
    change: 3.2,
    marketCap: '$38.5B',
    peRatio: 18.2,
    pbRatio: 1.8,
    evEbitda: 7.5,
    divYield: 2.1,
    debtEquity: 0.32,
    roe: 8.5,
    grossMargin: 42.3,
    operatingMargin: 28.5,
    revenue: '$11.2B',
    eps: 1.23,
    production: '4.2Moz Au',
    aisc: '$1,245/oz',
    reserves: '69Moz Au',
    resources: '128Moz Au',
  },
  'NEM': {
    price: 42.80,
    change: 2.1,
    marketCap: '$52.3B',
    peRatio: 22.5,
    pbRatio: 2.1,
    evEbitda: 8.2,
    divYield: 1.8,
    debtEquity: 0.45,
    roe: 7.2,
    grossMargin: 38.5,
    operatingMargin: 24.2,
    revenue: '$12.5B',
    eps: 1.90,
    production: '5.8Moz Au',
    aisc: '$1,318/oz',
    reserves: '96Moz Au',
    resources: '145Moz Au',
  },
  'KGC': {
    price: 8.15,
    change: -1.5,
    marketCap: '$9.8B',
    peRatio: 12.3,
    pbRatio: 1.2,
    evEbitda: 5.8,
    divYield: 2.5,
    debtEquity: 0.28,
    roe: 9.8,
    grossMargin: 35.2,
    operatingMargin: 22.1,
    revenue: '$4.1B',
    eps: 0.66,
    production: '2.1Moz Au',
    aisc: '$1,178/oz',
    reserves: '24Moz Au',
    resources: '45Moz Au',
  },
  'FCX': {
    price: 48.32,
    change: 1.8,
    marketCap: '$68.5B',
    peRatio: 14.5,
    pbRatio: 2.5,
    evEbitda: 6.2,
    divYield: 1.2,
    debtEquity: 0.52,
    roe: 18.5,
    grossMargin: 45.8,
    operatingMargin: 32.1,
    revenue: '$22.8B',
    eps: 3.33,
    production: '4.1Blb Cu',
    aisc: '$1.85/lb',
    reserves: '112Blb Cu',
    resources: '198Blb Cu',
  },
  'LAC': {
    price: 4.28,
    change: 8.5,
    marketCap: '$1.2B',
    peRatio: -15.2,
    pbRatio: 0.8,
    evEbitda: -12.5,
    divYield: 0,
    debtEquity: 0.15,
    roe: -8.2,
    grossMargin: 0,
    operatingMargin: -125.5,
    revenue: '$0',
    eps: -0.28,
    production: 'Pre-production',
    aisc: 'N/A',
    reserves: '3.8Mt LCE',
    resources: '8.4Mt LCE',
  },
};

// Metric categories
const metricCategories = [
  {
    name: 'Valuation',
    metrics: [
      { key: 'price', label: 'Stock Price', format: 'currency' },
      { key: 'change', label: 'Change %', format: 'percent' },
      { key: 'marketCap', label: 'Market Cap', format: 'text' },
      { key: 'peRatio', label: 'P/E Ratio', format: 'number' },
      { key: 'pbRatio', label: 'P/B Ratio', format: 'number' },
      { key: 'evEbitda', label: 'EV/EBITDA', format: 'number' },
    ],
  },
  {
    name: 'Financial',
    metrics: [
      { key: 'revenue', label: 'Revenue', format: 'text' },
      { key: 'eps', label: 'EPS', format: 'currency' },
      { key: 'divYield', label: 'Div Yield', format: 'percent' },
      { key: 'debtEquity', label: 'Debt/Equity', format: 'number' },
      { key: 'roe', label: 'ROE', format: 'percent' },
    ],
  },
  {
    name: 'Margins',
    metrics: [
      { key: 'grossMargin', label: 'Gross Margin', format: 'percent' },
      { key: 'operatingMargin', label: 'Operating Margin', format: 'percent' },
    ],
  },
  {
    name: 'Operations',
    metrics: [
      { key: 'production', label: 'Production', format: 'text' },
      { key: 'aisc', label: 'AISC', format: 'text' },
      { key: 'reserves', label: 'Reserves', format: 'text' },
      { key: 'resources', label: 'Resources', format: 'text' },
    ],
  },
];

function formatMetric(value: number | string, format: string): string {
  if (typeof value === 'string') return value;
  switch (format) {
    case 'currency':
      return `$${value.toFixed(2)}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'number':
      return value.toFixed(2);
    default:
      return String(value);
  }
}

function MetricRow({ 
  label, 
  metricKey, 
  format, 
  companies 
}: { 
  label: string;
  metricKey: string;
  format: string;
  companies: string[];
}) {
  const values = companies.map(ticker => {
    const metrics = companyMetrics[ticker];
    return metrics ? metrics[metricKey as keyof typeof metrics] : null;
  });

  // Find best value for highlighting (simplified logic)
  const numericValues = values.filter(v => typeof v === 'number') as number[];
  const maxIdx = metricKey === 'debtEquity' || metricKey === 'aisc' 
    ? numericValues.indexOf(Math.min(...numericValues))
    : numericValues.indexOf(Math.max(...numericValues));

  return (
    <tr className="border-b border-metallic-800/50">
      <td className="py-3 px-4 text-sm text-metallic-400 font-medium">{label}</td>
      {values.map((value, idx) => (
        <td 
          key={idx} 
          className={`py-3 px-4 text-sm text-center ${
            idx === maxIdx && numericValues.length > 1 ? 'text-green-400 font-medium' : 'text-metallic-100'
          }`}
        >
          {value !== null ? formatMetric(value, format) : '-'}
        </td>
      ))}
    </tr>
  );
}

export default function ComparePage() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['ABX', 'NEM', 'KGC']);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');

  const addCompany = (ticker: string) => {
    if (!selectedCompanies.includes(ticker) && selectedCompanies.length < 5) {
      setSelectedCompanies([...selectedCompanies, ticker]);
    }
    setShowAddModal(false);
  };

  const removeCompany = (ticker: string) => {
    setSelectedCompanies(selectedCompanies.filter(t => t !== ticker));
  };

  const filteredCompanies = availableCompanies.filter(
    c => !selectedCompanies.includes(c.ticker) &&
    (c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-metallic-400 mb-2">
                <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
                <span>/</span>
                <span className="text-metallic-300">Compare</span>
              </div>
              <h1 className="text-2xl font-bold text-metallic-100">Company Comparison</h1>
              <p className="text-metallic-400 text-sm">Compare mining companies side by side</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-metallic-800 text-metallic-300 rounded-lg hover:bg-metallic-700 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Selected Companies */}
          <div className="flex flex-wrap items-center gap-3">
            {selectedCompanies.map((ticker) => {
              const company = availableCompanies.find(c => c.ticker === ticker);
              const metrics = companyMetrics[ticker];
              if (!company) return null;

              return (
                <div 
                  key={ticker}
                  className="flex items-center gap-3 px-4 py-3 bg-metallic-800/50 rounded-lg"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: getCommodityColor(company.commodity) }}
                  >
                    {company.commodity}
                  </div>
                  <div>
                    <div className="font-medium text-metallic-100">{ticker}</div>
                    <div className="text-xs text-metallic-500">{company.name}</div>
                  </div>
                  {metrics && (
                    <div className={`text-sm ${metrics.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {metrics.change >= 0 ? '+' : ''}{metrics.change}%
                    </div>
                  )}
                  <button
                    onClick={() => removeCompany(ticker)}
                    className="p-1 rounded hover:bg-metallic-700 text-metallic-500 hover:text-metallic-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            
            {selectedCompanies.length < 5 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-metallic-700 rounded-lg text-metallic-500 hover:border-primary-500 hover:text-primary-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Company
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCompanies.length < 2 ? (
          <div className="text-center py-16">
            <Scale className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-metallic-100 mb-2">Select at least 2 companies</h2>
            <p className="text-metallic-400 mb-6">Add companies to start comparing their metrics</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add Companies
            </button>
          </div>
        ) : (
          <>
            {/* Chart Type Selector */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-metallic-100">Visual Comparison</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    chartType === 'bar' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-metallic-800 text-metallic-400'
                  }`}
                >
                  Bar Chart
                </button>
                <button
                  onClick={() => setChartType('radar')}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    chartType === 'radar' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-metallic-800 text-metallic-400'
                  }`}
                >
                  Radar Chart
                </button>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-8 mb-8">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-metallic-600 mx-auto mb-4" />
                  <p className="text-metallic-400">
                    {chartType === 'bar' ? 'Bar Chart' : 'Radar Chart'} comparison visualization
                  </p>
                  <p className="text-sm text-metallic-500 mt-2">
                    Connect to real data API for interactive charts
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Comparison Table */}
            {metricCategories.map((category) => (
              <div key={category.name} className="mb-8">
                <h3 className="text-lg font-semibold text-metallic-100 mb-4">{category.name}</h3>
                <div className="bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-metallic-800/50">
                        <th className="py-3 px-4 text-left text-xs text-metallic-500 font-medium">Metric</th>
                        {selectedCompanies.map((ticker) => (
                          <th key={ticker} className="py-3 px-4 text-center text-xs text-metallic-500 font-medium">
                            {ticker}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {category.metrics.map((metric) => (
                        <MetricRow
                          key={metric.key}
                          label={metric.label}
                          metricKey={metric.key}
                          format={metric.format}
                          companies={selectedCompanies}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Score Summary */}
            <div className="bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-xl p-6">
              <h3 className="font-semibold text-metallic-100 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                AI-Powered Insights
              </h3>
              <p className="text-metallic-300 text-sm mb-4">
                Based on the compared metrics, here are key observations:
              </p>
              <ul className="space-y-2 text-sm text-metallic-400">
                <li>• <span className="text-metallic-200">Barrick Gold (ABX)</span> offers the best combination of valuation and operational efficiency</li>
                <li>• <span className="text-metallic-200">Kinross (KGC)</span> has the lowest AISC among gold producers, indicating strong cost control</li>
                <li>• <span className="text-metallic-200">Newmont (NEM)</span> leads in production volume but trades at a premium P/E ratio</li>
              </ul>
              <p className="text-xs text-metallic-500 mt-4">
                * AI insights are for informational purposes only and should not be considered financial advice
              </p>
            </div>
          </>
        )}
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-metallic-800">
              <h3 className="font-semibold text-metallic-100">Add Company</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-metallic-800 text-metallic-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                <input
                  type="text"
                  placeholder="Search by ticker or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredCompanies.map((company) => (
                  <button
                    key={company.ticker}
                    onClick={() => addCompany(company.ticker)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-metallic-800 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getCommodityColor(company.commodity) }}
                    >
                      {company.commodity}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-metallic-100">{company.ticker}</div>
                      <div className="text-sm text-metallic-500">{company.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
