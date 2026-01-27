'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Database, AlertCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

const countryInfo: Record<string, { name: string; flag: string; description: string; available: boolean }> = {
  'australia': {
    name: 'Australia',
    flag: '🇦🇺',
    description: 'Geoscience Australia data including operating mines, mineral deposits, and geological surveys.',
    available: true,
  },
  'canada': {
    name: 'Canada',
    flag: '🇨🇦',
    description: 'Natural Resources Canada geological data and mineral occurrence database.',
    available: false,
  },
  'usa': {
    name: 'United States',
    flag: '🇺🇸',
    description: 'USGS mineral resources data and geological surveys.',
    available: false,
  },
  'south-africa': {
    name: 'South Africa',
    flag: '🇿🇦',
    description: 'Council for Geoscience data on mineral deposits and mining operations.',
    available: false,
  },
};

export default function GeoscienceCountryPage() {
  const params = useParams();
  const country = params.country as string;
  const info = countryInfo[country] || {
    name: country?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown',
    flag: '🌍',
    description: 'Geological survey data.',
    available: false,
  };

  if (country === 'australia') {
    // Redirect to main geoscience page for Australia
    return (
      <div className="min-h-screen bg-metallic-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-metallic-400 mb-4">Redirecting to Australia geoscience data...</p>
          <Link 
            href="/analysis/geoscience" 
            className="text-primary-400 hover:underline"
          >
            Click here if not redirected
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metallic-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/analysis/geoscience"
          className="flex items-center gap-2 text-metallic-400 hover:text-primary-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Geoscience
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">{info.flag}</span>
          <div>
            <h1 className="text-3xl font-bold text-metallic-100">{info.name}</h1>
            <p className="text-metallic-400">Geological Survey Data</p>
          </div>
        </div>

        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-metallic-100 mb-2">Coming Soon</h2>
              <p className="text-metallic-400 mb-4">
                {info.description}
              </p>
              <p className="text-metallic-500">
                We are working on integrating geological survey data from {info.name}. 
                This feature will be available in a future update.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-metallic-900/30 border border-metallic-800 rounded-lg p-6">
            <Database className="w-6 h-6 text-primary-400 mb-3" />
            <h3 className="font-semibold text-metallic-200 mb-2">Available Data</h3>
            <p className="text-sm text-metallic-500">
              Currently, only Australian geoscience data is available through our integration with Geoscience Australia.
            </p>
          </div>
          <div className="bg-metallic-900/30 border border-metallic-800 rounded-lg p-6">
            <MapPin className="w-6 h-6 text-primary-400 mb-3" />
            <h3 className="font-semibold text-metallic-200 mb-2">Explore Australia</h3>
            <p className="text-sm text-metallic-500 mb-3">
              View operating mines, mineral deposits, and geological data for Australia.
            </p>
            <Link 
              href="/analysis/geoscience"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              Go to Australia →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
