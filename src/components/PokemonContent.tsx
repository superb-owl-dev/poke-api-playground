import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/pokemon';
import PokemonGrid from './PokemonGrid';

interface PokemonContentProps {
  page: number;
  searchTerm: string;
  selectedGeneration: string | null;
  viewMode: 'grid' | 'list';
  onPageChange: (newPage: number) => void;
}

function PokemonContent({ 
  page, 
  searchTerm, 
  selectedGeneration, 
  viewMode,
  onPageChange 
}: PokemonContentProps) {
  const limit = 20;

  // Fetch generation details first if a generation is selected
  const { data: generationDetails, isLoading: isLoadingGeneration } = useQuery({
    queryKey: ['generation', selectedGeneration],
    queryFn: () => selectedGeneration ? api.getGeneration(selectedGeneration) : null,
    enabled: !!selectedGeneration,
  });

  // Then fetch all Pokemon for that generation
  const { data: generationPokemon, isLoading: isLoadingGenerationPokemon } = useQuery({
    queryKey: ['pokemon-by-generation', selectedGeneration],
    queryFn: () => generationDetails ? api.getPokemonsByGeneration(generationDetails) : [],
    enabled: !!generationDetails,
  });

  // Search functionality now considers both search term and generation
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['pokemon-search', searchTerm, selectedGeneration],
    queryFn: async () => {
      if (!searchTerm) return null;

      const results = await api.searchPokemon(searchTerm);
      if (!results?.length) return [];

      // If a generation is selected, filter the search results by that generation
      if (selectedGeneration && generationPokemon) {
        const generationPokemonNames = new Set(generationPokemon.map(p => p.name));
        return results.filter(pokemon => generationPokemonNames.has(pokemon.name));
      }

      return results;
    },
    enabled: !!searchTerm,
  });

  // Default list of Pokemon when no search or generation is selected
  const { data: pokemonList, isLoading: isLoadingList } = useQuery({
    queryKey: ['pokemon-list', page],
    queryFn: () => api.getPokemons(page, limit),
    enabled: !selectedGeneration && !searchTerm,
  });

  const { data: pokemonDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['pokemon-details', pokemonList?.results],
    queryFn: async () => {
      if (!pokemonList?.results) return [];
      return Promise.all(pokemonList.results.map((pokemon) => api.getPokemon(pokemon.name)));
    },
    enabled: !selectedGeneration && !searchTerm && !!pokemonList?.results,
  });

  const isLoading = 
    isLoadingList || 
    isLoadingDetails || 
    isLoadingGeneration || 
    isLoadingGenerationPokemon || 
    isLoadingSearch;

  // Get the current page of pokemon for the selected display mode
  const displayedPokemon = searchResults || 
    (selectedGeneration && generationPokemon
      ? generationPokemon.slice((page - 1) * limit, page * limit)
      : pokemonDetails || []);

  // Calculate total pages
  const totalPages = searchResults
    ? Math.ceil(searchResults.length / limit)
    : selectedGeneration && generationPokemon
      ? Math.ceil(generationPokemon.length / limit)
      : pokemonList
        ? Math.ceil(pokemonList.count / limit)
        : 0;

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

  return (
    <>
      <PokemonGrid pokemon={displayedPokemon} viewMode={viewMode} />
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = Math.min(Math.max(1, page - 2 + i), totalPages);
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  pageNum === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default memo(PokemonContent);