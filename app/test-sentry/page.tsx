'use client';

import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TestSentryPage() {
  const [message, setMessage] = useState('');

  const testError = () => {
    try {
      throw new Error('This is a test error for Sentry!');
    } catch (error) {
      Sentry.captureException(error);
      setMessage('Error sent to Sentry! Check your Sentry dashboard.');
    }
  };

  const testMessage = () => {
    Sentry.captureMessage('This is a test message for Sentry!', 'info');
    setMessage('Message sent to Sentry! Check your Sentry dashboard.');
  };

  const testBreadcrumb = () => {
    Sentry.addBreadcrumb({
      message: 'User clicked test breadcrumb button',
      level: 'info',
      category: 'user-action',
    });
    setMessage('Breadcrumb added to Sentry! Check your Sentry dashboard.');
  };

  const testPerformance = () => {
    Sentry.startSpan({
      name: 'Test Span',
      op: 'test',
    }, () => {
      // Simulate some work
      setTimeout(() => {
        setMessage('Performance span sent to Sentry! Check your Sentry dashboard.');
      }, 1000);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sentry Integration Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Test Error Logging</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to send a test error to Sentry.
            </p>
            <Button onClick={testError} variant="destructive">
              Send Test Error
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Test Message Logging</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to send a test message to Sentry.
            </p>
            <Button onClick={testMessage} variant="default">
              Send Test Message
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Test Breadcrumb</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to add a breadcrumb to Sentry.
            </p>
            <Button onClick={testBreadcrumb} variant="outline">
              Add Breadcrumb
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Test Performance Monitoring</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to send a performance transaction to Sentry.
            </p>
            <Button onClick={testPerformance} variant="secondary">
              Send Performance Transaction
            </Button>
          </div>

          {message && (
            <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Click any of the test buttons above</li>
            <li>Check your Sentry dashboard at <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="underline">sentry.io</a></li>
            <li>Look for the test data in the Issues, Performance, or Replays sections</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
