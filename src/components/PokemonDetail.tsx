import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/pokemon';
import type { Pokemon } from '../types/pokemon';

interface PokemonTypeSlot {
  type: {
    name: string;
  };
}

interface PokemonStat {
  stat: {
    name: string;
  };
  base_stat: number;
}

export default function PokemonDetail() {
  const { id } = useParams();

  const { data: pokemon, isLoading } = useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => api.getPokemon(id!),
    enabled: !!id,
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

  if (!pokemon) return null;

  return (
    <div className="animate-fadeIn">
      <Link 
        to="/"
        className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium rounded-lg 
          bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
          shadow-sm hover:shadow"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to List
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800">
          <img
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            className="absolute left-1/2 -translate-x-1/2 -bottom-20 w-40 h-40 drop-shadow-xl
              transition-transform hover:scale-110 duration-300"
          />
        </div>

        <div className="p-8 pt-24">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold capitalize mb-2 text-gray-800 dark:text-white">
              {pokemon.name}
            </h1>
            <div className="flex justify-center gap-2 mb-4">
              {pokemon.types.map(({ type }: PokemonTypeSlot) => (
                <span
                  key={type.name}
                  className="px-4 py-1 text-sm font-medium rounded-full 
                    bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100"
                >
                  {type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Height</p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{pokemon.height / 10}m</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weight</p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white">{pokemon.weight / 10}kg</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Base Stats</h2>
            {pokemon.stats.map(({ stat, base_stat }: PokemonStat) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize text-gray-600 dark:text-gray-300">
                    {stat.name.replace('-', ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {base_stat}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600
                      transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min(100, (base_stat / 255) * 100)}%`,
                      opacity: base_stat / 255
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}