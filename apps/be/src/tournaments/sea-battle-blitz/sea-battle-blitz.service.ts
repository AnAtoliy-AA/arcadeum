import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Tournament,
  type TournamentDocument,
  type TournamentLocale,
} from '../schemas/tournament.schema';
import { TournamentsBracketsService } from '../tournaments.brackets.service';
import { TournamentsService } from '../tournaments.service';
import { NotificationDispatcher } from '../../notifications/notifications.dispatcher';
import { deriveEffectiveStatus } from '../lib/derive-effective-window';
import type {
  PublicTournamentItem,
  TournamentLocaleContentItem,
} from '../interfaces/tournament.interface';
import type { SeaBattleBlitzCupResponse } from './sea-battle-blitz.types';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;
const DEFAULT_SYSTEM_USER_ID = new Types.ObjectId('000000000000000000000001');

export function computeNextBlitzCupDate(now: Date = new Date()): Date {
  const target = new Date(now);
  target.setUTCHours(18, 0, 0, 0);
  const currentDay = target.getUTCDay();
  let daysUntilSaturday = (6 - currentDay + 7) % 7;
  if (daysUntilSaturday === 0 && now.getTime() >= target.getTime()) {
    daysUntilSaturday = 7;
  }
  target.setUTCDate(target.getUTCDate() + daysUntilSaturday);
  return target;
}

