import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { GemPackage, GemPackageDocument } from '../schemas/gem-package.schema';
import {
  GemPurchase,
  GemPurchaseDocument,
} from '../schemas/gem-purchase.schema';
import { PaypalGateway } from '../../payments/lib/paypal.gateway';
import { WalletService } from '../../wallet/wallet.service';
import type { GemPurchaseView } from '../interfaces/gem-purchase.interface';
import type { WalletBalance } from '../../wallet/interfaces/wallet-balance.interface';

interface GemPackageLean {
  _id: Types.ObjectId;
  name: string;
  gems: number;
  bonusGems: number;
  /** Stored in cents. */
  priceUsd: number;
  active: boolean;
}

interface GemPurchaseLean {
  _id: Types.ObjectId;
  packageId: Types.ObjectId;
  paypalOrderId: string;
  amountUsd: number;
  gems: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  finalizedAt?: Date;
}

@Injectable()
export class GemPurchasesService {
  private readonly logger = new Logger(GemPurchasesService.name);

  constructor(
    @InjectModel(GemPackage.name)
    private readonly packageModel: Model<GemPackageDocument>,
    @InjectModel(GemPurchase.name)
    private readonly purchaseModel: Model<GemPurchaseDocument>,
    private readonly paypal: PaypalGateway,
    private readonly wallet: WalletService,
    private readonly config: ConfigService,
  ) {}

  async createOrder(
    userId: string,
    packageId: string,
  ): Promise<{ paypalOrderId: string; approveUrl: string }> {
    const pkg = await this.packageModel
      .findById(packageId)
      .lean<GemPackageLean | null>();
    if (!pkg) throw new NotFoundException('gems.packageNotFound');
    if (!pkg.active) throw new BadRequestException('gems.packageInactive');

    const totalGems = pkg.gems + (pkg.bonusGems ?? 0);

    // Gem purchases need their own return URL so the FE can auto-finalize
    // on redirect. The donation flow's PAYPAL_RETURN_URL ('/payment/success')
    // knows nothing about gems and would leave the row pending forever.
    // Prefer PAYPAL_GEM_RETURN_URL if set; otherwise derive from the donation
    // return URL by replacing its path with '/payment/gem-success'.
    const explicitGemReturn = this.config.get<string>('PAYPAL_GEM_RETURN_URL');
    const donationReturn = this.config.get<string>('PAYPAL_RETURN_URL');
    const cancelUrl = this.config.get<string>('PAYPAL_CANCEL_URL');
    if (!donationReturn || !cancelUrl) {
      throw new InternalServerErrorException('payments.missingRedirects');
    }
    const returnUrl =
      explicitGemReturn ??
      (() => {
        try {
          const u = new URL(donationReturn);
          u.pathname = '/payment/gem-success';
          u.search = '';
          return u.toString();
        } catch {
          return donationReturn; // fallback — better than throwing
        }
      })();

    const order = await this.paypal.createOrder({
      amountUsd: pkg.priceUsd,
      description: `Gems: ${pkg.name} (${totalGems})`,
      returnUrl,
      cancelUrl,
    });

    await this.purchaseModel.create({
      userId: new Types.ObjectId(userId),
      packageId: pkg._id,
      paypalOrderId: order.orderId,
      amountUsd: pkg.priceUsd,
      gems: totalGems,
      status: 'pending',
    });

    this.logger.log(
      `Created gem order ${order.orderId} for user ${userId}, package ${packageId}`,
    );

    return { paypalOrderId: order.orderId, approveUrl: order.approveUrl };
  }

  async finalizeOrder(
    userId: string,
    paypalOrderId: string,
  ): Promise<{
    success: boolean;
    gemsCredited: number;
    newBalance: WalletBalance;
  }> {
    const purchase = await this.purchaseModel.findOne({
      paypalOrderId,
      userId: new Types.ObjectId(userId),
    });
    if (!purchase) throw new NotFoundException('gems.orderNotFound');

    if (purchase.status === 'completed') {
      return {
        success: true,
        gemsCredited: 0,
        newBalance: await this.wallet.getBalance(userId),
      };
    }

    if (purchase.status === 'failed' || purchase.status === 'cancelled') {
      throw new BadRequestException('gems.orderNotEligible');
    }

    let paypalOrder = await this.paypal.getOrder(paypalOrderId);
    // With intent=CAPTURE, PayPal lands in APPROVED after the buyer clicks
    // Pay Now. We must explicitly capture to flip it to COMPLETED. (Some
    // sandbox flows auto-capture and return COMPLETED directly — both paths
    // are covered.)
    if (paypalOrder.status === 'APPROVED') {
      paypalOrder = await this.paypal.captureOrder(paypalOrderId);
    }
    if (paypalOrder.status !== 'COMPLETED') {
      if (paypalOrder.status === 'VOIDED') {
        purchase.status = 'failed';
        await purchase.save();
      }
      throw new BadRequestException('gems.orderNotCaptured');
    }

    // Single wallet write — no parentSession needed.
    // The GemPurchase row update happens after the credit completes.
    // The wallet idempotency layer makes a partial-state retry safe.
    const tx = await this.wallet.credit(
      userId,
      'gems',
      purchase.gems,
      'gem_purchase',
      `gem-purchase-${paypalOrderId}`,
      {
        paypalOrderId,
        packageId: String(purchase.packageId),
        amountUsd: purchase.amountUsd,
      },
    );

    purchase.status = 'completed';
    purchase.walletTxId = new Types.ObjectId(tx.id);
    purchase.finalizedAt = new Date();
    await purchase.save();

    this.logger.log(
      `Finalized gem order ${paypalOrderId} for user ${userId}: +${purchase.gems} gems`,
    );

    return {
      success: true,
      gemsCredited: purchase.gems,
      newBalance: await this.wallet.getBalance(userId),
    };
  }

  async listPendingForUser(userId: string): Promise<GemPurchaseView[]> {
    const docs = await this.purchaseModel
      .find({ userId: new Types.ObjectId(userId), status: 'pending' })
      .sort({ createdAt: -1 })
      .lean<GemPurchaseLean[]>();
    return docs.map((d) => this.toView(d));
  }

  /**
   * Mark a pending purchase as cancelled. Player-driven cleanup for orders
   * that can't be finalized — e.g. orphans from a prior PayPal env, or
   * never-completed redirects. Only the row's owner can cancel, and only
   * while the row is still `pending`.
   */
  async cancelPending(
    userId: string,
    paypalOrderId: string,
  ): Promise<{ cancelled: true }> {
    const result = await this.purchaseModel.updateOne(
      {
        paypalOrderId,
        userId: new Types.ObjectId(userId),
        status: 'pending',
      },
      { $set: { status: 'cancelled', finalizedAt: new Date() } },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('gems.orderNotFound');
    }
    return { cancelled: true };
  }

  private toView(doc: GemPurchaseLean): GemPurchaseView {
    return {
      id: doc._id.toString(),
      packageId: doc.packageId.toString(),
      paypalOrderId: doc.paypalOrderId,
      amountUsdCents: doc.amountUsd,
      gems: doc.gems,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      finalizedAt: doc.finalizedAt ? doc.finalizedAt.toISOString() : null,
    };
  }
}
