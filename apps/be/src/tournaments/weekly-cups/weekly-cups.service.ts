import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Tournament,
  type TournamentDocument,
  type TournamentLocale,
} from '../schemas/tournament.schema';
import {
  TournamentSetting,
  type TournamentSettingDocument,
} from '../schemas/tournament-setting.schema';
import { TournamentsBracketsService } from '../tournaments.brackets.service';
import { NotificationDispatcher } from '../../notifications/notifications.dispatcher';
import { deriveEffectiveStatus } from '../lib/derive-effective-window';
import type {
  PublicTournamentItem,
  TournamentLocaleContentItem,
} from '../interfaces/tournament.interface';
import {
  WEEKLY_CUP_DEFINITIONS,
  WEEKLY_CUP_GAMES,
  type WeeklyCupDefinition,
  type WeeklyCupGame,
} from './weekly-cups.config';
import type {
  WeeklyCupCaptain,
  WeeklyCupConfig,
  WeeklyCupConfigUpdate,
  WeeklyCupResponse,
} from './weekly-cups.types';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const TEN_MINUTES_MS = 10 * 60 * 1000;
const DEFAULT_SYSTEM_USER_ID = new Types.ObjectId('000000000000000000000001');

/** Next occurrence of `weekdayUtc` at `hourUtc`:00 UTC strictly after `now`. */
export function computeNextCupDate(
  def: Pick<WeeklyCupDefinition, 'weekdayUtc' | 'hourUtc'>,
  now: Date = new Date(),
): Date {
  const target = new Date(now);
  target.setUTCHours(def.hourUtc, 0, 0, 0);
  let daysUntil = (def.weekdayUtc - target.getUTCDay() + 7) % 7;
  if (daysUntil === 0 && now.getTime() >= target.getTime()) {
    daysUntil = 7;
  }
  target.setUTCDate(target.getUTCDate() + daysUntil);
  return target;
}

