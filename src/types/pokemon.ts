export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: NamedAPIResource;
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: NamedAPIResource;
  }[];
}

export interface Generation {
  id: number;
  name: string;
  pokemon_species: NamedAPIResource[];
  main_region: NamedAPIResource;
}