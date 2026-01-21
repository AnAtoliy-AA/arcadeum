import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentSession } from './interfaces/payment-session.interface';

type PayPalAuthResponse = {
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
};

type PayPalOrderResponse = {
  id: string;
  status: string;
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private cachedToken?: { token: string; expiresAt: number };

  constructor(private readonly config: ConfigService) {}

  async createSession(dto: CreatePaymentDto): Promise<PaymentSession> {
    const numericAmount = Number(dto.amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new BadRequestException('payments.invalidAmount');
    }

    let currency = (dto.currency ?? 'USD').trim().toUpperCase();
    // PayPal does not support GEL, fallback to USD or throw error
    if (currency === 'GEL') {
      currency = 'USD';
    }
    const description = dto.description?.trim() ?? 'Support contribution';

    const returnUrl =
      dto.successUrl?.trim() ?? this.getOptionalEnv('PAYPAL_RETURN_URL');
    const cancelUrl =
      dto.errorUrl?.trim() ?? this.getOptionalEnv('PAYPAL_CANCEL_URL');

    if (!returnUrl || !cancelUrl) {
      this.logger.error('Missing PayPal redirect URLs (return or cancel).');
      throw new InternalServerErrorException('payments.missingRedirects');
    }

    const baseUrl = this.getRequiredEnv('PAYPAL_API_BASE_URL')
      .replace(/\/$/, '')
      .trim();
    const clientId = this.getRequiredEnv('PAYPAL_CLIENT_ID').trim();
    const clientSecret = this.getRequiredEnv('PAYPAL_CLIENT_SECRET').trim();
    const brandName = this.getOptionalEnv('PAYPAL_BRAND_NAME') ?? 'AicoApp';

    const orderId = (dto.orderId?.trim() ?? randomUUID()).slice(0, 128);

    const token = await this.ensureAuthToken(baseUrl, clientId, clientSecret);

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: currency,
            value: numericAmount.toFixed(2),
          },
          description: description.slice(0, 127),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: brandName,
            locale: 'en-US',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            shipping_preference: 'NO_SHIPPING',
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
        },
      },
    };

    try {
      const response = await axios.post<PayPalOrderResponse>(
        `${baseUrl}/v2/checkout/orders`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'PayPal-Request-Id': randomUUID(),
          },
          timeout: 10000,
        },
      );

      const paymentLink = response.data.links.find(
        (link) => link.rel === 'payer-action' || link.rel === 'approve',
      );

      if (!paymentLink) {
        this.logger.error('PayPal response missing approval link', {
          response: response.data,
        });
        throw new InternalServerErrorException('payments.sessionFailed');
      }

      return {
        transactionId: response.data.id,
        paymentUrl: paymentLink.href,
        amount: numericAmount,
        currency: currency,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Failed to create PayPal order', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: JSON.stringify(axiosError.response?.data),
      });

      throw new InternalServerErrorException('payments.sessionFailed');
    }
  }

  private async ensureAuthToken(
    baseUrl: string,
    clientId: string,
    clientSecret: string,
  ): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );

      this.logger.log(`PayPal Environment: ${baseUrl}`);
      this.logger.log(`Attempting PayPal Auth with ClientID: ${clientId}`);

      const response = await axios.post<PayPalAuthResponse>(
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

      const token = response.data.access_token;
      if (!token) {
        this.logger.error('PayPal auth response missing access_token', {
          response: response.data,
        });
        throw new InternalServerErrorException('payments.sessionFailed');
      }

      const expiresIn = response.data.expires_in;
      this.cachedToken = {
        token,
        expiresAt: Date.now() + (expiresIn - 60) * 1000, // Buffer of 60 seconds
      };

      return token;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Failed to authenticate with PayPal', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: JSON.stringify(axiosError.response?.data),
      });

      throw new InternalServerErrorException('payments.sessionFailed');
    }
  }

  private getOptionalEnv(key: string): string | undefined {
    const fromConfig = this.config.get<string>(key);
    if (typeof fromConfig === 'string' && fromConfig.length > 0) {
      return fromConfig;
    }

    const fromProcess = process.env[key];
    return typeof fromProcess === 'string' && fromProcess.length > 0
      ? fromProcess
      : undefined;
  }

  private getRequiredEnv(key: string): string {
    const value = this.getOptionalEnv(key);
    if (!value) {
      this.logger.error(`Missing required environment variable: ${key}`);
      throw new InternalServerErrorException(`payments.missingConfig.${key}`);
    }

    return value;
  }
}
