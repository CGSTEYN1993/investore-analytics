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
