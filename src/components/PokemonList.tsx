import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/pokemon';

interface Props {
  viewMode: 'grid' | 'list';
}

interface PokemonListItem {
  name: string;
  url: string;
}

export default function PokemonList({ viewMode }: Props) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: pokemonList, isLoading } = useQuery({
    queryKey: ['pokemon-list', page],
    queryFn: () => api.getPokemons(page, limit),
  });

  const { data: pokemonDetails } = useQuery({
    queryKey: ['pokemon-details', pokemonList?.results],
    queryFn: async () => {
      if (!pokemonList?.results) return [];
      const details = await Promise.all(
        pokemonList.results.map((pokemon: PokemonListItem) => api.getPokemon(pokemon.name))
      );
      return details;
    },
    enabled: !!pokemonList?.results,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500" />
        </div>
      </div>
    );
  }

  const totalPages = pokemonList ? Math.ceil(pokemonList.count / limit) : 0;

  return (
    <div className="space-y-8">
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
        {pokemonDetails?.map((pokemon) => (
          <Link
            key={pokemon.id}
            to={`/pokemon/${pokemon.id}`}
            className={`
              group relative block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl 
              transition-all duration-300 ease-in-out overflow-hidden
              transform hover:-translate-y-1
              ${viewMode === 'list' ? 'flex items-center p-4' : ''}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/30 dark:from-black/5 dark:to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              className={`
                transition-transform duration-300 ease-in-out transform group-hover:scale-110
                ${viewMode === 'list' ? 'w-20 h-20' : 'w-full h-48 object-contain bg-gray-50 dark:bg-gray-700 p-4'}
              `}
            />
            <div className={`p-4 ${viewMode === 'list' ? 'flex-1 ml-4' : ''}`}>
              <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white">
                #{pokemon.id.toString().padStart(3, '0')} {pokemon.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {pokemon.types.map(({ type }) => (
                  <span
                    key={type.name}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100"
                  >
                    {type.name}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-6 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          Previous
        </button>
        <div className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <span className="font-medium">Page {page}</span>
          <span className="text-gray-500 dark:text-gray-400"> of {totalPages}</span>
        </div>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-6 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}