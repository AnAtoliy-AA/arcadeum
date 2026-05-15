import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, FilterQuery, Model, Types } from 'mongoose';
import {
  Tournament,
  TournamentDocument,
  type TournamentGameType,
  type TournamentLocale,
  type TournamentStatus,
} from './schemas/tournament.schema';
import { escapeRegExp } from '../admin/lib/escape-regexp';
import {
  deriveEffectiveWindow,
  deriveEffectiveStatus,
} from './lib/derive-effective-window';
import { canDelete, canTransition } from './lib/transition';
import { TournamentWalletOps } from './lib/tournament-wallet-ops';
import type {
  AdminTournamentItem,
  AdminTournamentsListResponse,
  PublicTournamentItem,
  PublicTournamentsListResponse,
  RegistrationsListResponse,
  TournamentContentMap,
  TournamentLocaleContentItem,
} from './interfaces/tournament.interface';
import type { CreateTournamentDto } from './dto/create-tournament.dto';
import type { UpdateTournamentDto } from './dto/update-tournament.dto';
import type { AdminTournamentStatusFilter } from './dto/list-admin-tournaments.dto';
import { WalletService } from '../wallet/wallet.service';

interface PopulatedCreator {
  _id: Types.ObjectId;
  displayName?: string | null;
}

interface RegistrationLean {
  userId: Types.ObjectId;
  displayName?: string | null;
  registeredAt: Date;
  waitlist: boolean;
}

interface TournamentLean {
  _id: Types.ObjectId;
  status: TournamentStatus;
  gameType: TournamentGameType;
  scheduledAt: Date;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
  maxPlayers: number;
  prizeDescription: string | null;
  resultText: string | null;
  entryFeeCoins: number;
  prizePoolCoins: number;
  winnerUserId: string | null;
  content: TournamentContentMap;
  registrations: RegistrationLean[];
  createdBy: Types.ObjectId | PopulatedCreator;
  createdAt: Date;
  updatedAt: Date;
}

interface ListForAdminArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminTournamentStatusFilter;
  gameType?: TournamentGameType;
}

@Injectable()
export class TournamentsService {
  private readonly walletOps: TournamentWalletOps;

  constructor(
    @InjectModel(Tournament.name)
    private readonly model: Model<TournamentDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly wallet: WalletService,
  ) {
    this.walletOps = new TournamentWalletOps(connection, wallet, model);
  }

  async listForAdmin(
    args: ListForAdminArgs,
  ): Promise<AdminTournamentsListResponse> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 25;

    const filter: FilterQuery<TournamentDocument> = {};
    if (args.gameType) filter.gameType = args.gameType;
    if (args.status && args.status !== 'all') filter.status = args.status;
    if (args.q && args.q.trim()) {
      filter['content.en.name'] = {
        $regex: escapeRegExp(args.q.trim()),
        $options: 'i',
      };
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .populate('createdBy', '_id displayName')
        .sort({ scheduledAt: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<TournamentLean[]>(),
      this.model.countDocuments(filter),
    ]);

    return {
      items: docs.map((d) => this.toAdminItem(d)),
      total,
      page,
      pageSize,
    };
  }

  async listPublic(
    locale: TournamentLocale,
    isAuthenticated: boolean,
    callerUserId?: string,
  ): Promise<PublicTournamentsListResponse> {
    const docs = await this.model
      .find({ status: { $ne: 'cancelled' } })
      .sort({ scheduledAt: 1, _id: 1 })
      .limit(50)
      .lean<TournamentLean[]>();
    const now = new Date();
    const items = docs.map((d): PublicTournamentItem => {
      const localized: TournamentLocaleContentItem =
        d.content[locale] ?? d.content.en;
      const registeredCount = d.registrations.filter((r) => !r.waitlist).length;
      const waitlistCount = d.registrations.length - registeredCount;
      const userMatch =
        isAuthenticated && callerUserId
          ? d.registrations.find((r) => r.userId.toString() === callerUserId)
          : undefined;
      const out: PublicTournamentItem = {
        id: d._id.toString(),
        gameType: d.gameType,
        scheduledAt: d.scheduledAt.toISOString(),
        registrationOpensAt: d.registrationOpensAt?.toISOString() ?? null,
        registrationClosesAt: d.registrationClosesAt?.toISOString() ?? null,
        maxPlayers: d.maxPlayers,
        prizeDescription: d.prizeDescription ?? null,
        resultText: d.resultText ?? null,
        status: d.status,
        effectiveStatus: deriveEffectiveStatus({
          status: d.status,
          scheduledAt: d.scheduledAt,
          registrationOpensAt: d.registrationOpensAt,
          registrationClosesAt: d.registrationClosesAt,
          now,
        }),
        registeredCount,
        waitlistCount,
        isRegistered: !!userMatch,
        isWaitlisted: !!userMatch?.waitlist,
        name: localized.name,
      };
      if (localized.description) out.description = localized.description;
      return out;
    });
    return { items, total: items.length };
  }

