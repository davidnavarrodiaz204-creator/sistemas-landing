export type ProspectSearchProvider = 'mock' | 'google_places' | 'serpapi';

export type ProspectSearchInput = {
  rubro: string;
  zona: string;
  maxResults: number;
};

export type ProspectSearchResult = {
  id: string;
  negocio: string;
  rubro: string;
  direccion: string;
  telefono: string;
  web: string;
  rating: number | null;
  googleMapsUrl: string;
  fuente: string;
};

export type ProspectSearchResponse = {
  provider: ProspectSearchProvider;
  configured: boolean;
  mode: 'real' | 'demo';
  message: string;
  results: ProspectSearchResult[];
};
