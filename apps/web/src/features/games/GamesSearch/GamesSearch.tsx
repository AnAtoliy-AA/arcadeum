import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Input } from '@/shared/ui';

export interface GamesSearchProps {
  /** Callback triggered when search query changes (debounced) or search button is clicked */
  onSearch: (query: string) => void;
  /** Initial search value */
  initialValue?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Label for search button */
  buttonLabel?: string;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  className?: string;
}

const Container = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 400px;
  display: flex;
  gap: 0.5rem;
`;

export function GamesSearch({
  onSearch,
  initialValue = '',
  placeholder = 'Search...',
  buttonLabel = 'Search',
  className,
}: GamesSearchProps) {
  const [searchText, setSearchText] = useState(initialValue);

  // Sync with initialValue if it changes externally
  useEffect(() => {
    setSearchText(initialValue);
  }, [initialValue]);

  const handleSearchClick = () => {
    onSearch(searchText);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchText);
    }
  };

  return (
    <Container className={className}>
      <Input
        placeholder={placeholder}
        value={searchText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        fullWidth
      />
      <Button variant="primary" onClick={handleSearchClick}>
        {buttonLabel}
      </Button>
    </Container>
  );
}
