import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameRuleVisibility,
  type GameRuleVisibilityDocument,
} from './game-rule-visibility.schema';
import { GAME_CATALOG } from '../../games/games.catalog';

const VALID_GAME_IDS = new Set(GAME_CATALOG.map((g) => g.gameId));

function validateGameId(gameId: string): void {
  if (!VALID_GAME_IDS.has(gameId)) {
    throw new BadRequestException(`Invalid gameId: ${gameId}`);
  }
}

function validateRuleId(gameId: string, ruleId: string): void {
  const game = GAME_CATALOG.find((g) => g.gameId === gameId);
  if (!game || !game.rules.some((r) => r.ruleId === ruleId)) {
    throw new BadRequestException(
      `Invalid ruleId ${ruleId} for game ${gameId}`,
    );
  }
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
    validateGameId(gameId);
    const rows = await this.model.find({ gameId }).exec();
    const map = new Map<string, boolean>();
    for (const row of rows) {
      map.set(row.ruleId, row.enabled);
    }
    return map;
  }

  async getAllRules(): Promise<Map<string, Map<string, boolean>>> {
    const rows = await this.model.find().exec();
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
    validateGameId(gameId);
    validateRuleId(gameId, ruleId);
    await this.model.findOneAndUpdate(
      { gameId, ruleId },
      { enabled, updatedBy },
      { upsert: true },
    );
    this.logger.log(
      `Rule ${ruleId} for ${gameId} set to ${enabled ? 'enabled' : 'disabled'} by ${updatedBy}`,
    );
  }

  async setAllRulesForGame(
    gameId: string,
    rules: Array<{ ruleId: string; enabled: boolean }>,
    updatedBy: string,
  ): Promise<void> {
    validateGameId(gameId);
    for (const r of rules) {
      validateRuleId(gameId, r.ruleId);
    }
    const ops = rules.map((r) =>
      this.model.findOneAndUpdate(
        { gameId, ruleId: r.ruleId },
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
