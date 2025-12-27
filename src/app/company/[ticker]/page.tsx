'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ExternalLink, MapPin, Building2, Calendar, TrendingUp, TrendingDown,
  Bookmark, BookmarkCheck, Bell, Share2, FileText, Hammer, Globe, ChevronRight,
  BarChart3, DollarSign, Users, Layers, Download
} from 'lucide-react';
import { getCommodityColor } from '@/lib/subscription-tiers';

// Mock company data - would come from API
const mockCompany = {
  id: 1,
  ticker: 'NEM',
  exchange: 'NYSE',
  name: 'Newmont Corporation',
  country: 'United States',
  website: 'https://www.newmont.com',
  primaryCommodity: 'Au',
  description: 'Newmont is the world\'s largest gold mining company, with operations and assets on five continents.',
  marketData: {
    price: 42.85,
    change: 1.23,
    changePercent: 2.95,
    volume: 8542100,
    marketCap: 53200000000,
    high52w: 55.43,
    low52w: 32.11,
    avgVolume: 7200000,
    sharesOutstanding: 1241000000,
    dividend: 1.60,
    dividendYield: 3.73,
  },
  projects: [
    { name: 'Boddington', country: 'Australia', stage: 'Production', commodity: 'Au' },
    { name: 'Tanami', country: 'Australia', stage: 'Production', commodity: 'Au' },
    { name: 'Cadia', country: 'Australia', stage: 'Production', commodity: 'Au' },
    { name: 'Lihir', country: 'Papua New Guinea', stage: 'Production', commodity: 'Au' },
  ],
  announcements: [
    { date: '2024-12-20', title: 'Q4 2024 Production Results', type: 'Operational' },
    { date: '2024-12-15', title: 'Dividend Declaration', type: 'Financial' },
    { date: '2024-12-10', title: 'Exploration Update - Tanami', type: 'Drilling' },
  ],
  resources: {
    measured: { tonnage: 450000000, grade: 1.2, contained: 17360000 },
    indicated: { tonnage: 620000000, grade: 1.1, contained: 21920000 },
    inferred: { tonnage: 380000000, grade: 0.9, contained: 11000000 },
  },
};

function StatCard({ label, value, subValue, icon: Icon, trend }: { 
  label: string; 
  value: string; 
  subValue?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-metallic-500 uppercase tracking-wide">{label}</span>
        <Icon className="w-4 h-4 text-metallic-600" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-metallic-100">{value}</span>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
          </span>
        )}
      </div>
      {subValue && <span className="text-xs text-metallic-500">{subValue}</span>}
    </div>
  );
}

