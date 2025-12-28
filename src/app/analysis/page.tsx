'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { 
  BarChart3, Globe, Building2, MapPin, Hammer, TrendingUp, 
  Filter, Bell, Bookmark, Briefcase, Search, ChevronRight,
  Gem, Factory, FileText, Clock
} from 'lucide-react';
import ExcavatorLoader from '@/components/ui/ExcavatorLoader';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Analysis category cards - dynamic stats will be updated via API
const baseCategories = [
  {
    id: 'global',
    title: 'Global Spatial View',
    description: 'Mining companies across global exchanges & countries',
    icon: Globe,
    href: '/analysis/global',
    color: 'from-indigo-500 to-purple-600',
    statsKey: 'totalCompanies', // Dynamic key
    statsLabel: 'Companies',
    featured: true,
  },
  {
    id: 'australia',
    title: 'Australia Mining Map',
    description: 'Interactive map with real data from Geoscience Australia',
    icon: MapPin,
    href: '/analysis/australia',
    color: 'from-green-500 to-emerald-600',
    statsKey: 'asxCompanies',
    statsLabel: 'ASX Companies',
    featured: true,
  },
  {
    id: 'mining-analytics',
    title: 'Mining Analytics',
    description: 'Comprehensive analytics from government databases',
    icon: BarChart3,
    href: '/analysis/mining-analytics',
    color: 'from-cyan-500 to-blue-600',
    statsKey: null,
    statsLabel: 'Real-time Insights',
    featured: true,
  },
  {
    id: 'commodities',
    title: 'By Commodity',
    description: 'Analyze companies by gold, copper, lithium, and 30+ commodities',
    icon: Gem,
    href: '/analysis/commodities',
    color: 'from-amber-500 to-amber-600',
    statsKey: 'totalCommodities',
    statsLabel: 'Commodities',
  },
  {
    id: 'exchanges',
    title: 'By Exchange',
    description: 'View mining companies listed on TSX, ASX, NYSE, and more',
    icon: Building2,
    href: '/analysis/exchanges',
    color: 'from-blue-500 to-blue-600',
    statsKey: 'totalExchanges',
    statsLabel: 'Exchanges',
  },
  {
    id: 'countries',
    title: 'By Country/Region',
    description: 'Explore mining projects by country, state, or territory',
    icon: Globe,
    href: '/analysis/countries',
    color: 'from-green-500 to-green-600',
    statsKey: 'totalCountries',
    statsLabel: 'Countries',
  },
  {
    id: 'map',
    title: 'Global Map',
    description: 'Visual exploration of worldwide mining projects',
    icon: MapPin,
    href: '/analysis/map',
    color: 'from-purple-500 to-purple-600',
    statsKey: null,
    statsLabel: 'Interactive Map',
    premium: true,
  },
  {
    id: 'stage',
    title: 'By Project Stage',
    description: 'Filter by exploration, feasibility, or operational status',
    icon: Hammer,
    href: '/analysis/stages',
    color: 'from-orange-500 to-orange-600',
    statsKey: null,
    statsLabel: 'All Stages',
  },
  {
    id: 'exploration',
    title: 'Exploration Data',
    description: 'Drilling, rock samples, soil surveys, and stream sediments',
    icon: Factory,
    href: '/analysis/exploration',
    color: 'from-red-500 to-red-600',
    statsKey: null,
    statsLabel: 'All Data Types',
    premium: true,
  },
  {
    id: 'market',
    title: 'Market Data',
    description: 'Share prices, market cap, volume, and trading metrics',
    icon: TrendingUp,
    href: '/analysis/market',
    color: 'from-cyan-500 to-cyan-600',
    statsKey: null,
    statsLabel: 'Real-time',
  },
  {
    id: 'announcements',
    title: 'Latest Announcements',
    description: 'Recent company news, drill results, and filings',
    icon: FileText,
    href: '/analysis/announcements',
    color: 'from-pink-500 to-pink-600',
    statsKey: null,
    statsLabel: '24/7 Updates',
  },
  {
    id: 'constraints',
    title: 'Legal Constraints',
    description: 'Heritage, social, and environmental restrictions on tenements',
    icon: MapPin,
    href: '/analysis/constraints',
    color: 'from-amber-500 to-amber-600',
    statsKey: null,
    statsLabel: 'Compliance',
    premium: true,
  },
];

// Interface for dynamic stats from API
interface SpatialSummary {
  total_companies: number;
  by_exchange: Record<string, number>;
  by_commodity: [string, number][];
  total_countries: number;
}

function CategoryCard({ category, dynamicStats }: { 
  category: typeof baseCategories[0],
  dynamicStats: SpatialSummary | null 
}) {
  const Icon = category.icon;
  const isFeatured = 'featured' in category && category.featured;
  
  // Calculate dynamic stat value based on statsKey
  const getStatValue = () => {
    if (!dynamicStats || !category.statsKey) {
      return category.statsLabel;
    }
    
    switch (category.statsKey) {
      case 'totalCompanies':
        return `${dynamicStats.total_companies.toLocaleString()} ${category.statsLabel}`;
      case 'asxCompanies':
        return `${(dynamicStats.by_exchange?.ASX || 0).toLocaleString()} ${category.statsLabel}`;
      case 'totalCommodities':
        return `${dynamicStats.by_commodity?.length || 0}+ ${category.statsLabel}`;
      case 'totalExchanges':
        return `${Object.keys(dynamicStats.by_exchange || {}).length} ${category.statsLabel}`;
      case 'totalCountries':
        return `${dynamicStats.total_countries} ${category.statsLabel}`;
      default:
        return category.statsLabel;
    }
  };
  
  return (
    <Link
      href={category.href}
      className={`group relative bg-metallic-900 border rounded-xl p-6 transition-all hover:-translate-y-1 ${
        isFeatured 
          ? 'border-primary-500/50 ring-1 ring-primary-500/20 hover:border-primary-400' 
          : 'border-metallic-800 hover:border-primary-500/50 hover:bg-metallic-800/50'
      }`}
    >
      {isFeatured && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
          NEW
        </span>
      )}
      {category.premium && !isFeatured && (
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
        <span className="text-xs text-metallic-500">{getStatValue()}</span>
        <ChevronRight className="w-4 h-4 text-metallic-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

export default function AnalysisDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicStats, setDynamicStats] = useState<SpatialSummary | null>(null);
  
  // Fetch dynamic stats from the API
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/spatial/summary`);
        if (response.ok) {
          const data = await response.json();
          setDynamicStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch spatial summary:', err);
      }
    }
    fetchStats();
  }, []);

  // Quick stats derived from API data
  const quickStats = [
    { 
      label: 'Companies Tracked', 
      value: dynamicStats ? `${dynamicStats.total_companies.toLocaleString()}+` : '1,000+' 
    },
    { label: 'Projects', value: '50,000+' },
    { 
      label: 'Countries', 
      value: dynamicStats ? `${dynamicStats.total_countries}+` : '40+' 
    },
    { label: 'Daily Updates', value: '10,000+' },
  ];

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
            {baseCategories.map((category) => (
              <CategoryCard key={category.id} category={category} dynamicStats={dynamicStats} />
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
                href="/analysis/exploration"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm text-metallic-300">Drilling Programs</span>
              </Link>
              <Link
                href="/analysis/exploration"
                className="flex items-center gap-3 p-3 rounded-lg bg-metallic-800/50 hover:bg-metallic-800 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-metallic-300">Soil Surveys</span>
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
