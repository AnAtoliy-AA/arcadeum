import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { paypalHttp } from '../../common/utils/paypal-http.util';
import { randomUUID } from 'crypto';

interface PayPalAuthResponse {
  access_token: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}

export interface PayPalGetOrderResponse {
  id: string;
  status:
    | 'CREATED'
    | 'SAVED'
    | 'APPROVED'
    | 'VOIDED'
    | 'COMPLETED'
    | 'PAYER_ACTION_REQUIRED';
  intent: 'CAPTURE' | 'AUTHORIZE';
}

export interface CreatePayPalOrderInput {
  amountUsd: number; // cents
  description: string;
  returnUrl: string;
  cancelUrl: string;
  brandName?: string;
}

export interface CreatePayPalOrderResult {
  orderId: string;
  approveUrl: string;
}

@Injectable()
export class PaypalGateway {
  private readonly logger = new Logger(PaypalGateway.name);
  private cachedToken?: { token: string; expiresAt: number };

  constructor(private readonly config: ConfigService) {}

  async authToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }
    const baseUrl = this.requiredEnv('PAYPAL_API_BASE_URL').replace(/\/$/, '');
    const clientId = this.requiredEnv('PAYPAL_CLIENT_ID').trim();
    const clientSecret = this.requiredEnv('PAYPAL_CLIENT_SECRET').trim();
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const res = await paypalHttp.post<PayPalAuthResponse>(
        `${baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          timeout: 10000,
        },
      );
      const token = res.data.access_token;
      if (!token) throw new InternalServerErrorException('paypal.authFailed');
      this.cachedToken = {
        token,
        expiresAt: Date.now() + (res.data.expires_in - 60) * 1000,
      };
      return token;
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error(`PayPal auth failed: ${(err as AxiosError).message}`);
      throw new ServiceUnavailableException('paypal.unavailable');
    }
  }

  async createOrder(
    input: CreatePayPalOrderInput,
  ): Promise<CreatePayPalOrderResult> {
    const token = await this.authToken();
    const baseUrl = this.requiredEnv('PAYPAL_API_BASE_URL').replace(/\/$/, '');
    const brand =
      input.brandName ?? this.optionalEnv('PAYPAL_BRAND_NAME') ?? 'AicoApp';

    const valueUsd = (input.amountUsd / 100).toFixed(2);
    try {
      const res = await paypalHttp.post<PayPalOrderResponse>(
        `${baseUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: { currency_code: 'USD', value: valueUsd },
              description: input.description,
            },
          ],
          application_context: {
            brand_name: brand,
            return_url: input.returnUrl,
            cancel_url: input.cancelUrl,
            user_action: 'PAY_NOW',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': randomUUID(),
          },
          timeout: 10000,
        },
      );
      const approve = res.data.links.find((l) => l.rel === 'approve')?.href;
      if (!approve) {
        this.logger.error('PayPal order missing approve link', {
          response: res.data,
        });
        throw new InternalServerErrorException('paypal.invalidResponse');
      }
      return { orderId: res.data.id, approveUrl: approve };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      const axiosErr = err as AxiosError;
      this.logger.error(
        `PayPal createOrder failed: ${axiosErr.message}`,
        axiosErr.response?.data,
      );
      throw new ServiceUnavailableException('paypal.unavailable');
    }
  }

  async getOrder(orderId: string): Promise<PayPalGetOrderResponse> {
    const token = await this.authToken();
    const baseUrl = this.requiredEnv('PAYPAL_API_BASE_URL').replace(/\/$/, '');
    try {
      const res = await paypalHttp.get<PayPalGetOrderResponse>(
        `${baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        },
      );
      return res.data;
    } catch (err) {
      this.logger.error(
        `PayPal getOrder ${orderId} failed: ${(err as AxiosError).message}`,
      );
      throw new ServiceUnavailableException('paypal.unavailable');
    }
  }

  /**
   * Capture an APPROVED order to flip it to COMPLETED.
   * With `intent: 'CAPTURE'`, PayPal puts the order in APPROVED after the
   * buyer clicks Pay Now. This call finalises the funds movement.
   * Returns the order's status after the capture attempt — typically
   * `COMPLETED`, but can be `VOIDED` if the capture failed.
   */
  async captureOrder(orderId: string): Promise<PayPalGetOrderResponse> {
    const token = await this.authToken();
    const baseUrl = this.requiredEnv('PAYPAL_API_BASE_URL').replace(/\/$/, '');
    try {
      const res = await paypalHttp.post<PayPalGetOrderResponse>(
        `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': randomUUID(),
          },
          timeout: 10000,
        },
      );
      return res.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      // PayPal returns 422 with `ORDER_ALREADY_CAPTURED` when the order is
      // already in COMPLETED state — treat as success and let the caller
      // fall through to the wallet credit. Re-fetch the order so the
      // caller sees its real status.
      const status = axiosErr.response?.status;
      const data = axiosErr.response?.data as
        | { name?: string; details?: { issue?: string }[] }
        | undefined;
      const issue = data?.details?.[0]?.issue;
      if (status === 422 && issue === 'ORDER_ALREADY_CAPTURED') {
        return this.getOrder(orderId);
      }
      this.logger.error(
        `PayPal captureOrder ${orderId} failed: ${axiosErr.message}`,
        axiosErr.response?.data,
      );
      throw new ServiceUnavailableException('paypal.unavailable');
    }
  }

  private requiredEnv(name: string): string {
    const v = this.config.get<string>(name);
    if (!v) throw new InternalServerErrorException(`paypal.${name}_missing`);
    return v;
  }

  private optionalEnv(name: string): string | undefined {
    return this.config.get<string>(name);
  }
}
