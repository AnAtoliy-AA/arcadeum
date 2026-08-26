import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VisionFilters } from './VisionFilters';

describe('VisionFilters', () => {
  it('renders SVG defs with all vision filter IDs', () => {
    const { container } = render(<VisionFilters />);

    expect(
      container.querySelector('#arcadeum-vision-deuteranopia'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('#arcadeum-vision-protanopia'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('#arcadeum-vision-tritanopia'),
    ).toBeInTheDocument();
  });
});
