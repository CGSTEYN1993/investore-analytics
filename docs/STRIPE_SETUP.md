# Stripe Payment Setup Guide — InvestOre Analytics

## Overview

The payment infrastructure is **fully built**. You just need to:
1. Create products/prices in Stripe Dashboard
2. Set up the webhook
3. Add the live keys to your environment

---

## Step 1: Stripe Account Setup

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Complete your account activation (verify identity, add bank account)
3. Switch to **Live Mode** (toggle in the top-right corner)

## Step 2: Create Products & Prices

In Stripe Dashboard → **Products**:

### Professional - Monthly
- Name: `InvestOre Professional`
- Description: `Full access to AI Analyst, 50 saved peer sets, CSV/JSON export, API access, price alerts`
- Pricing: **$49.00 USD / month** (recurring)
- Copy the **Price ID** (starts with `price_...`)

### Professional - Annual
- Name: `InvestOre Professional (Annual)`  
- Description: `Same as above — save $98/year`
- Pricing: **$490.00 USD / year** (recurring)
- Copy the **Price ID** (starts with `price_...`)

## Step 3: Set Up Webhook

In Stripe Dashboard → **Developers → Webhooks**:

1. Click **Add endpoint**
2. URL: `https://web-production-4faa7.up.railway.app/api/v1/subscription/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the **Webhook Signing Secret** (starts with `whsec_...`)

## Step 4: Add Environment Variables

### Railway (Backend)

Go to Railway Dashboard → your project → **Variables**:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...   (from Step 2)
STRIPE_PRO_ANNUAL_PRICE_ID=price_...     (from Step 2)
```

### Vercel (Frontend)

Go to Vercel Dashboard → your project → **Settings → Environment Variables**:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Step 5: Verify

1. Create a test account on your site
2. Go to `/pricing` → click "Get Started" on Professional
3. You should be redirected to Stripe Checkout
4. Complete payment with a real card
5. After payment, you should be redirected to `/subscription/success`
6. Your account should now show `tier: analyst`
7. Premium features (export, API, 50 peer sets) should be unlocked

## Architecture Reference

| File | Purpose |
|------|---------|
| `backend/app/services/stripe_service.py` | Core Stripe logic (620+ lines) |
| `backend/app/api/subscription.py` | API endpoints (checkout, status, cancel, webhook) |
| `backend/app/utils/feature_flags.py` | Feature entitlements by tier |
| `backend/app/core/security.py` | TierChecker auth dependency |
| `backend/app/models/models.py` | SubscriptionTier enum, User model |
| `frontend/src/app/pricing/page.tsx` | Pricing page with checkout flow |
| `frontend/src/lib/subscription-tiers.ts` | Frontend feature access config |
| `frontend/src/components/ui/UpgradePrompt.tsx` | Reusable upgrade CTA component |

## Subscription Flow

```
User clicks "Get Started" on /pricing
  → POST /api/v1/subscription/checkout { price_key: "pro_monthly" }
  → Backend creates Stripe Customer (if needed)
  → Backend creates Checkout Session
  → User redirected to Stripe Checkout (hosted page)
  → User pays
  → Stripe sends webhook: checkout.session.completed
  → Backend upgrades user to ANALYST tier
  → User redirected to /subscription/success
```

## Feature Gating (Already Implemented)

### Backend
- `TierChecker` in `security.py` — add as FastAPI dependency to gate endpoints
- `check_feature_access()` in `feature_flags.py` — check specific features
- Rate limits: FREE=30/min, ANALYST=300/min

### Frontend
- `UpgradePrompt` component — embed anywhere to show upgrade CTA
- `AuthProvider` with `requiredTier` prop — gate entire pages
- `useAuthStore().user.subscription_tier` — check tier in components

## Important Notes

- **Never commit live Stripe keys to git** — always use environment variables
- Webhook signature verification is already implemented
- Failed payments are logged but don't immediately downgrade (Stripe retries)
- Users can manage billing via Stripe Billing Portal (already integrated)
- Proration is handled by Stripe when upgrading/downgrading
