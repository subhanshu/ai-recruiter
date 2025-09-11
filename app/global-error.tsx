'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Something went wrong!
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </p>
              <button
                onClick={reset}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
