import { Model } from 'mongoose';
import { GamesRematchService } from './games.rematch.service';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameRoomsRematchService } from './rooms/game-rooms.rematch.service';
import { GameHistoryService } from './history/game-history.service';
import { GamesRealtimeService } from './games.realtime.service';
import { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import { User } from '../auth/schemas/user.schema';

describe('GamesRematchService', () => {
  let service: GamesRematchService;
  let roomsService: Partial<GameRoomsService>;
  let rematchRoomsService: Partial<GameRoomsRematchService>;
  let historyService: Partial<GameHistoryService>;
  let realtimeService: Partial<GamesRealtimeService>;
  let dispatcher: Partial<NotificationDispatcher>;
  let userModel: Partial<Model<User>>;

  beforeEach(() => {
    roomsService = {
      getRoom: jest.fn().mockResolvedValue({
        id: 'new-room-1',
        gameId: 'chess',
        host: { displayName: 'Host User' },
      }),
    };
    rematchRoomsService = {
      declineRematchInvitation: jest.fn(),
      acceptRematchInvitation: jest.fn(),
      cancelRematchInvitation: jest.fn(),
    };
    historyService = {
      createRematchFromHistory: jest.fn().mockResolvedValue({
        id: 'new-room-1',
        invitedIds: ['opponent-1'],
        pending: true,
        pendingUserIds: ['opponent-1'],
      }),
    };
    realtimeService = {
      emitRematchInvited: jest.fn(),
      emitRematchStatus: jest.fn(),
      emitPlayerDeclined: jest.fn(),
      emitRoomUpdated: jest.fn(),
    };
    dispatcher = {
      dispatch: jest.fn().mockResolvedValue(true),
      dispatchMany: jest.fn().mockResolvedValue(1),
    };
    userModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              _id: 'opponent-1',
              displayName: 'Opponent Player',
            }),
          }),
        }),
      }),
    };

    service = new GamesRematchService(
      roomsService as GameRoomsService,
      rematchRoomsService as GameRoomsRematchService,
      historyService as GameHistoryService,
      realtimeService as GamesRealtimeService,
      dispatcher as NotificationDispatcher,
      userModel as unknown as Model<User>,
    );
  });

  it('delivers game_invitation push notifications on createRematchFromHistory', async () => {
    const result = await service.createRematchFromHistory(
      'host-1',
      'old-room-1',
      ['opponent-1'],
    );

    expect(result).toEqual({
      id: 'new-room-1',
      pending: true,
      pendingUserIds: ['opponent-1'],
    });

    expect(realtimeService.emitRematchInvited).toHaveBeenCalledWith(
      'old-room-1',
      'new-room-1',
      'host-1',
      'Host User',
      ['opponent-1'],
      undefined,
    );

    expect(dispatcher.dispatchMany).toHaveBeenCalledWith(
      ['opponent-1'],
      expect.objectContaining({
        category: 'game_invitation',
        titleKey: 'notifications.game_invitation.title',
        bodyKey: 'notifications.game_invitation.body',
        data: expect.objectContaining({
          roomId: 'new-room-1',
          oldRoomId: 'old-room-1',
          hostId: 'host-1',
          type: 'rematch',
        }) as Record<string, unknown>,
      }),
    );
  });

  it('delivers rematch_accepted push notification and emits realtime status when opponent accepts', async () => {
    (
      rematchRoomsService.acceptRematchInvitation as jest.Mock
    ).mockResolvedValue({
      id: 'new-room-1',
      hostId: 'host-1',
      gameId: 'chess',
      gameOptions: {
        rematchPreviousRoomId: 'old-room-1',
        rematchInvitedIds: [],
        rematchAcceptedIds: ['host-1', 'opponent-1'],
        rematchDeclinedIds: [],
      },
    });

    await service.acceptInvitation('new-room-1', 'opponent-1');

    expect(realtimeService.emitRematchStatus).toHaveBeenCalledWith(
      'old-room-1',
      'new-room-1',
      'accepted',
      'opponent-1',
      [],
      ['host-1', 'opponent-1'],
      [],
    );

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'host-1',
        category: 'game_invitation',
        titleKey: 'notifications.rematch_accepted.title',
        bodyKey: 'notifications.rematch_accepted.body',
        i18nParams: { opponentName: 'Opponent Player', gameId: 'chess' },
        data: expect.objectContaining({
          roomId: 'new-room-1',
          oldRoomId: 'old-room-1',
          type: 'rematch_accepted',
          opponentId: 'opponent-1',
        }) as Record<string, unknown>,
      }),
    );
  });

  it('delivers rematch_declined push notification and emits realtime status when opponent declines', async () => {
    (
      rematchRoomsService.declineRematchInvitation as jest.Mock
    ).mockResolvedValue({
      id: 'new-room-1',
      hostId: 'host-1',
      gameId: 'chess',
      gameOptions: {
        rematchPreviousRoomId: 'old-room-1',
        rematchInvitedIds: [],
        rematchAcceptedIds: ['host-1'],
        rematchDeclinedIds: ['opponent-1'],
      },
    });

    await service.declineInvitation('new-room-1', 'opponent-1');

    expect(realtimeService.emitRematchStatus).toHaveBeenCalledWith(
      'old-room-1',
      'new-room-1',
      'declined',
      'opponent-1',
      [],
      ['host-1'],
      ['opponent-1'],
    );

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'host-1',
        category: 'game_invitation',
        titleKey: 'notifications.rematch_declined.title',
        bodyKey: 'notifications.rematch_declined.body',
        i18nParams: { opponentName: 'Opponent Player', gameId: 'chess' },
        data: expect.objectContaining({
          roomId: 'new-room-1',
          oldRoomId: 'old-room-1',
          type: 'rematch_declined',
          opponentId: 'opponent-1',
        }) as Record<string, unknown>,
      }),
    );
  });

  it('cancels invitation and emits cancelled status to old room', async () => {
    (
      rematchRoomsService.cancelRematchInvitation as jest.Mock
    ).mockResolvedValue({
      oldRoomId: 'old-room-1',
    });

    await service.cancelInvitation('new-room-1', 'host-1');

    expect(realtimeService.emitRematchStatus).toHaveBeenCalledWith(
      'old-room-1',
      'new-room-1',
      'cancelled',
      'host-1',
    );
  });
});
