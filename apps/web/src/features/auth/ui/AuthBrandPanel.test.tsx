import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';
import { AuthBrandPanel } from './AuthBrandPanel';
import type { AuthBrandLabels } from '../types';

const labels: AuthBrandLabels = {
  statusPill: 'All systems normal',
  eyebrow: 'Good to see you again',
  headlinePrefix: 'Pick up right where you',
  headlineHighlight: 'left off.',
  subline: 'Sign in to jump back into ranked matches.',
  featureOauthTitle: 'One-click sign-in',
  featureOauthDetail: 'Google, Apple, or Discord',
  featureMagicTitle: 'No password?',
  featureMagicDetail: "We'll email you a magic link.",
  featureProgressTitle: 'Your progress is safe',
  featureProgressDetail: 'stats, friends, and unlocks all carry over.',
  proofBefore: 'Joined by ',
  proofAfter: ' players this week.',
  proofCount: '240,000+',
  footHome: '← Back home',
  footGames: 'Browse games',
  footHelp: 'Need help?',
};

function renderPanel() {
  render(
    <TamaguiProvider config={config} defaultTheme="dark">
      <AuthBrandPanel brand={labels} />
    </TamaguiProvider>,
  );
}

describe('AuthBrandPanel', () => {
  it('renders all i18n labels from props', () => {
    renderPanel();
    expect(screen.getByText('All systems normal')).toBeInTheDocument();
    expect(screen.getByText('Good to see you again')).toBeInTheDocument();
    expect(screen.getByText('Pick up right where you')).toBeInTheDocument();
    expect(screen.getByText('left off.')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to jump back into ranked matches.'),
    ).toBeInTheDocument();
    expect(screen.getByText('One-click sign-in')).toBeInTheDocument();
    expect(screen.getByText('No password?')).toBeInTheDocument();
    expect(screen.getByText('Your progress is safe')).toBeInTheDocument();
    expect(screen.getByText('240,000+')).toBeInTheDocument();
    expect(screen.getByText('← Back home')).toBeInTheDocument();
    expect(screen.getByText('Browse games')).toBeInTheDocument();
    expect(screen.getByText('Need help?')).toBeInTheDocument();
  });

  it('routes footer links to the expected hrefs', () => {
    renderPanel();
    const home = screen.getByTestId('auth-brand-home-link');
    expect(home).toHaveAttribute('href', '/');

    const games = screen.getByTestId('auth-brand-games-link');
    expect(games).toHaveAttribute('href', '/games');

    const help = screen.getByTestId('auth-brand-help-link');
    expect(help).toHaveAttribute('href', '/support');
  });
});
