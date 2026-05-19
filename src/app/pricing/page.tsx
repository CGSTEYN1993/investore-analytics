'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Plan {
  id: string;
  name: string;
  price_monthly: number | string;
  price_annual: number | string;
  price_key_monthly?: string;
  price_key_annual?: string;
  features: string[];
  limits: Record<string, number | string>;
  popular?: boolean;
  contact_sales?: boolean;
}

interface PricingCardProps {
  plan: Plan;
  billingPeriod: 'monthly' | 'annual';
  onSelect: (priceKey: string) => void;
  isLoading: boolean;
  currentPlan?: string;
}

function PricingCard({
  plan,
  billingPeriod,
  onSelect,
  isLoading,
  currentPlan
}: PricingCardProps) {
  const price = billingPeriod === 'monthly' ? plan.price_monthly : plan.price_annual;
  const priceKey = billingPeriod === 'monthly' ? plan.price_key_monthly : plan.price_key_annual;
  const isCurrentPlan = currentPlan === plan.id;
  
  return (
    <div
      className={`relative rounded-2xl border p-8 transition-all ${
        plan.popular
          ? 'border-primary-500 bg-metallic-800/80 shadow-lg shadow-primary-500/20'
          : 'border-metallic-700 bg-metallic-800/50 hover:border-metallic-600'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1 text-sm font-medium text-white shadow-lg">
          Most Popular
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-metallic-100">{plan.name}</h3>
        <div className="mt-4">
          {typeof price === 'number' ? (
            <>
              <span className="text-4xl font-bold text-metallic-50">
                ${billingPeriod === 'annual' ? Math.floor(price / 12) : price}
              </span>
              <span className="text-metallic-400">/month</span>
              {billingPeriod === 'annual' && price > 0 && (
                <p className="mt-1 text-sm text-primary-400">
                  Save ${(plan.price_monthly as number) * 12 - (price as number)}/year
                </p>
              )}
            </>
          ) : (
            <span className="text-2xl font-bold text-metallic-50">{price}</span>
          )}
        </div>
      </div>
      
      <ul className="mt-8 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 flex-shrink-0 text-primary-400" />
            <span className="text-sm text-metallic-300">{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-8">
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full rounded-lg bg-metallic-700 px-4 py-3 text-sm font-semibold text-metallic-400"
          >
            Current Plan
          </button>
        ) : plan.contact_sales ? (
          <a
            href="mailto:sales@investoreanalytics.com"
            className="block w-full rounded-lg bg-metallic-700 border border-metallic-600 px-4 py-3 text-center text-sm font-semibold text-metallic-100 hover:bg-metallic-600 transition-colors"
          >
            Contact Sales
          </a>
        ) : priceKey ? (
          <button
            onClick={() => onSelect(priceKey)}
            disabled={isLoading}
            className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              plan.popular
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25'
                : 'bg-metallic-700 text-metallic-100 hover:bg-metallic-600'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              'Get Started'
            )}
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-lg bg-metallic-700/50 border border-metallic-600 px-4 py-3 text-sm font-semibold text-metallic-300"
          >
            Free Forever
          </button>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price_monthly: 0,
      price_annual: 0,
      features: [
        'AI Research Analyst (5 queries / day)',
        'Live commodity spot prices (read-only)',
        'News hits feed (read-only)',
        'Cross-exchange intelligence (read-only)',
        'Commodity breakdown \u2014 top 5 companies preview',
        'Community support',
      ],
      limits: {
        ai_queries_per_day: 5,
        peer_sets: 0,
        exports_per_day: 0,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      price_monthly: 49,
      price_annual: 490,
      price_key_monthly: 'pro_monthly',
      price_key_annual: 'pro_annual',
      features: [
        'Everything in Free, with no limits',
        'Unlimited AI Research Analyst queries',
        'Full commodity breakdown across every company',
        'Interactive global mining map',
        'Personal watchlists & alerts',
        'CSV & JSON export',
        'Full historical data',
        'Priority support',
        'Early access to the upcoming Trading Platform',
      ],
      limits: {
        ai_queries_per_day: 'Unlimited',
        peer_sets: 'Unlimited',
        exports_per_day: 'Unlimited',
      },
      popular: true,
    },
  ];
  ];
  
  const handleSelectPlan = async (priceKey: string) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = `/login?redirect=/pricing&plan=${priceKey}`;
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post<{ checkout_url: string }>('/subscription/checkout', {
        price_key: priceKey,
      });
      
      // Redirect to Stripe Checkout
      window.location.href = response.checkout_url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-metallic-950 py-12">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-metallic-100">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-metallic-400">
            Start free and scale as your analysis needs grow
          </p>
        </div>
        
        {/* Billing toggle */}
        <div className="mt-8 flex justify-center">
          <div className="relative flex rounded-full bg-metallic-800 p-1 border border-metallic-700">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`relative rounded-full px-6 py-2 text-sm font-medium transition ${
                billingPeriod === 'monthly'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-metallic-400 hover:text-metallic-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`relative rounded-full px-6 py-2 text-sm font-medium transition ${
                billingPeriod === 'annual'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-metallic-400 hover:text-metallic-200'
              }`}
            >
              Annual
              <span className="ml-1 text-xs text-primary-300">(Save 17%)</span>
            </button>
          </div>
        </div>
        
        {/* Pricing cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              onSelect={handleSelectPlan}
              isLoading={isLoading}
              currentPlan={user?.tier}
            />
          ))}
        </div>
        
        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-metallic-100">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-6 text-left">
            <div className="p-4 rounded-lg bg-metallic-900 border border-metallic-800">
              <h3 className="font-semibold text-metallic-100">
                Can I change plans later?
              </h3>
              <p className="mt-2 text-metallic-400">
                Yes! You can upgrade or downgrade at any time. Changes take effect
                immediately, and we&apos;ll prorate your billing.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-metallic-900 border border-metallic-800">
              <h3 className="font-semibold text-metallic-100">
                What payment methods do you accept?
              </h3>
              <p className="mt-2 text-metallic-400">
                We accept all major credit cards through our secure payment
                partner, Stripe.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-metallic-900 border border-metallic-800">
              <h3 className="font-semibold text-metallic-100">
                Is there a free trial?
              </h3>
              <p className="mt-2 text-metallic-400">
                Our Free tier gives you access to core features forever. When you
                upgrade to Pro, you can cancel anytime within the first 30 days
                for a full refund.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-metallic-900 border border-metallic-800">
              <h3 className="font-semibold text-metallic-100">
                What&apos;s included in API access?
              </h3>
              <p className="mt-2 text-metallic-400">
                Pro subscribers get programmatic access to all data and
                analytics via our REST API. Perfect for building custom dashboards
                or integrating with your existing tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
