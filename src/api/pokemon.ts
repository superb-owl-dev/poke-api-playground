import axios from 'axios';
import { PaginatedResponse, Pokemon, Generation } from '../types/pokemon';

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
    const response = await axios.get<Pokemon>(`${BASE_URL}/pokemon/${idOrName}`);
    return response.data;
  },

  getGenerations: async () => {
    const response = await axios.get<PaginatedResponse<{ name: string; url: string }>>(`${BASE_URL}/generation`);
    return response.data;
  },

  getGeneration: async (idOrName: string | number) => {
    const response = await axios.get<Generation>(`${BASE_URL}/generation/${idOrName}`);
    return response.data;
  }
};