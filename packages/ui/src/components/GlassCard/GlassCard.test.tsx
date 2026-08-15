import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { GlassCard } from './GlassCard';

import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('GlassCard', () => {
  it('renders children correctly', () => {
    render(<GlassCard>Glass Content</GlassCard>);
    expect(screen.getByText('Glass Content')).toBeInTheDocument();
  });
});
