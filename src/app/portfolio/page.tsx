'use client';

import { Briefcase } from 'lucide-react';
import { ComingSoonPlaceholder } from '@/components/subscription/ComingSoonPlaceholder';

/**
 * Portfolio (`/portfolio`)
 *
 * The portfolio surface is part of the upcoming InvestOre Pro experience.
 * Until live brokerage data and watchlist-linked holdings are wired in,
 * we deliberately show a Coming Soon placeholder rather than a stub UI
 * full of empty values — we don't want clients to see mock or placeholder
 * numbers.
 *
 * Real implementation will pull from `/api/v1/trading/accounts/{id}/holdings`
 * once the broker integration ships with the rest of the Trading Platform.
 */
export default function PortfolioPage() {
  return (
    <ComingSoonPlaceholder
      title="Portfolio"
      subtitle="Live brokerage · P&L · Holdings"
      icon={Briefcase}
      description="A connected portfolio view is on the way. We'll surface your live brokerage holdings, performance attribution, sector exposure, and tax lots once the InvestOre Trading Platform launches. No demo numbers in the meantime."
      bullets={[
        'Live IBKR-connected positions and unrealised P&L',
        'Sector & commodity exposure broken down by holding',
        'Lassonde-stage exposure (producer / developer / explorer)',
        'CSV export of cost basis, holdings, and realised gains',
      ]}
      ctaHref="/analysis/ai-analyst"
      ctaLabel="Use the AI Research Analyst"
      secondaryHref="/pricing"
      secondaryLabel="See Pro plans"
    />
  );
}
