import { useState, useEffect } from 'react';
import { XStack } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { Input } from '@/shared/ui';

export interface GamesSearchProps {
  /** Callback triggered when search query changes (debounced) or search button is clicked */
  onSearch: (query: string) => void;
  /** Initial search value */
  initialValue?: string;
  /** Placeholder text for input */
  placeholder?: string;
  /** Label for search button */
  buttonLabel?: string;
  className?: string;
}

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
    <XStack
      className={className}
      flex={1}
      minWidth={200}
      maxWidth={400}
      gap="$2"
    >
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
    </XStack>
  );
}
