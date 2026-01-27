'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, Database, Calculator, BarChart3, Scale } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-metallic-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-metallic-400 hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <FlaskConical className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Methodology</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-12">
          <section className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary-400" />
              <h2 className="text-xl font-semibold text-metallic-100 m-0">Data Sources</h2>
            </div>
            <p className="text-metallic-400">
              InvestOre Analytics aggregates data from multiple authoritative sources including stock exchanges 
              (ASX, TSX, LSE, NYSE, JSE), company announcements, geological surveys (Geoscience Australia), 
              and real-time market data providers.
            </p>
          </section>

          <section className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="w-6 h-6 text-primary-400" />
              <h2 className="text-xl font-semibold text-metallic-100 m-0">Resource Normalization</h2>
            </div>
            <p className="text-metallic-400 mb-4">
              We normalize resources across commodities using equivalent calculations:
            </p>
            <ul className="text-metallic-400 space-y-2">
              <li>• <strong className="text-metallic-200">Gold Equivalent (AuEq)</strong>: Converts all metals to gold equivalent ounces using current spot prices</li>
              <li>• <strong className="text-metallic-200">Copper Equivalent (CuEq)</strong>: Standard for base metal-focused comparisons</li>
              <li>• <strong className="text-metallic-200">Lithium Carbonate Equivalent (LCE)</strong>: For battery metals normalization</li>
            </ul>
          </section>

          <section className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-primary-400" />
              <h2 className="text-xl font-semibold text-metallic-100 m-0">Valuation Metrics</h2>
            </div>
            <p className="text-metallic-400 mb-4">
              Key metrics we calculate include:
            </p>
            <ul className="text-metallic-400 space-y-2">
              <li>• <strong className="text-metallic-200">EV/Resource</strong>: Enterprise value divided by total resources (M&I or M&I&I)</li>
              <li>• <strong className="text-metallic-200">Market Cap/oz</strong>: Market capitalization per contained ounce</li>
              <li>• <strong className="text-metallic-200">P/NAV</strong>: Price to net asset value based on economic studies</li>
              <li>• <strong className="text-metallic-200">In-Situ Value</strong>: Gross metal value at current spot prices</li>
            </ul>
          </section>

          <section className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary-400" />
              <h2 className="text-xl font-semibold text-metallic-100 m-0">Limitations & Disclaimer</h2>
            </div>
            <p className="text-metallic-400">
              All data and calculations are provided for informational purposes only and should not be 
              considered investment advice. Resource estimates are extracted from company announcements 
              and may contain errors. Users should always verify data with primary sources and consult 
              qualified professionals before making investment decisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
