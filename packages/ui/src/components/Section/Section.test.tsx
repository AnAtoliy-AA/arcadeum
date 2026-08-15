import { render as rtlRender, screen } from '@testing-library/react';
import { Section } from './Section';

import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(ui);
};

describe('Section', () => {
  it('renders title, description and children', () => {
    render(
      <Section title="Section Title" description="Section description">
        <div>Content</div>
      </Section>,
    );
    expect(screen.getByText('Section Title')).toBeInTheDocument();
    expect(screen.getByText('Section description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
