import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/pokemon';

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
        className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to List
      </Link>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <img
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-full max-w-md mx-auto"
              />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold capitalize text-gray-900 dark:text-gray-100">
                    {pokemon.name}
                  </h1>
                  <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                    #{String(pokemon.id).padStart(3, '0')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {pokemon.types.map((type) => (
                    <span
                      key={type.type.name}
                      className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {type.type.name}
                    </span>
                  ))}
                  {pokemon.species?.generation && (
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {pokemon.species.generation.name.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Details</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Height</span>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{pokemon.height / 10}m</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weight</span>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{pokemon.weight / 10}kg</p>
                  </div>
                  {pokemon.species && (
                    <>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {pokemon.species.is_legendary ? 'Legendary' : 
                           pokemon.species.is_mythical ? 'Mythical' : 
                           pokemon.species.is_baby ? 'Baby' : 
                           'Normal'}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Capture Rate</span>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {Math.round((pokemon.species.capture_rate / 255) * 100)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Base Stats</h2>
                <div className="space-y-2">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name} className="flex items-center">
                      <span className="w-32 text-sm capitalize text-gray-600 dark:text-gray-400">
                        {stat.stat.name}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-12 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                        {stat.base_stat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}