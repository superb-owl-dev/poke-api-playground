import axios, { AxiosError } from 'axios';
import { PaginatedResponse, Pokemon, Generation, PokemonSpecies, NamedAPIResource } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const api = {
  getPokemons: async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit;
    const response = await axios.get<PaginatedResponse<NamedAPIResource>>(`${BASE_URL}/pokemon`, {
      params: { offset, limit }
    });
    return response.data;
  },

  getPokemon: async (idOrName: string | number) => {
    try {
      // First get the Pokemon data
      const pokemonResponse = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${idOrName}`);
      
      // Get the species ID from the Pokemon response
      const speciesId = pokemonResponse.data.species?.name;
      if (!speciesId) throw new Error(`No species found for Pokemon ${idOrName}`);
      
      const speciesResponse = await axios.get<PokemonSpecies>(`${BASE_URL}/pokemon-species/${speciesId}`);
      
      // Get all variants including the default one
      const variantPromises = speciesResponse.data.varieties.map(async (variety) => {
        try {
          const variantResponse = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${variety.pokemon.name}`);
          return {
            ...variantResponse.data,
            is_default: variety.is_default,
            species: speciesResponse.data
          };
        } catch (error) {
          console.error(`Error fetching variant ${variety.pokemon.name}:`, error);
          return null;
        }
      });

      const variants = (await Promise.all(variantPromises))
        .filter((p): p is (Pokemon & { is_default: boolean; species: PokemonSpecies }) => p !== null);
      
      // Return the main Pokemon with all other variants
      const mainPokemon = variants.find(v => v.name === pokemonResponse.data.name);
      if (!mainPokemon) throw new Error(`Could not find requested Pokemon ${idOrName} in variants`);
      
      return {
        ...mainPokemon,
        variants: variants.filter(v => !v.is_default) // Include all non-default variants
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(`Error fetching Pokemon ${idOrName}: ${error.message}`);
      }
      throw error;
    }
  },

  searchPokemon: async (searchTerm: string) => {
    if (!searchTerm) return [];
    
    try {
      // Normalize search term
      const normalizedSearch = searchTerm.toLowerCase().trim();
      
      // First try exact match (for IDs and exact names)
      try {
        const response = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${normalizedSearch}`);
        const speciesResponse = await axios.get<PokemonSpecies>(`${BASE_URL}/pokemon-species/${response.data.id}`);
        return [{
          ...response.data,
          species: speciesResponse.data
        }];
      } catch {
        // If exact match fails, continue to partial match
      }

      // Get a list of all pokemon (limited to first 1000 for performance)
      const listResponse = await axios.get<PaginatedResponse<{ name: string; url: string }>>(`${BASE_URL}/pokemon?limit=1000`);
      
      // Filter pokemon that match the search term
      const matchedPokemon = listResponse.data.results.filter(pokemon => 
        pokemon.name.toLowerCase().includes(normalizedSearch) || 
        // Extract ID from URL and check if it matches search
        pokemon.url.split('/').filter(Boolean).pop()?.includes(normalizedSearch)
      ).slice(0, 5); // Limit to 5 results

      if (matchedPokemon.length === 0) return [];

      // Fetch details for matched pokemon
      const detailsPromises = matchedPokemon.map(async (pokemon) => {
        try {
          const pokemonResponse = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${pokemon.name}`);
          const speciesResponse = await axios.get<PokemonSpecies>(`${BASE_URL}/pokemon-species/${pokemonResponse.data.id}`);
          return {
            ...pokemonResponse.data,
            species: speciesResponse.data
          };
        } catch (error) {
          console.error(`Error fetching details for ${pokemon.name}:`, error);
          return null;
        }
      });

      const results = (await Promise.all(detailsPromises)).filter((result): result is Pokemon & { species: PokemonSpecies } => 
        result !== null
      );

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  },

  getGenerations: async () => {
    const response = await axios.get<PaginatedResponse<{ name: string; url: string }>>(`${BASE_URL}/generation`);
    return response.data;
  },

  getGeneration: async (idOrName: string | number) => {
    const response = await axios.get<Generation>(`${BASE_URL}/generation/${idOrName}`);
    return response.data;
  },

  getPokemonsByGeneration: async (generation: Generation) => {
    // First get all species data
    const speciesPromises = generation.pokemon_species.map(async (species) => {
      try {
        return await axios.get<PokemonSpecies>(`${BASE_URL}/pokemon-species/${species.name}`);
      } catch (error) {
        console.error(`Error fetching species ${species.name}:`, error);
        return null;
      }
    });

    const speciesResponses = (await Promise.all(speciesPromises)).filter(response => response !== null);

    // Then get Pokemon data using the default variety from each species
    const pokemonPromises = speciesResponses.map(async (speciesResponse) => {
      if (!speciesResponse) return null;
      
      try {
        const defaultVariety = speciesResponse.data.varieties.find(v => v.is_default);
        if (!defaultVariety) {
          console.error(`No default variety found for ${speciesResponse.data.name}`);
          return null;
        }

        const pokemonResponse = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${defaultVariety.pokemon.name}`);
        return {
          ...pokemonResponse.data,
          species: speciesResponse.data
        };
      } catch (error) {
        console.error(`Error fetching Pokemon for species ${speciesResponse.data.name}:`, error);
        return null;
      }
    });

    const pokemon = (await Promise.all(pokemonPromises))
      .filter((p): p is (Pokemon & { species: PokemonSpecies }) => p !== null)
      .sort((a, b) => a.id - b.id);

    return pokemon;
  }
};