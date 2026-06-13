import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Tournament,
  type TournamentDocument,
} from './schemas/tournament.schema';

const MINUTE_MS = 60 * 1000;

@Injectable()
export class TournamentsNotificationCron {
  private readonly logger = new Logger(TournamentsNotificationCron.name);

  constructor(
    @InjectModel(Tournament.name)
    private readonly model: Model<TournamentDocument>,
    private readonly dispatcher: NotificationDispatcher,
    private readonly notifications: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async runStartingSoon(): Promise<void> {
    try {
      const now = Date.now();
      const min = new Date(now + 10 * MINUTE_MS);
      const max = new Date(now + 20 * MINUTE_MS);
      const docs = await this.model
        .find({
          status: 'registration_open',
          scheduledAt: { $gte: min, $lte: max },
          notifiedStartingSoonAt: null,
        })
        .lean()
        .exec();

      for (const t of docs) {
        const name = nameFor(t);
        const minutes = Math.max(
          1,
          Math.round((t.scheduledAt.getTime() - now) / MINUTE_MS),
        );
        for (const reg of t.registrations) {
          await this.dispatcher.dispatch({
            userId: reg.userId.toHexString(),
            category: 'tournament_starting_soon',
            titleKey: 'notifications.tournament_starting_soon.title',
            bodyKey: 'notifications.tournament_starting_soon.body',
            i18nParams: { name, minutes },
            url: `/tournaments/${idToHex(t._id)}`,
            data: { tournamentId: idToHex(t._id) },
          });
        }
        await this.model
          .updateOne(
            { _id: t._id },
            { $set: { notifiedStartingSoonAt: new Date() } },
          )
          .exec();
      }
    } catch (err) {
      this.logger.warn(`tournament starting-soon cron failed: ${String(err)}`);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async runRegistrationOpened(): Promise<void> {
    try {
      const docs = await this.model
        .find({
          status: 'registration_open',
          notifiedRegistrationOpenAt: null,
        })
        .lean()
        .exec();

      if (docs.length === 0) return;

      const optedIn = await this.notifications.listUserIdsWithCategoryEnabled(
        'tournament_registration_opened',
      );
      if (optedIn.length === 0) {
        // Still flag the tournament so we don't try again — there's no
        // audience right now and waiting won't help.
        for (const t of docs) {
          await this.model
            .updateOne(
              { _id: t._id },
              { $set: { notifiedRegistrationOpenAt: new Date() } },
            )
            .exec();
        }
        return;
      }

      const optedInIds = optedIn.map((id) => id.toHexString());
      for (const t of docs) {
        const name = nameFor(t);
        await this.dispatcher.dispatchMany(optedInIds, {
          category: 'tournament_registration_opened',
          titleKey: 'notifications.tournament_registration_opened.title',
          bodyKey: 'notifications.tournament_registration_opened.body',
          i18nParams: { name },
          url: `/tournaments/${idToHex(t._id)}`,
          data: { tournamentId: idToHex(t._id) },
        });
        await this.model
          .updateOne(
            { _id: t._id },
            { $set: { notifiedRegistrationOpenAt: new Date() } },
          )
          .exec();
      }
    } catch (err) {
      this.logger.warn(
        `tournament registration-opened cron failed: ${String(err)}`,
      );
    }
  }
}

function idToHex(value: unknown): string {
  if (value instanceof Types.ObjectId) return value.toHexString();
  if (typeof value === 'string') return value;
  return '';
}

function nameFor(t: Pick<TournamentDocument, 'content'>): string {
  const content = t.content as unknown as
    | { en?: { name?: string } }
    | undefined;
  return content?.en?.name ?? 'Tournament';
}
