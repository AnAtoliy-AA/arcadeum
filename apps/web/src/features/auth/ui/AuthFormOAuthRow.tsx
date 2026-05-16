'use client';

import type { ReactNode } from 'react';
import { XStack, YStack } from 'tamagui';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { AppleGlyph, DiscordGlyph, GoogleGlyph } from './AuthProviderIcons';
import {
  isOAuthProviderEnabled,
  type OAuthProvider,
} from '../hooks/useAuthForm';
import type { AuthOAuthLabels } from '../types';

interface AuthFormOAuthRowProps {
  providers: AuthOAuthLabels;
  disabled?: boolean;
  onSelect: (provider: OAuthProvider) => void;
}

interface ProviderConfig {
  id: OAuthProvider;
  icon: ReactNode;
  label: string;
  shortLabel: string;
}

export function AuthFormOAuthRow({
  providers,
  disabled,
  onSelect,
}: AuthFormOAuthRowProps) {
  const config: ProviderConfig[] = [
    {
      id: 'google',
      icon: <GoogleGlyph />,
      label: providers.google,
      shortLabel: providers.googleShort,
    },
    {
      id: 'apple',
      icon: <AppleGlyph />,
      label: providers.apple,
      shortLabel: providers.appleShort,
    },
    {
      id: 'discord',
      icon: <DiscordGlyph />,
      label: providers.discord,
      shortLabel: providers.discordShort,
    },
  ];

  return (
    <XStack
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}
    >
      {config.map((p) => (
        <ProviderButton
          key={p.id}
          provider={p}
          disabled={disabled || !isOAuthProviderEnabled(p.id)}
          tooltip={
            isOAuthProviderEnabled(p.id) ? p.label : providers.comingSoon
          }
          onClick={() => onSelect(p.id)}
        />
      ))}
    </XStack>
  );
}

function ProviderButton({
  provider,
  disabled,
  tooltip,
  onClick,
}: {
  provider: ProviderConfig;
  disabled: boolean;
  tooltip: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      aria-label={provider.label}
      data-testid={`auth-oauth-${provider.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        paddingInline: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.78 : 1,
        transition: 'background-color 160ms ease, border-color 160ms ease',
      }}
    >
      <YStack alignItems="center" justifyContent="center">
        {provider.icon}
      </YStack>
      <Typography variant="body" uiSize="sm" weight="600">
        {provider.shortLabel}
      </Typography>
    </button>
  );
}
