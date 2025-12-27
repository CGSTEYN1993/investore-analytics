'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { 
  BarChart3, Globe, Building2, MapPin, Pickaxe, TrendingUp, 
  Filter, Bell, Bookmark, Briefcase, Search, ChevronRight,
  Gem, Factory, FileText, Clock
} from 'lucide-react';
import ExcavatorLoader from '@/components/ui/ExcavatorLoader';

// Analysis category cards
const analysisCategories = [
  {
    id: 'commodities',
    title: 'By Commodity',
    description: 'Analyze companies by gold, copper, lithium, and 30+ commodities',
    icon: Gem,
    href: '/analysis/commodities',
    color: 'from-amber-500 to-amber-600',
    stats: '30+ Commodities',
  },
  {
    id: 'exchanges',
    title: 'By Exchange',
    description: 'View mining companies listed on TSX, ASX, NYSE, and more',
    icon: Building2,
    href: '/analysis/exchanges',
    color: 'from-blue-500 to-blue-600',
    stats: '50+ Exchanges',
  },
  {
    id: 'countries',
    title: 'By Country/Region',
    description: 'Explore mining projects by country, state, or territory',
    icon: Globe,
    href: '/analysis/countries',
    color: 'from-green-500 to-green-600',
    stats: '180+ Countries',
  },
  {
    id: 'map',
    title: 'Interactive Map',
    description: 'Visual exploration of global mining projects',
    icon: MapPin,
    href: '/analysis/map',
    color: 'from-purple-500 to-purple-600',
    stats: '50,000+ Projects',
    premium: true,
  },
  {
    id: 'stage',
    title: 'By Project Stage',
    description: 'Filter by exploration, feasibility, or operational status',
    icon: Pickaxe,
    href: '/analysis/stages',
    color: 'from-orange-500 to-orange-600',
    stats: 'All Stages',
  },
  {
    id: 'drilling',
    title: 'Drilling Activity',
    description: 'Track ongoing campaigns and awaiting assay results',
    icon: Factory,
    href: '/analysis/drilling',
    color: 'from-red-500 to-red-600',
    stats: 'Live Updates',
    premium: true,
  },
  {
    id: 'market',
    title: 'Market Data',
    description: 'Share prices, market cap, volume, and trading metrics',
    icon: TrendingUp,
    href: '/analysis/market',
    color: 'from-cyan-500 to-cyan-600',
    stats: 'Real-time',
  },
  {
    id: 'announcements',
    title: 'Latest Announcements',
    description: 'Recent company news, drill results, and filings',
    icon: FileText,
    href: '/analysis/announcements',
    color: 'from-pink-500 to-pink-600',
    stats: '24/7 Updates',
  },
];

// Quick stats (would be fetched from API)
const quickStats = [
  { label: 'Companies Tracked', value: '4,500+' },
  { label: 'Projects', value: '50,000+' },
  { label: 'Countries', value: '180+' },
  { label: 'Daily Updates', value: '10,000+' },
];

function CategoryCard({ category }: { category: typeof analysisCategories[0] }) {
  const Icon = category.icon;
  
  return (
    <Link
      href={category.href}
      className="group relative bg-metallic-900 border border-metallic-800 rounded-xl p-6 hover:border-primary-500/50 transition-all hover:bg-metallic-800/50 hover:-translate-y-1"
    >
      {category.premium && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
          PRO
        </span>
      )}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-metallic-100 mb-2 group-hover:text-primary-400 transition-colors">
        {category.title}
      </h3>
      <p className="text-sm text-metallic-400 mb-4 line-clamp-2">
        {category.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-metallic-500">{category.stats}</span>
        <ChevronRight className="w-4 h-4 text-metallic-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

export default function AnalysisDashboard() {
  const [isLoading, setIsLoading] = useState(false);

  // Show excavator loader when loading
  if (isLoading) {
    return <ExcavatorLoader message="Loading analysis tools..." subMessage="Preparing your mining intelligence dashboard" />;
  }

  return (
    <div className="min-h-screen bg-metallic-950">
      {/* Header */}
      <div className="bg-metallic-900/50 border-b border-metallic-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-metallic-100">Analysis Dashboard</h1>
              <p className="text-metallic-400 mt-1">Explore mining data across multiple dimensions</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analysis/search"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 hover:bg-metallic-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 hover:bg-metallic-700 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                <span>Portfolio</span>
              </Link>
              <Link
                href="/watchlist"
                className="flex items-center gap-2 px-4 py-2 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-300 hover:bg-metallic-700 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>Watchlist</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {quickStats.map((stat, i) => (
              <div key={i} className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700/50">
                <div className="text-2xl font-bold text-primary-400">{stat.value}</div>
                <div className="text-sm text-metallic-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analysis Categories */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-metallic-100 mb-6">Analysis Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analysisCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-metallic-100">Recent Announcements</h3>
              <Link href="/analysis/announcements" className="text-sm text-primary-400 hover:text-primary-300">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {/* Placeholder announcements - would be fetched from API */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-metallic-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-metallic-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-metallic-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-metallic-800 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-metallic-800 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="text-xs text-metallic-500 flex-shrink-0">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Loading...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-metallic-900 border border-metallic-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-metallic-100 mb-4">Quick Filters</h3>
            <div className="space-y-3">
              <Link
                href="/analysis/drilling?status=awaiting_assay"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-sm text-metallic-300">Awaiting Assay Results</span>
              </Link>
              <Link
                href="/analysis/drilling?status=in_progress"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-metallic-300">Active Drilling</span>
              </Link>
              <Link
                href="/analysis/stages?stage=pre_feasibility"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-metallic-300">Pre-Feasibility Stage</span>
              </Link>
              <Link
                href="/analysis/stages?stage=feasibility"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-sm text-metallic-300">Feasibility Stage</span>
              </Link>
              <Link
                href="/analysis/market?sort=volume_desc"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                <span className="text-sm text-metallic-300">High Volume Today</span>
              </Link>
              <Link
                href="/analysis/stages?stage=operational"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                <span className="text-sm text-metallic-300">Producing Mines</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Comparison Tool Promo */}
        <section className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-metallic-100 mb-3">
            Compare Mining Companies
          </h3>
          <p className="text-metallic-400 mb-6 max-w-2xl mx-auto">
            Select multiple companies to compare side-by-side. Analyze market cap, resources, 
            project stages, and more with customizable charts.
          </p>
          <Link
            href="/analysis/compare"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            Open Comparison Tool
          </Link>
        </section>
      </div>
    </div>
  );
}
