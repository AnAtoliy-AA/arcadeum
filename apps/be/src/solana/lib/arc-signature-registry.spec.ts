import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ArcSignatureRegistry } from './arc-signature-registry.service';

/** In-memory stand-in honouring the unique signature index. */
function fakeModel() {
  const rows = new Map<
    string,
    { userId: Types.ObjectId; kind: string; subjectId: string }
  >();
  return {
    create: jest.fn((doc: { signature: string } & Record<string, never>) => {
      if (rows.has(doc.signature)) {
        return Promise.reject(
          Object.assign(new Error('E11000'), { code: 11000 }),
        );
      }
      rows.set(doc.signature, doc as never);
      return Promise.resolve(doc);
    }),
    findOne: jest.fn((q: { signature: { $eq: string } }) => ({
      lean: () => Promise.resolve(rows.get(q.signature.$eq) ?? null),
    })),
  };
}

const A = new Types.ObjectId().toHexString();
const B = new Types.ObjectId().toHexString();

describe('ArcSignatureRegistry', () => {
  const make = () => new ArcSignatureRegistry(fakeModel() as never);

  it('first redemption is new', async () => {
    await expect(make().redeem('s', A, 'gems', 'pkg1')).resolves.toBe('new');
  });

  it('same user, feature and subject retrying is an idempotent repeat', async () => {
    const r = make();
    await r.redeem('s', A, 'gems', 'pkg1');
    await expect(r.redeem('s', A, 'gems', 'pkg1')).resolves.toBe('repeat');
  });

  it('another user cannot redeem a signature someone else used', async () => {
    const r = make();
    await r.redeem('s', A, 'gems', 'pkg1');
    await expect(r.redeem('s', B, 'gems', 'pkg1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('one deposit cannot pay for a gem pack AND a shop item', async () => {
    const r = make();
    await r.redeem('s', A, 'gems', 'pkg1');
    await expect(r.redeem('s', A, 'shop', 'item1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('one deposit cannot pay for two different packages', async () => {
    const r = make();
    await r.redeem('s', A, 'gems', 'pkg1');
    await expect(r.redeem('s', A, 'gems', 'pkg2')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('propagates unexpected database errors', async () => {
    const model = {
      create: jest.fn().mockRejectedValue(new Error('db down')),
      findOne: jest.fn(),
    };
    await expect(
      new ArcSignatureRegistry(model as never).redeem('s', A, 'gems', 'p'),
    ).rejects.toThrow('db down');
  });
});
