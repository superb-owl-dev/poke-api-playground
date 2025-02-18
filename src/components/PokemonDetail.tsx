import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/pokemon';

const formatVariantName = (variantName: string, speciesName: string) => {
  // Special case for Nidoran
  if (variantName === 'nidoran-m' || variantName === 'nidoran-f') {
    return variantName === 'nidoran-m' ? 'Nidoran ♂' : 'Nidoran ♀';
  }
  
  // Default case: remove the species name and hyphen, then capitalize
  return variantName.replace(speciesName + '-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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
        className="inline-block mb-6 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        ← Back to list
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Pokemon Info */}
          <div>
            <div className="aspect-square p-4">
              <img
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold capitalize text-gray-900 dark:text-gray-100">
                {pokemon.name}
              </h1>
              <span className="text-xl text-gray-500 dark:text-gray-400">
                #{String(pokemon.id).padStart(3, '0')}
              </span>
            </div>

            {/* Types */}
            <div className="flex flex-wrap gap-2 mb-6">
              {pokemon.types.map((type) => (
                <span
                  key={type.type.name}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {type.type.name}
                </span>
              ))}
            </div>

            {/* Base Stats */}
            <div className="space-y-3">
              {pokemon.stats.map((stat) => (
                <div key={stat.stat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-600 dark:text-gray-400">{stat.stat.name}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{stat.base_stat}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Variants Section */}
        {pokemon.variants && pokemon.variants.length > 0 && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Forms & Variants</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pokemon.variants.map((variant) => (
                <Link
                  key={variant.name}
                  to={`/pokemon/${variant.name}`}
                  className="group bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="aspect-square mb-2">
                    <img
                      src={variant.sprites.other['official-artwork'].front_default || variant.sprites.front_default}
                      alt={variant.name}
                      className="w-full h-full object-contain transition-transform group-hover:scale-110"
                    />
                  </div>
                  <p className="text-sm text-center font-medium capitalize text-gray-700 dark:text-gray-300">
                    {formatVariantName(variant.name, pokemon.species.name)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}