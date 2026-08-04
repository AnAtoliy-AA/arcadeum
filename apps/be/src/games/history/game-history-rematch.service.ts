import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { HistoryRematchDto } from '../dtos/history-rematch.dto';
import { escapeRegExp } from '../../common/utils/escape-regexp';
import {
  ATLAS_CONNECTION,
  OCI_CONNECTION,
} from '../../common/providers/mongo-connections.provider';

@Injectable()
export class GameHistoryRematchService {
  constructor(
    @InjectModel(GameRoom.name, ATLAS_CONNECTION)
    private readonly gameRoomModel: Model<GameRoom>,
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly ociRoomModel?: Model<GameRoom>,
  ) {}

  async createRematchFromHistory(
    dto: HistoryRematchDto,
    userId: string,
  ): Promise<{ id: string; invitedIds: string[] }> {
    const { roomId: originalRoomId, participantIds } = dto;

    // Atomically claim the rematch lock — only one player can create a
    // rematch from a given room at a time.  If rematchPending is already
    // true we reject immediately instead of creating duplicate rooms.
    const lockedRoom = await this.gameRoomModel
      .findOneAndUpdate(
        { _id: originalRoomId, rematchPending: { $ne: true } },
        { $set: { rematchPending: true } },
        { new: true },
      )
      .lean()
      .exec();

    let originalRoom = lockedRoom;

    // If Atlas didn't have it (or it was already locked), try OCI
    if (!originalRoom && this.ociRoomModel) {
      const ociLocked = await this.ociRoomModel
        .findOneAndUpdate(
          { _id: originalRoomId, rematchPending: { $ne: true } },
          { $set: { rematchPending: true } },
          { new: true },
        )
        .lean()
        .exec();
      if (ociLocked) {
        originalRoom = ociLocked;
        // Mirror the lock back to Atlas
        try {
          await this.gameRoomModel.updateOne(
            { _id: originalRoomId },
            { $set: { rematchPending: true } },
          );
        } catch {
          // Best-effort mirror — game works from OCI if Atlas fails
        }
      }
    }

    if (!originalRoom) {
      // Either room doesn't exist or rematch is already in progress
      const exists = await this.gameRoomModel
        .findById(originalRoomId)
        .select('_id')
        .lean()
        .exec();
      if (!exists) {
        throw new NotFoundException(
          `Original room not found: ${originalRoomId}`,
        );
      }
      throw new BadRequestException('Rematch already in progress');
    }

    try {
      const isParticipant =
        originalRoom.hostId === userId ||
        originalRoom.participants.some((p) => p.userId === userId);

      if (!isParticipant) {
        throw new BadRequestException(
          'You were not a participant in the original game',
        );
      }

      const originalParticipantIds = originalRoom.participants
        .map((p) => p.userId)
        .filter((id) => id !== userId);

      const invitedIds =
        participantIds && participantIds.length > 0
          ? participantIds.filter((id) => id !== userId)
          : originalParticipantIds;

      const now = new Date();
      const participants: { userId: string; joinedAt: Date }[] = [
        { userId, joinedAt: now },
      ];
      const carriedOptions = dto.gameOptions || originalRoom.gameOptions || {};
      const carriedTeams = (
        carriedOptions as {
          teams?: { playerIds?: string[]; targetSize?: number }[];
        }
      ).teams;
      if (Array.isArray(carriedTeams)) {
        const seen = new Set<string>([userId]);
        for (const team of carriedTeams) {
          if (!Array.isArray(team.playerIds)) continue;
          for (const pid of team.playerIds) {
            if (typeof pid !== 'string') continue;
            if (!pid.startsWith('bot-')) continue;
            if (seen.has(pid)) continue;
            seen.add(pid);
            participants.push({ userId: pid, joinedAt: now });
          }
        }
      }

      const rematchMaxPlayers = Array.isArray(carriedTeams)
        ? Math.max(
            originalRoom.maxPlayers ?? 0,
            carriedTeams.reduce(
              (sum, t) =>
                sum + (typeof t.targetSize === 'number' ? t.targetSize : 0),
              0,
            ),
            participants.length,
          )
        : originalRoom.maxPlayers;

      const rematchSuffixMatch = originalRoom.name.match(/^(.+?) Rematch \d+$/);
      const baseName = rematchSuffixMatch
        ? rematchSuffixMatch[1]
        : originalRoom.name;

      const escapedBaseName = escapeRegExp(baseName);
      const existingRematches = await this.gameRoomModel
        .find({
          name: { $regex: new RegExp(`^${escapedBaseName} Rematch \\d+$`) },
        })
        .select('name')
        .lean()
        .exec();

      const usedNumbers = new Set(
        existingRematches
          .map((r) => {
            const match = r.name.match(/ Rematch (\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => n > 0),
      );

      let rematchNumber = 1;
      while (usedNumbers.has(rematchNumber)) {
        rematchNumber++;
      }
      const rematchName = `${baseName} Rematch ${rematchNumber}`;

      const newRoom = await this.gameRoomModel.create({
        gameId: originalRoom.gameId,
        name: rematchName,
        hostId: userId,
        visibility: originalRoom.visibility,
        maxPlayers: rematchMaxPlayers,
        participants,
        status: 'lobby',
        createdAt: now,
        updatedAt: now,
        gameOptions: {
          ...(dto.gameOptions || originalRoom.gameOptions || {}),
          rematchInvitedIds: invitedIds,
          rematchMessage: dto.message,
          rematchPreviousRoomId: originalRoomId,
        },
      });

      if (this.ociRoomModel) {
        try {
          await this.ociRoomModel.findOneAndUpdate(
            { _id: newRoom._id },
            { $set: newRoom.toObject() },
            { upsert: true },
          );
        } catch {
          // OCI mirror is best-effort; game works from Atlas
        }
      }

      return { id: newRoom._id.toString(), invitedIds };
    } catch (err) {
      // Release the lock on failure so the other player can retry
      await this.gameRoomModel
        .updateOne({ _id: originalRoomId }, { $set: { rematchPending: false } })
        .catch(() => {});
      if (this.ociRoomModel) {
        await this.ociRoomModel
          .updateOne(
            { _id: originalRoomId },
            { $set: { rematchPending: false } },
          )
          .catch(() => {});
      }
      throw err;
    }
  }
}
