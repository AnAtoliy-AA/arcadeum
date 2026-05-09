import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentNotesService } from './payment-notes.service';
import { PaymentNote } from './schemas/payment-note.schema';
import { User } from '../auth/schemas/user.schema';

const oid = () => new Types.ObjectId();

const buildNote = (
  overrides: Partial<{
    _id: Types.ObjectId;
    note: string;
    amount: number;
    currency: string;
    userId: Types.ObjectId | null;
    displayName: string | null;
    transactionId: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
  _id: overrides._id ?? oid(),
  note: overrides.note ?? 'Thanks',
  amount: overrides.amount ?? 5,
  currency: overrides.currency ?? 'USD',
  userId: overrides.userId ?? null,
  displayName: overrides.displayName ?? null,
  transactionId: overrides.transactionId ?? 'tx_1',
  isPublic: overrides.isPublic ?? true,
  createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00Z'),
  updatedAt: overrides.updatedAt ?? new Date('2026-01-02T00:00:00Z'),
});

const buildFindChain = (returnDocs: unknown[]) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(returnDocs),
});

const buildUserFindChain = (returnDocs: unknown[]) => ({
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(returnDocs),
});

describe('PaymentNotesService.listForAdmin', () => {
  let service: PaymentNotesService;
  let noteModel: {
    find: jest.Mock;
    countDocuments: jest.Mock;
  };
  let userModel: { find: jest.Mock };

  beforeEach(async () => {
    noteModel = {
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    userModel = { find: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PaymentNotesService,
        { provide: getModelToken(PaymentNote.name), useValue: noteModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    service = moduleRef.get(PaymentNotesService);
  });

  it('returns paginated results sorted by { createdAt: -1, _id: -1 }', async () => {
    const docs = [buildNote()];
    const findChain = buildFindChain(docs);
    noteModel.find.mockReturnValue(findChain);
    noteModel.countDocuments.mockResolvedValue(1);

    const result = await service.listForAdmin({ page: 1, pageSize: 50 });

    expect(noteModel.find).toHaveBeenCalledWith({});
    expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1, _id: -1 });
    expect(findChain.skip).toHaveBeenCalledWith(0);
    expect(findChain.limit).toHaveBeenCalledWith(50);
    expect(result.total).toBe(1);
    expect(result.items[0]?.note).toBe('Thanks');
  });

  it('skips correctly for higher pages (1-based)', async () => {
    const findChain = buildFindChain([]);
    noteModel.find.mockReturnValue(findChain);
    noteModel.countDocuments.mockResolvedValue(0);

    await service.listForAdmin({ page: 3, pageSize: 25 });
    expect(findChain.skip).toHaveBeenCalledWith(50);
  });

  it("visibility 'public' filters to { isPublic: true }", async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ visibility: 'public' });
    expect(noteModel.find).toHaveBeenCalledWith({ isPublic: true });
  });

  it("visibility 'private' filters to { isPublic: false }", async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ visibility: 'private' });
    expect(noteModel.find).toHaveBeenCalledWith({ isPublic: false });
  });

  it("visibility 'all' applies no isPublic constraint", async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ visibility: 'all' });
    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    const filter = calls[0]?.[0] as Record<string, unknown>;
    expect(filter).not.toHaveProperty('isPublic');
  });

  it('q matches across note, displayName, transactionId case-insensitively', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: 'alice' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    expect(calls[0]?.[0]).toEqual({
      $or: [
        { note: { $regex: 'alice', $options: 'i' } },
        { displayName: { $regex: 'alice', $options: 'i' } },
        { transactionId: { $regex: 'alice', $options: 'i' } },
      ],
    });
  });

  it('treats whitespace-only q as no filter', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: '   ' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    expect(calls[0]?.[0]).toEqual({});
  });

  it('escapes regex metacharacters in q', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: 'a*b+c(d' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    const filter = calls[0]?.[0] as {
      $or: Array<{ note: { $regex: string } }>;
    };
    expect(filter.$or?.[0]?.note?.$regex).toBe('a\\*b\\+c\\(d');
  });

  it('combines q + visibility', async () => {
    noteModel.find.mockReturnValue(buildFindChain([]));
    noteModel.countDocuments.mockResolvedValue(0);
    await service.listForAdmin({ q: 'a', visibility: 'private' });

    const calls = noteModel.find.mock.calls as unknown as Array<unknown[]>;
    const filter = calls[0]?.[0] as Record<string, unknown>;
    expect(filter.isPublic).toBe(false);
    expect(filter.$or).toBeDefined();
  });

  it('enriches userId-bearing notes with User.displayName', async () => {
    const userId = oid();
    const note = buildNote({ userId });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);
    userModel.find.mockReturnValue(
      buildUserFindChain([
        { _id: userId, displayName: 'Alice', username: 'alice' },
      ]),
    );

    const result = await service.listForAdmin({});

    expect(result.items[0]?.displayName).toBe('Alice');
  });

  it('regression: User join uses .select("_id displayName username")', async () => {
    const userId = oid();
    const note = buildNote({ userId });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);
    const userChain = buildUserFindChain([
      { _id: userId, displayName: 'Alice', username: 'alice' },
    ]);
    userModel.find.mockReturnValue(userChain);

    await service.listForAdmin({});

    expect(userChain.select).toHaveBeenCalledWith('_id displayName username');
  });

  it('falls back to displayName field when userId is null', async () => {
    const note = buildNote({ userId: null, displayName: 'Anon McGuest' });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);

    const result = await service.listForAdmin({});

    expect(result.items[0]?.displayName).toBe('Anon McGuest');
  });

  it('maps doc -> AdminPaymentNoteItem with all admin fields', async () => {
    const noteId = oid();
    const note = buildNote({
      _id: noteId,
      transactionId: 'tx_42',
      isPublic: false,
      userId: null,
      displayName: 'Anon',
    });
    noteModel.find.mockReturnValue(buildFindChain([note]));
    noteModel.countDocuments.mockResolvedValue(1);

    const result = await service.listForAdmin({});
    const item = result.items[0];
    expect(item).toBeDefined();
    if (!item) return;

    expect(item).toEqual({
      id: noteId.toString(),
      note: 'Thanks',
      amount: 5,
      currency: 'USD',
      displayName: 'Anon',
      createdAt: note.createdAt.toISOString(),
      transactionId: 'tx_42',
      isPublic: false,
      userId: null,
    });
  });

  it('total is independent of pagination slice', async () => {
    noteModel.find.mockReturnValue(buildFindChain([buildNote()]));
    noteModel.countDocuments.mockResolvedValue(123);

    const result = await service.listForAdmin({ page: 1, pageSize: 1 });
    expect(result.total).toBe(123);
    expect(result.items.length).toBe(1);
  });
});