export default function CompanyProfile({ params }: { params: { ticker: string } }) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const company = mockCompany; // Would fetch based on params.ticker
  const commodityColor = getCommodityColor(company.primaryCommodity);
  
  const isPositive = company.marketData.changePercent >= 0;

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-metallic-500 mb-4">
            <Link href="/analysis" className="hover:text-primary-400">Analysis</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/analysis/commodities" className="hover:text-primary-400">Commodities</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-metallic-300">{company.ticker}</span>
          </div>

          {/* Company Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Company Logo/Symbol */}
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: commodityColor }}
              >
                {company.primaryCommodity}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-metallic-100">{company.name}</h1>
                  <span className="px-2 py-1 bg-metallic-800 rounded text-sm text-metallic-400">
                    {company.ticker}:{company.exchange}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-metallic-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.country}
                  </span>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-400 hover:text-primary-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                </div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center gap-4">
              {/* Current Price */}
              <div className="text-right">
                <div className="text-3xl font-bold text-metallic-100">
                  ${company.marketData.price.toFixed(2)}
                </div>
                <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>${Math.abs(company.marketData.change).toFixed(2)}</span>
                  <span>({isPositive ? '+' : ''}{company.marketData.changePercent.toFixed(2)}%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isWatchlisted 
                      ? 'bg-primary-500/20 border-primary-500/50 text-primary-400' 
                      : 'bg-metallic-800 border-metallic-700 text-metallic-400 hover:bg-metallic-700'
                  }`}
                >
                  {isWatchlisted ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button className="p-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-400 hover:bg-metallic-700 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-lg bg-metallic-800 border border-metallic-700 text-metallic-400 hover:bg-metallic-700 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">About</h2>
              <p className="text-metallic-400 leading-relaxed">{company.description}</p>
            </section>

            {/* Market Data Grid */}
            <section>
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">Market Data</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                  label="Market Cap" 
                  value={`$${(company.marketData.marketCap / 1e9).toFixed(1)}B`}
                  icon={Building2}
                />
                <StatCard 
                  label="Volume" 
                  value={company.marketData.volume.toLocaleString()}
                  subValue={`Avg: ${(company.marketData.avgVolume / 1e6).toFixed(1)}M`}
                  icon={BarChart3}
                />
                <StatCard 
                  label="52W Range" 
                  value={`$${company.marketData.low52w} - $${company.marketData.high52w}`}
                  icon={TrendingUp}
                />
                <StatCard 
                  label="Shares Outstanding" 
                  value={`${(company.marketData.sharesOutstanding / 1e9).toFixed(2)}B`}
                  icon={Users}
                />
                <StatCard 
                  label="Dividend" 
                  value={`$${company.marketData.dividend.toFixed(2)}`}
                  subValue={`Yield: ${company.marketData.dividendYield}%`}
                  icon={DollarSign}
                />
                <StatCard 
                  label="Exchange" 
                  value={company.exchange}
                  subValue={company.ticker}
                  icon={Globe}
                />
              </div>
            </section>

            {/* Price Chart Placeholder */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100">Price Chart</h2>
                <div className="flex items-center gap-2">
                  {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((period) => (
                    <button
                      key={period}
                      className="px-3 py-1 text-sm rounded-lg bg-metallic-800 text-metallic-400 hover:bg-metallic-700 transition-colors"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              {/* Chart placeholder - would integrate actual charting library */}
              <div 
                className="h-64 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${commodityColor}10` }}
              >
                <span className="text-metallic-500">Interactive chart would display here</span>
              </div>
            </section>

            {/* Resources */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">Mineral Resources</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-metallic-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-metallic-400">Category</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Tonnage (Mt)</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Grade (g/t)</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-metallic-400">Contained (koz)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(company.resources).map(([category, data]) => (
                      <tr key={category} className="border-b border-metallic-800">
                        <td className="py-3 px-4 text-metallic-200 capitalize">{category}</td>
                        <td className="py-3 px-4 text-right text-metallic-300">{(data.tonnage / 1e6).toFixed(0)}</td>
                        <td className="py-3 px-4 text-right text-metallic-300">{data.grade.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-metallic-300">{(data.contained / 1000).toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-metallic-800/50">
                      <td className="py-3 px-4 text-metallic-100 font-semibold">Total M+I+I</td>
                      <td className="py-3 px-4 text-right text-metallic-100 font-semibold">1,450</td>
                      <td className="py-3 px-4 text-right text-metallic-100 font-semibold">1.08</td>
                      <td className="py-3 px-4 text-right text-metallic-100 font-semibold">50,280</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Projects */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100">Projects</h2>
                <span className="text-sm text-metallic-500">{company.projects.length} total</span>
              </div>
              <div className="space-y-3">
                {company.projects.map((project, i) => (
                  <Link
                    key={i}
                    href={`/projects/${project.name.toLowerCase().replace(' ', '-')}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-metallic-200">{project.name}</div>
                      <div className="text-xs text-metallic-500">{project.country} • {project.stage}</div>
                    </div>
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: getCommodityColor(project.commodity) }}
                    >
                      {project.commodity}
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                href={`/company/${company.ticker}/projects`}
                className="block text-center text-sm text-primary-400 hover:text-primary-300 mt-4"
              >
                View all projects →
              </Link>
            </section>

            {/* Recent Announcements */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-metallic-100">Announcements</h2>
                <FileText className="w-5 h-5 text-metallic-500" />
              </div>
              <div className="space-y-3">
                {company.announcements.map((ann, i) => (
                  <Link
                    key={i}
                    href={`/announcements/${i}`}
                    className="block p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                  >
                    <div className="text-sm font-medium text-metallic-200 line-clamp-2">{ann.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-metallic-500">{ann.date}</span>
                      <span className="text-xs px-2 py-0.5 bg-metallic-700 rounded text-metallic-400">{ann.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                href={`/company/${company.ticker}/announcements`}
                className="block text-center text-sm text-primary-400 hover:text-primary-300 mt-4"
              >
                View all announcements →
              </Link>
            </section>

            {/* Quick Actions */}
            <section className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-metallic-100 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href={`/analysis/compare?companies=${company.ticker}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">Compare with peers</span>
                </Link>
                <Link
                  href={`/analysis/map?company=${company.ticker}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">View on map</span>
                </Link>
                <button
                  className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors w-full"
                >
                  <Download className="w-5 h-5 text-primary-400" />
                  <span className="text-sm text-metallic-300">Export company data</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
