'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
          <FileText className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-metallic-300 mb-6">
            Last updated: January 27, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">1. Acceptance of Terms</h2>
            <p className="text-metallic-400">
              By accessing or using InvestOre Analytics, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">2. Use of Service</h2>
            <p className="text-metallic-400">
              InvestOre Analytics provides mining and exploration data analytics for informational purposes only. 
              The platform does not constitute investment advice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">3. Disclaimer</h2>
            <p className="text-metallic-400">
              All data and analytics are provided &quot;as is&quot; without warranty of any kind. Users should 
              verify all information with primary sources before making investment decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">4. Limitation of Liability</h2>
            <p className="text-metallic-400">
              InvestOre Analytics shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages arising from your use of the service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