  async create(
    body: CreateTournamentDto,
    requesterUserId: string,
  ): Promise<AdminTournamentItem> {
    if (!Types.ObjectId.isValid(requesterUserId)) {
      throw new BadRequestException({ code: 'INVALID_USER_ID' });
    }
    const window = deriveEffectiveWindow(
      body.scheduledAt,
      body.registrationOpensAt ?? null,
      body.registrationClosesAt ?? null,
    );
    const created = (await this.model.create({
      status: 'scheduled',
      gameType: body.gameType,
      scheduledAt: body.scheduledAt,
      registrationOpensAt:
        body.registrationOpensAt ?? window.registrationOpensAt,
      registrationClosesAt:
        body.registrationClosesAt ?? window.registrationClosesAt,
      maxPlayers: body.maxPlayers,
      prizeDescription: body.prizeDescription ?? null,
      resultText: null,
      entryFeeCoins: body.entryFeeCoins ?? 0,
      prizePoolCoins: body.prizePoolCoins ?? 0,
      winnerUserId: null,
      content: body.content,
      registrations: [],
      createdBy: new Types.ObjectId(requesterUserId),
    })) as { _id: Types.ObjectId };
    return this.findAdminItem(created._id.toString());
  }

  async update(
    id: string,
    body: UpdateTournamentDto,
  ): Promise<AdminTournamentItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const $set: Record<string, unknown> = {};
    if (body.gameType !== undefined) $set.gameType = body.gameType;
    if (body.scheduledAt !== undefined) $set.scheduledAt = body.scheduledAt;
    if (body.registrationOpensAt !== undefined)
      $set.registrationOpensAt = body.registrationOpensAt;
    if (body.registrationClosesAt !== undefined)
      $set.registrationClosesAt = body.registrationClosesAt;
    if (body.maxPlayers !== undefined) $set.maxPlayers = body.maxPlayers;
    if (body.prizeDescription !== undefined)
      $set.prizeDescription = body.prizeDescription;
    if (body.content !== undefined) $set.content = body.content;

