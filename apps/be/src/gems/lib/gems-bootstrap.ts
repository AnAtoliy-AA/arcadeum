import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GemPackage, GemPackageDocument } from '../schemas/gem-package.schema';

interface DefaultPackage {
  name: string;
  gems: number;
  bonusGems: number;
  priceUsd: number; // cents
  displayOrder: number;
}

const DEFAULT_PACKAGES: DefaultPackage[] = [
  {
    name: 'Starter Pack',
    gems: 100,
    bonusGems: 0,
    priceUsd: 499,
    displayOrder: 1,
  },
  {
    name: 'Player Pack',
    gems: 250,
    bonusGems: 25,
    priceUsd: 999,
    displayOrder: 2,
  },
  {
    name: 'Champion Pack',
    gems: 600,
    bonusGems: 100,
    priceUsd: 1999,
    displayOrder: 3,
  },
  {
    name: 'Tournament Pack',
    gems: 1500,
    bonusGems: 400,
    priceUsd: 3999,
    displayOrder: 4,
  },
];

@Injectable()
export class GemsBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(GemsBootstrap.name);

  constructor(
    @InjectModel(GemPackage.name)
    private readonly model: Model<GemPackageDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.model.estimatedDocumentCount();
    if (count > 0) return;
    await this.model.insertMany(
      DEFAULT_PACKAGES.map((p) => ({ ...p, active: true })),
    );
    this.logger.log(
      `Seeded ${DEFAULT_PACKAGES.length} default gem packages (collection was empty)`,
    );
  }
}
