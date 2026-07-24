import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GeoBlockedCountry,
  type GeoBlockedCountryDocument,
} from '../schemas/geo-blocked-country.schema';

const DEFAULT_BLOCKED_COUNTRIES = [
  { countryCode: 'CN', reason: 'Cryptocurrency transactions banned' },
  { countryCode: 'DZ', reason: 'Cryptocurrency transactions banned' },
  { countryCode: 'BD', reason: 'Cryptocurrency transactions banned' },
  { countryCode: 'NP', reason: 'Cryptocurrency transactions banned' },
  { countryCode: 'MK', reason: 'Cryptocurrency transactions banned' },
  { countryCode: 'EG', reason: 'Cryptocurrency transactions restricted' },
  { countryCode: 'IQ', reason: 'Cryptocurrency transactions restricted' },
  { countryCode: 'QA', reason: 'Cryptocurrency transactions restricted' },
  { countryCode: 'OM', reason: 'Cryptocurrency transactions restricted' },
  { countryCode: 'SA', reason: 'Cryptocurrency transactions restricted' },
];

@Injectable()
export class GeoBlockBootstrap implements OnModuleInit {
  private readonly logger = new Logger(GeoBlockBootstrap.name);

  constructor(
    @InjectModel(GeoBlockedCountry.name)
    private readonly countryModel: Model<GeoBlockedCountryDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.countryModel.countDocuments();
    if (count === 0) {
      await this.countryModel.insertMany(DEFAULT_BLOCKED_COUNTRIES);
      this.logger.log(
        `Seeded ${DEFAULT_BLOCKED_COUNTRIES.length} default blocked countries`,
      );
    }
  }
}
