import { useQuery } from '@tanstack/react-query';
import { api } from '../api/pokemon';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pokemon } from '../types/pokemon';

interface Props {
  viewMode: 'grid' | 'list';
}

export default function PokemonList({ viewMode }: Props) {
  const [page, setPage] = useState(1);
  const [selectedGeneration, setSelectedGeneration] = useState<string | null>(null);
  const limit = 20;

  // Reset page when changing generation
  useEffect(() => {
    setPage(1);
  }, [selectedGeneration]);

  const { data: generations } = useQuery({
    queryKey: ['generations'],
    queryFn: api.getGenerations,
  });

  const { data: generationDetails, isLoading: isLoadingGeneration } = useQuery({
    queryKey: ['generation', selectedGeneration],
    queryFn: () => selectedGeneration ? api.getGeneration(selectedGeneration) : null,
    enabled: !!selectedGeneration,
  });

  const { data: generationPokemon, isLoading: isLoadingGenerationPokemon } = useQuery({
    queryKey: ['pokemon-by-generation', generationDetails],
    queryFn: () => generationDetails ? api.getPokemonsByGeneration(generationDetails) : [],
    enabled: !!generationDetails,
  });

  const { data: pokemonList, isLoading: isLoadingList } = useQuery({
    queryKey: ['pokemon-list', page],
    queryFn: () => api.getPokemons(page, limit),
    enabled: !selectedGeneration,
  });

  const { data: pokemonDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['pokemon-details', pokemonList?.results],
    queryFn: async () => {
      if (!pokemonList?.results) return [];
      return Promise.all(pokemonList.results.map((pokemon) => api.getPokemon(pokemon.name)));
    },
    enabled: !selectedGeneration && !!pokemonList?.results,
  });

  const isLoading = isLoadingList || isLoadingDetails || isLoadingGeneration || isLoadingGenerationPokemon;

  // Get the current page of pokemon for the selected display mode
  const displayedPokemon = selectedGeneration && generationPokemon
    ? generationPokemon.slice((page - 1) * limit, page * limit)
    : pokemonDetails || [];

  // Calculate total pages
  const totalPages = selectedGeneration && generationPokemon
    ? Math.ceil(generationPokemon.length / limit)
    : pokemonList ? Math.ceil(pokemonList.count / limit) : 0;

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

  const renderPokemonCard = (pokemon: Pokemon) => {
    if (viewMode === 'grid') {
      return (
        <Link
          key={pokemon.id}
          to={`/pokemon/${pokemon.name}`}
          className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
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
        className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
      >
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
    <div className="space-y-6">
      <div className="relative">
        <select
          value={selectedGeneration || ''}
          onChange={(e) => setSelectedGeneration(e.target.value || null)}
          className="appearance-none w-full sm:w-64 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Generations</option>
          {generations?.results.map((gen) => (
            <option key={gen.name} value={gen.name}>
              {gen.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-4'}>
        {displayedPokemon.map(renderPokemonCard)}
      </div>

      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedGeneration ? `Page ${page} of ${totalPages}` : `Page ${page}`}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}