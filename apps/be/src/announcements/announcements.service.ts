import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import {
  Announcement,
  AnnouncementDocument,
  SEVERITY_RANK,
  type AnnouncementAudience,
  type AnnouncementLocale,
  type AnnouncementSeverity,
} from './schemas/announcement.schema';
import { escapeRegExp } from '../admin/lib/escape-regexp';
import { buildActiveFilter, deriveStatus } from './lib/announcement-status';
import type {
  AnnouncementAdminItem,
  AnnouncementContentMap,
  AnnouncementsAdminListResponse,
  AnnouncementPublicItem,
  AnnouncementLocaleContentItem,
  AnnouncementStatus,
} from './interfaces/announcement.interface';
import type { CreateAnnouncementDto } from './dto/create-announcement.dto';
import type { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import type { AdminAnnouncementsStatus } from './dto/list-admin-announcements.dto';

interface PopulatedCreator {
  _id: Types.ObjectId;
  displayName?: string | null;
}

interface AnnouncementLean {
  _id: Types.ObjectId;
  severity: AnnouncementSeverity;
  severityRank: number;
  audience: AnnouncementAudience;
  startsAt: Date | null;
  endsAt: Date | null;
  content: AnnouncementContentMap;
  createdBy: Types.ObjectId | PopulatedCreator;
  createdAt: Date;
  updatedAt: Date;
}

interface ListForAdminArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminAnnouncementsStatus;
  severity?: AnnouncementSeverity;
}

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private readonly model: Model<AnnouncementDocument>,
  ) {}

  async listForAdmin(
    args: ListForAdminArgs,
  ): Promise<AnnouncementsAdminListResponse> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 25;
    const now = new Date();

    const filter: FilterQuery<AnnouncementDocument> = {};
    if (args.severity) filter.severity = args.severity;
    if (args.q && args.q.trim()) {
      const escaped = escapeRegExp(args.q.trim());
      filter['content.en.title'] = { $regex: escaped, $options: 'i' };
    }
    if (args.status === 'active') {
      Object.assign(filter, buildActiveFilter(now));
    } else if (args.status === 'scheduled') {
      filter.startsAt = { $gt: now };
    } else if (args.status === 'expired') {
      filter.endsAt = { $ne: null, $lte: now };
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('createdBy', '_id displayName')
        .sort({ severityRank: -1, startsAt: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<AnnouncementLean[]>(),
      this.model.countDocuments(filter),
    ]);

    const items = docs.map((d) => this.toAdminItem(d, now));
    return { items, total, page, pageSize };
  }

  async getActiveForCaller(
    isAuthenticated: boolean,
    locale: AnnouncementLocale,
  ): Promise<AnnouncementPublicItem | null> {
    const now = new Date();
    const audienceFilter = isAuthenticated
      ? { audience: { $in: ['all', 'authenticated'] } }
      : { audience: { $in: ['all', 'anonymous'] } };
    const filter: FilterQuery<AnnouncementDocument> = {
      ...buildActiveFilter(now),
      ...audienceFilter,
    };
    const doc = await this.model
      .findOne(filter)
      .sort({ severityRank: -1, startsAt: -1, _id: -1 })
      .lean<AnnouncementLean | null>();
    if (!doc) return null;
    return this.toPublicItem(doc, locale);
  }

  async create(
    body: CreateAnnouncementDto,
    requesterUserId: string,
  ): Promise<AnnouncementAdminItem> {
    if (!Types.ObjectId.isValid(requesterUserId)) {
      throw new BadRequestException({ code: 'INVALID_USER_ID' });
    }
    const created = (await this.model.create({
      severity: body.severity,
      severityRank: SEVERITY_RANK[body.severity],
      audience: body.audience ?? 'all',
      startsAt: body.startsAt ?? null,
      endsAt: body.endsAt ?? null,
      content: body.content,
      createdBy: new Types.ObjectId(requesterUserId),
    })) as { _id: Types.ObjectId };
    return this.findById(created._id.toString());
  }

  async update(
    id: string,
    body: UpdateAnnouncementDto,
  ): Promise<AnnouncementAdminItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_ANNOUNCEMENT_ID' });
    }
    const $set: Record<string, unknown> = {};
    if (body.severity !== undefined) {
      $set.severity = body.severity;
      $set.severityRank = SEVERITY_RANK[body.severity];
    }
    if (body.audience !== undefined) $set.audience = body.audience;
    if (body.startsAt !== undefined) $set.startsAt = body.startsAt;
    if (body.endsAt !== undefined) $set.endsAt = body.endsAt;
    if (body.content !== undefined) $set.content = body.content;

    const updated = await this.model
      .findByIdAndUpdate(id, { $set }, { new: true })
      .lean<AnnouncementLean | null>();
    if (!updated) {
      throw new NotFoundException({ code: 'ANNOUNCEMENT_NOT_FOUND' });
    }
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_ANNOUNCEMENT_ID' });
    }
    const result = await this.model.findByIdAndDelete(id).lean();
    if (!result) {
      throw new NotFoundException({ code: 'ANNOUNCEMENT_NOT_FOUND' });
    }
  }

  async findById(id: string): Promise<AnnouncementAdminItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_ANNOUNCEMENT_ID' });
    }
    const doc = await this.model
      .findById(id)
      .populate('createdBy', '_id displayName')
      .lean<AnnouncementLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'ANNOUNCEMENT_NOT_FOUND' });
    }
    return this.toAdminItem(doc, new Date());
  }

  private toAdminItem(d: AnnouncementLean, now: Date): AnnouncementAdminItem {
    const status: AnnouncementStatus = deriveStatus(
      d.startsAt ?? null,
      d.endsAt ?? null,
      now,
    );
    const createdBy = this.extractCreator(d.createdBy);
    return {
      id: d._id.toString(),
      severity: d.severity,
      audience: d.audience,
      startsAt: d.startsAt?.toISOString() ?? null,
      endsAt: d.endsAt?.toISOString() ?? null,
      content: d.content,
      createdBy,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      status,
    };
  }

  private extractCreator(
    raw: Types.ObjectId | PopulatedCreator,
  ): { id: string; displayName: string | null } | null {
    if (raw instanceof Types.ObjectId) {
      return { id: raw.toString(), displayName: null };
    }
    if (raw && typeof raw === 'object' && '_id' in raw) {
      return {
        id: raw._id.toString(),
        displayName: raw.displayName ?? null,
      };
    }
    return null;
  }

  private toPublicItem(
    d: AnnouncementLean,
    locale: AnnouncementLocale,
  ): AnnouncementPublicItem {
    const localized: AnnouncementLocaleContentItem =
      d.content[locale] ?? d.content.en;
    const out: AnnouncementPublicItem = {
      id: d._id.toString(),
      severity: d.severity,
      updatedAt: d.updatedAt.toISOString(),
      title: localized.title,
    };
    if (localized.body) out.body = localized.body;
    if (localized.ctaLabel) out.ctaLabel = localized.ctaLabel;
    if (localized.ctaHref) out.ctaHref = localized.ctaHref;
    return out;
  }
}
