import { Injectable } from '@nestjs/common';
import { GameVisibilityService } from '../admin/game-visibility/game-visibility.service';
import { GameRuleVisibilityService } from '../admin/game-visibility/game-rule-visibility.service';
import { UserRoleResolver } from '../auth/lib/user-role-resolver.service';
import type { UserRole } from '../auth/lib/roles';
import { GAME_CATALOG } from './games.catalog';
import {
  type CatalogResponse,
  type CatalogGame,
  type CatalogTheme,
  type CatalogVariant,
} from './games.types';
import type { GameRoomSummary } from './rooms/game-rooms.types';

@Injectable()
export class GamesCatalogService {
  constructor(
    private readonly visibility: GameVisibilityService,
    private readonly ruleVisibility: GameRuleVisibilityService,
    private readonly roleResolver: UserRoleResolver,
  ) {}

  async resolveRole(userId?: string): Promise<UserRole> {
    return this.roleResolver.resolveRole(userId);
  }

  async assertVisible(role: UserRole, gameId: string, variant?: string) {
    return this.visibility.assertVisible(role, gameId, variant);
  }

  async getRulesForGame(gameId: string) {
    return this.ruleVisibility.getRulesForGame(gameId);
  }

  async filterVisible(
    role: UserRole,
    rooms: GameRoomSummary[],
    getVariant: (r: GameRoomSummary) => { gameId: string; variantId?: string },
  ) {
    return this.visibility.filterVisible(role, rooms, getVariant);
  }

  async getCatalog(userId?: string): Promise<CatalogResponse> {
    const role = await this.roleResolver.resolveRole(userId);
    const allRuleMaps = await this.ruleVisibility.getAllRules();
    const games: CatalogGame[] = [];
    for (const entry of GAME_CATALOG) {
      const visible = await this.visibility.canSee(role, entry.gameId);
      if (!visible) {
        games.push({
          gameId: entry.gameId,
          comingSoon: true,
          themes: [],
          variants: [],
          rules: entry.rules.map((r) => ({
            ruleId: r.ruleId,
            comingSoon: true,
          })),
        });
        continue;
      }

      const themes: CatalogTheme[] = entry.themes.map((t) => ({
        id: t,
        comingSoon: false,
      }));

      const variants: CatalogVariant[] = [];
      for (const v of entry.variants) {
        const visible = await this.visibility.canSee(role, entry.gameId, v);
        variants.push({ id: v, comingSoon: !visible });
      }

      const ruleMap = allRuleMaps.get(entry.gameId);
      const rules = entry.rules.map((r) => ({
        ruleId: r.ruleId,
        comingSoon: ruleMap ? !(ruleMap.get(r.ruleId) ?? true) : false,
      }));

      games.push({
        gameId: entry.gameId,
        comingSoon: false,
        themes,
        variants,
        rules,
      });
    }
    return { games };
  }

  stripDisabledRules(
    gameOptions: Record<string, unknown>,
    ruleMap: Map<string, boolean>,
  ): void {
    if (ruleMap.get('gridSize') === false) {
      delete gameOptions.gridSize;
    }

    const sw = gameOptions.specialWeapons;
    if (typeof sw === 'object' && sw !== null) {
      const weapons = sw as Record<string, unknown>;
      if (ruleMap.get('sonar') === false) {
        delete weapons.sonar;
      }
      if (ruleMap.get('radar') === false) {
        delete weapons.radar;
      }
      if (Object.keys(weapons).length === 0) {
        delete gameOptions.specialWeapons;
      }
    }

    if (ruleMap.get('teams') === false) {
      delete gameOptions.teams;
      delete gameOptions.teamConfig;
      if (gameOptions.mode === 'team') {
        delete gameOptions.mode;
      }
    }

    if (ruleMap.get('combos') === false) {
      delete gameOptions.expansions;
    }
  }
}
