import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameVisibility,
  type GameVisibilityDocument,
} from './game-visibility.schema';
import {
  canSeeAtTier,
  type UserRole,
  type VisibilityTier,
} from '../../auth/lib/roles';

const TIER_RANK: Record<VisibilityTier, number> = {
  all: 0,
  premium_plus: 1,
  vip_plus: 2,
};
const CACHE_TTL_MS = 30_000;

function variantKey(gameId: string, variantId: string): string {
  return `${gameId}::${variantId}`;
}

@Injectable()
export class GameVisibilityService {
  private readonly logger = new Logger(GameVisibilityService.name);
  private map: Map<string, VisibilityTier> | null = null;
  private loadedAt = 0;

  constructor(
    @InjectModel(GameVisibility.name)
    private readonly model: Model<GameVisibilityDocument>,
  ) {}

  async getEffectiveTier(
    gameId: string,
    variantId?: string,
  ): Promise<VisibilityTier> {
    const map = await this.getMap();
    const gameTier = map.get(gameId) ?? 'all';
    if (!variantId) return gameTier;
    const variantTier = map.get(variantKey(gameId, variantId)) ?? 'all';
    return TIER_RANK[gameTier] >= TIER_RANK[variantTier]
      ? gameTier
      : variantTier;
  }

  async canSee(
    role: UserRole,
    gameId: string,
    variantId?: string,
  ): Promise<boolean> {
    const tier = await this.getEffectiveTier(gameId, variantId);
    return canSeeAtTier(role, tier);
  }

  async assertVisible(
    role: UserRole,
    gameId: string,
    variantId?: string,
  ): Promise<void> {
    if (await this.canSee(role, gameId, variantId)) return;
    throw new ForbiddenException({
      code: 'GAME_VISIBILITY_DENIED',
      gameId,
      variantId: variantId ?? null,
    });
  }

  async filterVisible<T>(
    role: UserRole,
    items: T[],
    key: (t: T) => { gameId: string; variantId?: string },
  ): Promise<T[]> {
    const out: T[] = [];
    for (const item of items) {
      const { gameId, variantId } = key(item);
      if (await this.canSee(role, gameId, variantId)) out.push(item);
    }
    return out;
  }

  private async getMap(): Promise<Map<string, VisibilityTier>> {
    if (this.map && Date.now() - this.loadedAt < CACHE_TTL_MS) {
      return this.map;
    }
    const rows = await this.model.find().lean<
      Array<{
        gameId: string;
        variantId: string | null;
        tier: VisibilityTier;
      }>
    >();
    const fresh = new Map<string, VisibilityTier>();
    for (const r of rows) {
      const k = r.variantId ? variantKey(r.gameId, r.variantId) : r.gameId;
      fresh.set(k, r.tier);
    }
    this.map = fresh;
    this.loadedAt = Date.now();
    return fresh;
  }

  invalidateCache(): void {
    this.map = null;
    this.loadedAt = 0;
  }
}
