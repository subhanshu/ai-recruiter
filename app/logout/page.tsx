'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate logout process
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Logged Out Successfully</CardTitle>
            <CardDescription>
              You have been logged out of your account. Redirecting to home page...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
