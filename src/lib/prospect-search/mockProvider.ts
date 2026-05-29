import type { ProspectSearchInput, ProspectSearchResponse } from './prospectSearch.types';

export async function searchMockProspects(input: ProspectSearchInput): Promise<ProspectSearchResponse> {
  const zona = input.zona || 'Paita';
  const rubro = input.rubro || 'Polleria';
  const examples = [
    {
      id: 'mock-1',
      negocio: `${rubro} Demo Norte`,
      rubro,
      direccion: `Av. principal, ${zona}`,
      telefono: '',
      web: '',
      rating: 4.4,
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${rubro} ${zona}`)}`,
      fuente: 'Demo',
    },
    {
      id: 'mock-2',
      negocio: `${rubro} Ejemplo ${zona}`,
      rubro,
      direccion: `Zona comercial, ${zona}`,
      telefono: '',
      web: '',
      rating: 4.1,
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(`${rubro} ${zona} WhatsApp`)}`,
      fuente: 'Demo',
    },
  ];

  return {
    provider: 'mock',
    configured: false,
    mode: 'demo',
    message: 'Modo demo. Configura Google Places o SerpApi para traer datos reales.',
    results: examples.slice(0, input.maxResults),
  };
}
