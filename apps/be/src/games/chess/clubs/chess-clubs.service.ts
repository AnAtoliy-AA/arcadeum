import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChessClub, type ChessClubDocument } from './chess-club.schema';
import { OCI_CONNECTION } from '../../../common/providers/mongo-connections.provider';

@Injectable()
export class ChessClubsService {
  private readonly logger = new Logger(ChessClubsService.name);

  constructor(
    @InjectModel(ChessClub.name, OCI_CONNECTION)
    private readonly model: Model<ChessClubDocument>,
  ) {}

  async createClub(
    name: string,
    ownerId: string,
    description = '',
    visibility: 'public' | 'private' = 'public',
  ): Promise<ChessClubDocument> {
    return this.model.create({
      name,
      ownerId,
      description,
      visibility,
      memberIds: [ownerId],
      adminIds: [ownerId],
      memberCount: 1,
    });
  }

  async getClub(clubId: string): Promise<ChessClubDocument> {
    const club = await this.model.findById(clubId).exec();
    if (!club) throw new NotFoundException('Club not found');
    return club;
  }

  async searchClubs(query: string, limit = 20): Promise<ChessClubDocument[]> {
    return this.model
      .find({ name: { $regex: query, $options: 'i' }, visibility: 'public' })
      .limit(limit)
      .sort({ memberCount: -1 })
      .exec();
  }

  async joinClub(clubId: string, userId: string): Promise<ChessClubDocument> {
    const club = await this.getClub(clubId);
    if (club.memberIds.includes(userId)) return club;
    club.memberIds.push(userId);
    club.memberCount = club.memberIds.length;
    await club.save();
    return club;
  }

  async leaveClub(clubId: string, userId: string): Promise<ChessClubDocument> {
    const club = await this.getClub(clubId);
    if (club.ownerId === userId) {
      throw new ForbiddenException('Owner cannot leave club');
    }
    club.memberIds = club.memberIds.filter((id) => id !== userId);
    club.adminIds = club.adminIds.filter((id) => id !== userId);
    club.memberCount = club.memberIds.length;
    await club.save();
    return club;
  }

  async addAdmin(clubId: string, ownerId: string, userId: string): Promise<ChessClubDocument> {
    const club = await this.getClub(clubId);
    if (club.ownerId !== ownerId && !club.adminIds.includes(ownerId)) {
      throw new ForbiddenException('Not authorized');
    }
    if (!club.adminIds.includes(userId)) {
      club.adminIds.push(userId);
      await club.save();
    }
    return club;
  }

  async getClubMembers(clubId: string): Promise<string[]> {
    const club = await this.getClub(clubId);
    return club.memberIds;
  }

  async getUserClubs(userId: string): Promise<ChessClubDocument[]> {
    return this.model.find({ memberIds: userId }).exec();
  }

  async deleteClub(clubId: string, userId: string): Promise<void> {
    const club = await this.getClub(clubId);
    if (club.ownerId !== userId) {
      throw new ForbiddenException('Only owner can delete club');
    }
    await this.model.findByIdAndDelete(clubId).exec();
  }
}
