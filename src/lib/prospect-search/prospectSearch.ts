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
    fuente: input.fuente?.trim() || 'Google Maps',
  };

  const provider = getProspectSearchProvider();

  try {
    if (provider === 'google_places') return searchGooglePlaces(safeInput);
    if (provider === 'serpapi') return searchSerpApi(safeInput);
    return searchMockProspects(safeInput);
  } catch (error) {
    return {
      provider: provider as ProspectSearchProvider,
      configured: provider !== 'mock',
      mode: 'real' as const,
      message: `Error en búsqueda: ${error instanceof Error ? error.message : 'error desconocido'}. Usando fallback demo.`,
      results: [],
    };
  }
}
