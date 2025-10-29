import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { createHmac, randomUUID } from 'crypto';
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

type PayzePaymentResponse = {
  success?: boolean;
  data?: {
    transactionId?: string;
    transactionUrl?: string;
    paymentUrl?: string;
    redirectUrl?: string;
    payId?: string;
    paymentId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly config: ConfigService) {}

  async createSession(dto: CreatePaymentDto): Promise<PaymentSession> {
    const numericAmount = Number(dto.amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new BadRequestException('payments.invalidAmount');
    }

    const fallbackCurrency =
      this.getOptionalEnv('PAYZE_DEFAULT_CURRENCY') ?? 'GEL';
    const normalizedCurrency = (dto.currency ?? fallbackCurrency)
      .trim()
      .toUpperCase();

    const description =
      dto.description?.trim() ??
      this.getOptionalEnv('PAYZE_DEFAULT_DESCRIPTION') ??
      'Support contribution';

    const successUrl =
      dto.successUrl?.trim() ?? this.getOptionalEnv('PAYZE_SUCCESS_URL');
    const errorUrl =
      dto.errorUrl?.trim() ?? this.getOptionalEnv('PAYZE_ERROR_URL');
    const callbackUrl =
      dto.callbackUrl?.trim() ?? this.getOptionalEnv('PAYZE_CALLBACK_URL');
    const language = this.getOptionalEnv('PAYZE_LANGUAGE') ?? 'en';

    if (!successUrl || !errorUrl) {
      this.logger.error('Missing Payze redirect URLs (success or error).');
      throw new InternalServerErrorException('payments.missingRedirects');
    }

    if (!callbackUrl) {
      this.logger.error('Missing Payze callback URL.');
      throw new InternalServerErrorException('payments.missingCallback');
    }

    const publicKey = this.getRequiredEnv('PAYZE_PUBLIC_KEY');
    const privateKey = this.getRequiredEnv('PAYZE_PRIVATE_KEY');
    const apiBaseUrl = this.getRequiredEnv('PAYZE_API_BASE_URL');

    const orderId = dto.orderId?.trim() ?? randomUUID();
    const amountForPayze = this.formatAmount(numericAmount, normalizedCurrency);

    const payzePayload = {
      amount: amountForPayze,
      currency: normalizedCurrency,
      description,
      orderId,
      callbackUrl,
      successRedirectUrl: successUrl,
      errorRedirectUrl: errorUrl,
      preauthorize: false,
      language,
      metadata: {
        source: 'mobile-support-payment',
      },
    };

    const signature = this.calculateSignature(privateKey, payzePayload);

    try {
      const response = await axios.post<PayzePaymentResponse>(
        `${apiBaseUrl.replace(/\/$/, '')}/payments`,
        payzePayload,
        {
          headers: {
            ApiKey: publicKey,
            Signature: signature,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      if (response.data?.success === false) {
        this.logger.error('Payze response indicated failure', {
          response: response.data,
        });
        throw new InternalServerErrorException('payments.sessionFailed');
      }

      const responseData =
        response.data?.data ?? (response.data as PayzePaymentResponse['data']);
      const paymentUrl = this.extractPaymentUrl(responseData);
      const transactionId = this.extractTransactionId(responseData);

      if (!paymentUrl || !transactionId) {
        this.logger.error(
          'Payze response missing paymentUrl or transactionId',
          {
            response: response.data,
          },
        );
        throw new InternalServerErrorException('payments.sessionFailed');
      }

      return {
        transactionId,
        paymentUrl,
        amount: numericAmount,
        currency: normalizedCurrency,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Failed to create Payze payment', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });

      throw new InternalServerErrorException('payments.sessionFailed');
    }
  }

  private extractPaymentUrl(
    data?: PayzePaymentResponse['data'],
  ): string | undefined {
    if (!data) {
      return undefined;
    }

    const candidates = [data.paymentUrl, data.transactionUrl, data.redirectUrl];

    return candidates.find(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );
  }

  private extractTransactionId(
    data?: PayzePaymentResponse['data'],
  ): string | undefined {
    if (!data) {
      return undefined;
    }

    const candidates = [data.transactionId, data.paymentId, data.payId];
    return candidates.find(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );
  }

  private formatAmount(amount: number, currency: string): string {
    const upperCurrency = currency.toUpperCase();
    if (ZERO_DECIMAL_CURRENCIES.has(upperCurrency)) {
      return Math.round(amount).toString();
    }

    return amount.toFixed(2);
  }

  private calculateSignature(privateKey: string, payload: unknown): string {
    const serialized = JSON.stringify(payload);
    return createHmac('sha256', privateKey).update(serialized).digest('hex');
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
