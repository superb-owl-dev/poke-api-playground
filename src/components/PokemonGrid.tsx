import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Pokemon } from '../types/pokemon';

interface PokemonGridProps {
  pokemon: (Pokemon & { variants?: Pokemon[] })[];
  viewMode: 'grid' | 'list';
}

function PokemonGrid({ pokemon, viewMode }: PokemonGridProps) {
  const renderPokemonCard = (pokemon: Pokemon & { variants?: Pokemon[] }) => {
    if (viewMode === 'grid') {
      return (
        <Link
          key={pokemon.id}
          to={`/pokemon/${pokemon.name}`}
          className="group relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          {pokemon.variants && pokemon.variants.length > 0 && (
            <div className="absolute top-2 right-2 z-10 flex items-center">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                +{pokemon.variants.length}
              </span>
            </div>
          )}
          <div className="aspect-square p-4">
            <img
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              className="w-full h-full object-contain transition-transform group-hover:scale-110"
            />
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                {pokemon.name}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                #{String(pokemon.id).padStart(3, '0')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {pokemon.types.map((type) => (
                <span
                  key={type.type.name}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {type.type.name}
                </span>
              ))}
              {pokemon.species?.generation && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {pokemon.species.generation.name.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              )}
            </div>
          </div>
        </Link>
      );
    }

    return (
      <Link
        key={pokemon.id}
        to={`/pokemon/${pokemon.name}`}
        className="relative flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
      >
        {pokemon.variants && pokemon.variants.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
              +{pokemon.variants.length}
            </span>
          </div>
        )}
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          className="w-16 h-16"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
              {pokemon.name}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {pokemon.types.map((type) => (
              <span
                key={type.type.name}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {type.type.name}
              </span>
            ))}
            {pokemon.species?.generation && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {pokemon.species.generation.name.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-4'}>
      {pokemon.map(renderPokemonCard)}
    </div>
  );
}

export default memo(PokemonGrid);