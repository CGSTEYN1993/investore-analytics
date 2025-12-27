/**
 * Returns the public API origin (no trailing slash).
 *
 * - Uses NEXT_PUBLIC_API_URL when set.
 * - Falls back to Railway API in production to avoid hard failures when env vars are missing.
 * - Uses localhost in development.
 */

const DEFAULT_PRODUCTION_API_URL = 'https://web-production-4faa7.up.railway.app';

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getPublicApiUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  if (raw) {
    return stripTrailingSlashes(raw);
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PRODUCTION_API_URL;
  }

  return 'http://localhost:8000';
}

export function getPublicApiV1Url(): string {
  return `${getPublicApiUrl()}/api/v1`;
}
