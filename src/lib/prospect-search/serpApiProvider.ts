import type { ProspectSearchInput, ProspectSearchResponse, ProspectSearchResult } from './prospectSearch.types';
import { searchMockProspects } from './mockProvider';

type SerpLocalResult = {
  position?: number;
  title?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  place_id?: string;
  gps_coordinates?: { latitude?: number; longitude?: number };
};

export async function searchSerpApi(input: ProspectSearchInput): Promise<ProspectSearchResponse> {
  const apiKey = process.env.SERPAPI_API_KEY || '';
  if (!apiKey) return searchMockProspects(input);

  const params = new URLSearchParams({
    engine: 'google_maps',
    q: `${input.rubro} ${input.zona}`,
    hl: 'es',
    api_key: apiKey,
  });
  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, { cache: 'no-store' });
  if (!response.ok) {
    return {
      provider: 'serpapi',
      configured: true,
      mode: 'real',
      message: `SerpApi respondio con estado ${response.status}.`,
      results: [],
    };
  }

  const data = await response.json();
  const localResults = Array.isArray(data?.local_results) ? data.local_results.slice(0, input.maxResults) as SerpLocalResult[] : [];
  const results: ProspectSearchResult[] = localResults.map((item, index) => ({
    id: item.place_id || `serp-${item.position || index}`,
    negocio: item.title || '',
    rubro: input.rubro,
    direccion: item.address || '',
    telefono: item.phone || '',
    email: '',
    web: item.website || '',
    facebookLink: '',
    instagramLink: '',
    tiktokLink: '',
    rating: typeof item.rating === 'number' ? item.rating : null,
    googleMapsUrl: item.place_id ? `https://www.google.com/maps/place/?q=place_id:${item.place_id}` : `https://www.google.com/maps/search/${encodeURIComponent(`${item.title || input.rubro} ${input.zona}`)}`,
    fuente: 'SerpApi',
  }));

  return {
    provider: 'serpapi',
    configured: true,
    mode: 'real',
    message: results.length ? 'Resultados reales desde SerpApi.' : 'SerpApi no devolvio resultados.',
    results,
  };
}
