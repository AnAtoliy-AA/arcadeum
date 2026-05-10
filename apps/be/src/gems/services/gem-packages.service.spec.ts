import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { GemPackagesService } from './gem-packages.service';
import { GemPackage } from '../schemas/gem-package.schema';
import { GemPurchase } from '../schemas/gem-purchase.schema';

const oid = () => new Types.ObjectId();

const buildPackageDoc = (
  overrides: Partial<{
    _id: Types.ObjectId;
    name: string;
    gems: number;
    bonusGems: number;
    priceUsd: number;
    displayOrder: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
) => ({
  _id: overrides._id ?? oid(),
  name: overrides.name ?? 'Starter Pack',
  gems: overrides.gems ?? 100,
  bonusGems: overrides.bonusGems ?? 0,
  priceUsd: overrides.priceUsd ?? 499,
  displayOrder: overrides.displayOrder ?? 0,
  active: overrides.active ?? true,
  createdAt: overrides.createdAt ?? new Date('2026-01-01'),
  updatedAt: overrides.updatedAt ?? new Date('2026-01-01'),
});

const buildFindChain = (docs: unknown[]) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(docs),
});

const buildFindByIdAndUpdateChain = (doc: unknown) => ({
  lean: jest.fn().mockResolvedValue(doc),
});

describe('GemPackagesService', () => {
  let service: GemPackagesService;
  let packageModel: {
    find: jest.Mock;
    create: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    deleteOne: jest.Mock;
  };
  let purchaseModel: {
    exists: jest.Mock;
  };

  beforeEach(async () => {
    packageModel = {
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    purchaseModel = {
      exists: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        GemPackagesService,
        { provide: getModelToken(GemPackage.name), useValue: packageModel },
        { provide: getModelToken(GemPurchase.name), useValue: purchaseModel },
      ],
    }).compile();

    service = moduleRef.get(GemPackagesService);
  });

  describe('listActive', () => {
    it('returns only active packages sorted by displayOrder then _id', async () => {
      const doc1 = buildPackageDoc({ displayOrder: 1, active: true });
      const doc2 = buildPackageDoc({ displayOrder: 0, active: true });
      packageModel.find.mockReturnValue(buildFindChain([doc2, doc1]));

      const result = await service.listActive();

      expect(packageModel.find).toHaveBeenCalledWith({ active: true });
      expect(result).toHaveLength(2);
      expect(result[0].displayOrder).toBe(0);
      expect(result[1].displayOrder).toBe(1);
      // Public view has no active field
      expect(Object.keys(result[0])).not.toContain('active');
    });

    it('maps priceUsd (schema cents) to priceUsdCents (interface)', async () => {
      const doc = buildPackageDoc({ priceUsd: 999 });
      packageModel.find.mockReturnValue(buildFindChain([doc]));

      const [pkg] = await service.listActive();

      expect(pkg.priceUsdCents).toBe(999);
    });
  });

  describe('listAllForAdmin', () => {
    it('includes both active and inactive packages', async () => {
      const active = buildPackageDoc({ active: true });
      const inactive = buildPackageDoc({ active: false });
      packageModel.find.mockReturnValue(buildFindChain([active, inactive]));

      const result = await service.listAllForAdmin();

      expect(packageModel.find).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      // Admin view includes active flag
      expect(result.find((p) => !p.active)).toBeDefined();
    });

    it('includes createdAt and updatedAt in admin view', async () => {
      const doc = buildPackageDoc({
        createdAt: new Date('2026-03-01'),
        updatedAt: new Date('2026-04-01'),
      });
      packageModel.find.mockReturnValue(buildFindChain([doc]));

      const [pkg] = await service.listAllForAdmin();

      expect(pkg.createdAt).toBe('2026-03-01T00:00:00.000Z');
      expect(pkg.updatedAt).toBe('2026-04-01T00:00:00.000Z');
    });
  });

  describe('create', () => {
    it('persists with provided values and returns admin view', async () => {
      const id = oid();
      const created = buildPackageDoc({
        _id: id,
        name: 'Pro Pack',
        gems: 500,
        bonusGems: 50,
        priceUsd: 999,
        displayOrder: 2,
        active: true,
      });
      packageModel.create.mockResolvedValue({ toObject: () => created });

      const result = await service.create({
        name: 'Pro Pack',
        gems: 500,
        bonusGems: 50,
        priceUsdCents: 999,
        displayOrder: 2,
        active: true,
      });

      expect(packageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Pro Pack',
          gems: 500,
          bonusGems: 50,
          priceUsd: 999,
          displayOrder: 2,
          active: true,
        }),
      );
      expect(result.priceUsdCents).toBe(999);
      expect(result.id).toBe(id.toString());
    });

    it('applies defaults for optional fields when omitted', async () => {
      const created = buildPackageDoc({
        bonusGems: 0,
        displayOrder: 0,
        active: true,
      });
      packageModel.create.mockResolvedValue({ toObject: () => created });

      await service.create({ name: 'Basic', gems: 100, priceUsdCents: 199 });

      expect(packageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bonusGems: 0,
          displayOrder: 0,
          active: true,
        }),
      );
    });
  });

  describe('update', () => {
    it('returns updated admin view on success', async () => {
      const id = oid();
      const updated = buildPackageDoc({
        _id: id,
        name: 'Updated Pack',
        priceUsd: 1299,
      });
      packageModel.findByIdAndUpdate.mockReturnValue(
        buildFindByIdAndUpdateChain(updated),
      );

      const result = await service.update(id.toString(), {
        name: 'Updated Pack',
        priceUsdCents: 1299,
      });

      expect(result.name).toBe('Updated Pack');
      expect(result.priceUsdCents).toBe(1299);
    });

    it('throws NotFoundException when package not found', async () => {
      packageModel.findByIdAndUpdate.mockReturnValue(
        buildFindByIdAndUpdateChain(null),
      );

      await expect(
        service.update(new Types.ObjectId().toString(), { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('maps priceUsdCents to priceUsd in the update payload', async () => {
      const id = oid();
      const updated = buildPackageDoc({ _id: id, priceUsd: 750 });
      packageModel.findByIdAndUpdate.mockReturnValue(
        buildFindByIdAndUpdateChain(updated),
      );

      await service.update(id.toString(), { priceUsdCents: 750 });

      expect(packageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id.toString(),
        expect.objectContaining({ priceUsd: 750 }),
        { new: true },
      );
    });
  });

  describe('delete', () => {
    it('throws BadRequestException when pending purchases exist', async () => {
      const id = oid();
      purchaseModel.exists.mockResolvedValue({ _id: oid() });

      await expect(service.delete(id.toString())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('succeeds when only completed/failed purchases reference the package', async () => {
      const id = oid();
      purchaseModel.exists.mockResolvedValue(null);
      packageModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await expect(service.delete(id.toString())).resolves.toBeUndefined();
      expect(packageModel.deleteOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(id.toString()),
      });
    });

    it('throws NotFoundException when package does not exist', async () => {
      const id = oid();
      purchaseModel.exists.mockResolvedValue(null);
      packageModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.delete(id.toString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
