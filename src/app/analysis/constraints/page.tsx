'use client';

import { Shield } from 'lucide-react';
import { ComingSoonPlaceholder } from '@/components/subscription/ComingSoonPlaceholder';

/**
 * Legal & Spatial Constraints (`/analysis/constraints`)
 *
 * Previously rendered illustrative "Mock constraint areas" data. Removed
 * to ensure no demo data reaches clients. Real implementation will pull
 * heritage, social, and environmental overlays from authoritative
 * registries (AHIMS, EPBC, native title, state heritage lists, etc.).
 */
export default function ConstraintsPage() {
  return (
    <ComingSoonPlaceholder
      title="Legal & Spatial Constraints"
      subtitle="Heritage · Social · Environmental"
      icon={Shield}
      description="A unified register of legal and spatial constraints that may impact mining tenements is on the way. We're connecting to authoritative sources rather than ship illustrative samples \u2014 no demo data will be displayed here."
      bullets={[
        'Heritage sites \u2014 AHIMS, state heritage lists, archaeological registries',
        'Social \u2014 Indigenous land use agreements and native title claims',
        'Environmental \u2014 EPBC, marine parks, RAMSAR, conservation overlays',
        'Per-tenement overlap and risk scoring with citations',
      ]}
      ctaHref="/analysis/commodity-breakdown"
      ctaLabel="Browse companies by commodity"
      secondaryHref="/pricing"
      secondaryLabel="See Pro plans"
    />
  );
}
