'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Scale } from 'lucide-react';

export default function DisclaimerPage() {
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
          <AlertTriangle className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Disclaimer</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Not Financial Advice
            </h2>
            <p className="text-metallic-300">
              InvestOre Analytics provides data and analytical tools for informational and educational 
              purposes only. Nothing on this platform constitutes financial, investment, legal, or 
              tax advice. You should not make any investment decision based solely on information 
              provided through this service.
            </p>
          </section>

          <section className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">Data Accuracy</h2>
            <p className="text-metallic-400 mb-4">
              While we strive to maintain accurate and up-to-date information, we cannot guarantee 
              the accuracy, completeness, or timeliness of any data presented on this platform. 
              Data is sourced from third-party providers and may contain errors or omissions.
            </p>
            <p className="text-metallic-400">
              Resource estimates, economic metrics, and other technical data extracted from company 
              announcements are processed using automated systems and may contain extraction errors. 
              Always verify data with primary source documents.
            </p>
          </section>

          <section className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">Investment Risk</h2>
            <p className="text-metallic-400 mb-4">
              Mining and exploration investments carry significant risks, including but not limited to:
            </p>
            <ul className="text-metallic-400 space-y-2 list-disc list-inside">
              <li>Commodity price volatility</li>
              <li>Exploration and development risk</li>
              <li>Regulatory and permitting risk</li>
              <li>Currency exchange fluctuations</li>
              <li>Geopolitical and country risk</li>
              <li>Environmental and social risks</li>
            </ul>
          </section>

          <section className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">Professional Advice</h2>
            <p className="text-metallic-400">
              We strongly recommend consulting with qualified financial advisors, accountants, 
              and legal professionals before making any investment decisions. Past performance 
              is not indicative of future results.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
