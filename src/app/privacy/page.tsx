'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
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
          <Shield className="w-8 h-8 text-primary-400" />
          <h1 className="text-3xl font-bold text-metallic-100">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-metallic-300 mb-6">
            Last updated: January 27, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">1. Information We Collect</h2>
            <p className="text-metallic-400">
              InvestOre Analytics collects information you provide directly to us, including account 
              information, usage data, and analytics data to improve our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">2. How We Use Your Information</h2>
            <p className="text-metallic-400">
              We use the information we collect to provide, maintain, and improve our services, 
              communicate with you, and ensure the security of our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">3. Data Security</h2>
            <p className="text-metallic-400">
              We implement appropriate technical and organizational measures to protect your personal 
              data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-metallic-100 mb-4">4. Contact Us</h2>
            <p className="text-metallic-400">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@investore.io" className="text-primary-400 hover:underline">
                privacy@investore.io
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
