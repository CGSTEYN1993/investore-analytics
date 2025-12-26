'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function SubscriptionCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md">
        <XCircle className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Checkout Cancelled
        </h1>
        <p className="mt-2 text-gray-600">
          No worries! Your subscription was not processed. You can continue
          using the free tier or try again when you're ready.
        </p>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/pricing"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            View Plans Again
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
        
        <div className="mt-12 rounded-lg bg-gray-50 p-6 text-left">
          <h2 className="font-semibold text-gray-900">
            Have questions about our plans?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're happy to help you choose the right plan for your needs.
            Contact us anytime.
          </p>
          <a
            href="mailto:support@investoreanalytics.com"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            support@investoreanalytics.com
          </a>
        </div>
      </div>
    </div>
  );
}
