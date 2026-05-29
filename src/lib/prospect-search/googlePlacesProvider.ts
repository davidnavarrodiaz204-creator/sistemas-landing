import type { ProspectSearchInput, ProspectSearchResponse, ProspectSearchResult } from './prospectSearch.types';
import { searchMockProspects } from './mockProvider';

type GooglePlace = {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  rating?: number;
  website?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  url?: string;
};

async function fetchPlaceDetails(placeId: string, apiKey: string): Promise<Partial<GooglePlace>> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'formatted_phone_number,international_phone_number,website,url',
    key: apiKey,
  });
  const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`, { cache: 'no-store' });
  if (!response.ok) return {};
  const data = await response.json();
  return data?.result || {};
}

export async function searchGooglePlaces(input: ProspectSearchInput): Promise<ProspectSearchResponse> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  if (!apiKey) return searchMockProspects(input);

  const params = new URLSearchParams({
    query: `${input.rubro} en ${input.zona}`,
    key: apiKey,
  });
  const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`, { cache: 'no-store' });
  if (!response.ok) {
    return {
      provider: 'google_places',
      configured: true,
      mode: 'real',
      message: `Google Places respondio con estado ${response.status}.`,
      results: [],
    };
  }

  const data = await response.json();
  const places = Array.isArray(data?.results) ? data.results.slice(0, input.maxResults) as GooglePlace[] : [];
  const details: Partial<GooglePlace>[] = await Promise.all(
    places.map((place) => place.place_id ? fetchPlaceDetails(place.place_id, apiKey) : Promise.resolve({} as Partial<GooglePlace>)),
  );
  const results: ProspectSearchResult[] = places.map((place, index) => {
    const detail = details[index] || {};
    const placeId = place.place_id || `google-${index}`;
    return {
      id: placeId,
      negocio: place.name || '',
      rubro: input.rubro,
      direccion: place.formatted_address || '',
      telefono: detail.international_phone_number || detail.formatted_phone_number || '',
      web: detail.website || '',
      rating: typeof place.rating === 'number' ? place.rating : null,
      googleMapsUrl: detail.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      fuente: 'Google Places',
    };
  });

  return {
    provider: 'google_places',
    configured: true,
    mode: 'real',
    message: results.length ? 'Resultados reales desde Google Places.' : 'Google Places no devolvio resultados.',
    results,
  };
}
