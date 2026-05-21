'use client';

import React, { useEffect, useState } from 'react';
import { Image as ImgIcon, ExternalLink, X, Loader2 } from 'lucide-react';
import { RAILWAY_API_URL } from '@/lib/public-api-url';

interface Figure {
  id: number;
  document_id: string;
  figure_type: string | null;
  caption: string | null;
  page_num: number | null;
  image_url: string;
  document_title?: string | null;
  announcement_date?: string | null;
  pdf_url?: string | null;
  confidence?: number | null;
}

interface Props {
  ticker: string;
  project: string;
  className?: string;
}

const TYPE_LABEL: Record<string, string> = {
  cross_section: 'Cross-sections',
  long_section: 'Long sections',
  plan_view: 'Plan views',
  collar_map: 'Drill collar maps',
  geological_map: 'Geological maps',
  tenement_map: 'Tenement maps',
  other: 'Other figures',
};

export default function FigureGallery({ ticker, project, className = '' }: Props) {
  const [data, setData] = useState<{ by_type: Record<string, Figure[]> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<Figure | null>(null);
  const [extracting, setExtracting] = useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `${RAILWAY_API_URL}/api/v1/mining/company/${encodeURIComponent(ticker)}` +
          `/projects/${encodeURIComponent(project)}/figures`,
      );
      if (r.ok) setData(await r.json());
      else setData({ by_type: {} });
    } catch {
      setData({ by_type: {} });
    } finally {
      setLoading(false);
    }
  }, [ticker, project]);

  useEffect(() => {
    load();
  }, [load]);

  async function triggerExtract() {
    setExtracting(true);
    try {
      await fetch(
        `${RAILWAY_API_URL}/api/v1/mining/company/${encodeURIComponent(ticker)}` +
          `/projects/${encodeURIComponent(project)}/figures/extract`,
        { method: 'POST' },
      );
      await load();
    } finally {
      setExtracting(false);
    }
  }

  const groups = data?.by_type || {};
  const total = Object.values(groups).reduce((a, b) => a + b.length, 0);

  return (
    <section
      className={`bg-metallic-900 border border-metallic-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-metallic-100 flex items-center gap-2">
          <ImgIcon className="w-5 h-5 text-primary-400" /> Cross-sections &amp;
          Project Figures
        </h2>
        <div className="flex items-center gap-3 text-xs text-metallic-500">
          <span>{total} figure(s)</span>
          <button
            type="button"
            onClick={triggerExtract}
            disabled={extracting}
            className="px-2 py-1 text-xs rounded bg-metallic-800 hover:bg-metallic-700 border border-metallic-700 text-metallic-200 disabled:opacity-50"
          >
            {extracting ? 'Extracting…' : 'Extract more'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      ) : total === 0 ? (
        <p className="text-sm text-metallic-500">
          No figures detected for this project yet. Run extraction via the
          button above (works on any locally-cached announcement PDFs).
        </p>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([t, items]) => (
            <div key={t}>
              <h3 className="text-xs uppercase tracking-wider text-metallic-500 mb-2">
                {TYPE_LABEL[t] || t} · {items.length}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {items.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setLightbox(f)}
                    className="group text-left bg-metallic-800/40 hover:bg-metallic-800 border border-metallic-800 hover:border-primary-700 rounded-lg overflow-hidden transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${RAILWAY_API_URL}${f.image_url}`}
                      alt={f.caption || `Figure on page ${f.page_num}`}
                      className="w-full h-32 object-cover bg-metallic-950"
                      loading="lazy"
                    />
                    <div className="p-2 text-[11px]">
                      <div className="text-metallic-200 truncate">
                        {f.caption || `Figure (p.${f.page_num ?? '?'})`}
                      </div>
                      <div className="text-metallic-500">
                        p.{f.page_num ?? '?'} ·{' '}
                        {f.announcement_date?.split('T')[0] || ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-metallic-900 border border-metallic-800 rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 p-1 rounded bg-metallic-800/80 hover:bg-metallic-700 text-metallic-300"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${RAILWAY_API_URL}${lightbox.image_url}`}
              alt={lightbox.caption || ''}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-4 text-sm">
              <div className="text-metallic-100 font-medium">
                {lightbox.caption || `Figure (page ${lightbox.page_num ?? '?'})`}
              </div>
              <div className="text-xs text-metallic-500 mt-1 flex items-center gap-3">
                <span>{TYPE_LABEL[lightbox.figure_type || 'other']}</span>
                <span>·</span>
                <span>p. {lightbox.page_num ?? '?'}</span>
                {lightbox.document_title && (
                  <>
                    <span>·</span>
                    <span className="truncate">{lightbox.document_title}</span>
                  </>
                )}
                {lightbox.pdf_url && (
                  <a
                    href={lightbox.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-primary-300 hover:text-primary-200"
                  >
                    Source PDF <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
