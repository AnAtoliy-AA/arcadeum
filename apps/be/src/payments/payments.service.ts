import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';

import {
  CreateSubscriptionDto,
  SubscriptionInterval,
} from './dto/create-subscription.dto';
import { PaymentSession } from './interfaces/payment-session.interface';
import { PaypalGateway } from './lib/paypal.gateway';

type PayPalPlanResponse = {
  id: string;
  status: string;
};

type PayPalSubscriptionResponse = {
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

  constructor(
    private readonly config: ConfigService,
    private readonly gateway: PaypalGateway,
  ) {}

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

    const { orderId: transactionId, approveUrl: paymentUrl } =
      await this.gateway.createOrder({
        amountUsd: Math.round(numericAmount * 100),
        description: description.slice(0, 127),
        returnUrl,
        cancelUrl,
      });

    return {
      transactionId,
      paymentUrl,
      amount: numericAmount,
      currency,
    };
  }

  async createSubscription(
    dto: CreateSubscriptionDto,
  ): Promise<PaymentSession> {
    const numericAmount = Number(dto.amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new BadRequestException('payments.invalidAmount');
    }

    let currency = (dto.currency ?? 'USD').trim().toUpperCase();
    if (currency === 'GEL') {
      currency = 'USD';
    }

    const returnUrl =
      dto.returnUrl?.trim() ?? this.getOptionalEnv('PAYPAL_RETURN_URL');
    const cancelUrl =
      dto.cancelUrl?.trim() ?? this.getOptionalEnv('PAYPAL_CANCEL_URL');

    if (!returnUrl || !cancelUrl) {
      this.logger.error('Missing PayPal redirect URLs (return or cancel).');
      throw new InternalServerErrorException('payments.missingRedirects');
    }

    const baseUrl = this.getRequiredEnv('PAYPAL_API_BASE_URL')
      .replace(/\/$/, '')
      .trim();
    const brandName = this.getOptionalEnv('PAYPAL_BRAND_NAME') ?? 'AicoApp';

    const token = await this.gateway.authToken();

    let productId = this.getOptionalEnv('PAYPAL_PRODUCT_ID');
    if (!productId) {
      try {
        const prodResp = await axios.post<{ id: string }>(
          `${baseUrl}/v1/catalogs/products`,
          {
            name: `${brandName} Sponsorship`,
            description: 'Recurring support for development',
            type: 'SERVICE',
            category: 'SOFTWARE',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'PayPal-Request-Id': randomUUID(),
            },
          },
        );
        productId = prodResp.data.id;
        this.logger.warn(
          `Created temporary PayPal Product: ${productId}. Please add PAYPAL_PRODUCT_ID to .env to avoid creating new products.`,
        );
      } catch {
        this.logger.error('Failed to create PayPal Product for subscription');
        throw new InternalServerErrorException('payments.subscriptionFailed');
      }
    }

    const intervalUnit =
      dto.interval === SubscriptionInterval.YEARLY ? 'YEAR' : 'MONTH';
    const planPayload = {
      product_id: productId,
      name: `${brandName} ${dto.interval} Sponsorship`,
      description:
        `${dto.interval} sponsorship of ${numericAmount} ${currency}${dto.description ? ` - ${dto.description}` : ''}`.slice(
          0,
          127,
        ),
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: intervalUnit,
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: numericAmount.toFixed(2),
              currency_code: currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    };

    let planId: string;
    try {
      const planResp = await axios.post<PayPalPlanResponse>(
        `${baseUrl}/v1/billing/plans`,
        planPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'PayPal-Request-Id': randomUUID(),
          },
        },
      );
      planId = planResp.data.id;
    } catch (err) {
      this.logger.error('Failed to create PayPal Plan', err);
      throw new InternalServerErrorException('payments.subscriptionFailed');
    }

    const subPayload = {
      plan_id: planId,
      application_context: {
        brand_name: brandName,
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };

    try {
      const subResp = await axios.post<PayPalSubscriptionResponse>(
        `${baseUrl}/v1/billing/subscriptions`,
        subPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'PayPal-Request-Id': randomUUID(),
          },
        },
      );

      const approvalLink = subResp.data.links.find(
        (link) => link.rel === 'approve',
      );

      if (!approvalLink) {
        throw new Error('No approval link in subscription response');
      }

      return {
        transactionId: subResp.data.id,
        paymentUrl: approvalLink.href,
        amount: numericAmount,
        currency: currency,
      };
    } catch (err) {
      this.logger.error('Failed to create PayPal Subscription', err);
      throw new InternalServerErrorException('payments.subscriptionFailed');
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
