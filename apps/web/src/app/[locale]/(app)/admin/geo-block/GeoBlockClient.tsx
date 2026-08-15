'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  PageLayout,
  PageTitle,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching in effect
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
        <div className="flex flex-col items-stretch gap-4">
          <PageTitle size="lg">Geo Block Management</PageTitle>

          {error && (
            <div
              className="flex flex-col items-stretch p-3 rounded-xl bg-[#4c1d1d]"
              data-testid="geo-block-error"
            >
              <Typography className={'text-[#dc2626]'}>{error}</Typography>
            </div>
          )}

          <div className="flex flex-col items-stretch p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] gap-3">
            <Typography className={'font-bold'} variant="body">
              Add Country
            </Typography>
            <div className="flex items-stretch flex-row gap-2">
              <Input
                className={'w-[120px]'}
                placeholder="Country code (e.g., US)"
                value={newCountryCode}
                onChange={(e) => setNewCountryCode(e.target.value)}
                maxLength={2}
                data-testid="geo-block-country-input"
              />
              <Input
                className={'flex-1'}
                placeholder="Reason (optional)"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                data-testid="geo-block-reason-input"
              />
              <Button
                onClick={handleAdd}
                disabled={adding || !newCountryCode.trim()}
                data-testid="geo-block-add-btn"
              >
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-stretch p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] gap-3">
            <Typography className={'font-bold'} variant="body">
              Quick Add (Common Restricted Countries)
            </Typography>
            <div className="flex items-stretch flex-row flex-wrap gap-2">
              {COMMON_COUNTRIES.map((country) => (
                <Button
                  key={country.code}
                  size="sm"
                  variant={
                    blockedCodes.has(country.code) ? 'secondary' : 'primary'
                  }
                  onClick={() => {
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
            </div>
          </div>

          <div className="flex flex-col items-stretch p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] gap-3">
            <Typography className={'font-bold'} variant="body">
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
              <div className="flex flex-col items-stretch gap-2">
                {countries
                  .filter((c) => c.active)
                  .map((country) => (
                    <div
                      className="flex flex-row items-center justify-between p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]"
                      key={country.countryCode}
                      data-testid={`blocked-country-${country.countryCode}`}
                    >
                      <div className="flex flex-col items-stretch gap-1">
                        <Typography className={'font-bold'} variant="body">
                          {country.countryCode}
                        </Typography>
                        {country.reason && (
                          <Typography variant="caption" alpha="medium">
                            {country.reason}
                          </Typography>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRemove(country.countryCode)}
                        data-testid={`remove-country-${country.countryCode}`}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
