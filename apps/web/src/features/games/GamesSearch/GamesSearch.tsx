import { useState } from 'react';
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
    <div
      className={`box-border flex flex-row min-w-[280px] max-w-[450px] gap-2 items-center max-[800px]:min-w-0 max-[800px]:w-full ${className ?? ''}`}
    >
      <Input
        className={'flex-1'}
        placeholder={placeholder}
        value={searchText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        size="md"
      />
      <Button
        className="shrink-0 px-6"
        variant="primary"
        onClick={handleSearchClick}
        size="md"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
