import type { Request } from 'express';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { CriticalService } from './critical/critical.service';
import { TexasHoldemService } from './texas-holdem/texas-holdem.service';
import { GamesCatalogService } from './games-catalog.service';
import { AiVsAiService } from './ai-vs-ai/ai-vs-ai.service';
import { GAME_CATALOG } from './games.catalog';
import type { CatalogResponse, CatalogGame } from './games.types';

function reqWithUser(userId: string | undefined): Request {
  return (userId
    ? { user: { userId } }
    : { user: undefined }) as unknown as Request;
}

function buildCatalog(catalogResult: CatalogResponse): GamesCatalogService {
  return {
    getCatalog: jest.fn().mockResolvedValue(catalogResult),
    resolveRole: jest.fn(),
    assertVisible: jest.fn(),
    getRulesForGame: jest.fn(),
    filterVisible: jest.fn(),
    stripDisabledRules: jest.fn(),
  } as unknown as GamesCatalogService;
}

function buildController(catalog: GamesCatalogService): GamesController {
  return new GamesController(
    {} as unknown as GamesService,
    catalog,
    {} as unknown as CriticalService,
    {} as unknown as TexasHoldemService,
    {} as unknown as AiVsAiService,
  );
}

function buildFullCatalog(): CatalogResponse {
  const games: CatalogGame[] = GAME_CATALOG.map((entry) => ({
    gameId: entry.gameId,
    comingSoon: false,
    variants: entry.variants.map((v) => ({ id: v, comingSoon: false })),
    rules: entry.rules.map((r) => ({ ruleId: r.ruleId, comingSoon: false })),
  }));
  return { games };
}

describe('GamesController.getCatalog', () => {
  it('returns the full catalog for an admin', async () => {
    const catalog = buildCatalog(buildFullCatalog());
    const controller = buildController(catalog);

    const res = await controller.getCatalog(reqWithUser('admin-1'));
    const ids = res.games.map((g) => g.gameId);
    expect(ids).toEqual(expect.arrayContaining(['glimworm_v1', 'critical_v1']));
    expect(catalog.getCatalog).toHaveBeenCalledWith('admin-1');
  });

  it('delegates to catalog service with userId', async () => {
    const catalog = buildCatalog(buildFullCatalog());
    const controller = buildController(catalog);

    await controller.getCatalog(reqWithUser('user-1'));
    expect(catalog.getCatalog).toHaveBeenCalledWith('user-1');
  });

  it('handles undefined user', async () => {
    const catalog = buildCatalog(buildFullCatalog());
    const controller = buildController(catalog);

    await controller.getCatalog(reqWithUser(undefined));
    expect(catalog.getCatalog).toHaveBeenCalledWith(undefined);
  });
});

describe('getCatalog (catalog service integration)', () => {
  it('delegates to catalog service and returns result', async () => {
    const response: CatalogResponse = {
      games: [
        {
          gameId: 'critical_v1',
          comingSoon: false,
          variants: [
            { id: 'crime', comingSoon: true },
            { id: 'cyberpunk', comingSoon: false },
          ],
          rules: [
            { ruleId: 'combos', comingSoon: false },
            { ruleId: 'idle', comingSoon: false },
          ],
        },
      ],
    };
    const catalog = buildCatalog(response);
    const controller = buildController(catalog);

    const res = await controller.getCatalog(reqWithUser('user-1'));
    expect(res).toEqual(response);
  });
});
