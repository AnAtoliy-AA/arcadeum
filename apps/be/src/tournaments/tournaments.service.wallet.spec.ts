/**
 * TournamentsService — wallet-touching flows (Tasks 7-10).
 * Kept separate to stay under the 500-line file limit.
 */
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { InsufficientFundsException } from '../wallet/exceptions/insufficient-funds.exception';
import {
  buildDoc,
  buildFindByIdChain,
  buildMockSession,
  buildModel,
  buildWalletService,
  buildConnection,
  buildServiceModule,
  oid,
} from './tournaments.service.spec';
import type { TournamentsService } from './tournaments.service';

describe('TournamentsService — wallet flows', () => {
  let service: TournamentsService;
  let model: ReturnType<typeof buildModel>;
  let walletService: ReturnType<typeof buildWalletService>;
  let connection: ReturnType<typeof buildConnection>;

  beforeEach(async () => {
    model = buildModel();
    walletService = buildWalletService();
    connection = buildConnection();
    service = await buildServiceModule(model, walletService, connection);
  });

  // ── Task 7: register with entry fee ─────────────────────────────────────

  describe('register — with entry fee (Task 7)', () => {
    it('debits the wallet then writes the registration in one transaction', async () => {
      const id = oid();
      const userId = oid().toString();
      const mockSession = buildMockSession();
      connection.startSession.mockResolvedValue(mockSession);

      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(
          buildDoc({
            _id: id,
            status: 'registration_open',
            entryFeeCoins: 50,
          }),
        ),
      });
      model.findByIdAndUpdate.mockResolvedValue({});
      walletService.debit.mockResolvedValue({ id: 'tx1', delta: -50 });

      const result = await service.register(id.toString(), userId, null);

      expect(result.ok).toBe(true);
      expect(walletService.debit).toHaveBeenCalledWith(
        userId,
        'coins',
        50,
        'tournament_entry',
        `tournament-${id.toHexString()}-entry-${userId}`,
        { tournamentId: id.toHexString() },
        mockSession,
      );
      expect(walletService.emitAfterCommit).toHaveBeenCalled();
    });

    it('rejects with InsufficientFundsException and does NOT write the registration', async () => {
      const id = oid();
      const userId = oid().toString();
      const mockSession = buildMockSession();
      connection.startSession.mockResolvedValue(mockSession);

      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(
          buildDoc({
            _id: id,
            status: 'registration_open',
            entryFeeCoins: 50,
          }),
        ),
      });
      walletService.debit.mockRejectedValue(
        new InsufficientFundsException('coins', 50, 0),
      );

      await expect(
        service.register(id.toString(), userId, null),
      ).rejects.toBeInstanceOf(InsufficientFundsException);
      expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('skips the wallet entirely when entryFeeCoins is 0', async () => {
      const id = oid();
      const userId = oid().toString();
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(
          buildDoc({
            _id: id,
            status: 'registration_open',
            entryFeeCoins: 0,
          }),
        ),
      });
      model.findByIdAndUpdate.mockResolvedValue({});

      await service.register(id.toString(), userId, null);

      expect(walletService.debit).not.toHaveBeenCalled();
      expect(connection.startSession).not.toHaveBeenCalled();
    });
  });

  // ── Task 8: unregister with refund ───────────────────────────────────────

  describe('unregister', () => {
    it('forbids unregister for live or completed tournaments', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValue(buildDoc({ _id: id, status: 'live' })),
      });
      await expect(
        service.unregister(id.toString(), oid().toString()),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('pulls registration without fee for scheduled/registration_open', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(
          buildDoc({
            _id: id,
            status: 'registration_open',
            entryFeeCoins: 0,
          }),
        ),
      });
      model.findByIdAndUpdate.mockResolvedValue({});
      await expect(
        service.unregister(id.toString(), oid().toString()),
      ).resolves.toBeUndefined();
      expect(walletService.credit).not.toHaveBeenCalled();
    });
  });

  describe('unregister — with refund (Task 8)', () => {
    it('refunds the entry fee when status is registration_open', async () => {
      const id = oid();
      const userId = oid().toString();
      const mockSession = buildMockSession();
      connection.startSession.mockResolvedValue(mockSession);

      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(
          buildDoc({
            _id: id,
            status: 'registration_open',
            entryFeeCoins: 50,
          }),
        ),
      });
      model.findByIdAndUpdate.mockResolvedValue({});
      walletService.credit.mockResolvedValue({ id: 'tx2', delta: 50 });

      await service.unregister(id.toString(), userId);

      expect(walletService.credit).toHaveBeenCalledWith(
        userId,
        'coins',
        50,
        'tournament_refund',
        `tournament-${id.toHexString()}-refund-${userId}`,
        { tournamentId: id.toHexString() },
        mockSession,
      );
      expect(walletService.emitAfterCommit).toHaveBeenCalled();
    });

    it('refunds when status is scheduled (also pre-start)', async () => {
      const id = oid();
      const userId = oid().toString();
      const mockSession = buildMockSession();
      connection.startSession.mockResolvedValue(mockSession);

      model.findById.mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValue(
            buildDoc({ _id: id, status: 'scheduled', entryFeeCoins: 50 }),
          ),
      });
      model.findByIdAndUpdate.mockResolvedValue({});
      walletService.credit.mockResolvedValue({ id: 'tx3', delta: 50 });

      await service.unregister(id.toString(), userId);
      expect(walletService.credit).toHaveBeenCalled();
    });

    it('does not refund when entryFeeCoins is 0', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(
          buildDoc({
            _id: id,
            status: 'registration_open',
            entryFeeCoins: 0,
          }),
        ),
      });
      model.findByIdAndUpdate.mockResolvedValue({});

      await service.unregister(id.toString(), oid().toString());
      expect(walletService.credit).not.toHaveBeenCalled();
    });
  });

  // ── Task 9: transition → cancelled refunds all paid registrants ──────────

  describe('transition → cancelled — refunds all paid registrants (Task 9)', () => {
    it('refunds every registration when entryFeeCoins > 0', async () => {
      const id = oid();
      const u1 = oid();
      const u2 = oid();
      const mockSession = buildMockSession();
      connection.startSession.mockResolvedValue(mockSession);

      model.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(
            buildDoc({
              _id: id,
              status: 'registration_open',
              entryFeeCoins: 30,
              registrations: [
                {
                  userId: u1,
                  displayName: null,
                  registeredAt: new Date(),
                  waitlist: false,
                },
                {
                  userId: u2,
                  displayName: null,
                  registeredAt: new Date(),
                  waitlist: false,
                },
              ],
            }),
          ),
        })
        .mockReturnValue(
          buildFindByIdChain(buildDoc({ _id: id, status: 'cancelled' })),
        );
      model.findByIdAndUpdate.mockResolvedValue({});
      walletService.credit.mockResolvedValue({ id: 'tx', delta: 30 });

      await service.transition(id.toString(), 'cancelled');

      expect(walletService.credit).toHaveBeenCalledTimes(2);
      expect(walletService.credit).toHaveBeenCalledWith(
        u1.toHexString(),
        'coins',
        30,
        'tournament_refund',
        `tournament-${id.toHexString()}-refund-${u1.toHexString()}`,
        { tournamentId: id.toHexString(), reason: 'admin_cancel' },
        mockSession,
      );
      expect(walletService.credit).toHaveBeenCalledWith(
        u2.toHexString(),
        'coins',
        30,
        'tournament_refund',
        `tournament-${id.toHexString()}-refund-${u2.toHexString()}`,
        { tournamentId: id.toHexString(), reason: 'admin_cancel' },
        mockSession,
      );
    });

    it('skips wallet when entryFeeCoins is 0', async () => {
      const id = oid();
      model.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(
            buildDoc({
              _id: id,
              status: 'registration_open',
              entryFeeCoins: 0,
              registrations: [
                {
                  userId: oid(),
                  displayName: null,
                  registeredAt: new Date(),
                  waitlist: false,
                },
              ],
            }),
          ),
        })
        .mockReturnValue(
          buildFindByIdChain(buildDoc({ _id: id, status: 'cancelled' })),
        );
      model.findByIdAndUpdate.mockResolvedValue({});

      await service.transition(id.toString(), 'cancelled');
      expect(walletService.credit).not.toHaveBeenCalled();
      expect(connection.startSession).not.toHaveBeenCalled();
    });
  });

  // ── Task 10: markComplete pays prize pool ────────────────────────────────

  describe('markComplete (Task 10)', () => {
    it('pays the prize pool to the winner and records winnerUserId', async () => {
      const id = oid();
      const winnerId = oid().toString();
      const mockSession = buildMockSession();
      connection.startSession.mockResolvedValue(mockSession);

      model.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(
            buildDoc({
              _id: id,
              status: 'live',
              prizePoolCoins: 500,
              registrations: [
                {
                  userId: new Types.ObjectId(winnerId),
                  displayName: null,
                  registeredAt: new Date(),
                  waitlist: false,
                },
              ],
            }),
          ),
        })
        .mockReturnValue(
          buildFindByIdChain(
            buildDoc({ _id: id, status: 'completed', winnerUserId: winnerId }),
          ),
        );
      model.updateOne.mockResolvedValue({ modifiedCount: 1 });
      walletService.credit.mockResolvedValue({ id: 'prize-tx', delta: 500 });

      await service.markComplete(id.toString(), winnerId);

      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: id, status: 'live' },
        { $set: { status: 'completed', winnerUserId: winnerId } },
        expect.objectContaining({ session: mockSession }),
      );
      expect(walletService.credit).toHaveBeenCalledWith(
        winnerId,
        'coins',
        500,
        'tournament_prize',
        `tournament-${id.toHexString()}-prize-${winnerId}`,
        { tournamentId: id.toHexString() },
        mockSession,
      );
    });

    it('rejects when status is not live', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValue(
            buildDoc({ _id: id, status: 'registration_open' }),
          ),
      });
      await expect(
        service.markComplete(id.toString(), oid().toString()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when winner is not a registered participant', async () => {
      const id = oid();
      model.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(
          buildDoc({
            _id: id,
            status: 'live',
            prizePoolCoins: 500,
            registrations: [
              {
                userId: oid(),
                displayName: null,
                registeredAt: new Date(),
                waitlist: false,
              },
            ],
          }),
        ),
      });
      await expect(
        service.markComplete(id.toString(), oid().toString()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('is idempotent: re-marking with the same winner is a no-op', async () => {
      const id = oid();
      const winnerId = oid().toString();
      model.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(
            buildDoc({
              _id: id,
              status: 'completed',
              winnerUserId: winnerId,
            }),
          ),
        })
        .mockReturnValue(
          buildFindByIdChain(
            buildDoc({ _id: id, status: 'completed', winnerUserId: winnerId }),
          ),
        );

      await expect(
        service.markComplete(id.toString(), winnerId),
      ).resolves.toBeDefined();
      expect(walletService.credit).not.toHaveBeenCalled();
    });

    it('rejects re-marking with a different winner', async () => {
      const id = oid();
      const winnerId = oid().toString();
      model.findById.mockReturnValue({
        lean: jest
          .fn()
          .mockResolvedValue(
            buildDoc({ _id: id, status: 'completed', winnerUserId: winnerId }),
          ),
      });
      await expect(
        service.markComplete(id.toString(), oid().toString()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('skips the wallet when prizePoolCoins is 0', async () => {
      const id = oid();
      const winnerId = oid().toString();
      const mockSession = buildMockSession();
      connection.startSession.mockResolvedValue(mockSession);

      model.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue(
            buildDoc({
              _id: id,
              status: 'live',
              prizePoolCoins: 0,
              registrations: [
                {
                  userId: new Types.ObjectId(winnerId),
                  displayName: null,
                  registeredAt: new Date(),
                  waitlist: false,
                },
              ],
            }),
          ),
        })
        .mockReturnValue(
          buildFindByIdChain(
            buildDoc({ _id: id, status: 'completed', winnerUserId: winnerId }),
          ),
        );
      model.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.markComplete(id.toString(), winnerId);
      expect(walletService.credit).not.toHaveBeenCalled();
    });
  });
});
