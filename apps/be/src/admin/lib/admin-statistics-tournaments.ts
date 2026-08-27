import { Model } from 'mongoose';
import type { Tournament } from '../../tournaments/schemas/tournament.schema';
import type { AdminStatsTournaments } from '../interfaces/admin-statistics.types';

export async function computeTournamentStats(
  tournamentModel: Model<Tournament>,
): Promise<AdminStatsTournaments> {
  const [total, liveOrOpen, completed, registrationsAgg] = await Promise.all([
    tournamentModel.countDocuments({}).exec(),
    tournamentModel
      .countDocuments({ status: { $in: ['live', 'registration_open'] } })
      .exec(),
    tournamentModel.countDocuments({ status: 'completed' }).exec(),
    tournamentModel
      .aggregate<{ totalRegs: number }>([
        {
          $project: {
            regCount: { $size: { $ifNull: ['$registrations', []] } },
          },
        },
        {
          $group: {
            _id: null,
            totalRegs: { $sum: '$regCount' },
          },
        },
      ])
      .exec(),
  ]);

  return {
    total,
    liveOrOpen,
    completed,
    totalRegistrations: registrationsAgg[0]?.totalRegs ?? 0,
  };
}
