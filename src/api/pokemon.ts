import axios, { AxiosError } from 'axios';
import { PaginatedResponse, Pokemon, Generation, PokemonSpecies } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const api = {
  getPokemons: async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit;
    const response = await axios.get<PaginatedResponse<{ name: string; url: string }>>(`${BASE_URL}/pokemon`, {
      params: { offset, limit }
    });
    return response.data;
  },

  getPokemon: async (idOrName: string | number) => {
    try {
      // Try to get both Pokemon and species data
      const speciesResponse = await axios.get<PokemonSpecies>(`${BASE_URL}/pokemon-species/${idOrName}`);
      const defaultFormId = speciesResponse.data.varieties.find(v => v.is_default)?.pokemon.name;
      
      if (!defaultFormId) {
        throw new Error(`Could not find default form for Pokemon: ${idOrName}`);
      }

      const pokemonResponse = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${defaultFormId}`);
      return {
        ...pokemonResponse.data,
        species: speciesResponse.data
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(`Error fetching Pokemon ${idOrName}: ${error.message}`);
      }
      throw error;
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