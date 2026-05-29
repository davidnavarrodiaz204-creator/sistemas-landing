import { searchGooglePlaces } from './googlePlacesProvider';
import { searchMockProspects } from './mockProvider';
import { searchSerpApi } from './serpApiProvider';
import type { ProspectSearchInput, ProspectSearchProvider } from './prospectSearch.types';

export function getProspectSearchProvider(): ProspectSearchProvider {
  const provider = process.env.NEXT_PUBLIC_PROSPECT_SEARCH_PROVIDER;
  if (provider === 'google_places' || provider === 'serpapi') return provider;
  return 'mock';
}

export async function searchProspects(input: ProspectSearchInput) {
  const safeInput = {
    rubro: input.rubro.trim() || 'negocio',
    zona: input.zona.trim() || 'Paita',
    maxResults: Math.min(Math.max(Number(input.maxResults) || 10, 1), 20),
  };
  const provider = getProspectSearchProvider();
  if (provider === 'google_places') return searchGooglePlaces(safeInput);
  if (provider === 'serpapi') return searchSerpApi(safeInput);
  return searchMockProspects(safeInput);
}