@Injectable()
export class WeeklyCupsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(WeeklyCupsService.name);

  constructor(
    @InjectModel(Tournament.name)
    private readonly model: Model<TournamentDocument>,
    @InjectModel(TournamentSetting.name)
    private readonly settingModel: Model<TournamentSettingDocument>,
    private readonly bracketsService: TournamentsBracketsService,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const game of WEEKLY_CUP_GAMES) {
      try {
        await this.ensureUpcomingCup(game);
      } catch (err) {
        this.logger.warn(
          `Failed initial weekly cup bootstrap for ${game}: ${String(err)}`,
        );
      }
    }
  }

  async getConfig(game: WeeklyCupGame): Promise<WeeklyCupConfig> {
    const def = WEEKLY_CUP_DEFINITIONS[game];
    const doc = await this.settingModel.findOne({ key: def.settingKey }).exec();
    return {
      enabled: doc ? doc.enabled : true,
      prizePoolCoins:
        doc && typeof doc.prizePoolCoins === 'number'
          ? doc.prizePoolCoins
          : def.defaultPrizePoolCoins,
      prizeDescription:
        doc && typeof doc.prizeDescription === 'string'
          ? doc.prizeDescription
          : def.defaultPrizeDescription,
    };
  }

  async isEnabled(game: WeeklyCupGame): Promise<boolean> {
    return (await this.getConfig(game)).enabled;
  }

  async updateConfig(
    game: WeeklyCupGame,
    dto: WeeklyCupConfigUpdate,
    updatedBy?: string,
  ): Promise<{ ok: boolean } & WeeklyCupConfig> {
    const def = WEEKLY_CUP_DEFINITIONS[game];
    const current = await this.getConfig(game);
    // Always persist the full merged config so schema defaults (which belong
    // to Sea Battle) never leak into other games on first upsert.
    const next: WeeklyCupConfig = {
      enabled: typeof dto.enabled === 'boolean' ? dto.enabled : current.enabled,
      prizePoolCoins:
        typeof dto.prizePoolCoins === 'number'
          ? dto.prizePoolCoins
          : current.prizePoolCoins,
      prizeDescription:
        typeof dto.prizeDescription === 'string'
          ? dto.prizeDescription.trim()
          : current.prizeDescription,
    };
    const updateFields: Record<string, unknown> = { ...next };
    if (updatedBy && Types.ObjectId.isValid(updatedBy)) {
      updateFields.updatedBy = new Types.ObjectId(updatedBy);
    }

    const doc = await this.settingModel.findOneAndUpdate(
      { key: def.settingKey },
      { $set: updateFields },
      { upsert: true, new: true },
    );

    const config: WeeklyCupConfig = {
      enabled: doc.enabled,
      prizePoolCoins:
        typeof doc.prizePoolCoins === 'number'
          ? doc.prizePoolCoins
          : def.defaultPrizePoolCoins,
      prizeDescription:
        typeof doc.prizeDescription === 'string'
          ? doc.prizeDescription
          : def.defaultPrizeDescription,
    };

    if (
      typeof dto.prizePoolCoins === 'number' ||
      typeof dto.prizeDescription === 'string'
    ) {
      const activeTournamentUpdate: Record<string, unknown> = {};
      if (typeof dto.prizePoolCoins === 'number') {
        activeTournamentUpdate.prizePoolCoins = dto.prizePoolCoins;
      }
      if (typeof dto.prizeDescription === 'string') {
        activeTournamentUpdate.prizeDescription = dto.prizeDescription.trim();
      }
      await this.model.updateMany(
        {
          gameType: def.gameType,
          status: { $in: ['scheduled', 'registration_open'] },
        },
        { $set: activeTournamentUpdate },
      );
    }

    this.logger.log(
      `${def.fallbackName} config updated: enabled=${config.enabled}, prizePoolCoins=${config.prizePoolCoins}, prizeDescription=${config.prizeDescription}`,
    );

    return { ok: true, ...config };
  }

  async ensureUpcomingCup(
    game: WeeklyCupGame,
  ): Promise<TournamentDocument | null> {
    const def = WEEKLY_CUP_DEFINITIONS[game];
    const config = await this.getConfig(game);
    if (!config.enabled) {
      return null;
    }

    const existing = await this.model
      .findOne({
        gameType: def.gameType,
        status: { $in: ['scheduled', 'registration_open', 'live'] },
      })
      .exec();

    if (existing) {
      return existing;
    }

    const now = new Date();
    const scheduledAt = computeNextCupDate(def, now);
    const registrationOpensAt = new Date(
      Math.min(now.getTime(), scheduledAt.getTime() - FIVE_DAYS_MS),
    );
    const registrationClosesAt = new Date(
      scheduledAt.getTime() - TEN_MINUTES_MS,
    );

    const doc = await this.model.create({
      status: 'registration_open',
      gameType: def.gameType,
      scheduledAt,
      registrationOpensAt,
      registrationClosesAt,
      maxPlayers: def.maxPlayers,
      prizeDescription: config.prizeDescription,
      resultText: null,
      entryFeeCoins: 0,
      prizePoolCoins: config.prizePoolCoins,
      winnerUserId: null,
      content: def.content,
      registrations: [],
      createdBy: DEFAULT_SYSTEM_USER_ID,
    });

    this.logger.log(`Created ${def.fallbackName}: ${doc._id.toString()}`);
    return doc;
  }

  async startCupIfDue(game: WeeklyCupGame): Promise<void> {
    const def = WEEKLY_CUP_DEFINITIONS[game];
    if (!(await this.isEnabled(game))) {
      return;
    }

    const now = new Date();
    const dueCups = await this.model
      .find({
        gameType: def.gameType,
        status: 'registration_open',
        scheduledAt: { $lte: now },
      })
      .exec();

    for (const cup of dueCups) {
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
          i18nParams: { name: cup.content.en?.name ?? def.fallbackName },
          url: `/tournaments/${cup._id.toString()}`,
          data: { tournamentId: cup._id.toString() },
        });

        this.logger.log(
          `Started ${def.fallbackName} ${cup._id.toString()} with ${validPlayers.length} players`,
        );
      } else {
        const nextScheduledAt = computeNextCupDate(
          def,
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
          `Rescheduled ${def.fallbackName} ${cup._id.toString()} to ${nextScheduledAt.toISOString()} (insufficient players)`,
        );
      }
    }
  }

  async getCup(
    game: WeeklyCupGame,
    locale: TournamentLocale,
    isAuthenticated: boolean,
    callerUserId?: string,
  ): Promise<WeeklyCupResponse> {
    const def = WEEKLY_CUP_DEFINITIONS[game];
    const enabled = await this.isEnabled(game);
    const doc = await this.model
      .findOne({
        gameType: def.gameType,
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
        enabled,
        captains: [],
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

    const captains: WeeklyCupCaptain[] = (doc.registrations ?? []).map(
      (reg, index) => ({
        userId: reg.userId.toString(),
        displayName: reg.displayName ?? null,
        seed: index + 1,
        waitlist: !!reg.waitlist,
      }),
    );

    const bracketRes = doc.bracket
      ? await this.bracketsService.getPublicBracket(doc._id.toString())
      : null;

    const remainingMs = Math.max(0, doc.scheduledAt.getTime() - now.getTime());

    return {
      tournament: item,
      bracket: bracketRes?.bracket ?? null,
      countdownSeconds: Math.floor(remainingMs / 1000),
      enabled,
      captains,
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
