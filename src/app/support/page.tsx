'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, FileText, ExternalLink } from 'lucide-react';

export default function SupportPage() {
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
          <MessageSquare className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Support</h1>
        </div>
        
        <p className="text-metallic-400 mb-12">
          Need help? We are here to assist you with any questions or issues.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6">
            <Mail className="w-8 h-8 text-primary-400 mb-4" />
            <h3 className="text-lg font-semibold text-metallic-100 mb-2">Email Support</h3>
            <p className="text-metallic-400 text-sm mb-4">
              For general inquiries and technical support
            </p>
            <a 
              href="mailto:support@investore.io"
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              support@investore.io
            </a>
          </div>

          <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-6">
            <FileText className="w-8 h-8 text-primary-400 mb-4" />
            <h3 className="text-lg font-semibold text-metallic-100 mb-2">Documentation</h3>
            <p className="text-metallic-400 text-sm mb-4">
              Guides, tutorials, and API reference
            </p>
            <Link 
              href="/docs"
              className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1"
            >
              View Docs <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-metallic-900/50 border border-metallic-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-metallic-100 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-metallic-200 mb-2">How often is data updated?</h3>
              <p className="text-metallic-400 text-sm">
                Market data is updated in real-time during trading hours. Company announcements 
                and extracted data are processed within hours of release.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-metallic-200 mb-2">Which exchanges are covered?</h3>
              <p className="text-metallic-400 text-sm">
                We cover major mining exchanges including ASX, TSX, TSXV, LSE, NYSE, and JSE 
                with varying levels of data depth.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-metallic-200 mb-2">How accurate is the extracted data?</h3>
              <p className="text-metallic-400 text-sm">
                Our AI extraction system achieves high accuracy but is not perfect. We recommend 
                verifying critical data points with source documents for investment decisions.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-metallic-200 mb-2">Can I export data?</h3>
              <p className="text-metallic-400 text-sm">
                Yes, data export is available for premium subscribers. Export formats include 
                CSV and Excel for most data tables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
