/**
 * Utility functions for URL generation and management
 */

/**
 * Get the base URL for the application
 * This function handles different environments and deployment scenarios
 * Optimized for Railway hosting with Supabase database
 */
export function getBaseUrl(): string {
  // First, check if NEXT_PUBLIC_APP_URL is explicitly set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // For Railway deployments (primary hosting platform)
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  // For Railway with custom domain
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL;
  }

  // For other cloud providers that set PORT
  if (process.env.PORT && process.env.NODE_ENV === 'production') {
    // This is a fallback - you should set NEXT_PUBLIC_APP_URL in production
    console.warn('NEXT_PUBLIC_APP_URL not set in production. Please configure it properly.');
    return 'https://your-app-domain.com'; // Replace with your actual domain
  }

  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Generate an interview URL with the given token
 */
export function generateInterviewUrl(token: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/interview/${token}`;
}

/**
 * Generate a full URL for any path
 */
export function generateUrl(path: string): string {
  const baseUrl = getBaseUrl();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
