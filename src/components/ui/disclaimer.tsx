'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export function Disclaimer() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p>
              <strong>Disclaimer:</strong> InvestOre Analytics provides data for 
              informational purposes only. This does not constitute investment 
              advice. Always verify data with primary sources.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-100 rounded text-amber-600"
            aria-label="Dismiss disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
