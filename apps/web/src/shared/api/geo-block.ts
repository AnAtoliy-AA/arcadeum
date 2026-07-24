import { apiClient } from '@/shared/lib/api-client';

export interface GeoBlockedCountry {
  countryCode: string;
  reason: string;
  active: boolean;
}

export async function getBlockedCountries(
  token?: string,
): Promise<GeoBlockedCountry[]> {
  return apiClient.get<GeoBlockedCountry[]>('/admin/geo-block/countries', {
    token,
  });
}

export async function addBlockedCountry(
  countryCode: string,
  reason?: string,
  token?: string,
): Promise<GeoBlockedCountry> {
  return apiClient.post<GeoBlockedCountry>(
    '/admin/geo-block/countries',
    { countryCode, reason },
    { token },
  );
}

export async function removeBlockedCountry(
  countryCode: string,
  token?: string,
): Promise<void> {
  return apiClient.delete<void>(`/admin/geo-block/countries/${countryCode}`, {
    token,
  });
}
