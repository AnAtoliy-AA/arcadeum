import { SeaBattleEngine } from './sea-battle.engine';
import { GAME_PHASE, CELL_STATE } from './sea-battle.constants';

describe('SeaBattleEngine — ship abilities', () => {
  const engine = new SeaBattleEngine();
  const ctx = (userId: string) => ({
    userId,
    roomId: 'r',
    sessionId: 's',
    timestamp: new Date(),
  });

  function battleState(playerIds: string[] = ['a', 'b']) {
    const s = engine.initializeState(playerIds, {
      shipAbilities: true,
    });
    s.phase = GAME_PHASE.BATTLE;
    s.shipAbilities = true;

    for (const p of s.players) {
      p.placementComplete = true;
      p.shipsRemaining = 4;
      p.ships = [
        {
          id: 'carrier-1',
          name: 'Carrier',
          size: 5,
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 },
            { row: 0, col: 4 },
          ],
          hits: 0,
          sunk: false,
        },
        {
          id: 'submarine-1',
          name: 'Submarine',
          size: 3,
          cells: [
            { row: 2, col: 0 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
          ],
          hits: 0,
          sunk: false,
        },
      ];
      for (const ship of p.ships) {
        for (const cell of ship.cells) {
          p.board[cell.row][cell.col] = CELL_STATE.SHIP;
        }
      }
    }

    return s;
  }

  it('validates and executes scout ability successfully', () => {
    const s = battleState();
    const isValid = engine.validateAction(s, 'useShipAbility', ctx('a'), {
      abilityId: 'scout',
      targetPlayerId: 'b',
      row: 1,
      col: 1,
    });
    expect(isValid).toBe(true);

    const result = engine.executeAction(s, 'useShipAbility', ctx('a'), {
      abilityId: 'scout',
      targetPlayerId: 'b',
      row: 1,
      col: 1,
    });
    expect(result.success).toBe(true);
    expect(result.state?.abilityCooldowns?.['a']?.['scout']).toBe(3);
    expect(result.state?.lastSonar?.radius).toBe(1);
    expect(result.state?.lastSonar?.cells.length).toBe(9);
  });

  it('validates and executes sonar_ping with 3x3 scan area and sets lastSonar', () => {
    const s = battleState();
    const result = engine.executeAction(s, 'useShipAbility', ctx('a'), {
      abilityId: 'sonar_ping',
      targetPlayerId: 'b',
      row: 2,
      col: 2,
    });
    expect(result.success).toBe(true);
    expect(result.state?.lastSonar?.radius).toBe(1);
    expect(result.state?.lastSonar?.cells.length).toBe(9);
  });

  it('validates and executes silent_run self-buff without target', () => {
    const s = battleState();
    const isValid = engine.validateAction(s, 'useShipAbility', ctx('a'), {
      abilityId: 'silent_run',
    });
    expect(isValid).toBe(true);

    const result = engine.executeAction(s, 'useShipAbility', ctx('a'), {
      abilityId: 'silent_run',
    });
    expect(result.success).toBe(true);
    expect(result.state?.abilityCooldowns?.['a']?.['silent_run']).toBe(3);
  });

  it('fails with Unknown ability if abilityId is invalid', () => {
    const s = battleState();
    const result = engine.executeAction(s, 'useShipAbility', ctx('a'), {
      abilityId: 'non_existent_ability',
      targetPlayerId: 'b',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Unknown ability');
  });

  it('accumulates scanned cells across teammates and sanitizes for opponents', () => {
    const s = battleState(['a', 'b', 'c', 'd']);
    s.teams = [
      {
        id: 'team-1',
        name: 'Team 1',
        color: '#ff0000',
        playerIds: ['a', 'c'],
        currentShooterIndex: 0,
      },
      {
        id: 'team-2',
        name: 'Team 2',
        color: '#0000ff',
        playerIds: ['b', 'd'],
        currentShooterIndex: 0,
      },
    ];

    const r1 = engine.executeAction(s, 'useShipAbility', ctx('a'), {
      abilityId: 'scout',
      targetPlayerId: 'b',
      row: 1,
      col: 1,
    });
    expect(r1.success).toBe(true);

    const r2 = engine.executeAction(r1.state!, 'useShipAbility', ctx('c'), {
      abilityId: 'sonar_ping',
      targetPlayerId: 'b',
      row: 5,
      col: 5,
    });
    expect(r2.success).toBe(true);

    const finalState = r2.state!;
    const sanitizedA = engine.sanitizeStateForPlayer(
      finalState,
      'a',
    ) as typeof s;
    const sanitizedC = engine.sanitizeStateForPlayer(
      finalState,
      'c',
    ) as typeof s;
    const sanitizedB = engine.sanitizeStateForPlayer(
      finalState,
      'b',
    ) as typeof s;

    const scansForTeam = sanitizedA.scannedCells?.['b'] as Array<unknown>;
    expect(Array.isArray(scansForTeam)).toBe(true);
    expect(scansForTeam.length).toBe(18);

    const scansForTeammateC = sanitizedC.scannedCells?.['b'] as Array<unknown>;
    expect(scansForTeammateC.length).toBe(18);

    const scansForOpponentB = sanitizedB.scannedCells?.['b'] as Array<unknown>;
    expect(scansForOpponentB).toBeUndefined();
  });
});
