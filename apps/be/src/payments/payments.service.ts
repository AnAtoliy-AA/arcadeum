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

const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'JPY',
  'KMF',
  'KRW',
  'MGA',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

type UnipayAuthResponse = {
  auth_token?: string;
  token_type?: string;
  expires_in?: number;
};

type UnipayOrderPayload = Record<string, unknown>;

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

    const fallbackCurrency =
      this.getOptionalEnv('UNIPAY_DEFAULT_CURRENCY') ?? 'GEL';
    const normalizedCurrency = (dto.currency ?? fallbackCurrency)
      .trim()
      .toUpperCase();

    const description =
      dto.description?.trim() ??
      this.getOptionalEnv('UNIPAY_DEFAULT_DESCRIPTION') ??
      'Support contribution';

    const successUrl =
      dto.successUrl?.trim() ?? this.getOptionalEnv('UNIPAY_SUCCESS_URL');
    const cancelUrl =
      dto.errorUrl?.trim() ?? this.getOptionalEnv('UNIPAY_CANCEL_URL');
    const callbackUrl =
      dto.callbackUrl?.trim() ?? this.getOptionalEnv('UNIPAY_CALLBACK_URL');

    if (!successUrl || !cancelUrl) {
      this.logger.error('Missing UniPAY redirect URLs (success or cancel).');
      throw new InternalServerErrorException('payments.missingRedirects');
    }

    if (!callbackUrl) {
      this.logger.error('Missing UniPAY callback URL.');
      throw new InternalServerErrorException('payments.missingCallback');
    }

    const merchantUser = this.getRequiredEnv('UNIPAY_MERCHANT_USER');

    const baseUrl = this.getRequiredEnv('UNIPAY_API_BASE_URL').replace(
      /\/$/,
      '',
    );
    const merchantId = this.getRequiredEnv('UNIPAY_MERCHANT_ID');
    const apiKey = this.getRequiredEnv('UNIPAY_API_KEY');

    const language = (this.getOptionalEnv('UNIPAY_LANGUAGE') ?? 'EN')
      .trim()
      .toUpperCase();
    const logo = this.getOptionalEnv('UNIPAY_LOGO_URL');

    const orderId = (dto.orderId?.trim() ?? randomUUID()).slice(0, 128);
    const orderPrice = Number(
      this.formatAmount(numericAmount, normalizedCurrency),
    );

    const orderName = description.slice(0, 70) || 'Contribution';
    const orderDescription = description.slice(0, 250) || 'Contribution';

    const token = await this.ensureAuthToken(baseUrl, merchantId, apiKey);

    const payload: Record<string, unknown> = {
      MerchantUser: merchantUser,
      MerchantOrderID: orderId,
      OrderPrice: orderPrice,
      OrderCurrency: normalizedCurrency,
      OrderName: orderName,
      OrderDescription: orderDescription,
      SuccessRedirectUrl: this.encodeUrl(successUrl),
      CancelRedirectUrl: this.encodeUrl(cancelUrl),
      CallBackUrl: this.encodeUrl(callbackUrl),
      Language: language,
    };

    if (logo) {
      payload.Mlogo = logo;
    }

    try {
      const response = await axios.post<UnipayOrderPayload>(
        `${baseUrl}/v3/api/order/create`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const resolved = this.extractDataNode(response.data ?? {});
      const paymentUrl = this.extractPaymentUrl(resolved);
      const orderHashId = this.extractOrderHashId(resolved);

      if (!paymentUrl || !orderHashId) {
        this.logger.error('UniPAY response missing paymentUrl or OrderHashID', {
          response: response.data,
        });
        throw new InternalServerErrorException('payments.sessionFailed');
      }

      return {
        transactionId: orderHashId,
        paymentUrl,
        amount: numericAmount,
        currency: normalizedCurrency,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Failed to create UniPAY order', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });

      throw new InternalServerErrorException('payments.sessionFailed');
    }
  }

  private async ensureAuthToken(
    baseUrl: string,
    merchantId: string,
    apiKey: string,
  ): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.token;
    }

    try {
      const response = await axios.post<UnipayAuthResponse>(
        `${baseUrl}/v3/auth`,
        {
          merchant_id: merchantId,
          api_key: apiKey,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const token = response.data?.auth_token;
      if (!token) {
        this.logger.error('UniPAY auth response missing auth_token', {
          response: response.data,
        });
        throw new InternalServerErrorException('payments.sessionFailed');
      }

      const expiresIn = Number(response.data?.expires_in ?? 0);
      const buffer = 5_000;
      this.cachedToken = {
        token,
        expiresAt:
          expiresIn > 0
            ? Date.now() + expiresIn * 1000 - buffer
            : Date.now() + 25 * 60 * 1000,
      };

      return token;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Failed to authenticate with UniPAY', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });

      throw new InternalServerErrorException('payments.sessionFailed');
    }
  }

  private extractDataNode(
    payload: UnipayOrderPayload,
  ): Record<string, unknown> {
    if (!payload || typeof payload !== 'object') {
      return {};
    }

    const candidates = ['Data', 'data', 'Result', 'result'];
    for (const key of candidates) {
      const value = (payload as Record<string, unknown>)[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
      }
    }

    return payload as Record<string, unknown>;
  }

  private extractPaymentUrl(data: Record<string, unknown>): string | undefined {
    const keys = [
      'PaymentPageUrl',
      'PaymentPageURL',
      'PaymentUrl',
      'PaymentURL',
      'paymentPageUrl',
      'payment_url',
      'RedirectUrl',
      'redirectUrl',
      'CheckoutUrl',
      'checkoutUrl',
      'PayUrl',
      'payUrl',
    ];

    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'string' && this.looksLikeUrl(value)) {
        return value;
      }
    }

    for (const value of Object.values(data)) {
      if (typeof value === 'string' && this.looksLikeUrl(value)) {
        return value;
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nested = this.extractPaymentUrl(value as Record<string, unknown>);
        if (nested) {
          return nested;
        }
      }
    }

    return undefined;
  }

  private extractOrderHashId(
    data: Record<string, unknown>,
  ): string | undefined {
    const keys = [
      'OrderHashID',
      'orderHashId',
      'order_hash_id',
      'OrderHash',
      'OrderID',
      'orderId',
    ];

    for (const key of keys) {
      const value = data[key];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    for (const value of Object.values(data)) {
      if (typeof value === 'string' && value.startsWith('MP')) {
        return value;
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nested = this.extractOrderHashId(
          value as Record<string, unknown>,
        );
        if (nested) {
          return nested;
        }
      }
    }

    return undefined;
  }

  private looksLikeUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }

  private encodeUrl(url: string): string {
    return Buffer.from(url, 'utf8').toString('base64');
  }

  private formatAmount(amount: number, currency: string): string {
    const upperCurrency = currency.toUpperCase();
    if (ZERO_DECIMAL_CURRENCIES.has(upperCurrency)) {
      return Math.round(amount).toString();
    }

    return amount.toFixed(2);
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
