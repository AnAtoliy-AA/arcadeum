import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChessCosmetic,
  type ChessCosmeticDocument,
} from './chess-cosmetic.schema';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Injectable()
export class ChessCosmeticsService {
  private readonly logger = new Logger(ChessCosmeticsService.name);

  constructor(
    @InjectModel(ChessCosmetic.name, OCI_CONNECTION)
    private readonly model: Model<ChessCosmeticDocument>,
  ) {}

  async getAllCosmetics(): Promise<ChessCosmeticDocument[]> {
    return this.model.find().sort({ price: 1 }).exec();
  }

  async getCosmeticsByType(type: string): Promise<ChessCosmeticDocument[]> {
    return this.model.find({ type }).sort({ price: 1 }).exec();
  }

  async getCosmetic(id: string): Promise<ChessCosmeticDocument> {
    const cosmetic = await this.model.findOne({ id }).exec();
    if (!cosmetic) throw new NotFoundException('Cosmetic not found');
    return cosmetic;
  }

  async purchaseCosmetic(
    userId: string,
    cosmeticId: string,
    userGems: number,
  ): Promise<{ success: boolean; remainingGems: number }> {
    const cosmetic = await this.getCosmetic(cosmeticId);
    if (userGems < cosmetic.price) {
      throw new BadRequestException('Insufficient gems');
    }
    return { success: true, remainingGems: userGems - cosmetic.price };
  }
}