    const updated = await this.model
      .findByIdAndUpdate(id, { $set }, { new: true })
      .lean<TournamentLean | null>();
    if (!updated) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    return this.findAdminItem(id);
  }

  async transition(
    id: string,
    to: TournamentStatus,
    resultText?: string,
  ): Promise<AdminTournamentItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model.findById(id).lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (!canTransition(doc.status, to)) {
      throw new ConflictException({
        code: 'INVALID_TRANSITION',
        from: doc.status,
        to,
      });
    }

    const $set: Record<string, unknown> = { status: to };
    if (to === 'completed' && resultText !== undefined) {
      $set.resultText = resultText;
    }

    if (to === 'cancelled') {
      await this.walletOps.cancelWithRefunds(doc, $set);
    } else {
      await this.model.findByIdAndUpdate(id, { $set });
    }

    return this.findAdminItem(id);
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model.findById(id).lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (!canDelete(doc.status)) {
      throw new ConflictException({
        code: 'CANNOT_DELETE_NON_CANCELLED',
        status: doc.status,
      });
    }
    await this.model.findByIdAndDelete(id);
  }

  async findAdminItem(id: string): Promise<AdminTournamentItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model
      .findById(id)
      .populate('createdBy', '_id displayName')
      .lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    return this.toAdminItem(doc);
  }

  async register(
    id: string,
    userId: string,
    displayName: string | null,
  ): Promise<{ ok: true; waitlist: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model.findById(id).lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (doc.status !== 'registration_open') {
      throw new ConflictException({
        code: 'REGISTRATION_NOT_OPEN',
        status: doc.status,
      });
    }
    const userOid = new Types.ObjectId(userId);
    const already = doc.registrations.find(
      (r) => r.userId.toString() === userId,
    );
    if (already) return { ok: true, waitlist: already.waitlist };

    const waitlist = doc.registrations.length >= doc.maxPlayers;
    const regRow = {
      userId: userOid,
      displayName,
      registeredAt: new Date(),
      waitlist,
    };

    if ((doc.entryFeeCoins ?? 0) === 0) {
      await this.model.findByIdAndUpdate(id, {
        $push: { registrations: regRow },
      });
      return { ok: true, waitlist };
    }

    await this.walletOps.chargeEntryFee(doc, userId, regRow);
    return { ok: true, waitlist };
  }

  async unregister(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model.findById(id).lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    if (doc.status === 'live' || doc.status === 'completed') {
      throw new ForbiddenException({
        code: 'UNREGISTER_NOT_ALLOWED',
        status: doc.status,
      });
    }

    const userOid = new Types.ObjectId(userId);

    if ((doc.entryFeeCoins ?? 0) === 0) {
      await this.model.findByIdAndUpdate(id, {
        $pull: { registrations: { userId: userOid } },
      });
      return;
    }

    await this.walletOps.refundEntryFee(doc, userId);
  }

  async markComplete(
    id: string,
    winnerUserId: string,
  ): Promise<AdminTournamentItem> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model.findById(id).lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }

    if (doc.status === 'completed') {
      if (doc.winnerUserId === winnerUserId) {
        return this.findAdminItem(id);
      }
      throw new BadRequestException({
        code: 'TOURNAMENT_ALREADY_COMPLETED',
        winnerUserId: doc.winnerUserId,
      });
    }

    if (doc.status !== 'live') {
      throw new BadRequestException({
        code: 'TOURNAMENT_NOT_LIVE',
        status: doc.status,
      });
    }

    const isRegistered = doc.registrations.some(
      (r) => r.userId.toString() === winnerUserId,
    );
    if (!isRegistered) {
      throw new BadRequestException({
        code: 'WINNER_NOT_REGISTERED',
        winnerUserId,
      });
    }

    await this.walletOps.markCompleteWithPrize(doc, winnerUserId);
    return this.findAdminItem(id);
  }

  async listRegistrations(
    id: string,
    page = 1,
    pageSize = 50,
  ): Promise<RegistrationsListResponse> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({ code: 'INVALID_TOURNAMENT_ID' });
    }
    const doc = await this.model.findById(id).lean<TournamentLean | null>();
    if (!doc) {
      throw new NotFoundException({ code: 'TOURNAMENT_NOT_FOUND' });
    }
    const all = doc.registrations.map((r) => ({
      userId: r.userId.toString(),
      displayName: r.displayName ?? null,
      registeredAt: r.registeredAt.toISOString(),
      waitlist: r.waitlist,
    }));
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      total: all.length,
      page,
      pageSize,
    };
  }

  private toAdminItem(d: TournamentLean): AdminTournamentItem {
    const createdBy = this.extractCreator(d.createdBy);
    const registeredCount = d.registrations.filter((r) => !r.waitlist).length;
    const waitlistCount = d.registrations.length - registeredCount;
    return {
      id: d._id.toString(),
      status: d.status,
      gameType: d.gameType,
      scheduledAt: d.scheduledAt.toISOString(),
      registrationOpensAt: d.registrationOpensAt?.toISOString() ?? null,
      registrationClosesAt: d.registrationClosesAt?.toISOString() ?? null,
      maxPlayers: d.maxPlayers,
      prizeDescription: d.prizeDescription ?? null,
      resultText: d.resultText ?? null,
      content: d.content,
      registeredCount,
      waitlistCount,
      createdBy,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
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
}
