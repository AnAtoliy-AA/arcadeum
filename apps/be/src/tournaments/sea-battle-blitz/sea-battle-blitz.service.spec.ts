import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  SeaBattleBlitzService,
  computeNextBlitzCupDate,
} from './sea-battle-blitz.service';
import { Tournament } from '../schemas/tournament.schema';
import { TournamentSetting } from '../schemas/tournament-setting.schema';
import { TournamentsBracketsService } from '../tournaments.brackets.service';
import { TournamentsService } from '../tournaments.service';
import { NotificationDispatcher } from '../../notifications/notifications.dispatcher';

const oid = () => new Types.ObjectId();

describe('SeaBattleBlitzService', () => {
  let service: SeaBattleBlitzService;
  let model: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
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
  let tournamentsService: {
    listPublic: jest.Mock;
  };
  let dispatcher: {
    dispatchMany: jest.Mock;
  };

  beforeEach(async () => {
    model = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
    };
    settingModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findOneAndUpdate: jest.fn().mockResolvedValue({ enabled: true }),
    };
    bracketsService = {
      generateBracket: jest.fn(),
      getPublicBracket: jest.fn(),
      reportResult: jest.fn(),
    };
    tournamentsService = {
      listPublic: jest.fn(),
    };
    dispatcher = {
      dispatchMany: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SeaBattleBlitzService,
        { provide: getModelToken(Tournament.name), useValue: model },
        {
          provide: getModelToken(TournamentSetting.name),
          useValue: settingModel,
        },
        { provide: TournamentsBracketsService, useValue: bracketsService },
        { provide: TournamentsService, useValue: tournamentsService },
        { provide: NotificationDispatcher, useValue: dispatcher },
      ],
    }).compile();

    service = moduleRef.get(SeaBattleBlitzService);
  });

  describe('computeNextBlitzCupDate', () => {
    it('returns coming Saturday 18:00 UTC when called on a weekday', () => {
      const wednesday = new Date('2026-10-07T12:00:00Z');
      const target = computeNextBlitzCupDate(wednesday);
      expect(target.getUTCDay()).toBe(6);
      expect(target.getUTCHours()).toBe(18);
      expect(target.getUTCDate()).toBe(10);
    });

    it('returns today at 18:00 UTC if called on Saturday before 18:00', () => {
      const saturdayMorning = new Date('2026-10-10T10:00:00Z');
      const target = computeNextBlitzCupDate(saturdayMorning);
      expect(target.getUTCDay()).toBe(6);
      expect(target.getUTCDate()).toBe(10);
      expect(target.getUTCHours()).toBe(18);
    });

    it('returns next Saturday if called on Saturday after 18:00', () => {
      const saturdayNight = new Date('2026-10-10T19:00:00Z');
      const target = computeNextBlitzCupDate(saturdayNight);
      expect(target.getUTCDay()).toBe(6);
      expect(target.getUTCDate()).toBe(17);
      expect(target.getUTCHours()).toBe(18);
    });
  });

  describe('isBlitzCupEnabled and setBlitzCupEnabled', () => {
    it('defaults to true when setting is absent', async () => {
      settingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const enabled = await service.isBlitzCupEnabled();
      expect(enabled).toBe(true);
    });

    it('returns stored setting value', async () => {
      settingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ enabled: false }),
      });
      const enabled = await service.isBlitzCupEnabled();
      expect(enabled).toBe(false);
    });

    it('updates setting via setBlitzCupEnabled', async () => {
      const res = await service.setBlitzCupEnabled(false, oid().toString());
      expect(res).toEqual({ ok: true, enabled: false });
      expect(settingModel.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'sea_battle_weekly_blitz' },
        expect.anything(),
        { upsert: true, new: true },
      );
    });
  });

  describe('ensureUpcomingBlitzCup', () => {
    it('returns null and does not query or create if disabled', async () => {
      settingModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ enabled: false }),
      });
      const res = await service.ensureUpcomingBlitzCup();
      expect(res).toBeNull();
      expect(model.findOne).not.toHaveBeenCalled();
      expect(model.create).not.toHaveBeenCalled();
    });

    it('returns existing tournament if active one already exists', async () => {
      const existingDoc = { _id: oid(), status: 'registration_open' };
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingDoc),
      });

      const res = await service.ensureUpcomingBlitzCup();
      expect(res).toBe(existingDoc);
      expect(model.create).not.toHaveBeenCalled();
    });

    it('creates new Sea Battle Blitz Cup when none exists', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const createdDoc = { _id: oid(), status: 'registration_open' };
      model.create.mockResolvedValue(createdDoc);

      const res = await service.ensureUpcomingBlitzCup();
      expect(res).toBe(createdDoc);
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gameType: 'sea_battle_v1',
          status: 'registration_open',
          maxPlayers: 16,
          prizePoolCoins: 500,
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

      await service.startBlitzCupIfDue();

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

      await service.startBlitzCupIfDue();

      expect(cupDoc.status).toBe('registration_open');
      expect(cupDoc.scheduledAt.getTime()).toBeGreaterThan(Date.now());
      expect(cupDoc.save).toHaveBeenCalled();
      expect(bracketsService.generateBracket).not.toHaveBeenCalled();
    });
  });

  describe('getSeaBattleBlitzCup', () => {
    it('returns empty null payload when no tournament found', async () => {
      model.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const res = await service.getSeaBattleBlitzCup('en', false);
      expect(res.tournament).toBeNull();
      expect(res.bracket).toBeNull();
      expect(res.countdownSeconds).toBe(0);
    });

    it('returns tournament summary, bracket and countdownSeconds', async () => {
      const cupId = oid();
      const futureDate = new Date(Date.now() + 60000);
      const cupDoc = {
        _id: cupId,
        gameType: 'sea_battle_v1',
        status: 'registration_open',
        scheduledAt: futureDate,
        registrationOpensAt: new Date(Date.now() - 10000),
        registrationClosesAt: futureDate,
        maxPlayers: 16,
        prizeDescription: '500 Coins',
        resultText: null,
        entryFeeCoins: 0,
        prizePoolCoins: 500,
        registrations: [],
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

      const res = await service.getSeaBattleBlitzCup('en', false);
      expect(res.tournament).not.toBeNull();
      expect(res.tournament?.id).toBe(cupId.toString());
      expect(res.tournament?.name).toBe('Sea Battle Cup');
      expect(res.bracket).not.toBeNull();
      expect(res.countdownSeconds).toBeGreaterThan(0);
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
});
