import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SeaBattleTeamConfigService } from './sea-battle-team-config.service';
import { AssignTeamDto } from '../dtos/assign-team.dto';
import {
  FakeRoom,
  FakeRoomModel,
  buildService,
  getTeams,
  makeRoom,
} from './sea-battle-team-config.test-helpers';

function teamRoomTrio(): FakeRoom {
  return makeRoom({
    participants: [
      { userId: 'host', joinedAt: new Date() },
      { userId: 'p2', joinedAt: new Date() },
      { userId: 'p3', joinedAt: new Date() },
    ],
    gameOptions: {
      teamMode: true,
      teams: [
        {
          id: 't1',
          name: 'Team 1',
          color: '#E11D48',
          targetSize: 2,
          playerIds: ['host'],
        },
        {
          id: 't2',
          name: 'Team 2',
          color: '#2563EB',
          targetSize: 2,
          playerIds: ['p2'],
        },
      ],
    },
  });
}

describe('SeaBattleTeamConfigService — assign / bots', () => {
  let service: SeaBattleTeamConfigService;
  let model: FakeRoomModel;

  beforeEach(async () => {
    model = new FakeRoomModel();
    service = await buildService(model);
  });

  describe('assignPlayerToTeam', () => {
    it('host can move any participant to any team', async () => {
      const room = teamRoomTrio();
      model.set(room);
      const dto: AssignTeamDto = {
        roomId: 'r1',
        userId: 'p2',
        teamId: 't1',
      };
      await service.assignPlayerToTeam('host', dto);
      const teams = getTeams(room);
      expect(teams[0].playerIds).toEqual(['host', 'p2']);
      expect(teams[1].playerIds).toEqual([]);
    });

    it('non-host actor can only assign themselves', async () => {
      const room = teamRoomTrio();
      model.set(room);
      const dto: AssignTeamDto = {
        roomId: 'r1',
        userId: 'p3',
        teamId: 't1',
      };
      await expect(
        service.assignPlayerToTeam('p2', dto),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects when target team is full', async () => {
      const room = makeRoom({
        participants: [
          { userId: 'host', joinedAt: new Date() },
          { userId: 'p2', joinedAt: new Date() },
          { userId: 'p3', joinedAt: new Date() },
        ],
        gameOptions: {
          teamMode: true,
          teams: [
            {
              id: 't1',
              name: 'Team 1',
              color: '#E11D48',
              targetSize: 2,
              playerIds: ['host', 'p2'],
            },
            {
              id: 't2',
              name: 'Team 2',
              color: '#2563EB',
              targetSize: 2,
              playerIds: [],
            },
          ],
        },
      });
      model.set(room);
      const dto: AssignTeamDto = {
        roomId: 'r1',
        userId: 'p3',
        teamId: 't1',
      };
      await expect(
        service.assignPlayerToTeam('host', dto),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('teamId === null removes the player from all teams', async () => {
      const room = teamRoomTrio();
      model.set(room);
      const dto: AssignTeamDto = {
        roomId: 'r1',
        userId: 'host',
        teamId: null,
      };
      await service.assignPlayerToTeam('host', dto);
      const teams = getTeams(room);
      expect(teams[0].playerIds).toEqual([]);
      expect(teams[1].playerIds).toEqual(['p2']);
    });

    it('throws NotFoundException when room is missing', async () => {
      const dto: AssignTeamDto = {
        roomId: 'missing',
        userId: 'host',
        teamId: 't1',
      };
      await expect(
        service.assignPlayerToTeam('host', dto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('addBotToTeam', () => {
    function botableRoom(): FakeRoom {
      return makeRoom({
        gameOptions: {
          teamMode: true,
          teams: [
            {
              id: 't1',
              name: 'Team 1',
              color: '#E11D48',
              targetSize: 3,
              playerIds: ['host'],
            },
            {
              id: 't2',
              name: 'Team 2',
              color: '#2563EB',
              targetSize: 2,
              playerIds: ['p2', 'p3'],
            },
          ],
        },
      });
    }

    it('adds a bot-* id to participants and the named team', async () => {
      const room = botableRoom();
      model.set(room);
      await service.addBotToTeam('host', 'r1', 't1');
      const teams = getTeams(room);
      const newBots = teams[0].playerIds.filter((id) => id.startsWith('bot-'));
      expect(newBots).toHaveLength(1);
      const botId = newBots[0];
      expect(room.participants.some((p) => p.userId === botId)).toBe(true);
    });

    it('rejects when target team is full', async () => {
      const room = botableRoom();
      model.set(room);
      await expect(
        service.addBotToTeam('host', 'r1', 't2'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when gameOptions.teams is not set', async () => {
      const room = makeRoom({ gameOptions: { teamMode: true } });
      model.set(room);
      await expect(
        service.addBotToTeam('host', 'r1', 't1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('removeBotFromTeam', () => {
    it('removes a bot id from team.playerIds and room.participants', async () => {
      const botId = 'bot-abc12345';
      const room = makeRoom({
        participants: [
          { userId: 'host', joinedAt: new Date() },
          { userId: botId, joinedAt: new Date() },
        ],
        gameOptions: {
          teamMode: true,
          teams: [
            {
              id: 't1',
              name: 'Team 1',
              color: '#E11D48',
              targetSize: 2,
              playerIds: ['host', botId],
            },
            {
              id: 't2',
              name: 'Team 2',
              color: '#2563EB',
              targetSize: 2,
              playerIds: [],
            },
          ],
        },
      });
      model.set(room);
      await service.removeBotFromTeam('host', 'r1', botId);
      const teams = getTeams(room);
      expect(teams[0].playerIds).toEqual(['host']);
      expect(room.participants.some((p) => p.userId === botId)).toBe(false);
    });

    it('rejects non-bot ids (does not start with bot-)', async () => {
      const room = makeRoom({
        participants: [
          { userId: 'host', joinedAt: new Date() },
          { userId: 'p2', joinedAt: new Date() },
        ],
        gameOptions: { teamMode: true, teams: [] },
      });
      model.set(room);
      await expect(
        service.removeBotFromTeam('host', 'r1', 'p2'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
