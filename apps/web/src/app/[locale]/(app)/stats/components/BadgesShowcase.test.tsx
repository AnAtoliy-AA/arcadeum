import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BadgesShowcase } from './BadgesShowcase';

const mockEquip = vi.fn();
const mockUnequip = vi.fn();

vi.mock('../hooks/useMilestoneBadgeEquip', () => ({
  useMilestoneBadgeEquip: () => ({
    equippedBadgeId: 'badge-newcomer',
    pendingBadgeId: null,
    handleEquip: mockEquip,
    handleUnequip: mockUnequip,
    isLoggedIn: true,
  }),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { level?: string }) => {
      if (params?.level) return `Requires Lv. ${params.level}`;
      const map: Record<string, string> = {
        'stats.milestoneBadges': 'Milestone Badges',
        'stats.milestoneBadgesSubtitle': 'Earn exclusive badges',
        'stats.unlocked': 'Unlocked',
        'stats.locked': 'Locked',
        'stats.equip': 'Equip',
        'stats.equipped': 'Equipped',
        'stats.unequip': 'Unequip',
        'pages.shop.items.badge.newcomer.name': 'Newcomer',
        'pages.shop.items.badge.newcomer.desc': 'Starter badge',
        'pages.shop.items.badge.scout.name': 'Scout',
        'pages.shop.items.badge.scout.desc': 'Scout badge',
        'pages.shop.items.badge.veteran.name': 'Veteran',
        'pages.shop.items.badge.veteran.desc': 'Veteran badge',
        'pages.shop.items.badge.mythic.name': 'Mythic Star',
        'pages.shop.items.badge.mythic.desc': 'Prestige badge',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-testid="badge-image" data-src={src} aria-label={alt} />
  ),
}));

describe('BadgesShowcase', () => {
  it('renders all milestone badges with correct unlock status', () => {
    render(<BadgesShowcase currentLevel={5} />);

    expect(screen.getByText('Milestone Badges')).toBeInTheDocument();
    expect(screen.getByTestId('milestone-badge-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('milestone-badge-card-5')).toBeInTheDocument();
    expect(screen.getByTestId('milestone-badge-card-10')).toBeInTheDocument();
    expect(screen.getByTestId('milestone-badge-card-99')).toBeInTheDocument();

    expect(screen.getByTestId('badge-action-1')).toHaveTextContent('Equipped');
    expect(screen.getByTestId('badge-action-5')).toHaveTextContent('Equip');
    expect(screen.getByTestId('badge-locked-10')).toHaveTextContent(
      'Requires Lv. 10',
    );
  });

  it('triggers equip when clicking Equip on an unlocked badge', () => {
    render(<BadgesShowcase currentLevel={5} />);

    const equipBtn = screen.getByTestId('badge-action-5');
    fireEvent.click(equipBtn);
    expect(mockEquip).toHaveBeenCalledWith('badge-scout');
  });

  it('triggers unequip when clicking Equipped badge', () => {
    render(<BadgesShowcase currentLevel={5} />);

    const equippedBtn = screen.getByTestId('badge-action-1');
    fireEvent.click(equippedBtn);
    expect(mockUnequip).toHaveBeenCalled();
  });
});
