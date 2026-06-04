'use client';

/**
 * Token infrastructure for future paid Mandoo API features.
 *
 * Usage (planned):
 *   <MandooEditor apiToken="mk_live_..." />
 *
 * The token is passed here so that pro plugins (PDF export, Word import,
 * AI assist, …) can authenticate against the Mandoo cloud API.
 * None of these plugins are active yet — this module is the stub.
 */

export interface TokenConfig {
  /** The Mandoo API token (prefix: mk_live_ or mk_test_). */
  token: string;
  /** Override the default API base URL (for self-hosted / staging). */
  baseUrl?: string;
}

const DEFAULT_BASE = 'https://api.mandoo.dev/v1';

export function validateToken(token: string): boolean {
  return typeof token === 'string' && token.length >= 16;
}

export function createAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'X-Mandoo-Token': token,
  };
}

/**
 * Base fetcher for future pro-plugin API calls.
 * All pro plugins will use this function.
 */
export async function mandooFetch<T>(
  path: string,
  init: RequestInit,
  config: TokenConfig,
): Promise<T> {
  if (!validateToken(config.token)) {
    throw new Error('MandooEditor: invalid or missing apiToken');
  }
  const base = config.baseUrl ?? DEFAULT_BASE;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...createAuthHeaders(config.token),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Mandoo API error ${res.status}: ${msg}`);
  }
  return res.json() as Promise<T>;
}
