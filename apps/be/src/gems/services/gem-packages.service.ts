import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GemPackage, GemPackageDocument } from '../schemas/gem-package.schema';
import {
  GemPurchase,
  GemPurchaseDocument,
} from '../schemas/gem-purchase.schema';
import type {
  GemPackageAdmin,
  GemPackagePublic,
} from '../interfaces/gem-package.interface';
import type { CreateGemPackageDto } from '../dto/create-gem-package.dto';
import type { UpdateGemPackageDto } from '../dto/update-gem-package.dto';

interface GemPackageLean {
  _id: Types.ObjectId;
  name: string;
  gems: number;
  bonusGems: number;
  /** Stored in cents. */
  priceUsd: number;
  displayOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GemPackagesService {
  constructor(
    @InjectModel(GemPackage.name)
    private readonly model: Model<GemPackageDocument>,
    @InjectModel(GemPurchase.name)
    private readonly purchaseModel: Model<GemPurchaseDocument>,
  ) {}

  async listActive(): Promise<GemPackagePublic[]> {
    const docs = await this.model
      .find({ active: true })
      .sort({ displayOrder: 1, _id: 1 })
      .lean<GemPackageLean[]>();
    return docs.map((d) => this.toPublicView(d));
  }

  async listAllForAdmin(): Promise<GemPackageAdmin[]> {
    const docs = await this.model
      .find()
      .sort({ displayOrder: 1, _id: 1 })
      .lean<GemPackageLean[]>();
    return docs.map((d) => this.toAdminView(d));
  }

  async create(dto: CreateGemPackageDto): Promise<GemPackageAdmin> {
    const doc = await this.model.create({
      name: dto.name,
      gems: dto.gems,
      bonusGems: dto.bonusGems ?? 0,
      priceUsd: dto.priceUsdCents,
      displayOrder: dto.displayOrder ?? 0,
      active: dto.active ?? true,
    });
    // toObject() drops Mongoose internals; cast via unknown is intentional here
    return this.toAdminView(doc.toObject() as unknown as GemPackageLean);
  }

  async update(id: string, dto: UpdateGemPackageDto): Promise<GemPackageAdmin> {
    const updatePayload: Partial<GemPackageLean> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.gems !== undefined) updatePayload.gems = dto.gems;
    if (dto.bonusGems !== undefined) updatePayload.bonusGems = dto.bonusGems;
    if (dto.priceUsdCents !== undefined)
      updatePayload.priceUsd = dto.priceUsdCents;
    if (dto.displayOrder !== undefined)
      updatePayload.displayOrder = dto.displayOrder;
    if (dto.active !== undefined) updatePayload.active = dto.active;

    const doc = await this.model
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .lean<GemPackageLean | null>();
    if (!doc) throw new NotFoundException('gems.packageNotFound');
    return this.toAdminView(doc);
  }

  async delete(id: string): Promise<void> {
    const pending = await this.purchaseModel.exists({
      packageId: new Types.ObjectId(id),
      status: 'pending',
    });
    if (pending)
      throw new BadRequestException('gems.packageHasPendingPurchases');

    const result = await this.model.deleteOne({ _id: new Types.ObjectId(id) });
    if (result.deletedCount === 0)
      throw new NotFoundException('gems.packageNotFound');
  }

  private toPublicView(d: GemPackageLean): GemPackagePublic {
    return {
      id: d._id.toString(),
      name: d.name,
      gems: d.gems,
      bonusGems: d.bonusGems,
      priceUsdCents: d.priceUsd,
      displayOrder: d.displayOrder,
    };
  }

  private toAdminView(d: GemPackageLean): GemPackageAdmin {
    return {
      ...this.toPublicView(d),
      active: d.active,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    };
  }
}
