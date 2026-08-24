import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { InfiniteScroll } from './InfiniteScroll';
import { GlassCard } from '../GlassCard/GlassCard';
import { Typography } from '../Typography/Typography';

const meta: Meta<typeof InfiniteScroll> = {
  title: 'Data Display/InfiniteScroll',
  component: InfiniteScroll,
};

export default meta;
type Story = StoryObj<typeof InfiniteScroll>;

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(
      Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`),
    );
    const total = 25;
    const hasMore = items.length < total;

    const handleLoadMore = () => {
      setItems((prev) => [
        ...prev,
        ...Array.from({ length: 5 }, (_, i) => `Item ${prev.length + i + 1}`),
      ]);
    };

    return (
      <InfiniteScroll
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        allLoadedText={`All ${total} items loaded`}
        className="max-w-md mx-auto"
      >
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <GlassCard key={item} className="p-4">
              <Typography variant="body" uiSize="sm">
                {item}
              </Typography>
            </GlassCard>
          ))}
        </div>
      </InfiniteScroll>
    );
  },
};

export const LoadingState: Story = {
  args: {
    hasMore: true,
    isLoading: true,
    onLoadMore: () => {},
    children: (
      <GlassCard className="p-4">
        <Typography variant="body" uiSize="sm">
          Existing item
        </Typography>
      </GlassCard>
    ),
  },
};

export const AllLoaded: Story = {
  args: {
    hasMore: false,
    allLoadedText: 'All 50 records loaded',
    onLoadMore: () => {},
    children: (
      <GlassCard className="p-4">
        <Typography variant="body" uiSize="sm">
          All items rendered
        </Typography>
      </GlassCard>
    ),
  },
};
