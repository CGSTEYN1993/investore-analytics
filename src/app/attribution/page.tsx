'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, ExternalLink } from 'lucide-react';

const attributions = [
  {
    name: 'Geoscience Australia',
    url: 'https://www.ga.gov.au/',
    description: 'Australian geological data, mineral deposits, and operating mine information.',
    license: 'Creative Commons Attribution 4.0',
  },
  {
    name: 'ASX (Australian Securities Exchange)',
    url: 'https://www.asx.com.au/',
    description: 'Australian market data and company announcements.',
    license: 'ASX Terms of Use',
  },
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/',
    description: 'Global stock market data and historical prices.',
    license: 'Yahoo Terms of Service',
  },
  {
    name: 'Lucide Icons',
    url: 'https://lucide.dev/',
    description: 'Beautiful open-source icons used throughout the platform.',
    license: 'ISC License',
  },
  {
    name: 'Recharts',
    url: 'https://recharts.org/',
    description: 'React charting library for data visualization.',
    license: 'MIT License',
  },
  {
    name: 'Leaflet',
    url: 'https://leafletjs.com/',
    description: 'Open-source JavaScript library for interactive maps.',
    license: 'BSD-2-Clause License',
  },
  {
    name: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/',
    description: 'Map tiles and geographic data.',
    license: 'Open Database License (ODbL)',
  },
];

export default function AttributionPage() {
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
          <Heart className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Attribution</h1>
        </div>
        
        <p className="text-metallic-400 mb-12">
          InvestOre Analytics is built with the help of many open-source projects and data providers. 
          We gratefully acknowledge their contributions.
        </p>

        <div className="space-y-4">
          {attributions.map((attr) => (
            <div
              key={attr.name}
              className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <a 
                    href={attr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-metallic-100 hover:text-primary-400 transition-colors flex items-center gap-2"
                  >
                    {attr.name}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-metallic-400 text-sm mt-1">{attr.description}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-metallic-800 text-metallic-500 rounded whitespace-nowrap">
                  {attr.license}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-metallic-500 text-sm">
          <p>
            If you believe we have missed an attribution, please{' '}
            <Link href="/contact" className="text-primary-400 hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
