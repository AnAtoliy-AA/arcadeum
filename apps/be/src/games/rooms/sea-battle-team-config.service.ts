import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomSummary } from './game-rooms.types';
import {
  SeaBattleGameOptions,
  SeaBattleTeamConfigEntry,
  TEAM_DEFAULT_COLORS,
} from './sea-battle-team-config.types';
import { SetTeamConfigDto } from '../dtos/set-team-config.dto';
import { AssignTeamDto } from '../dtos/assign-team.dto';

const MIN_TEAMS = 2;
const MIN_TEAM_SIZE = 2;
const MAX_TOTAL_PLAYERS = 8;

@Injectable()
export class SeaBattleTeamConfigService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    private readonly mapper: GameRoomsMapper,
  ) {}

  async enableTeamMode(
    roomId: string,
    hostId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.requireLobbyHostRoom(roomId, hostId);
    const participants = room.participants.map((p) => p.userId);
    if (participants.length > MAX_TOTAL_PLAYERS) {
      throw new BadRequestException(
        'Too many players in room — kick excess players before enabling team mode',
      );
    }
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    opts.teamMode = true;

    // Seed two teams. Host on team 1; remaining alternate.
    const a: string[] = [];
    const b: string[] = [];
    const ordered = [hostId, ...participants.filter((id) => id !== hostId)];
    ordered.forEach((id, i) => (i % 2 === 0 ? a.push(id) : b.push(id)));

    const aSize = Math.max(MIN_TEAM_SIZE, a.length);
    const bSize = Math.max(MIN_TEAM_SIZE, b.length);
    if (aSize + bSize > MAX_TOTAL_PLAYERS) {
      throw new BadRequestException(
        'Cannot fit participants into default teams',
      );
    }

    opts.teams = [
      {
        id: 't1',
        name: 'Team 1',
        color: TEAM_DEFAULT_COLORS[0],
        targetSize: aSize,
        playerIds: a,
      },
      {
        id: 't2',
        name: 'Team 2',
        color: TEAM_DEFAULT_COLORS[1],
        targetSize: bSize,
        playerIds: b,
      },
    ];
    room.gameOptions = opts;
    room.markModified('gameOptions');
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async disableTeamMode(
    roomId: string,
    hostId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.requireLobbyHostRoom(roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    delete opts.teams;
    delete opts.hideShipsFromTeammates;
    opts.teamMode = false;
    room.gameOptions = opts;
    room.markModified('gameOptions');
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async setTeamConfig(
    hostId: string,
    dto: SetTeamConfigDto,
  ): Promise<GameRoomSummary> {
    const room = await this.requireLobbyHostRoom(dto.roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teamMode) {
      throw new BadRequestException('Team mode is not enabled');
    }

    if (dto.teams.length < MIN_TEAMS) {
      throw new BadRequestException('Need at least 2 teams');
    }
    const total = dto.teams.reduce((s, t) => s + t.targetSize, 0);
    if (total > MAX_TOTAL_PLAYERS) {
      throw new BadRequestException(
        `Total slots cannot exceed ${MAX_TOTAL_PLAYERS}`,
      );
    }
    if (dto.teams.some((t) => t.targetSize < MIN_TEAM_SIZE)) {
      throw new BadRequestException(
        `Each team must have at least ${MIN_TEAM_SIZE} slots`,
      );
    }

    const previous = opts.teams ?? [];
    const next: SeaBattleTeamConfigEntry[] = dto.teams.map((incoming, idx) => {
      const id = incoming.id ?? `t${idx + 1}`;
      const prior = previous.find((p) => p.id === id);
      const players = (prior?.playerIds ?? []).slice(0, incoming.targetSize);
      return {
        id,
        name: incoming.name,
        color: incoming.color,
        targetSize: incoming.targetSize,
        playerIds: players,
      };
    });
    opts.teams = next;
    if (dto.hideShipsFromTeammates !== undefined) {
      opts.hideShipsFromTeammates = dto.hideShipsFromTeammates;
    }
    room.gameOptions = opts;
    room.markModified('gameOptions');
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async assignPlayerToTeam(
    actorId: string,
    dto: AssignTeamDto,
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(dto.roomId).exec();
    if (!room) throw new NotFoundException('Room not found');
    if (room.status !== 'lobby') {
      throw new BadRequestException('Room is not in lobby phase');
    }
    if (actorId !== room.hostId && actorId !== dto.userId) {
      throw new ForbiddenException('Players can only assign themselves');
    }
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teams) {
      throw new BadRequestException('Team mode is not configured');
    }

    // Remove from any existing team first.
    for (const t of opts.teams) {
      t.playerIds = t.playerIds.filter((id) => id !== dto.userId);
    }
    if (dto.teamId) {
      const team = opts.teams.find((t) => t.id === dto.teamId);
      if (!team) throw new BadRequestException('Team not found');
      if (team.playerIds.length >= team.targetSize) {
        throw new BadRequestException('Team is full');
      }
      team.playerIds.push(dto.userId);
    }
    room.gameOptions = opts;
    room.markModified('gameOptions');
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, actorId);
  }

  async addBotToTeam(
    hostId: string,
    roomId: string,
    teamId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.requireLobbyHostRoom(roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teams) {
      throw new BadRequestException('Team mode is not configured');
    }
    const team = opts.teams.find((t) => t.id === teamId);
    if (!team) throw new BadRequestException('Team not found');
    if (team.playerIds.length >= team.targetSize) {
      throw new BadRequestException('Team is full');
    }

    const totalParticipants = room.participants.length;
    if (totalParticipants >= MAX_TOTAL_PLAYERS) {
      throw new BadRequestException(
        `Room cannot exceed ${MAX_TOTAL_PLAYERS} participants`,
      );
    }

    const botId = `bot-${Math.random().toString(36).slice(2, 11)}`;
    team.playerIds.push(botId);
    room.participants.push({ userId: botId, joinedAt: new Date() });
    room.gameOptions = opts;
    room.markModified('gameOptions');
    room.markModified('participants');
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async removeBotFromTeam(
    hostId: string,
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.requireLobbyHostRoom(roomId, hostId);
    if (!userId.startsWith('bot-')) {
      throw new BadRequestException('Only bots may be removed via this method');
    }
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (opts.teams) {
      for (const t of opts.teams) {
        t.playerIds = t.playerIds.filter((id) => id !== userId);
      }
    }
    room.participants = room.participants.filter((p) => p.userId !== userId);
    room.gameOptions = opts;
    room.markModified('gameOptions');
    room.markModified('participants');
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async toggleHideShips(
    hostId: string,
    roomId: string,
    enabled: boolean,
  ): Promise<GameRoomSummary> {
    const room = await this.requireLobbyHostRoom(roomId, hostId);
    const opts = (room.gameOptions ?? {}) as SeaBattleGameOptions;
    if (!opts.teamMode) {
      throw new BadRequestException('Team mode is not enabled');
    }
    opts.hideShipsFromTeammates = enabled;
    room.gameOptions = opts;
    room.markModified('gameOptions');
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  private async requireLobbyHostRoom(roomId: string, hostId: string) {
    const room = await this.gameRoomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException('Room not found');
    if (room.hostId !== hostId) throw new ForbiddenException('Host only');
    if (room.status !== 'lobby') {
      throw new BadRequestException('Room is not in lobby phase');
    }
    return room;
  }
}
