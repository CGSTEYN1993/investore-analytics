'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RAILWAY_API_URL } from '@/lib/public-api-url';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

/**
 * OAuth callback landing page. IB Client Portal redirects here with ?code=...&state=...
 * We forward the code+state to the backend which exchanges it for tokens and persists
 * the encrypted refresh token.
 */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState('Completing broker link…');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      setErr('Missing code/state in callback URL.');
      return;
    }
    (async () => {
      try {
        const url = `${RAILWAY_API_URL}/api/v1/trading/onboarding/ib/oauth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `HTTP ${res.status}`);
        }
        setMsg('Broker linked successfully. Redirecting…');
        sessionStorage.removeItem('onboarding_account_id');
        setTimeout(() => router.push('/onboarding/broker'), 1200);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-metallic-950 text-metallic-100 px-4">
      <div className="max-w-md w-full rounded-xl border border-metallic-800 bg-metallic-900/60 p-8 text-center">
        {err ? (
          <>
            <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-red-300 font-medium mb-1">Broker link failed</div>
            <div className="text-sm text-metallic-400 break-words">{err}</div>
            <button
              onClick={() => router.push('/onboarding/broker')}
              className="mt-5 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium"
            >
              Back to onboarding
            </button>
          </>
        ) : msg.startsWith('Broker linked') ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <div className="text-metallic-100 font-medium">{msg}</div>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-primary-400 mx-auto mb-3 animate-spin" />
            <div className="text-metallic-200">{msg}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BrokerCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-metallic-950 text-metallic-100">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
