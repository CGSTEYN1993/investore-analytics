'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // In a real app, you'd verify the session with the backend.
    // For now, we show success if we have a session_id.
    if (sessionId) {
      const timer = setTimeout(() => {
        setStatus('success');
      }, 1500);
      return () => clearTimeout(timer);
    }

    setStatus('error');
  }, [sessionId]);

  if (status === 'loading') {
    // Suspense fallback should usually cover this, but keep it safe.
    return null;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-gray-600">
            We couldn&apos;t confirm your subscription. Please contact support.
          </p>
          <div className="mt-6 space-x-4">
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Try Again
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome to InvestOre Pro!</h1>
        <p className="mt-2 max-w-md text-gray-600">
          Your subscription is now active. You have access to all Professional features including
          advanced analytics, exports, and API access.
        </p>

        <div className="mt-8 rounded-lg bg-gray-50 p-6">
          <h2 className="font-semibold text-gray-900">What&apos;s next?</h2>
          <ul className="mt-4 space-y-3 text-left text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
              Create up to 50 saved peer sets
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
              Export data to CSV or JSON
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
              Access the full API (10,000 requests/day)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
              Set up price alerts and custom formulas
            </li>
          </ul>
        </div>

        <div className="mt-6 space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/account/subscription"
            className="inline-flex items-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    </div>
  );
}
