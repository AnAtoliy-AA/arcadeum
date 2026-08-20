import { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';
import { GeoBlockService } from './geo-block.guard';
import type { GeoBlockedCountryDocument } from '../schemas/geo-blocked-country.schema';
import type { EconomySettingsService } from '../../economy/economy-settings.service';

describe('GeoBlockService', () => {
  let service: GeoBlockService;
  let fetchMock: jest.Mock;
  const getNumberMock = jest.fn();
  const findOneMock = jest.fn();
  const configGetMock = jest.fn();

  const config = { get: configGetMock } as unknown as ConfigService;
  const countryModel = {
    findOne: findOneMock,
  } as unknown as Model<GeoBlockedCountryDocument>;
  const economy = {
    getNumber: getNumberMock,
  } as unknown as EconomySettingsService;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
    fetchMock = global.fetch as unknown as jest.Mock;
    getNumberMock.mockResolvedValue(0);
    findOneMock.mockResolvedValue(null);
    service = new GeoBlockService(config, economy, countryModel);
  });

  it('does not make an outbound request when the IP is not a valid IP literal (SSRF guard)', async () => {
    getNumberMock.mockImplementation((key: string) =>
      Promise.resolve(key === 'geo_block_enabled' ? 1 : 0),
    );

    // A value that would alter the URL path if interpolated unvalidated.
    await service.checkIp('8.8.8.8/../../secret');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('queries the geo service for a valid IPv4 literal', async () => {
    getNumberMock.mockImplementation((key: string) =>
      Promise.resolve(key === 'geo_block_enabled' ? 1 : 0),
    );
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ countryCode: 'US' }),
    });

    const result = await service.checkIp('8.8.8.8');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://ip-api.com/json/8.8.8.8?fields=countryCode',
    );
    expect(result).toEqual({ blocked: false, country: 'US' });
  });

  it('skips the VPN check when the IP is not a valid IP literal', async () => {
    getNumberMock.mockImplementation((key: string) =>
      Promise.resolve(
        key === 'geo_block_enabled' || key === 'vpn_detection_enabled' ? 1 : 0,
      ),
    );
    configGetMock.mockReturnValue('vpn-api-key');

    await service.checkIp('not-an-ip');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