@Injectable()
export class SeaBattleBlitzService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeaBattleBlitzService.name);

  constructor(
    @InjectModel(Tournament.name)
    private readonly model: Model<TournamentDocument>,
    private readonly bracketsService: TournamentsBracketsService,
    private readonly tournamentsService: TournamentsService,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.ensureUpcomingBlitzCup();
    } catch (err) {
      this.logger.warn(
        `Failed initial Sea Battle blitz cup bootstrap: ${String(err)}`,
      );
    }
  }

  async ensureUpcomingBlitzCup(): Promise<TournamentDocument | null> {
    const existing = await this.model
      .findOne({
        gameType: 'sea_battle_v1',
        status: { $in: ['scheduled', 'registration_open', 'live'] },
      })
      .exec();

    if (existing) {
      return existing;
    }

    const now = new Date();
    const scheduledAt = computeNextBlitzCupDate(now);
    const registrationOpensAt = new Date(
      Math.min(now.getTime(), scheduledAt.getTime() - FIVE_DAYS_MS),
    );
    const registrationClosesAt = new Date(
      scheduledAt.getTime() - TEN_MINUTES_MS,
    );

    const doc = await this.model.create({
      status: 'registration_open',
      gameType: 'sea_battle_v1',
      scheduledAt,
      registrationOpensAt,
      registrationClosesAt,
      maxPlayers: 16,
      prizeDescription: '500 Coins + Admiral Trophy',
      resultText: null,
      entryFeeCoins: 0,
      prizePoolCoins: 500,
      winnerUserId: null,
      content: {
        en: {
          name: 'Sea Battle Weekend Blitz Cup',
          description:
            'Weekly single-elimination naval blitz tournament! Command your fleet, predict enemy coordinates, and sink your opponents to claim the championship trophy.',
        },
        ru: {
          name: 'Морской бой: Еженедельный Блиц-Кубок',
          description:
            'Еженедельный турнир на выбывание по Морскому бою! Командуйте флотом, вычисляйте координаты врага и завоюйте чемпионский кубок.',
        },
        es: {
          name: 'Copa Blitz Semanal de Batalla Naval',
          description:
            '¡Torneo semanal de eliminación directa de Batalla Naval! Dirige tu flota, predice las coordenadas enemigas y álzate con el trofeo de campeón.',
        },
        fr: {
          name: 'Coupe Blitz Hebdomadaire de Bataille Navale',
          description:
            'Tournoi hebdomadaire à élimination directe de Bataille Navale ! Commandez votre flotte, anticipez les tirs ennemis et devenez le champion naval.',
        },
        by: {
          name: 'Марскі бой: Штотыднёвы Бліц-Кубак',
          description:
            'Штотыднёвы турнір на выбыванне па Марскім боі! Камандуйце флотам, знаходзьце каардынаты ворага і заваюйце чэмпіёнскі кубак.',
        },
      },
      registrations: [],
      createdBy: DEFAULT_SYSTEM_USER_ID,
    });

    this.logger.log(
      `Created Sea Battle Weekly Blitz Cup: ${doc._id.toString()}`,
    );
    return doc;
  }

  async startBlitzCupIfDue(): Promise<void> {
    const now = new Date();
    const activeCups = await this.model
      .find({
        gameType: 'sea_battle_v1',
        status: 'registration_open',
        scheduledAt: { $lte: now },
      })
      .exec();

    for (const cup of activeCups) {
      const validPlayers = cup.registrations
        .filter((r) => !r.waitlist)
        .map((r) => r.userId.toString());

      if (validPlayers.length >= 2) {
        cup.status = 'live';
        await cup.save();

        await this.bracketsService.generateBracket(cup._id.toString(), {
          format: 'single_elimination',
        });

        await this.dispatcher.dispatchMany(validPlayers, {
          category: 'tournament_starting_soon',
          titleKey: 'notifications.tournament_started.title',
          bodyKey: 'notifications.tournament_started.body',
          i18nParams: { name: cup.content.en?.name ?? 'Sea Battle Blitz Cup' },
          url: `/tournaments/${cup._id.toString()}`,
          data: { tournamentId: cup._id.toString() },
        });

        this.logger.log(
          `Started Sea Battle Blitz Cup ${cup._id.toString()} with ${validPlayers.length} players`,
        );
      } else {
        const nextScheduledAt = computeNextBlitzCupDate(
          new Date(cup.scheduledAt.getTime() + 1000),
        );
        cup.scheduledAt = nextScheduledAt;
        cup.registrationOpensAt = new Date(
          nextScheduledAt.getTime() - FIVE_DAYS_MS,
        );
        cup.registrationClosesAt = new Date(
          nextScheduledAt.getTime() - TEN_MINUTES_MS,
        );
        await cup.save();

        this.logger.log(
          `Rescheduled Sea Battle Blitz Cup ${cup._id.toString()} to ${nextScheduledAt.toISOString()} (insufficient players)`,
        );
      }
    }
  }

  async getSeaBattleBlitzCup(
    locale: TournamentLocale,
    isAuthenticated: boolean,
    callerUserId?: string,
  ): Promise<SeaBattleBlitzCupResponse> {
    const doc = await this.model
      .findOne({
        gameType: 'sea_battle_v1',
        status: {
          $in: ['registration_open', 'live', 'scheduled', 'completed'],
        },
      })
      .sort({ scheduledAt: -1 })
      .exec();

    if (!doc) {
      return {
        tournament: null,
        bracket: null,
        countdownSeconds: 0,
      };
    }

    const now = new Date();
    const effectiveStatus = deriveEffectiveStatus({
      status: doc.status,
      scheduledAt: doc.scheduledAt,
      registrationOpensAt: doc.registrationOpensAt,
      registrationClosesAt: doc.registrationClosesAt,
      now,
    });

    const localized: TournamentLocaleContentItem =
      doc.content[locale] ?? doc.content.en;
    const registeredCount = doc.registrations.filter((r) => !r.waitlist).length;
    const waitlistCount = doc.registrations.length - registeredCount;
    const userMatch =
      isAuthenticated && callerUserId
        ? doc.registrations.find((r) => r.userId.toString() === callerUserId)
        : undefined;

    const item: PublicTournamentItem = {
      id: doc._id.toString(),
      gameType: doc.gameType,
      scheduledAt: doc.scheduledAt.toISOString(),
      registrationOpensAt: doc.registrationOpensAt?.toISOString() ?? null,
      registrationClosesAt: doc.registrationClosesAt?.toISOString() ?? null,
      maxPlayers: doc.maxPlayers,
      prizeDescription: doc.prizeDescription ?? null,
      resultText: doc.resultText ?? null,
      entryFeeCoins: doc.entryFeeCoins ?? 0,
      prizePoolCoins: doc.prizePoolCoins ?? 0,
      status: doc.status,
      effectiveStatus,
      registeredCount,
      waitlistCount,
      isRegistered: !!userMatch,
      isWaitlisted: !!userMatch?.waitlist,
      name: localized.name,
      description: localized.description,
    };

    const bracketRes = doc.bracket
      ? await this.bracketsService.getPublicBracket(doc._id.toString())
      : null;

    const remainingMs = Math.max(0, doc.scheduledAt.getTime() - now.getTime());
    const countdownSeconds = Math.floor(remainingMs / 1000);

    return {
      tournament: item,
      bracket: bracketRes?.bracket ?? null,
      countdownSeconds,
    };
  }

  async reportMatchResult(
    tournamentId: string,
    round: number,
    matchIndex: number,
    winnerUserId: string,
  ): Promise<void> {
    await this.bracketsService.reportResult(
      tournamentId,
      round,
      matchIndex,
      winnerUserId,
    );
  }
}
