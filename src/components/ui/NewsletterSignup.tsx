'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/lib/public-api-url';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'footer' | 'hero';
  className?: string;
}

const ALL_EXCHANGES: { code: string; label: string }[] = [
  { code: 'ASX', label: 'ASX (Australia)' },
  { code: 'TSX', label: 'TSX (Toronto)' },
  { code: 'JSE', label: 'JSE (Johannesburg)' },
  { code: 'LSE', label: 'LSE (London)' },
  { code: 'NYSE', label: 'NYSE (New York)' },
];

const ALL_CAPS: { code: string; label: string }[] = [
  { code: 'small', label: 'Small Cap (< $300M)' },
  { code: 'mid', label: 'Mid Cap ($300M – $2B)' },
  { code: 'large', label: 'Large Cap (> $2B)' },
];

const ALL_COMMODITIES: string[] = ['Au', 'Cu', 'Li', 'Ni', 'Fe', 'Ag', 'U', 'REE', 'PGM', 'Co', 'Zn'];

export default function NewsletterSignup({ variant = 'card', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [exchanges, setExchanges] = useState<string[]>(['ASX', 'TSX', 'JSE', 'LSE', 'NYSE']);
  const [caps, setCaps] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const toggle = (arr: string[], setter: (v: string[]) => void, value: string) => {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    if (exchanges.length === 0) {
      setMessage('Pick at least one exchange.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          exchanges,
          commodities: commodities.length ? commodities : null,
          cap_sizes: caps.length ? caps : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.detail || 'Sign-up failed. Please try again.');
        setStatus('error');
        return;
      }
      setMessage(data?.message || 'Check your inbox to confirm your subscription.');
      setStatus('success');
      setEmail('');
    } catch {
      setMessage('Network error. Please try again.');
      setStatus('error');
    }
  };

  // ─── Hero variant — used on home page ────────────────────────────────
  if (variant === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-900/40 via-metallic-900/80 to-metallic-900/80 p-6 sm:p-8 backdrop-blur-sm ${className}`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-[10px] uppercase tracking-widest text-primary-400 font-bold">Daily Pre-Market Report</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-metallic-50 mb-2">
            Know what the market will do — before it opens
          </h3>
          <p className="text-sm text-metallic-300 mb-5 leading-relaxed max-w-xl">
            Bullish/bearish outlook for ASX, TSX, JSE, LSE &amp; NYSE delivered 45 minutes before each market open.
            Segmented by commodity (Au, Cu, Li, Ni …) and cap size. Powered by every news, sentiment and signal source we track.
          </p>

          {status === 'success' ? (
            <div className="flex items-start gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-emerald-300">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{message}</span>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                    disabled={status === 'loading'}
                    className="w-full pl-10 pr-4 py-3 bg-metallic-900/80 border border-metallic-700 rounded-lg text-sm text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
                >
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Get the Report
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="text-xs text-primary-400 hover:text-primary-300 font-medium"
              >
                {showAdvanced ? '− Hide preferences' : '+ Customise exchanges, commodities & cap size'}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-metallic-700/50">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-metallic-400 font-bold mb-2">Exchanges</p>
                    <div className="space-y-1.5">
                      {ALL_EXCHANGES.map((ex) => (
                        <label key={ex.code} className="flex items-center gap-2 text-xs text-metallic-300 cursor-pointer hover:text-metallic-100">
                          <input type="checkbox" checked={exchanges.includes(ex.code)} onChange={() => toggle(exchanges, setExchanges, ex.code)} className="rounded bg-metallic-800 border-metallic-600 text-primary-500 focus:ring-primary-500" />
                          {ex.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-metallic-400 font-bold mb-2">Cap Size</p>
                    <div className="space-y-1.5">
                      {ALL_CAPS.map((c) => (
                        <label key={c.code} className="flex items-center gap-2 text-xs text-metallic-300 cursor-pointer hover:text-metallic-100">
                          <input type="checkbox" checked={caps.includes(c.code)} onChange={() => toggle(caps, setCaps, c.code)} className="rounded bg-metallic-800 border-metallic-600 text-primary-500 focus:ring-primary-500" />
                          {c.label}
                        </label>
                      ))}
                    </div>
                    <p className="text-[10px] text-metallic-500 mt-1">Empty = all sizes</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-metallic-400 font-bold mb-2">Commodities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_COMMODITIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggle(commodities, setCommodities, c)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${commodities.includes(c) ? 'bg-primary-500 text-white' : 'bg-metallic-800 text-metallic-400 hover:bg-metallic-700'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-metallic-500 mt-1">Empty = all commodities</p>
                  </div>
                </div>
              )}

              {status === 'error' && <p className="text-xs text-red-400">{message}</p>}
              <p className="text-[10px] text-metallic-500">
                Free forever · Double opt-in · Unsubscribe anytime · Not investment advice.
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ─── Inline ─────────────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <form onSubmit={submit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
          <input type="email" placeholder="Enter your email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            className="w-full pl-10 pr-4 py-2.5 bg-metallic-900 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" />
        </div>
        <button type="submit" disabled={status === 'loading' || status === 'success'}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2">
          {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" />
            : status === 'success' ? <CheckCircle className="w-4 h-4" />
            : <Send className="w-4 h-4" />}
          {status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>
    );
  }

  // ─── Footer ─────────────────────────────────────────────────────────────
  if (variant === 'footer') {
    return (
      <div className={className}>
        <h4 className="font-semibold text-metallic-100 mb-3">Pre-Market Mining Report</h4>
        <p className="text-sm text-metallic-400 mb-4">
          Daily bullish/bearish outlook delivered 45 min before each exchange opens.
        </p>
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-400 bg-green-500/10 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5" /><span className="text-sm">{message}</span>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input type="email" placeholder="your@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} disabled={status === 'loading'}
              className="w-full px-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" />
            {status === 'error' && <p className="text-sm text-red-400">{message}</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" />Subscribing...</>
                : <><Mail className="w-4 h-4" />Subscribe</>}
            </button>
          </form>
        )}
      </div>
    );
  }

  // ─── Card (default) ─────────────────────────────────────────────────────
  return (
    <div className={`bg-metallic-900/50 border border-metallic-800/50 rounded-xl p-6 sm:p-8 ${className}`}>
      <div className="max-w-md mx-auto text-center">
        <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-metallic-100 mb-2">Pre-Market Mining Report</h2>
        <p className="text-sm text-metallic-400 mb-5">
          Daily bullish/bearish outlook by commodity and cap size, delivered before each exchange opens.
        </p>
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5" /><span className="text-sm">{message}</span>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                <input type="email" placeholder="your@email.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                  disabled={status === 'loading'}
                  className="w-full pl-10 pr-4 py-2.5 bg-metallic-800/50 border border-metallic-700/50 rounded-lg text-sm text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50" />
              </div>
              <button type="submit" disabled={status === 'loading'}
                className="px-5 py-2.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Subscribe
              </button>
            </div>
            {status === 'error' && <p className="text-xs text-red-400">{message}</p>}
          </form>
        )}
        <p className="text-[10px] text-metallic-600 mt-3">Free forever · Unsubscribe anytime</p>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'footer';
  className?: string;
}

export default function NewsletterSignup({ variant = 'card', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would call your API
    // const response = await fetch('/api/newsletter', {
    //   method: 'POST',
    //   body: JSON.stringify({ email }),
    // });
    
    setStatus('success');
    setEmail('');
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            className="w-full pl-10 pr-4 py-2.5 bg-metallic-900 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={className}>
        <h4 className="font-semibold text-metallic-100 mb-3">Subscribe to Our Newsletter</h4>
        <p className="text-sm text-metallic-400 mb-4">
          Get weekly market insights and analysis delivered to your inbox.
        </p>
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-400 bg-green-500/10 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5" />
            <span>Thanks for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-4 py-2.5 bg-metallic-800 border border-metallic-700 rounded-lg text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            />
            {status === 'error' && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Subscribe
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`bg-metallic-900/50 border border-metallic-800/50 rounded-xl p-6 sm:p-8 ${className}`}>
      <div className="max-w-md mx-auto text-center">
        <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-metallic-100 mb-2">
          Weekly Mining Insights
        </h2>
        <p className="text-sm text-metallic-400 mb-5">
          Drill results, market analysis, and AI-powered signals — delivered every Monday.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 rounded-lg px-4 py-3">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">You&apos;re subscribed! Check your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-500" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={status === 'loading'}
                  className="w-full pl-10 pr-4 py-2.5 bg-metallic-800/50 border border-metallic-700/50 rounded-lg text-sm text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Subscribe
              </button>
            </div>
            {status === 'error' && (
              <p className="text-xs text-red-400">{errorMessage}</p>
            )}
          </form>
        )}

        <p className="text-[10px] text-metallic-600 mt-3">
          Free forever · Unsubscribe anytime
        </p>
      </div>
    </div>
  );
}
