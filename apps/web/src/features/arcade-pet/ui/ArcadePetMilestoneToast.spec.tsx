import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockUseTranslation } from '../test/mock-translation';
import { ArcadePetMilestoneToast } from './ArcadePetMilestoneToast';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => mockUseTranslation(),
}));

describe('ArcadePetMilestoneToast', () => {
  it('renders nothing without notices', () => {
    const { container } = render(
      <ArcadePetMilestoneToast notices={[]} onDismiss={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('announces milestones and dismisses', () => {
    const onDismiss = vi.fn();
    render(
      <ArcadePetMilestoneToast
        notices={[{ id: 'level_5', rewardCoins: 20 }]}
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('+20');
    fireEvent.click(screen.getByTestId('pet-milestone-dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });
});
