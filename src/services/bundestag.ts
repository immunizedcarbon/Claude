import type { PlenarprotokollTextListResponse, SearchParams } from '@/types';
import { BUNDESTAG_API_BASE, CORS_PROXY_URL, ERROR_MESSAGES } from '@/config/constants';

/**
 * Smart fetch wrapper that handles CORS issues by falling back to a proxy.
 * Uses query parameter authentication which is more reliable than headers.
 */
async function smartFetch<T>(url: string, apiKey: string): Promise<T> {
  const urlObj = new URL(url);
  urlObj.searchParams.append('apikey', apiKey);
  urlObj.searchParams.append('format', 'json');

  const targetUrl = urlObj.toString();

  // Strategy 1: Direct call (works in some environments)
  try {
    const response = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      return response.json();
    }

    // If we get a response but it's not OK, check if it's a CORS issue
    if (response.status === 0 || response.type === 'opaque') {
      throw new Error('CORS');
    }

    // Handle specific error codes
    if (response.status === 401) {
      throw new Error('Ungültiger API-Key. Bitte überprüfen Sie Ihre Einstellungen.');
    }
    if (response.status === 429) {
      throw new Error(ERROR_MESSAGES.RATE_LIMIT);
    }
    if (response.status >= 500) {
      throw new Error('Der Bundestag-Server ist derzeit nicht erreichbar. Bitte versuchen Sie es später erneut.');
    }

    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  } catch (error) {
    // If direct fetch fails due to CORS, try proxy
    if (error instanceof TypeError || (error instanceof Error && error.message === 'CORS')) {
      console.info('Direkter API-Zugriff nicht möglich, verwende CORS-Proxy...');
    } else {
      throw error;
    }
  }

  // Strategy 2: CORS Proxy
  const proxyTarget = `${CORS_PROXY_URL}${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyTarget, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Ungültiger API-Key. Bitte überprüfen Sie Ihre Einstellungen.');
      }
      if (response.status === 429) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT);
      }
      throw new Error(`API-Fehler via Proxy: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw specific errors
      if (error.message.includes('API-Fehler') || error.message.includes('API-Key')) {
        throw error;
      }
    }
    console.error('Proxy fetch failed:', error);
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  }
}

/**
 * Fetch plenary protocol texts with full text content
 */
export async function fetchProtocolsWithText(
  apiKey: string,
  params: SearchParams
): Promise<PlenarprotokollTextListResponse> {
  const url = new URL(`${BUNDESTAG_API_BASE}/plenarprotokoll-text`);

  // Required parameter
  url.searchParams.append('f.wahlperiode', params.wahlperiode.toString());

  // Pagination
  url.searchParams.append('limit', (params.limit || 20).toString());

  // Optional filters
  if (params.startDatum) {
    url.searchParams.append('f.datum.start', params.startDatum);
  }
  if (params.endDatum) {
    url.searchParams.append('f.datum.end', params.endDatum);
  }
  if (params.suchbegriff) {
    // Search in title
    url.searchParams.append('f.titel', params.suchbegriff);
  }
  if (params.cursor) {
    url.searchParams.append('cursor', params.cursor);
  }

  const response = await smartFetch<PlenarprotokollTextListResponse>(url.toString(), apiKey);

  // Validate response structure
  if (!response || !Array.isArray(response.documents)) {
    throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
  }

  return response;
}

/**
 * Fetch a single protocol by ID with full text
 */
export async function fetchProtocolById(
  apiKey: string,
  id: string
): Promise<import('@/types').PlenarprotokollText> {
  const url = `${BUNDESTAG_API_BASE}/plenarprotokoll-text/${id}`;
  return smartFetch(url, apiKey);
}

/**
 * Fetch protocols metadata only (without full text - faster)
 */
export async function fetchProtocolsMetadata(
  apiKey: string,
  params: SearchParams
): Promise<import('@/types').PlenarprotokollListResponse> {
  const url = new URL(`${BUNDESTAG_API_BASE}/plenarprotokoll`);

  url.searchParams.append('f.wahlperiode', params.wahlperiode.toString());
  url.searchParams.append('limit', (params.limit || 20).toString());

  if (params.startDatum) {
    url.searchParams.append('f.datum.start', params.startDatum);
  }
  if (params.endDatum) {
    url.searchParams.append('f.datum.end', params.endDatum);
  }
  if (params.suchbegriff) {
    url.searchParams.append('f.titel', params.suchbegriff);
  }
  if (params.cursor) {
    url.searchParams.append('cursor', params.cursor);
  }

  return smartFetch(url.toString(), apiKey);
}

/**
 * Search for Drucksachen (printed documents)
 */
export async function fetchDrucksachen(
  apiKey: string,
  wahlperiode: number,
  limit = 20
): Promise<{ documents: import('@/types').Drucksache[]; cursor?: string; numFound: number }> {
  const url = new URL(`${BUNDESTAG_API_BASE}/drucksache`);
  url.searchParams.append('f.wahlperiode', wahlperiode.toString());
  url.searchParams.append('limit', limit.toString());

  return smartFetch(url.toString(), apiKey);
}

/**
 * Search for persons (members of parliament)
 */
export async function fetchPersonen(
  apiKey: string,
  query: string
): Promise<{ documents: import('@/types').Person[]; numFound: number }> {
  const url = new URL(`${BUNDESTAG_API_BASE}/person`);
  if (query) {
    url.searchParams.append('f.nachname', query);
  }
  url.searchParams.append('limit', '50');

  return smartFetch(url.toString(), apiKey);
}

/**
 * Validate API key by making a simple request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const url = new URL(`${BUNDESTAG_API_BASE}/plenarprotokoll`);
    url.searchParams.append('f.wahlperiode', '21');
    url.searchParams.append('limit', '1');

    await smartFetch(url.toString(), apiKey);
    return true;
  } catch {
    return false;
  }
}
