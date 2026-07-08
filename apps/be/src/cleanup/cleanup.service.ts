import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession } from '../games/schemas/game-session.schema';
import { GameRoom } from '../games/schemas/game-room.schema';
import { Message } from '../chat/schemas/message.schema';
import { EconomySettingsService } from '../economy/economy-settings.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectModel(GameSession.name)
    private readonly sessionModel: Model<GameSession>,
    @InjectModel(GameRoom.name)
    private readonly roomModel: Model<GameRoom>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
    private readonly economy: EconomySettingsService,
  ) {}

  async runCleanup(): Promise<{
    sessionsStateStripped: number;
    sessionsDeleted: number;
    roomsDeleted: number;
    anonRoomsDeleted: number;
    messagesDeleted: number;
  }> {
    const [
      sessionStateDays,
      sessionDeleteDays,
      roomDeleteDays,
      messageDeleteDays,
      anonRoomDeleteDays,
    ] = await Promise.all([
      this.economy.getNumber('cleanup_session_state_days'),
      this.economy.getNumber('cleanup_session_delete_days'),
      this.economy.getNumber('cleanup_room_delete_days'),
      this.economy.getNumber('cleanup_message_delete_days'),
      this.economy.getNumber('cleanup_anon_room_delete_days'),
    ]);

    const results = {
      sessionsStateStripped: 0,
      sessionsDeleted: 0,
      roomsDeleted: 0,
      anonRoomsDeleted: 0,
      messagesDeleted: 0,
    };

    try {
      const stateCutoff = new Date(
        Date.now() - sessionStateDays * 24 * 60 * 60 * 1000,
      );
      const stateResult = await this.sessionModel.updateMany(
        {
          status: 'completed',
          updatedAt: { $lt: stateCutoff },
          'state.logs': { $exists: true },
        },
        {
          $unset: {
            'state.board': '',
            'state.ships': '',
            'state.moves': '',
            'state.logs': '',
            'state.grid': '',
            'state.players': '',
            'state.teams': '',
            'state.pieces': '',
            'state.capturedPieces': '',
            'state.moveHistory': '',
            'state.placedShips': '',
          },
        },
      );
      results.sessionsStateStripped = stateResult.modifiedCount;
    } catch (err) {
      this.logger.warn(`Session state strip failed: ${(err as Error).message}`);
    }

    try {
      const sessionDeleteCutoff = new Date(
        Date.now() - sessionDeleteDays * 24 * 60 * 60 * 1000,
      );
      const sessionDeleteResult = await this.sessionModel.deleteMany({
        status: 'completed',
        updatedAt: { $lt: sessionDeleteCutoff },
      });
      results.sessionsDeleted = sessionDeleteResult.deletedCount;
    } catch (err) {
      this.logger.warn(`Session delete failed: ${(err as Error).message}`);
    }

    try {
      const roomDeleteCutoff = new Date(
        Date.now() - roomDeleteDays * 24 * 60 * 60 * 1000,
      );
      const roomDeleteResult = await this.roomModel.deleteMany({
        status: 'completed',
        updatedAt: { $lt: roomDeleteCutoff },
        hostId: { $not: /^anon_/ },
      });
      results.roomsDeleted = roomDeleteResult.deletedCount;
    } catch (err) {
      this.logger.warn(`Room delete failed: ${(err as Error).message}`);
    }

    try {
      const anonCutoff = new Date(
        Date.now() - anonRoomDeleteDays * 24 * 60 * 60 * 1000,
      );
      const anonRooms = await this.roomModel
        .find({
          hostId: { $regex: /^anon_/ },
          updatedAt: { $lt: anonCutoff },
        })
        .select('_id')
        .lean();

      if (anonRooms.length > 0) {
        const anonRoomIds = anonRooms.map((r) => r._id.toString());
        await this.sessionModel.deleteMany({
          roomId: { $in: anonRoomIds },
        });
        const anonResult = await this.roomModel.deleteMany({
          _id: { $in: anonRoomIds },
        });
        results.anonRoomsDeleted = anonResult.deletedCount;
      }
    } catch (err) {
      this.logger.warn(
        `Anonymous room delete failed: ${(err as Error).message}`,
      );
    }

    try {
      const messageDeleteCutoff = new Date(
        Date.now() - messageDeleteDays * 24 * 60 * 60 * 1000,
      );
      const messageDeleteResult = await this.messageModel.deleteMany({
        timestamp: { $lt: messageDeleteCutoff },
      });
      results.messagesDeleted = messageDeleteResult.deletedCount;
    } catch (err) {
      this.logger.warn(`Message delete failed: ${(err as Error).message}`);
    }

    if (
      results.sessionsStateStripped > 0 ||
      results.sessionsDeleted > 0 ||
      results.roomsDeleted > 0 ||
      results.anonRoomsDeleted > 0 ||
      results.messagesDeleted > 0
    ) {
      this.logger.log(
        `Cleanup done: ${results.sessionsStateStripped} sessions stripped, ` +
          `${results.sessionsDeleted} sessions deleted, ` +
          `${results.roomsDeleted} rooms deleted, ` +
          `${results.anonRoomsDeleted} anon rooms deleted, ` +
          `${results.messagesDeleted} messages deleted`,
      );
    }

    return results;
  }
}
