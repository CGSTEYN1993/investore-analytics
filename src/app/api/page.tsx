'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Key, Server, ExternalLink } from 'lucide-react';

export default function ApiPage() {
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

        <div className="flex items-center gap-3 mb-4">
          <Code className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">API Access</h1>
        </div>
        
        <p className="text-metallic-400 mb-12">
          Programmatic access to InvestOre Analytics data for developers and integrations.
        </p>

        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-metallic-100">API Keys</h2>
          </div>
          <p className="text-metallic-400 mb-4">
            API access is available for premium subscribers. Generate and manage your API keys 
            from your account settings.
          </p>
          <Link
            href="/subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Manage Subscription
          </Link>
        </div>

        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-semibold text-metallic-100">Base URL</h2>
          </div>
          <code className="block bg-metallic-800 text-primary-400 px-4 py-3 rounded-lg font-mono text-sm">
            https://web-production-4faa7.up.railway.app/api/v1
          </code>
        </div>

        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-metallic-100 mb-6">Available Endpoints</h2>
          
          <div className="space-y-4">
            <div className="border-b border-metallic-800 pb-4">
              <code className="text-primary-400 font-mono text-sm">GET /market/quote/{'{symbol}'}</code>
              <p className="text-metallic-400 text-sm mt-1">Get real-time stock quote</p>
            </div>
            
            <div className="border-b border-metallic-800 pb-4">
              <code className="text-primary-400 font-mono text-sm">GET /market/chart/{'{symbol}'}</code>
              <p className="text-metallic-400 text-sm mt-1">Get OHLCV chart data</p>
            </div>
            
            <div className="border-b border-metallic-800 pb-4">
              <code className="text-primary-400 font-mono text-sm">GET /mining/exploration/summary</code>
              <p className="text-metallic-400 text-sm mt-1">Get exploration activity summary</p>
            </div>
            
            <div className="border-b border-metallic-800 pb-4">
              <code className="text-primary-400 font-mono text-sm">GET /mining/company/{'{symbol}'}</code>
              <p className="text-metallic-400 text-sm mt-1">Get company mining data</p>
            </div>
            
            <div className="pb-4">
              <code className="text-primary-400 font-mono text-sm">GET /geoscience/australia/all</code>
              <p className="text-metallic-400 text-sm mt-1">Get Australian geoscience data</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-metallic-800">
            <Link
              href="/docs#api"
              className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2"
            >
              Full API Documentation <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
