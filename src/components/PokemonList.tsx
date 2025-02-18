import { useQuery } from '@tanstack/react-query';
import { api } from '../api/pokemon';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchInput from './SearchInput';
import PokemonContent from './PokemonContent';

interface Props {
  viewMode: 'grid' | 'list';
}

export default function PokemonList({ viewMode }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const selectedGeneration = searchParams.get('generation');
  const searchTerm = searchParams.get('search') || '';

  // Keep URL in sync with state
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (selectedGeneration) params.set('generation', selectedGeneration);
    if (searchTerm) params.set('search', searchTerm);
    setSearchParams(params, { replace: true });
  }, [page, selectedGeneration, searchTerm, setSearchParams]);

  const { data: generations } = useQuery({
    queryKey: ['generations'],
    queryFn: api.getGenerations,
  });

  const handleSearch = (term: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }
      params.delete('page'); // Reset to first page when searching
      // Preserve generation if it exists
      if (selectedGeneration) {
        params.set('generation', selectedGeneration);
      }
      return params;
    });
  };

  const handleGenerationChange = (generation: string | null) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (generation) {
        params.set('generation', generation);
      } else {
        params.delete('generation');
      }
      params.delete('page'); // Reset to first page when changing generation
      // Preserve search term if it exists
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      return params;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('page', newPage.toString());
      return params;
    });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
        <SearchInput
          onSearch={handleSearch}
          value={searchTerm}
          className="border rounded p-2 w-full md:w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
        />
        <select
          value={selectedGeneration || ''}
          onChange={(e) => handleGenerationChange(e.target.value || null)}
          className="border rounded p-2 w-full md:w-48 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
        >
          <option value="">All Generations</option>
          {generations?.results.map((gen) => (
            <option key={gen.name} value={gen.name}>
              {gen.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      <PokemonContent 
        page={page}
        searchTerm={searchTerm}
        selectedGeneration={selectedGeneration}
        viewMode={viewMode}
        onPageChange={handlePageChange}
      />
    </div>
  );
}