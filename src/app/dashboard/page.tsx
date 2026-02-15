'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard redirect page
 * Routes users to the main analysis page
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/analysis');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
        <p className="text-metallic-400">Redirecting to Analysis Dashboard...</p>
      </div>
    </div>
  );
}
