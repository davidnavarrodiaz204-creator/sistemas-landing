export type ProspectSearchProvider = 'mock' | 'google_places' | 'serpapi';

export type ProspectSearchInput = {
  rubro: string;
  zona: string;
  maxResults: number;
  fuente?: string;
};

export type ProspectSearchResult = {
  id: string;
  negocio: string;
  rubro: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  facebookLink: string;
  instagramLink: string;
  tiktokLink: string;
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
