import { useState, useEffect } from 'react';
import { XStack } from 'tamagui';
import { Button, Input } from '@arcadeum/ui';

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
      minWidth={280}
      maxWidth={450}
      gap="$2"
      alignItems="center"
      $sm={{ minWidth: 0, width: '100%' }}
    >
      <Input
        placeholder={placeholder}
        value={searchText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        flex={1}
        size="md"
      />
      <Button
        variant="primary"
        onClick={handleSearchClick}
        flexShrink={0}
        size="md"
        px="$6"
      >
        {buttonLabel}
      </Button>
    </XStack>
  );
}
