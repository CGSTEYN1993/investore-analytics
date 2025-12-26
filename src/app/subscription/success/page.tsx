import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SuccessClient from './success-client';

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-600">Confirming your subscription...</p>
          </div>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
