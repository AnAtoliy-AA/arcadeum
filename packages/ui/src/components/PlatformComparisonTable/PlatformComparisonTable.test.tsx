import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlatformComparisonTable } from './PlatformComparisonTable';

describe('PlatformComparisonTable', () => {
  const mockColumns = [
    { key: 'arcadeum', name: 'Arcadeum', isHighlighted: true, badge: 'Recommended' },
    { key: 'competitor', name: 'Other' },
  ];

  const mockRows = [
    {
      feature: 'Engine',
      hint: 'Stockfish version',
      values: { arcadeum: 'Stockfish 19', competitor: 'Stockfish 16' },
    },
    {
      feature: 'Ad Free',
      values: { arcadeum: true, competitor: false },
    },
  ];

  it('renders title, columns, and rows in comparison mode', () => {
    render(
      <PlatformComparisonTable
        title="Platform Comparison"
        kicker="Feature Matrix"
        subtitle="See how we compare"
        columns={mockColumns}
        rows={mockRows}
      />,
    );

    expect(screen.getByText('Platform Comparison')).toBeInTheDocument();
    expect(screen.getByText('Feature Matrix')).toBeInTheDocument();
    expect(screen.getByText('See how we compare')).toBeInTheDocument();
    expect(screen.getByText('Arcadeum')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByText('Engine')).toBeInTheDocument();
    expect(screen.getByText('Stockfish version')).toBeInTheDocument();
    expect(screen.getByText('Stockfish 19')).toBeInTheDocument();
    expect(screen.getByText('Stockfish 16')).toBeInTheDocument();
    expect(screen.getByLabelText('Supported')).toBeInTheDocument();
    expect(screen.getByLabelText('Not supported')).toBeInTheDocument();
  });

  it('renders in advantages-only single-column mode', () => {
    const singleRow = [
      {
        feature: 'Unlimited Game Review',
        hint: 'Accuracy and eval graph',
        values: { arcadeum: 'Free & Unlimited' },
      },
      {
        feature: 'Zero Ads',
        values: { arcadeum: true },
      },
    ];

    render(
      <PlatformComparisonTable
        title="Arcadeum Games Advantages"
        kicker="Key Features"
        rows={singleRow}
      />,
    );

    expect(screen.getByText('Arcadeum Games Advantages')).toBeInTheDocument();
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByText('Unlimited Game Review')).toBeInTheDocument();
    expect(screen.getByText('Free & Unlimited')).toBeInTheDocument();
    expect(screen.getByText('Included')).toBeInTheDocument();
  });

  it('returns null when rows are empty', () => {
    const { container } = render(<PlatformComparisonTable rows={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
