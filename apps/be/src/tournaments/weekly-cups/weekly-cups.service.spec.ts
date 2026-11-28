import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { WeeklyCupsService, computeNextCupDate } from './weekly-cups.service';
import {
  WEEKLY_CUP_DEFINITIONS,
  WEEKLY_CUP_GAMES,
  isWeeklyCupGame,
  type WeeklyCupGame,
} from './weekly-cups.config';
import { Tournament } from '../schemas/tournament.schema';
import { TournamentSetting } from '../schemas/tournament-setting.schema';
import { TournamentsBracketsService } from '../tournaments.brackets.service';
import { NotificationDispatcher } from '../../notifications/notifications.dispatcher';

const oid = () => new Types.ObjectId();

describe.each(WEEKLY_CUP_GAMES)(
  'WeeklyCupsService (%s)',
  (game: WeeklyCupGame) => {
    const def = WEEKLY_CUP_DEFINITIONS[game];
    let service: WeeklyCupsService;
    let model: {
      findOne: jest.Mock;
      find: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
    };
    let settingModel: {
      findOne: jest.Mock;
      findOneAndUpdate: jest.Mock;
    };
    let bracketsService: {
      generateBracket: jest.Mock;
      getPublicBracket: jest.Mock;
      reportResult: jest.Mock;
    };
    let dispatcher: {
      dispatchMany: jest.Mock;
    };

    beforeEach(async () => {
      model = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      };
      settingModel = {
        findOne: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
        findOneAndUpdate: jest.fn().mockResolvedValue({
          enabled: true,
          prizePoolCoins: def.defaultPrizePoolCoins,
          prizeDescription: def.defaultPrizeDescription,
        }),
      };
      bracketsService = {
        generateBracket: jest.fn(),
        getPublicBracket: jest.fn(),
        reportResult: jest.fn(),
      };
      dispatcher = {
        dispatchMany: jest.fn(),
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          WeeklyCupsService,
          { provide: getModelToken(Tournament.name), useValue: model },
          {
            provide: getModelToken(TournamentSetting.name),
            useValue: settingModel,
          },
          { provide: TournamentsBracketsService, useValue: bracketsService },
          { provide: NotificationDispatcher, useValue: dispatcher },
        ],
      }).compile();

      service = moduleRef.get(WeeklyCupsService);
    });

    describe('computeNextCupDate', () => {
      it('returns a future date on the configured weekday and hour', () => {
        const now = new Date('2026-10-07T12:00:00Z');
        const target = computeNextCupDate(def, now);
        expect(target.getUTCDay()).toBe(def.weekdayUtc);
        expect(target.getUTCHours()).toBe(def.hourUtc);
        expect(target.getTime()).toBeGreaterThan(now.getTime());
      });

      it('rolls to the following week when the slot has just passed', () => {
        const slot = computeNextCupDate(def, new Date('2026-10-07T12:00:00Z'));
        const next = computeNextCupDate(def, new Date(slot.getTime() + 1000));
        expect(next.getTime() - slot.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
      });

      it('returns the same slot when called one second before it', () => {
        const slot = computeNextCupDate(def, new Date('2026-10-07T12:00:00Z'));
        const same = computeNextCupDate(def, new Date(slot.getTime() - 1000));
        expect(same.getTime()).toBe(slot.getTime());
      });
    });

    describe('getConfig and updateConfig', () => {
      it('defaults to game prize and enabled when setting is absent', async () => {
        settingModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });
        const config = await service.getConfig(game);
        expect(config).toEqual({
          enabled: true,
          prizePoolCoins: def.defaultPrizePoolCoins,
          prizeDescription: def.defaultPrizeDescription,
        });
        const isEnabled = await service.isEnabled(game);
        expect(isEnabled).toBe(true);
      });

      it('returns stored setting value', async () => {
        settingModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            enabled: false,
            prizePoolCoins: 1200,
            prizeDescription: '1200 Coins + Golden Fleet',
          }),
        });
        const config = await service.getConfig(game);
        expect(config).toEqual({
          enabled: false,
          prizePoolCoins: 1200,
          prizeDescription: '1200 Coins + Golden Fleet',
        });
        const isEnabled = await service.isEnabled(game);
        expect(isEnabled).toBe(false);
      });

      it('updates setting via updateBlitzCupConfig', async () => {
        const res = await service.updateConfig(
          game,
          {
            enabled: false,
            prizePoolCoins: 1000,
            prizeDescription: '1000 Coins + Golden Trophy',
          },
          oid().toString(),
        );
        expect(res).toEqual({
          ok: true,
          enabled: true,
          prizePoolCoins: def.defaultPrizePoolCoins,
          prizeDescription: def.defaultPrizeDescription,
        });
        expect(settingModel.findOneAndUpdate).toHaveBeenCalledWith(
          { key: def.settingKey },
          {
            $set: {
              enabled: false,
              prizePoolCoins: 1000,
              prizeDescription: '1000 Coins + Golden Trophy',
              updatedBy: expect.any(Types.ObjectId) as Types.ObjectId,
            },
          },
          { upsert: true, new: true },
        );
        expect(model.updateMany).toHaveBeenCalledWith(
          {
            gameType: def.gameType,
            status: { $in: ['scheduled', 'registration_open'] },
          },
          {
            $set: {
              prizePoolCoins: 1000,
              prizeDescription: '1000 Coins + Golden Trophy',
            },
          },
        );
      });
    });

    describe('ensureUpcomingBlitzCup', () => {
      it('returns null and does not query or create if disabled', async () => {
        settingModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue({ enabled: false }),
        });
        const res = await service.ensureUpcomingCup(game);
        expect(res).toBeNull();
        expect(model.findOne).not.toHaveBeenCalled();
        expect(model.create).not.toHaveBeenCalled();
      });

      it('returns existing tournament if active one already exists', async () => {
        const existingDoc = { _id: oid(), status: 'registration_open' };
        model.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingDoc),
        });

        const res = await service.ensureUpcomingCup(game);
        expect(res).toBe(existingDoc);
        expect(model.create).not.toHaveBeenCalled();
      });

      it('creates a new cup when none exists', async () => {
        model.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });
        const createdDoc = { _id: oid(), status: 'registration_open' };
        model.create.mockResolvedValue(createdDoc);

        const res = await service.ensureUpcomingCup(game);
        expect(res).toBe(createdDoc);
        expect(model.create).toHaveBeenCalledWith(
          expect.objectContaining({
            gameType: def.gameType,
            status: 'registration_open',
            maxPlayers: def.maxPlayers,
            prizePoolCoins: def.defaultPrizePoolCoins,
          }),
        );
      });
    });

    describe('startBlitzCupIfDue', () => {
      it('starts cup and generates single elimination bracket when >= 2 players', async () => {
        const p1 = oid();
        const p2 = oid();
        const cupId = oid();
        const cupDoc = {
          _id: cupId,
          status: 'registration_open',
          scheduledAt: new Date(Date.now() - 10000),
          registrations: [
            { userId: p1, waitlist: false },
            { userId: p2, waitlist: false },
          ],
          content: { en: { name: 'Sea Battle Cup' } },
          save: jest.fn().mockResolvedValue(undefined),
        };

        model.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue([cupDoc]),
        });

        await service.startCupIfDue(game);

        expect(cupDoc.status).toBe('live');
        expect(cupDoc.save).toHaveBeenCalled();
        expect(bracketsService.generateBracket).toHaveBeenCalledWith(
          cupId.toString(),
          { format: 'single_elimination' },
        );
        expect(dispatcher.dispatchMany).toHaveBeenCalled();
      });

      it('reschedules cup when less than 2 players registered', async () => {
        const cupId = oid();
        const cupDoc = {
          _id: cupId,
          status: 'registration_open',
          scheduledAt: new Date(Date.now() - 10000),
          registrations: [],
          save: jest.fn().mockResolvedValue(undefined),
        };

        model.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue([cupDoc]),
        });

        await service.startCupIfDue(game);

        expect(cupDoc.status).toBe('registration_open');
        expect(cupDoc.scheduledAt.getTime()).toBeGreaterThan(Date.now());
        expect(cupDoc.save).toHaveBeenCalled();
        expect(bracketsService.generateBracket).not.toHaveBeenCalled();
      });
    });

    describe('getCup', () => {
      it('returns empty null payload when no tournament found', async () => {
        model.findOne.mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        });

        const res = await service.getCup(game, 'en', false);
        expect(res.tournament).toBeNull();
        expect(res.bracket).toBeNull();
        expect(res.countdownSeconds).toBe(0);
      });

      it('returns tournament summary, bracket and countdownSeconds', async () => {
        const cupId = oid();
        const futureDate = new Date(Date.now() + 60000);
        const cupDoc = {
          _id: cupId,
          gameType: def.gameType,
          status: 'registration_open',
          scheduledAt: futureDate,
          registrationOpensAt: new Date(Date.now() - 10000),
          registrationClosesAt: futureDate,
          maxPlayers: 16,
          prizeDescription: '500 Coins',
          resultText: null,
          entryFeeCoins: 0,
          prizePoolCoins: 500,
          registrations: [
            {
              userId: oid(),
              displayName: 'Admiral Nemo',
              waitlist: false,
            },
          ],
          content: {
            en: { name: 'Sea Battle Cup', description: 'Naval cup' },
          },
          bracket: { format: 'single_elimination' },
        };

        model.findOne.mockReturnValue({
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(cupDoc),
        });

        bracketsService.getPublicBracket.mockResolvedValue({
          bracket: {
            tournamentId: cupId.toString(),
            status: 'registration_open',
            format: 'single_elimination',
            rounds: [],
          },
        });

        const res = await service.getCup(game, 'en', false);
        expect(res.tournament).not.toBeNull();
        expect(res.tournament?.id).toBe(cupId.toString());
        expect(res.tournament?.name).toBe('Sea Battle Cup');
        expect(res.bracket).not.toBeNull();
        expect(res.countdownSeconds).toBeGreaterThan(0);
        expect(res.captains).toHaveLength(1);
        expect(res.captains[0].displayName).toBe('Admiral Nemo');
        expect(res.captains[0].seed).toBe(1);
      });
    });

    describe('reportMatchResult', () => {
      it('delegates to bracketsService.reportResult', async () => {
        const cupId = oid().toString();
        const winnerId = oid().toString();
        await service.reportMatchResult(cupId, 1, 0, winnerId);
        expect(bracketsService.reportResult).toHaveBeenCalledWith(
          cupId,
          1,
          0,
          winnerId,
        );
      });
    });

    describe('definitions', () => {
      it('uses a distinct game type and setting key per game', () => {
        const types = WEEKLY_CUP_GAMES.map(
          (g) => WEEKLY_CUP_DEFINITIONS[g].gameType,
        );
        const keys = WEEKLY_CUP_GAMES.map(
          (g) => WEEKLY_CUP_DEFINITIONS[g].settingKey,
        );
        expect(new Set(types).size).toBe(types.length);
        expect(new Set(keys).size).toBe(keys.length);
      });

      it('has copy in all five locales and no em dashes', () => {
        for (const locale of ['en', 'ru', 'es', 'fr', 'by'] as const) {
          const item = def.content[locale];
          expect(item.name.length).toBeGreaterThan(0);
          expect(`${item.name}${item.description ?? ''}`).not.toContain(
            '\u2014',
          );
        }
      });

      it('guards game keys', () => {
        expect(isWeeklyCupGame(game)).toBe(true);
        expect(isWeeklyCupGame('chess')).toBe(false);
        expect(isWeeklyCupGame(undefined)).toBe(false);
      });
    });
  },
);
