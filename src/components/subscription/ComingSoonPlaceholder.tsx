'use client';

import Link from 'next/link';
import { Clock, Sparkles, ArrowRight, type LucideIcon } from 'lucide-react';

interface ComingSoonPlaceholderProps {
  /** Page / feature title (e.g. "Portfolio", "Interactive Mining Map"). */
  title: string;
  /** Optional sub-headline shown under the title. */
  subtitle?: string;
  /** Longer description of what's coming. Defaults to a generic blurb. */
  description?: string;
  /** Optional icon for the hero badge. Defaults to Clock. */
  icon?: LucideIcon;
  /** Bulleted list of features previewing what'll ship. */
  bullets?: string[];
  /** Where the primary CTA navigates. Defaults to `/analysis/ai-analyst`. */
  ctaHref?: string;
  /** Label for the primary CTA. */
  ctaLabel?: string;
  /** Optional secondary action (e.g. link to /pricing). */
  secondaryHref?: string;
  secondaryLabel?: string;
}

/**
 * Standard "Coming Soon" placeholder used wherever a feature is shipped
 * but its real data wiring isn't ready yet. Replaces any mock / demo
 * data we don't want clients to see.
 */
export function ComingSoonPlaceholder({
  title,
  subtitle,
  description = "This feature is part of the InvestOre roadmap. We're working on the data integrations needed to ship it with real, audit-ready numbers \u2014 no mock or demo data.",
  icon: Icon = Clock,
  bullets,
  ctaHref = '/analysis/ai-analyst',
  ctaLabel = 'Explore the AI Research Analyst',
  secondaryHref,
  secondaryLabel,
}: ComingSoonPlaceholderProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-metallic-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="bg-metallic-900/60 border border-metallic-800 rounded-2xl p-10 text-center shadow-2xl shadow-black/30">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-500/15 border border-primary-500/30 mb-6">
            <Icon className="w-10 h-10 text-primary-400" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium mb-4">
            <Clock className="w-3.5 h-3.5" />
            Coming Soon
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-metallic-100 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-primary-300 text-sm font-medium mb-3">{subtitle}</p>
          )}
          <p className="text-metallic-400 text-base leading-relaxed max-w-xl mx-auto mb-8">
            {description}
          </p>

          {bullets && bullets.length > 0 && (
            <ul className="text-left max-w-md mx-auto mb-8 space-y-2">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-metallic-300">
                  <Sparkles className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-metallic-800 hover:bg-metallic-700 text-metallic-200 text-sm font-medium rounded-lg border border-metallic-700/50 transition-colors"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
