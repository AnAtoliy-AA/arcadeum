import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

@Injectable()
export class GameRoomsChatService {
  private readonly logger = new Logger(GameRoomsChatService.name);

  /** Keep embedded lobby logs bounded; older entries roll off the tail. */
  private static readonly ROOM_CHAT_LOG_CAP = 100;

  constructor(
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly ociRoomModel: Model<GameRoom>,
  ) {}

  async postRoomChat(
    roomId: string,
    userId: string,
    senderName: string,
    message: string,
    scope: string,
  ): Promise<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    scope: string;
    createdAt: string;
  } | null> {
    if (!Types.ObjectId.isValid(roomId)) return null;
    const room = await this.ociRoomModel.findById(roomId).exec();
    if (!room) return null;

    const isParticipant =
      room.hostId === userId ||
      room.participants.some((p) => p.userId === userId);
    if (!isParticipant) return null;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      senderId: userId,
      senderName,
      message: message.slice(0, 240),
      scope,
      createdAt: new Date().toISOString(),
    };

    // Atomic bounded push: keeps lobby logs from growing unbounded and
    // avoids rewriting the whole room document via save().
    await this.ociRoomModel
      .updateOne(
        { _id: room._id },
        {
          $push: {
            chatLogs: {
              $each: [entry],
              $slice: GameRoomsChatService.ROOM_CHAT_LOG_CAP,
            },
          },
          $set: { updatedAt: new Date() },
        },
      )
      .exec();

    return entry;
  }

  async deleteRoomChatMessage(
    roomId: string,
    callerId: string,
    messageId: string,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(roomId)) return false;
    const room = await this.ociRoomModel.findById(roomId).exec();
    if (!room) return false;

    const targetMessage = (room.chatLogs ?? []).find((l) => l.id === messageId);
    if (!targetMessage) return false;

    const isHost = room.hostId === callerId;
    const isOwnMessage = targetMessage.senderId === callerId;
    if (!isHost && !isOwnMessage) return false;

    room.chatLogs = (room.chatLogs ?? []).filter((l) => l.id !== messageId);
    room.updatedAt = new Date();
    await room.save();
    return true;
  }
}
