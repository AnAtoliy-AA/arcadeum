import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { TournamentsBracketsService } from './tournaments.brackets.service';
import { Tournament, type TournamentStatus } from './schemas/tournament.schema';
import type { GenerateBracketDto } from './dto/generate-bracket.dto';

const oid = () => new Types.ObjectId();

interface DocOverrides {
  _id?: Types.ObjectId;
  status?: TournamentStatus;
  registrations?: Array<{ userId: Types.ObjectId; waitlist: boolean }>;
  bracket?: Record<string, unknown> | null;
  winnerUserId?: string | null;
}

const buildDoc = (overrides: DocOverrides = {}) => ({
  _id: overrides._id ?? oid(),
  status: overrides.status ?? 'registration_open',
  gameType: 'critical_v1' as const,
  scheduledAt: new Date('2026-06-01T18:00:00Z'),
  registrationOpensAt: new Date('2026-05-25T18:00:00Z'),
  registrationClosesAt: new Date('2026-06-01T17:00:00Z'),
  maxPlayers: 16,
  prizeDescription: null,
  resultText: null,
  entryFeeCoins: 0,
  prizePoolCoins: 0,
  winnerUserId: overrides.winnerUserId ?? null,
  content: { en: { name: 'Cup' } },
  registrations:
    overrides.registrations ??
    [oid(), oid(), oid(), oid()].map((userId) => ({ userId, waitlist: false })),
  createdBy: oid(),
  createdAt: new Date('2026-04-01T00:00:00Z'),
  updatedAt: new Date('2026-04-02T00:00:00Z'),
  bracket: overrides.bracket ?? null,
});

/** Build an embedded single-elimination bracket for `n` players. */
const buildSeRounds = (
  playerIds: Types.ObjectId[],
  decided: Array<[number, number, Types.ObjectId | null]> = [],
) => {
  const rounds: Array<
    Array<{
      round: number;
      matchIndex: number;
      playerA: Types.ObjectId | null;
      playerB: Types.ObjectId | null;
      winnerUserId: Types.ObjectId | null;
    }>
  > = [];
  let slotCount = playerIds.length;
  let round = 1;
  while (slotCount > 1) {
    const matchCount = Math.ceil(slotCount / 2);
    const matches = [];
    for (let m = 0; m < matchCount; m++) {
      matches.push({
        round,
        matchIndex: m,
        playerA:
          round === 1 && playerIds[m * 2] !== undefined
            ? playerIds[m * 2]
            : null,
        playerB:
          round === 1 && playerIds[m * 2 + 1] !== undefined
            ? playerIds[m * 2 + 1]
            : null,
        winnerUserId: null,
      });
    }
    rounds.push(matches);
    slotCount = matchCount;
    round++;
  }
  for (const [r, m, w] of decided) {
    rounds[r - 1][m].winnerUserId = w;
  }
  return rounds;
};

const buildFindByIdChain = (returnDoc: unknown) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDoc),
});

const buildModel = () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
});

const buildServiceModule = async (model: ReturnType<typeof buildModel>) => {
  const moduleRef = await Test.createTestingModule({
    providers: [
      TournamentsBracketsService,
      { provide: getModelToken(Tournament.name), useValue: model },
    ],
  }).compile();
  return moduleRef.get(TournamentsBracketsService);
};

