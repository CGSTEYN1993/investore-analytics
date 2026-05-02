'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/public-api-url';

function ConfirmContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your subscription…');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing confirmation token.');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/newsletter/confirm?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus('error');
          setMessage(data?.detail || 'Confirmation failed.');
          return;
        }
        setStatus('success');
        setMessage(data?.message || 'You are confirmed.');
      } catch {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-metallic-900/60 border border-metallic-800 rounded-2xl p-8">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-400 animate-spin" />
            <h1 className="text-xl font-bold text-metallic-100 mb-2">Confirming…</h1>
            <p className="text-sm text-metallic-400">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 mx-auto mb-4 text-emerald-400" />
            <h1 className="text-xl font-bold text-metallic-100 mb-2">You&apos;re subscribed</h1>
            <p className="text-sm text-metallic-300 mb-6">{message}</p>
            <Link href="/" className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-colors">
              Back to home
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 mx-auto mb-4 text-red-400" />
            <h1 className="text-xl font-bold text-metallic-100 mb-2">Confirmation failed</h1>
            <p className="text-sm text-metallic-300 mb-6">{message}</p>
            <Link href="/" className="inline-block px-6 py-2.5 bg-metallic-700 hover:bg-metallic-600 text-metallic-100 text-sm font-semibold rounded-lg transition-colors">
              Sign up again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-metallic-400">Loading…</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
