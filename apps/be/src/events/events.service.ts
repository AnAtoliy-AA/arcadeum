import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  GameNightEvent,
  GameNightEventDocument,
  EventStatus,
} from './schemas/event.schema';
import { CreateEventDto, UpdateEventDto, RecordMatchDto } from './dto';

export interface EventParticipantView {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  gamesPlayed: number;
  wins: number;
  points: number;
  registeredAt: string;
}

export interface GameNightEventView {
  id: string;
  title: string;
  description: string;
  gameType: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  prizeBadge: string | null;
  participantCount: number;
  activeGamesCount: number;
  mvpUserId: string | null;
  mvpDisplayName: string | null;
  mvpPoints: number;
  createdAt: string;
}

export interface GameNightEventDetailView extends GameNightEventView {
  participants: EventParticipantView[];
  leaderboard: EventParticipantView[];
}

interface LeanParticipant {
  userId: Types.ObjectId;
  displayName: string;
  avatarUrl?: string | null;
  gamesPlayed: number;
  wins: number;
  points: number;
  registeredAt: Date;
}

interface LeanEvent {
  _id: Types.ObjectId;
  title: string;
  description: string;
  gameType: string;
  status: EventStatus;
  startTime: Date;
  endTime: Date;
  prizeBadge?: string | null;
  participants?: LeanParticipant[];
  activeGamesCount: number;
  mvpUserId?: Types.ObjectId | null;
  mvpDisplayName?: string | null;
  mvpPoints: number;
  createdAt: Date;
}

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectModel(GameNightEvent.name)
    private readonly eventModel: Model<GameNightEventDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultEvents();
  }

  private mapEventSummary(event: LeanEvent): GameNightEventView {
    const computedStatus = this.computeStatus(
      event.status,
      event.startTime,
      event.endTime,
    );
    return {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      gameType: event.gameType,
      status: computedStatus,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      prizeBadge: event.prizeBadge ?? null,
      participantCount: event.participants?.length ?? 0,
      activeGamesCount: event.activeGamesCount ?? 0,
      mvpUserId: event.mvpUserId ? event.mvpUserId.toString() : null,
      mvpDisplayName: event.mvpDisplayName ?? null,
      mvpPoints: event.mvpPoints ?? 0,
      createdAt: event.createdAt.toISOString(),
    };
  }

  private mapEventDetail(event: LeanEvent): GameNightEventDetailView {
    const summary = this.mapEventSummary(event);
    const participants: EventParticipantView[] = (event.participants ?? []).map(
      (p) => ({
        userId: p.userId.toString(),
        displayName: p.displayName,
        avatarUrl: p.avatarUrl ?? null,
        gamesPlayed: p.gamesPlayed,
        wins: p.wins,
        points: p.points,
        registeredAt: p.registeredAt.toISOString(),
      }),
    );

    const leaderboard = [...participants].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.gamesPlayed - b.gamesPlayed;
    });

    return {
      ...summary,
      participants,
      leaderboard,
    };
  }

  private computeStatus(
    currentStatus: EventStatus,
    startTime: Date,
    endTime: Date,
  ): EventStatus {
    if (currentStatus === 'cancelled') return 'cancelled';
    const now = Date.now();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (now >= end) return 'completed';
    if (now >= start) return 'active';
    return 'upcoming';
  }

  async getEvents(query?: {
    status?: EventStatus;
    limit?: number;
  }): Promise<GameNightEventView[]> {
    const limit = Math.min(query?.limit ?? 50, 100);
    const filter: Record<string, unknown> = {};
    if (query?.status) {
      filter.status = query.status;
    }

    const events = (await this.eventModel
      .find(filter)
      .sort({ startTime: 1 })
      .limit(limit)
      .lean()
      .exec()) as unknown as LeanEvent[];

    return events.map((e) => this.mapEventSummary(e));
  }

  async getFeaturedEvent(): Promise<GameNightEventView | null> {
    const all = await this.getEvents({ limit: 50 });
    const active = all.find((e) => e.status === 'active');
    if (active) return active;

    const upcoming = all.find((e) => e.status === 'upcoming');
    if (upcoming) return upcoming;

    return all[0] ?? null;
  }

  async getEventById(id: string): Promise<GameNightEventDetailView> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = (await this.eventModel
      .findById(id)
      .lean()
      .exec()) as unknown as LeanEvent | null;

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.mapEventDetail(event);
  }

  async createEvent(dto: CreateEventDto): Promise<GameNightEventView> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime.getTime() <= startTime.getTime()) {
      throw new BadRequestException('End time must be after start time');
    }

    const created = await this.eventModel.create({
      title: dto.title.trim(),
      description: (dto.description ?? '').trim(),
      gameType: dto.gameType,
      startTime,
      endTime,
      prizeBadge: dto.prizeBadge ?? null,
      status: dto.status ?? this.computeStatus('upcoming', startTime, endTime),
      participants: [],
      activeGamesCount: 0,
      mvpPoints: 0,
    });

    const lean = (await this.eventModel
      .findById(created._id)
      .lean()
      .exec()) as unknown as LeanEvent;

    return this.mapEventSummary(lean);
  }

  async updateEvent(
    id: string,
    dto: UpdateEventDto,
  ): Promise<GameNightEventView> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid event ID');
    }

    const update: Record<string, unknown> = {};
    if (dto.title !== undefined) update.title = dto.title.trim();
    if (dto.description !== undefined)
      update.description = dto.description.trim();
    if (dto.gameType !== undefined) update.gameType = dto.gameType;
    if (dto.startTime !== undefined) update.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) update.endTime = new Date(dto.endTime);
    if (dto.prizeBadge !== undefined) update.prizeBadge = dto.prizeBadge;
    if (dto.status !== undefined) update.status = dto.status;
    if (dto.activeGamesCount !== undefined)
      update.activeGamesCount = Math.max(0, dto.activeGamesCount);

    const updated = (await this.eventModel
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean()
      .exec()) as unknown as LeanEvent | null;

    if (!updated) {
      throw new NotFoundException('Event not found');
    }

    return this.mapEventSummary(updated);
  }

  async joinEvent(
    eventId: string,
    userId: string,
    displayName: string,
    avatarUrl?: string | null,
  ): Promise<GameNightEventDetailView> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const uObjectId = new Types.ObjectId(userId);
    const existingIndex = event.participants.findIndex(
      (p) => p.userId.toString() === userId,
    );

    if (existingIndex === -1) {
      event.participants.push({
        userId: uObjectId,
        displayName: displayName || 'Player',
        avatarUrl: avatarUrl ?? null,
        gamesPlayed: 0,
        wins: 0,
        points: 0,
        registeredAt: new Date(),
      });
      await event.save();
    }

    const lean = (await this.eventModel
      .findById(eventId)
      .lean()
      .exec()) as unknown as LeanEvent;

    return this.mapEventDetail(lean);
  }

  async recordMatchResult(
    eventId: string,
    dto: RecordMatchDto,
  ): Promise<GameNightEventDetailView> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid event ID');
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const pIndex = event.participants.findIndex(
      (p) => p.userId.toString() === dto.userId,
    );
    const pointsDelta = dto.pointsEarned ?? (dto.won ? 3 : 1);

    if (pIndex >= 0) {
      const p = event.participants[pIndex];
      p.gamesPlayed += 1;
      if (dto.won) p.wins += 1;
      p.points += pointsDelta;
    } else {
      event.participants.push({
        userId: new Types.ObjectId(dto.userId),
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl ?? null,
        gamesPlayed: 1,
        wins: dto.won ? 1 : 0,
        points: pointsDelta,
        registeredAt: new Date(),
      });
    }

    let topParticipant = event.participants[0];
    for (const p of event.participants) {
      if (
        !topParticipant ||
        p.points > topParticipant.points ||
        (p.points === topParticipant.points && p.wins > topParticipant.wins)
      ) {
        topParticipant = p;
      }
    }

    if (topParticipant) {
      event.mvpUserId = topParticipant.userId;
      event.mvpDisplayName = topParticipant.displayName;
      event.mvpPoints = topParticipant.points;
    }

    await event.save();

    const lean = (await this.eventModel
      .findById(eventId)
      .lean()
      .exec()) as unknown as LeanEvent;

    return this.mapEventDetail(lean);
  }

  async seedDefaultEvents(): Promise<void> {
    const count = await this.eventModel.countDocuments();
    if (count > 0) return;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    await this.eventModel.create([
      {
        title: 'Friday Night Blitz Chess',
        description:
          'Join the community blitz chess showdown. Fast 3-minute rounds with double points for winning streaks!',
        gameType: 'chess',
        status: 'active',
        startTime: new Date(now - 30 * 60 * 1000),
        endTime: new Date(now + 2 * oneHour),
        prizeBadge: 'champion_crown',
        participants: [
          {
            userId: new Types.ObjectId(),
            displayName: 'GrandmasterAlex',
            avatarUrl: null,
            gamesPlayed: 4,
            wins: 4,
            points: 12,
            registeredAt: new Date(now - 40 * 60 * 1000),
          },
          {
            userId: new Types.ObjectId(),
            displayName: 'KnightRider',
            avatarUrl: null,
            gamesPlayed: 3,
            wins: 2,
            points: 7,
            registeredAt: new Date(now - 35 * 60 * 1000),
          },
          {
            userId: new Types.ObjectId(),
            displayName: 'TacticianPro',
            avatarUrl: null,
            gamesPlayed: 2,
            wins: 1,
            points: 4,
            registeredAt: new Date(now - 20 * 60 * 1000),
          },
        ],
        activeGamesCount: 2,
        mvpPoints: 12,
        mvpDisplayName: 'GrandmasterAlex',
      },
      {
        title: 'Sea Battle Armada Clash',
        description:
          'Fleet commanders assemble! Compete in radar-enabled naval battles to secure the Admiral badge.',
        gameType: 'sea-battle',
        status: 'upcoming',
        startTime: new Date(now + 1 * oneDay),
        endTime: new Date(now + 1 * oneDay + 3 * oneHour),
        prizeBadge: 'admiral_ribbon',
        participants: [],
        activeGamesCount: 0,
        mvpPoints: 0,
      },
      {
        title: 'Sunday Backgammon Derby',
        description:
          'High stakes doubling cube action with the classic 24-point board masters.',
        gameType: 'backgammon',
        status: 'upcoming',
        startTime: new Date(now + 3 * oneDay),
        endTime: new Date(now + 3 * oneDay + 4 * oneHour),
        prizeBadge: 'golden_dice',
        participants: [],
        activeGamesCount: 0,
        mvpPoints: 0,
      },
    ]);
  }
}
