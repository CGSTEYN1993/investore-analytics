'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Map, BarChart3, Users, Brain, Database } from 'lucide-react';

const demoFeatures = [
  {
    title: 'Interactive Map',
    icon: Map,
    description: 'Explore mining projects globally with geological overlays',
    href: '/analysis/map',
  },
  {
    title: 'Market Analytics',
    icon: BarChart3,
    description: 'Real-time market data and valuation metrics',
    href: '/analysis/market',
  },
  {
    title: 'Peer Comparison',
    icon: Users,
    description: 'Build and analyze custom peer groups',
    href: '/peers',
  },
  {
    title: 'AI Analyst',
    icon: Brain,
    description: 'Natural language queries for mining data analysis',
    href: '/analysis/ai-analyst',
  },
  {
    title: 'Extracted Data',
    icon: Database,
    description: 'Browse drilling results and resource estimates',
    href: '/analysis/extracted-data',
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-metallic-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-metallic-400 hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Play className="w-10 h-10 text-primary-400" />
            <h1 className="text-3xl font-bold text-metallic-100">Explore the Platform</h1>
          </div>
          <p className="text-metallic-400 max-w-2xl mx-auto">
            Try out the key features of InvestOre Analytics. No account required for basic exploration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoFeatures.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6 hover:bg-metallic-800/50 hover:border-primary-500/30 transition-all group"
            >
              <feature.icon className="w-10 h-10 text-primary-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-metallic-100 mb-2">{feature.title}</h3>
              <p className="text-metallic-400 text-sm">{feature.description}</p>
              <div className="mt-4 text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Try it →
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary-500/20 to-copper-500/20 border border-primary-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-metallic-100 mb-4">Ready for More?</h2>
          <p className="text-metallic-400 mb-6 max-w-xl mx-auto">
            Create a free account to save peer groups, set up watchlists, and access premium analytics.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-metallic-800 hover:bg-metallic-700 text-metallic-200 rounded-lg font-medium border border-metallic-700 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
