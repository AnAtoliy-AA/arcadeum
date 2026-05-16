import {
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaypalGateway } from './paypal.gateway';

jest.mock('../../common/utils/paypal-http.util', () => ({
  paypalHttp: { post: jest.fn(), get: jest.fn() },
}));

import { paypalHttp } from '../../common/utils/paypal-http.util';

const mockedAxios = paypalHttp as unknown as {
  post: jest.MockedFunction<typeof paypalHttp.post>;
  get: jest.MockedFunction<typeof paypalHttp.get>;
};

function makeConfig(
  overrides: Record<string, string | undefined> = {},
): ConfigService {
  const defaults: Record<string, string> = {
    PAYPAL_API_BASE_URL: 'https://api-m.sandbox.paypal.com',
    PAYPAL_CLIENT_ID: 'test-client-id',
    PAYPAL_CLIENT_SECRET: 'test-client-secret',
  };
  return {
    get: jest.fn((key: string) => {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        return overrides[key]; // may be undefined — caller explicitly unset it
      }
      return defaults[key];
    }),
  } as unknown as ConfigService;
}

function buildAuthResponse(
  token = 'tok123',
  expiresIn = 3600,
): { data: { access_token: string; expires_in: number } } {
  return { data: { access_token: token, expires_in: expiresIn } };
}

function buildOrderResponse(
  id = 'ORDER-1',
  approveHref = 'https://paypal.com/approve',
): {
  data: {
    id: string;
    status: string;
    links: { href: string; rel: string; method: string }[];
  };
} {
  return {
    data: {
      id,
      status: 'CREATED',
      links: [
        { href: approveHref, rel: 'approve', method: 'GET' },
        { href: 'https://paypal.com/self', rel: 'self', method: 'GET' },
      ],
    },
  };
}

describe('PaypalGateway', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authToken', () => {
    it('fetches a token and caches it', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post.mockResolvedValueOnce(buildAuthResponse());

      const token = await gateway.authToken();

      expect(token).toBe('tok123');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('reuses cached token within expiry window', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post.mockResolvedValueOnce(buildAuthResponse());

      await gateway.authToken();
      await gateway.authToken();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('re-authenticates after the token expires', async () => {
      const gateway = new PaypalGateway(makeConfig());
      // expiresIn=1 → expiresAt = now + (1-60)*1000 which is already in the past
      mockedAxios.post.mockResolvedValueOnce(buildAuthResponse('tok-a', 1));
      mockedAxios.post.mockResolvedValueOnce(buildAuthResponse('tok-b', 1));

      const first = await gateway.authToken();
      const second = await gateway.authToken();

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(first).toBe('tok-a');
      expect(second).toBe('tok-b');
    });

    it('throws ServiceUnavailableException on axios error', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post.mockRejectedValueOnce(new Error('network error'));

      await expect(gateway.authToken()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('throws InternalServerErrorException when response has no access_token', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: '', expires_in: 3600 },
      });

      await expect(gateway.authToken()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });

  describe('createOrder', () => {
    const validInput = {
      amountUsd: 1000, // $10.00
      description: '100 gems',
      returnUrl: 'https://example.com/return',
      cancelUrl: 'https://example.com/cancel',
    };

    it('posts correct body with CAPTURE intent and USD currency', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post
        .mockResolvedValueOnce(buildAuthResponse()) // auth
        .mockResolvedValueOnce(buildOrderResponse()); // createOrder

      await gateway.createOrder(validInput);

      const orderCall = mockedAxios.post.mock.calls[1];
      const body = orderCall[1] as {
        intent: string;
        purchase_units: { amount: { currency_code: string; value: string } }[];
        application_context: {
          brand_name: string;
          return_url: string;
          cancel_url: string;
        };
      };
      expect(body.intent).toBe('CAPTURE');
      expect(body.purchase_units[0].amount.currency_code).toBe('USD');
      expect(body.purchase_units[0].amount.value).toBe('10.00');
      expect(body.application_context.return_url).toBe(validInput.returnUrl);
      expect(body.application_context.cancel_url).toBe(validInput.cancelUrl);
      expect(body.application_context.brand_name).toBe('AicoApp');
    });

    it('uses PAYPAL_BRAND_NAME from config when provided', async () => {
      const gateway = new PaypalGateway(
        makeConfig({ PAYPAL_BRAND_NAME: 'MyBrand' }),
      );
      mockedAxios.post
        .mockResolvedValueOnce(buildAuthResponse())
        .mockResolvedValueOnce(buildOrderResponse());

      await gateway.createOrder(validInput);

      const body = mockedAxios.post.mock.calls[1][1] as {
        application_context: { brand_name: string };
      };
      expect(body.application_context.brand_name).toBe('MyBrand');
    });

    it('returns orderId and approveUrl from the approve link', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post
        .mockResolvedValueOnce(buildAuthResponse())
        .mockResolvedValueOnce(
          buildOrderResponse('ORD-42', 'https://paypal.com/pay'),
        );

      const result = await gateway.createOrder(validInput);

      expect(result.orderId).toBe('ORD-42');
      expect(result.approveUrl).toBe('https://paypal.com/pay');
    });

    it('throws InternalServerErrorException when no approve link in response', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post
        .mockResolvedValueOnce(buildAuthResponse())
        .mockResolvedValueOnce({
          data: {
            id: 'ORD-1',
            status: 'CREATED',
            links: [
              { href: 'https://paypal.com/self', rel: 'self', method: 'GET' },
            ],
          },
        });

      await expect(gateway.createOrder(validInput)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('throws ServiceUnavailableException on axios error', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post
        .mockResolvedValueOnce(buildAuthResponse())
        .mockRejectedValueOnce(new Error('timeout'));

      await expect(gateway.createOrder(validInput)).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });

  describe('getOrder', () => {
    it('returns parsed PayPal order response', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post.mockResolvedValueOnce(buildAuthResponse());
      mockedAxios.get.mockResolvedValueOnce({
        data: { id: 'ORD-1', status: 'COMPLETED', intent: 'CAPTURE' },
      });

      const result = await gateway.getOrder('ORD-1');

      expect(result.id).toBe('ORD-1');
      expect(result.status).toBe('COMPLETED');
      expect(result.intent).toBe('CAPTURE');
    });

    it('throws ServiceUnavailableException on axios error', async () => {
      const gateway = new PaypalGateway(makeConfig());
      mockedAxios.post.mockResolvedValueOnce(buildAuthResponse());
      mockedAxios.get.mockRejectedValueOnce(new Error('network error'));

      await expect(gateway.getOrder('ORD-1')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });

  describe('missing required env vars', () => {
    it('throws InternalServerErrorException when PAYPAL_API_BASE_URL is missing', async () => {
      const gateway = new PaypalGateway(
        makeConfig({ PAYPAL_API_BASE_URL: undefined }),
      );

      await expect(gateway.authToken()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException when PAYPAL_CLIENT_ID is missing', async () => {
      const gateway = new PaypalGateway(
        makeConfig({ PAYPAL_CLIENT_ID: undefined }),
      );

      await expect(gateway.authToken()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });

    it('throws InternalServerErrorException when PAYPAL_CLIENT_SECRET is missing', async () => {
      const gateway = new PaypalGateway(
        makeConfig({ PAYPAL_CLIENT_SECRET: undefined }),
      );

      await expect(gateway.authToken()).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    });
  });
});
