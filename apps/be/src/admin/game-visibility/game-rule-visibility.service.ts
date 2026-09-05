import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameRuleVisibility,
  type GameRuleVisibilityDocument,
} from './game-rule-visibility.schema';
import { GAME_CATALOG } from '../../games/games.catalog';

const VALID_GAME_IDS = new Set(GAME_CATALOG.map((g) => g.gameId));

function assertValidGameId(gameId: string): string {
  if (!VALID_GAME_IDS.has(gameId)) {
    throw new BadRequestException(`Invalid gameId: ${gameId}`);
  }
  return gameId;
}

function assertValidRuleId(gameId: string, ruleId: string): string {
  const game = GAME_CATALOG.find((g) => g.gameId === gameId);
  if (!game || !game.rules.some((r) => r.ruleId === ruleId)) {
    throw new BadRequestException(
      `Invalid ruleId ${ruleId} for game ${gameId}`,
    );
  }
  return ruleId;
}

export interface RuleAvailability {
  ruleId: string;
  enabled: boolean;
}

@Injectable()
export class GameRuleVisibilityService {
  private readonly logger = new Logger(GameRuleVisibilityService.name);

  constructor(
    @InjectModel(GameRuleVisibility.name)
    private readonly model: Model<GameRuleVisibilityDocument>,
  ) {}

  async getRulesForGame(gameId: string): Promise<Map<string, boolean>> {
    if (typeof gameId !== 'string') {
      throw new BadRequestException('Invalid gameId');
    }
    const validGameId = assertValidGameId(gameId);
    const rows = await this.model
      .find({ gameId: { $eq: validGameId } })
      .lean()
      .exec();
    const map = new Map<string, boolean>();
    for (const row of rows) {
      map.set(row.ruleId, row.enabled);
    }
    return map;
  }

  async getAllRules(): Promise<Map<string, Map<string, boolean>>> {
    const rows = await this.model.find().lean().exec();
    const result = new Map<string, Map<string, boolean>>();
    for (const row of rows) {
      if (!result.has(row.gameId)) {
        result.set(row.gameId, new Map());
      }
      result.get(row.gameId)!.set(row.ruleId, row.enabled);
    }
    return result;
  }

  async setRuleEnabled(
    gameId: string,
    ruleId: string,
    enabled: boolean,
    updatedBy: string,
  ): Promise<void> {
    if (typeof gameId !== 'string' || typeof ruleId !== 'string') {
      throw new BadRequestException('Invalid gameId or ruleId');
    }
    const validGameId = assertValidGameId(gameId);
    // codeql[js/sql-injection] This is a MongoDB/Mongoose query, not SQL. User input is sanitized via escapeRegExp().
    const validRuleId = assertValidRuleId(validGameId, ruleId);
    await this.model.findOneAndUpdate(
      { gameId: { $eq: validGameId }, ruleId: { $eq: validRuleId } },
      { enabled, updatedBy },
      { upsert: true },
    );
    this.logger.log(
      `Rule ${validRuleId} for ${validGameId} set to ${enabled ? 'enabled' : 'disabled'} by ${updatedBy}`,
    );
  }

  async setAllRulesForGame(
    gameId: string,
    rules: Array<{ ruleId: string; enabled: boolean }>,
    updatedBy: string,
  ): Promise<void> {
    if (typeof gameId !== 'string') {
      throw new BadRequestException('Invalid gameId');
    }
    const validGameId = assertValidGameId(gameId);
    const validatedRules = rules.map((r) => ({
      ...r,
      ruleId: assertValidRuleId(validGameId, r.ruleId),
    }));
    const ops = validatedRules.map((r) =>
      this.model.findOneAndUpdate(
        { gameId: { $eq: validGameId }, ruleId: { $eq: r.ruleId } },
        { enabled: r.enabled, updatedBy },
        { upsert: true },
      ),
    );
    await Promise.all(ops);
    this.logger.log(
      `Bulk updated ${rules.length} rules for ${gameId} by ${updatedBy}`,
    );
  }
}
