'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  PageLayout,
  PageTitle,
  YStack,
  Button,
  Input,
  Typography,
} from '@arcadeum/ui';
import {
  getBlockedCountries,
  addBlockedCountry,
  removeBlockedCountry,
  type GeoBlockedCountry,
} from '@/shared/api/geo-block';

const COMMON_COUNTRIES = [
  { code: 'CN', name: 'China' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'NP', name: 'Nepal' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'QA', name: 'Qatar' },
  { code: 'OM', name: 'Oman' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
];

export default function GeoBlockClient() {
  const [countries, setCountries] = useState<GeoBlockedCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCountries = useCallback(async () => {
    try {
      const data = await getBlockedCountries();
      setCountries(data);
      setLoading(false);
    } catch {
      setError('Failed to load blocked countries');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate data-fetch on mount
    fetchCountries();
  }, [fetchCountries]);

  const handleAdd = async () => {
    if (!newCountryCode.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addBlockedCountry(
        newCountryCode.toUpperCase(),
        newReason || undefined,
      );
      setNewCountryCode('');
      setNewReason('');
      await fetchCountries();
    } catch {
      setError('Failed to add country');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (countryCode: string) => {
    setError(null);
    try {
      await removeBlockedCountry(countryCode);
      await fetchCountries();
    } catch {
      setError('Failed to remove country');
    }
  };

  const blockedCodes = new Set(
    countries.filter((c) => c.active).map((c) => c.countryCode),
  );

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$4">
          <PageTitle size="lg">Geo Block Management</PageTitle>

          {error && (
            <YStack
              padding="$3"
              borderRadius="$3"
              backgroundColor="$red3"
              data-testid="geo-block-error"
            >
              <Typography color="$red10">{error}</Typography>
            </YStack>
          )}

          <YStack
            padding="$4"
            borderRadius="$3"
            backgroundColor="rgba(255,255,255,0.03)"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.1)"
            gap="$3"
          >
            <Typography variant="body" fontWeight="bold">
              Add Country
            </Typography>
            <YStack flexDirection="row" gap="$2">
              <Input
                placeholder="Country code (e.g., US)"
                value={newCountryCode}
                onChangeText={setNewCountryCode}
                maxLength={2}
                width={120}
                data-testid="geo-block-country-input"
              />
              <Input
                placeholder="Reason (optional)"
                value={newReason}
                onChangeText={setNewReason}
                flex={1}
                data-testid="geo-block-reason-input"
              />
              <Button
                onPress={handleAdd}
                disabled={adding || !newCountryCode.trim()}
                data-testid="geo-block-add-btn"
              >
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </YStack>
          </YStack>

          <YStack
            padding="$4"
            borderRadius="$3"
            backgroundColor="rgba(255,255,255,0.03)"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.1)"
            gap="$3"
          >
            <Typography variant="body" fontWeight="bold">
              Quick Add (Common Restricted Countries)
            </Typography>
            <YStack flexDirection="row" flexWrap="wrap" gap="$2">
              {COMMON_COUNTRIES.map((country) => (
                <Button
                  key={country.code}
                  size="sm"
                  variant={
                    blockedCodes.has(country.code) ? 'secondary' : 'primary'
                  }
                  onPress={() => {
                    if (!blockedCodes.has(country.code)) {
                      setNewCountryCode(country.code);
                      setNewReason('Cryptocurrency transactions restricted');
                      handleAdd();
                    }
                  }}
                  disabled={blockedCodes.has(country.code)}
                  data-testid={`quick-add-${country.code}`}
                >
                  {country.name} {blockedCodes.has(country.code) ? '✓' : '+'}
                </Button>
              ))}
            </YStack>
          </YStack>

          <YStack
            padding="$4"
            borderRadius="$3"
            backgroundColor="rgba(255,255,255,0.03)"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.1)"
            gap="$3"
          >
            <Typography variant="body" fontWeight="bold">
              Blocked Countries ({countries.filter((c) => c.active).length})
            </Typography>

            {loading ? (
              <Typography variant="body" alpha="medium">
                Loading...
              </Typography>
            ) : countries.filter((c) => c.active).length === 0 ? (
              <Typography variant="body" alpha="medium">
                No countries blocked. ARC payments are available worldwide.
              </Typography>
            ) : (
              <YStack gap="$2">
                {countries
                  .filter((c) => c.active)
                  .map((country) => (
                    <YStack
                      key={country.countryCode}
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      padding="$3"
                      borderRadius="$2"
                      backgroundColor="rgba(239,68,68,0.1)"
                      borderWidth={1}
                      borderColor="rgba(239,68,68,0.3)"
                      data-testid={`blocked-country-${country.countryCode}`}
                    >
                      <YStack gap="$1">
                        <Typography variant="body" fontWeight="bold">
                          {country.countryCode}
                        </Typography>
                        {country.reason && (
                          <Typography variant="caption" alpha="medium">
                            {country.reason}
                          </Typography>
                        )}
                      </YStack>
                      <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => handleRemove(country.countryCode)}
                        data-testid={`remove-country-${country.countryCode}`}
                      >
                        Remove
                      </Button>
                    </YStack>
                  ))}
              </YStack>
            )}
          </YStack>
        </YStack>
      </Container>
    </PageLayout>
  );
}
