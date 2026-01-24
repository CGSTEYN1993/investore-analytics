/**
 * Returns the public API origin (no trailing slash).
 *
 * ALWAYS uses Railway backend in production to ensure reliability.
 * Only uses NEXT_PUBLIC_API_URL if it's a valid https:// URL.
 * Falls back to localhost only in development mode.
 */

// Railway backend - always reliable
export const RAILWAY_API_URL = 'https://web-production-4faa7.up.railway.app';

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

function stripApiV1Suffix(value: string): string {
  // Remove /api/v1 from the end if present (to avoid duplication)
  return value.replace(/\/api\/v1\/?$/, '');
}

function isValidProductionUrl(url: string): boolean {
  // Only accept https URLs that are not localhost
  return url.startsWith('https://') && !url.includes('localhost');
}

export function getPublicApiUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  
  // In production or when deployed, ALWAYS use Railway unless we have a valid https URL
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // We're in a browser on https - only use env URL if it's valid https
    if (raw && isValidProductionUrl(raw)) {
      return stripApiV1Suffix(stripTrailingSlashes(raw));
    }
    return RAILWAY_API_URL;
  }
  
  // Server-side or development
  if (process.env.NODE_ENV === 'production') {
    if (raw && isValidProductionUrl(raw)) {
      return stripApiV1Suffix(stripTrailingSlashes(raw));
    }
    return RAILWAY_API_URL;
  }

  // Development mode - use env var or localhost
  if (raw) {
    return stripApiV1Suffix(stripTrailingSlashes(raw));
  }
  return 'http://localhost:8000';
}

export function getPublicApiV1Url(): string {
  return `${getPublicApiUrl()}/api/v1`;
}

// Export a constant for files that want direct access
export const API_BASE_URL = RAILWAY_API_URL;
