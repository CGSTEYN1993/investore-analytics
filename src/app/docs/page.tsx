'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Database, Code, BarChart3, Map, Users } from 'lucide-react';

const docSections = [
  {
    title: 'Getting Started',
    icon: Book,
    description: 'Learn the basics of using InvestOre Analytics',
    href: '/docs#getting-started',
  },
  {
    title: 'Data Sources',
    icon: Database,
    description: 'Understand our data sources and methodology',
    href: '/docs#data-sources',
  },
  {
    title: 'API Reference',
    icon: Code,
    description: 'Technical documentation for developers',
    href: '/docs#api',
  },
  {
    title: 'Analytics Features',
    icon: BarChart3,
    description: 'Deep dive into valuation metrics and analysis tools',
    href: '/docs#analytics',
  },
  {
    title: 'Map & Spatial',
    icon: Map,
    description: 'Interactive project mapping and spatial analysis',
    href: '/docs#spatial',
  },
  {
    title: 'Peer Comparison',
    icon: Users,
    description: 'Building and analyzing peer groups',
    href: '/docs#peers',
  },
];

export default function DocsPage() {
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

        <div className="flex items-center gap-3 mb-4">
          <Book className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Documentation</h1>
        </div>
        
        <p className="text-metallic-400 mb-12 max-w-2xl">
          Comprehensive guides and references for getting the most out of InvestOre Analytics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6 hover:bg-metallic-800/50 hover:border-primary-500/30 transition-all group"
            >
              <section.icon className="w-8 h-8 text-primary-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-metallic-100 mb-2">{section.title}</h3>
              <p className="text-metallic-400 text-sm">{section.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-16" id="getting-started">
          <h2 className="text-2xl font-bold text-metallic-100 mb-6">Getting Started</h2>
          <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
            <p className="text-metallic-400 mb-4">
              InvestOre Analytics is a comprehensive platform for analyzing mining and exploration companies.
              Start by exploring the market overview, building peer groups, or using our AI analyst.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="/analysis/market"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Explore Markets
              </Link>
              <Link
                href="/peers"
                className="px-4 py-2 bg-metallic-800 hover:bg-metallic-700 text-metallic-200 rounded-lg border border-metallic-700 transition-colors"
              >
                Build Peer Groups
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
