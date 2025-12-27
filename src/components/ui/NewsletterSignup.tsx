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
    <div className={`bg-gradient-to-br from-primary-500/20 via-metallic-900 to-amber-500/20 border border-metallic-800 rounded-2xl p-8 ${className}`}>
      <div className="max-w-xl mx-auto text-center">
        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-metallic-100 mb-3">
          Stay Ahead of the Market
        </h2>
        <p className="text-metallic-400 mb-6">
          Get exclusive mining market insights, drilling results, and analysis delivered to your inbox every week. Join 10,000+ investors who trust InvestOre Analytics.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-3 text-green-400 bg-green-500/10 rounded-xl px-6 py-4">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg">You&apos;re subscribed! Check your inbox for confirmation.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-metallic-500" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={status === 'loading'}
                  className="w-full pl-12 pr-4 py-3.5 bg-metallic-800 border border-metallic-700 rounded-xl text-metallic-100 placeholder-metallic-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-3.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}
          </form>
        )}

        <p className="text-xs text-metallic-500 mt-4">
          By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-metallic-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-metallic-100">10K+</p>
            <p className="text-xs text-metallic-500">Subscribers</p>
          </div>
          <div className="w-px h-10 bg-metallic-800" />
          <div className="text-center">
            <p className="text-2xl font-bold text-metallic-100">Weekly</p>
            <p className="text-xs text-metallic-500">Updates</p>
          </div>
          <div className="w-px h-10 bg-metallic-800" />
          <div className="text-center">
            <p className="text-2xl font-bold text-metallic-100">Free</p>
            <p className="text-xs text-metallic-500">Forever</p>
          </div>
        </div>
      </div>
    </div>
  );
}
