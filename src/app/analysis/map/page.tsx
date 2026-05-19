'use client';

import { Map as MapIcon } from 'lucide-react';
import { ComingSoonPlaceholder } from '@/components/subscription/ComingSoonPlaceholder';

/**
 * Interactive Global Mining Map (`/analysis/map`)
 *
 * The map surface previously rendered illustrative demo coordinates and
 * mocked constraint areas. We removed that placeholder UI rather than
 * ship synthetic data to clients. Real implementation will plug into the
 * spatial backend (project locations, tenement polygons, heritage and
 * environmental overlays) once those data feeds are production-ready.
 */
export default function GlobalMiningMapPage() {
  return (
    <ComingSoonPlaceholder
      title="Interactive Global Mining Map"
      subtitle="Projects · Tenements · Constraints"
      icon={MapIcon}
      description="A fully interactive map of mining projects, tenement boundaries, and overlapping social / environmental / heritage constraints is on the way. We removed the previous demo coordinates to avoid showing illustrative data — real spatial layers will be wired in next."
      bullets={[
        'Project markers driven by live drill-hole and resource data',
        'Tenement polygons sourced from DMIRS / MINVIEW / SARIG',
        'Heritage, environmental and social constraint overlays',
        'Commodity filters and Lassonde-stage colour coding',
      ]}
      ctaHref="/analysis/commodity-breakdown"
      ctaLabel="Browse companies by commodity"
      secondaryHref="/pricing"
      secondaryLabel="See Pro plans"
    />
  );
}
