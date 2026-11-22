import type { Meta, StoryObj } from '@storybook/react';
import { Checkerboard } from './Checkerboard';

const meta: Meta<typeof Checkerboard> = {
  title: 'Components/Checkerboard',
  component: Checkerboard,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Checkerboard>;

export const Default8x8: Story = {
  render: () => (
    <div className="w-[480px] h-[480px]">
      <Checkerboard
        rows={8}
        cols={8}
        renderCell={({ row, col, isDark, isBottomRank, isLastFile, rankLabel, fileLabel }) => (
          <div
            key={`${row}-${col}`}
            className={`flex-1 aspect-square relative flex items-center justify-center ${
              isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'
            }`}
          >
            {isLastFile && rankLabel && (
              <span className="pointer-events-none absolute top-0.5 right-0.5 text-[10px] font-bold text-[#b58863] opacity-70">
                {rankLabel}
              </span>
            )}
            {isBottomRank && fileLabel && (
              <span className="pointer-events-none absolute bottom-0.5 left-0.5 text-[10px] font-bold text-[#b58863] opacity-70">
                {fileLabel}
              </span>
            )}
          </div>
        )}
      />
    </div>
  ),
};

export const Flipped: Story = {
  render: () => (
    <div className="w-[480px] h-[480px]">
      <Checkerboard
        rows={8}
        cols={8}
        isFlipped
        renderCell={({ row, col, isDark, isBottomRank, isLastFile, rankLabel, fileLabel }) => (
          <div
            key={`${row}-${col}`}
            className={`flex-1 aspect-square relative flex items-center justify-center ${
              isDark ? 'bg-[#8ca2ad]' : 'bg-[#dee3e6]'
            }`}
          >
            {isLastFile && rankLabel && (
              <span className="pointer-events-none absolute top-0.5 right-0.5 text-[10px] font-bold text-[#8ca2ad] opacity-70">
                {rankLabel}
              </span>
            )}
            {isBottomRank && fileLabel && (
              <span className="pointer-events-none absolute bottom-0.5 left-0.5 text-[10px] font-bold text-[#8ca2ad] opacity-70">
                {fileLabel}
              </span>
            )}
          </div>
        )}
      />
    </div>
  ),
};
