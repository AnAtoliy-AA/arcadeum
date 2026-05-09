import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaymentNote,
  PaymentNoteDocument,
} from './schemas/payment-note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { escapeRegExp } from '../admin/lib/escape-regexp';
import type {
  AdminPaymentNoteItem,
  AdminPaymentNotesResponse,
} from './interfaces/admin-payment-note.interface';
import type { AdminNotesVisibility } from './dto/list-admin-notes.dto';

interface LeanPaymentNote {
  _id: Types.ObjectId;
  note: string;
  amount: number;
  currency: string;
  userId?: Types.ObjectId | null;
  displayName?: string | null;
  transactionId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ListForAdminArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  visibility?: AdminNotesVisibility;
}

export interface NoteWithUser {
  id: string;
  note: string;
  amount: number;
  currency: string;
  displayName: string | null;
  createdAt: Date;
}

export interface PaginatedNotes {
  notes: NoteWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PaymentNotesService {
  private readonly logger = new Logger(PaymentNotesService.name);

  constructor(
    @InjectModel(PaymentNote.name)
    private readonly noteModel: Model<PaymentNoteDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createNote(
    dto: CreateNoteDto,
    userId?: string,
  ): Promise<PaymentNoteDocument> {
    const noteData: Partial<PaymentNote> = {
      note: dto.note.trim(),
      amount: dto.amount,
      currency: dto.currency.toUpperCase(),
      transactionId: dto.transactionId,
      displayName: dto.displayName?.trim(),
      isPublic: dto.isPublic ?? true,
    };

    if (userId) {
      noteData.userId = new Types.ObjectId(userId);
    }

    const note = new this.noteModel(noteData);
    await note.save();

    this.logger.log(
      `Created payment note for transaction ${dto.transactionId}`,
    );

    return note;
  }

  async getNotes(page = 0, limit = 20): Promise<PaginatedNotes> {
    const skip = page * limit;
    const safeLimit = Math.min(limit, 100);

    const [notes, total] = await Promise.all([
      this.noteModel
        .find({ isPublic: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean()
        .exec(),
      this.noteModel.countDocuments({ isPublic: true }).exec(),
    ]);

    // Fetch user info for authenticated notes
    const userIds = notes
      .filter((n) => n.userId)
      .map((n) => n.userId as Types.ObjectId);

    const users =
      userIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: userIds } })
            .select('_id displayName username')
            .lean()
            .exec()
        : [];

    const userMap = new Map(
      users.map((u) => [
        (u._id as Types.ObjectId).toString(),
        u.displayName || u.username,
      ]),
    );

    const notesWithUsers: NoteWithUser[] = notes.map((n) => ({
      id: (n._id as Types.ObjectId).toString(),
      note: n.note,
      amount: n.amount,
      currency: n.currency,
      displayName: n.userId
        ? userMap.get(n.userId.toString()) || null
        : n.displayName || null,
      createdAt: (n as unknown as { createdAt: Date }).createdAt,
    }));

    return {
      notes: notesWithUsers,
      total,
      page,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async listForAdmin(
    args: ListForAdminArgs,
  ): Promise<AdminPaymentNotesResponse> {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 50;
    const visibility = args.visibility ?? 'all';

    const filter: Record<string, unknown> = {};
    if (visibility === 'public') filter.isPublic = true;
    else if (visibility === 'private') filter.isPublic = false;

    const trimmed = args.q?.trim();
    if (trimmed) {
      const escaped = escapeRegExp(trimmed);
      filter.$or = [
        { note: { $regex: escaped, $options: 'i' } },
        { displayName: { $regex: escaped, $options: 'i' } },
        { transactionId: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      this.noteModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean<LeanPaymentNote[]>(),
      this.noteModel.countDocuments(filter),
    ]);

    const userIds = docs
      .filter(
        (d): d is LeanPaymentNote & { userId: Types.ObjectId } =>
          d.userId !== null && d.userId !== undefined,
      )
      .map((d) => d.userId);

    const users =
      userIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: userIds } })
            .select('_id displayName username')
            .lean()
            .exec()
        : [];

    const userMap = new Map(
      users.map((u) => [
        (u._id as Types.ObjectId).toString(),
        u.displayName || u.username,
      ]),
    );

    const items: AdminPaymentNoteItem[] = docs.map((d) => ({
      id: d._id.toString(),
      note: d.note,
      amount: d.amount,
      currency: d.currency,
      displayName: d.userId
        ? userMap.get(d.userId.toString()) || null
        : (d.displayName ?? null),
      createdAt: d.createdAt.toISOString(),
      transactionId: d.transactionId,
      isPublic: d.isPublic,
      userId: d.userId ? d.userId.toString() : null,
    }));

    return { items, total, page, pageSize };
  }
}
