'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export function Disclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-900/20 border-b border-amber-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-400/80">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <p>
              <strong>Disclaimer:</strong> InvestOre Analytics provides data for 
              informational purposes only. This is not investment advice.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 hover:bg-amber-800/30 rounded text-amber-500/60 hover:text-amber-400"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
