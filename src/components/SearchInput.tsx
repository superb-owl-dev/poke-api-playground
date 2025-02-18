import { memo, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

interface SearchInputProps {
  onSearch: (term: string) => void;
  className?: string;
  value: string;
}

function SearchInput({ onSearch, className, value }: SearchInputProps) {
  // Local state to handle immediate input updates
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Create debounced search function
  const debouncedSearch = useMemo(() => 
    debounce((term: string) => onSearch(term), 300),
    [onSearch]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue); // Update local state immediately
    debouncedSearch(newValue.trim().toLowerCase()); // Debounce the search callback
  };

  return (
    <input
      type="text"
      placeholder="Search Pokémon by name or ID..."
      value={localValue} // Use local state for immediate updates
      onChange={handleSearchChange}
      className={className}
    />
  );
}

export default memo(SearchInput);