describe('TournamentsBracketsService', () => {
  let service: TournamentsBracketsService;
  let model: ReturnType<typeof buildModel>;

  beforeEach(async () => {
    model = buildModel();
    service = await buildServiceModule(model);
  });

  describe('generateBracket', () => {
    it('throws 404 when tournament missing', async () => {
      model.findById.mockReturnValue(buildFindByIdChain(null));
      await expect(
        service.generateBracket(oid().toString(), {
          format: 'single_elimination',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects invalid tournament id', async () => {
      await expect(
        service.generateBracket('nope', { format: 'single_elimination' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('requires registration_open or live status', async () => {
      model.findById.mockReturnValue(
        buildFindByIdChain(buildDoc({ status: 'scheduled' })),
      );
      await expect(
        service.generateBracket(oid().toString(), {
          format: 'single_elimination',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects fewer than 2 non-waitlist players', async () => {
      const doc = buildDoc({
        registrations: [{ userId: oid(), waitlist: false }],
      });
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      await expect(
        service.generateBracket(oid().toString(), { format: 'round_robin' }),
      ).rejects.toMatchObject({
        response: { code: 'NOT_ENOUGH_PLAYERS' },
      });
    });

    it('locks regeneration once any match has a winner', async () => {
      const p = [oid(), oid(), oid(), oid()];
      const doc = buildDoc({
        status: 'live',
        registrations: p.map((userId) => ({ userId, waitlist: false })),
        bracket: {
          format: 'single_elimination',
          rounds: buildSeRounds(p, [[1, 0, p[0]]]),
        },
      });
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      await expect(
        service.generateBracket(oid().toString(), {
          format: 'single_elimination',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows regeneration when nothing is decided yet and persists rounds', async () => {
      const p = [oid(), oid(), oid(), oid()];
      const doc = buildDoc({
        registrations: p.map((userId) => ({ userId, waitlist: false })),
        bracket: { format: 'round_robin', rounds: buildSeRounds(p) },
      });
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      await service.generateBracket(doc._id.toString(), {
        format: 'single_elimination',
      } satisfies GenerateBracketDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      const call = model.findByIdAndUpdate.mock.calls[0] as [
        string,
        { $set: { bracket: { format: string; rounds: unknown[][] } } },
      ];
      expect(call[1].$set.bracket.format).toBe('single_elimination');
      // 4 players → 2 rounds.
      expect(call[1].$set.bracket.rounds).toHaveLength(2);
      expect(call[1].$set.bracket.rounds[0]).toHaveLength(2);
    });
  });

  describe('reportResult', () => {
    const liveWithSe = (
      n = 4,
      decided: Array<[number, number, Types.ObjectId | null]> = [],
    ) => {
      const players = Array.from({ length: n }, () => oid());
      const doc = buildDoc({
        _id: oid(),
        status: 'live',
        registrations: players.map((userId) => ({ userId, waitlist: false })),
        bracket: {
          format: 'single_elimination',
          rounds: buildSeRounds(players, decided),
        },
      });
      return { doc, players };
    };

    it('requires live status', async () => {
      const { doc } = liveWithSe();
      doc.status = 'registration_open';
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      await expect(
        service.reportResult(doc._id.toString(), 1, 0, oid().toString()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws when bracket not generated', async () => {
      const doc = buildDoc({ status: 'live' });
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      await expect(
        service.reportResult(doc._id.toString(), 1, 0, oid().toString()),
      ).rejects.toMatchObject({ response: { code: 'BRACKET_NOT_GENERATED' } });
    });

    it('rejects unknown match coordinates', async () => {
      const { doc } = liveWithSe();
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      await expect(
        service.reportResult(doc._id.toString(), 9, 9, oid().toString()),
      ).rejects.toMatchObject({ response: { code: 'MATCH_NOT_FOUND' } });
    });

    it('rejects a winner who is not in the match', async () => {
      const { doc } = liveWithSe();
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      await expect(
        service.reportResult(doc._id.toString(), 1, 0, oid().toString()),
      ).rejects.toMatchObject({ response: { code: 'WINNER_NOT_IN_MATCH' } });
    });

    it('sets the winner and advances them into the next round', async () => {
      const { doc, players } = liveWithSe(4);
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      await service.reportResult(
        doc._id.toString(),
        1,
        0,
        players[0].toString(),
      );

      const call = model.findByIdAndUpdate.mock.calls[0] as [
        string,
        { $set: Record<string, unknown> },
      ];
      expect(call[1].$set['bracket.rounds.0.0.winnerUserId']).toEqual(
        players[0],
      );
      expect(call[1].$set['bracket.rounds.1.0.playerA']).toEqual(players[0]);
      expect(call[1].$set.status).toBeUndefined();
    });

    it('auto-advances byes and cascades into the final (5 players)', async () => {
      const { doc, players } = liveWithSe(5);
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      // Round 1 match 2 is the bye [p5, null].
      await service.reportResult(
        doc._id.toString(),
        1,
        2,
        players[4].toString(),
      );

      const call = model.findByIdAndUpdate.mock.calls[0] as [
        string,
        { $set: Record<string, unknown> },
      ];
      expect(call[1].$set['bracket.rounds.0.2.winnerUserId']).toEqual(
        players[4],
      );
      expect(call[1].$set['bracket.rounds.1.1.playerA']).toEqual(players[4]);
      // Structural bye in round 2 auto-decides → straight into the final.
      expect(call[1].$set['bracket.rounds.1.1.winnerUserId']).toEqual(
        players[4],
      );
      expect(call[1].$set['bracket.rounds.2.0.playerB']).toEqual(players[4]);
      expect(call[1].$set.status).toBeUndefined();
    });

    it('completes the tournament when the final is decided', async () => {
      const { doc, players } = liveWithSe(4);
      // Semifinals already reported.
      const seRounds = (
        doc.bracket as {
          rounds: Array<
            Array<{
              playerA: Types.ObjectId | null;
              playerB: Types.ObjectId | null;
              winnerUserId: Types.ObjectId | null;
            }>
          >;
        }
      ).rounds;
      seRounds[0][0].winnerUserId = players[0];
      seRounds[0][1].winnerUserId = players[2];
      seRounds[1][0].playerA = players[0];
      seRounds[1][0].playerB = players[2];
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      model.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(doc),
      });

      await service.reportResult(
        doc._id.toString(),
        2,
        0,
        players[0].toString(),
      );

      const call = model.findByIdAndUpdate.mock.calls[0] as [
        string,
        { $set: Record<string, unknown> },
      ];
      expect(call[1].$set.status).toBe('completed');
      expect(call[1].$set.winnerUserId).toBe(players[0].toString());
    });

    it('is idempotent for a repeated same-winner report', async () => {
      const players = Array.from({ length: 4 }, () => oid());
      const doc = buildDoc({
        _id: oid(),
        status: 'live',
        registrations: players.map((userId) => ({ userId, waitlist: false })),
        bracket: {
          format: 'single_elimination',
          rounds: buildSeRounds(players, [[1, 0, players[0]]]),
        },
      });
      model.findById.mockReturnValue(buildFindByIdChain(doc));

      await service.reportResult(
        doc._id.toString(),
        1,
        0,
        players[0].toString(),
      );
      expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('conflicts when changing a decided result', async () => {
      const players = Array.from({ length: 4 }, () => oid());
      const doc = buildDoc({
        _id: oid(),
        status: 'live',
        registrations: players.map((userId) => ({ userId, waitlist: false })),
        bracket: {
          format: 'single_elimination',
          rounds: buildSeRounds(players, [[1, 0, players[0]]]),
        },
      });
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      await expect(
        service.reportResult(doc._id.toString(), 1, 0, players[1].toString()),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('getPublicBracket', () => {
    it('serializes ObjectIds to strings', async () => {
      const players = [oid(), oid(), oid(), oid()];
      const doc = buildDoc({
        _id: oid(),
        status: 'live',
        registrations: players.map((userId) => ({ userId, waitlist: false })),
        bracket: {
          format: 'single_elimination',
          rounds: buildSeRounds(players),
        },
      });
      model.findById.mockReturnValue(buildFindByIdChain(doc));

      const res = await service.getPublicBracket(doc._id.toString());

      expect(res.bracket).not.toBeNull();
      expect(res.bracket?.tournamentId).toBe(doc._id.toString());
      expect(res.bracket?.status).toBe('live');
      expect(res.bracket?.format).toBe('single_elimination');
      expect(res.bracket?.rounds).toHaveLength(2);
      expect(res.bracket?.rounds[0]?.[0]?.playerA).toBe(players[0].toString());
    });

    it('returns null bracket when not generated yet', async () => {
      const doc = buildDoc();
      model.findById.mockReturnValue(buildFindByIdChain(doc));
      const res = await service.getPublicBracket(doc._id.toString());
      expect(res).toEqual({ bracket: null });
    });

    it('throws 404 for missing tournament', async () => {
      model.findById.mockReturnValue(buildFindByIdChain(null));
      await expect(
        service.getPublicBracket(oid().toString()),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
