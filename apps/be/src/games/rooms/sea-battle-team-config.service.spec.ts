import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { SeaBattleTeamConfigService } from './sea-battle-team-config.service';
import { SetTeamConfigDto } from '../dtos/set-team-config.dto';
import {
  FakeRoomModel,
  buildService,
  getOpts,
  getTeams,
  makeRoom,
} from './sea-battle-team-config.test-helpers';

describe('SeaBattleTeamConfigService — config', () => {
  let service: SeaBattleTeamConfigService;
  let model: FakeRoomModel;

  beforeEach(async () => {
    model = new FakeRoomModel();
    service = await buildService(model);
  });

  describe('enableTeamMode', () => {
    it('rejects non-host with ForbiddenException', async () => {
      model.set(makeRoom());
      await expect(
        service.enableTeamMode('r1', 'someone-else'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects when room.status is not lobby', async () => {
      model.set(makeRoom({ status: 'in_progress' }));
      await expect(service.enableTeamMode('r1', 'host')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when participants > MAX_TOTAL_PLAYERS', async () => {
      const tooMany = Array.from({ length: 9 }, (_, i) => ({
        userId: i === 0 ? 'host' : `p${i}`,
        joinedAt: new Date(),
      }));
      model.set(makeRoom({ participants: tooMany }));
      await expect(service.enableTeamMode('r1', 'host')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('seeds two teams of size 2 with host on team 1 for a 1-participant room', async () => {
      const room = makeRoom();
      model.set(room);
      await service.enableTeamMode('r1', 'host');
      const teams = getTeams(room);
      expect(teams).toHaveLength(2);
      expect(teams[0].id).toBe('t1');
      expect(teams[1].id).toBe('t2');
      expect(teams[0].targetSize).toBe(2);
      expect(teams[1].targetSize).toBe(2);
      expect(teams[0].playerIds).toEqual(['host']);
      expect(teams[1].playerIds).toEqual([]);
      expect(getOpts(room).teamMode).toBe(true);
    });

    it('splits 4-participant room into 2/2 with host on team 1', async () => {
      const room = makeRoom({
        participants: [
          { userId: 'host', joinedAt: new Date() },
          { userId: 'p2', joinedAt: new Date() },
          { userId: 'p3', joinedAt: new Date() },
          { userId: 'p4', joinedAt: new Date() },
        ],
      });
      model.set(room);
      await service.enableTeamMode('r1', 'host');
      const teams = getTeams(room);
      expect(teams[0].playerIds).toEqual(['host', 'p3']);
      expect(teams[1].playerIds).toEqual(['p2', 'p4']);
      expect(teams[0].targetSize).toBe(2);
      expect(teams[1].targetSize).toBe(2);
    });
  });

  describe('disableTeamMode', () => {
    it('clears teams, hideShipsFromTeammates and sets teamMode false', async () => {
      const room = makeRoom({
        gameOptions: {
          teamMode: true,
          hideShipsFromTeammates: true,
          teams: [
            {
              id: 't1',
              name: 'Team 1',
              color: '#E11D48',
              targetSize: 2,
              playerIds: ['host'],
            },
          ],
        },
      });
      model.set(room);
      await service.disableTeamMode('r1', 'host');
      const opts = getOpts(room);
      expect(opts.teamMode).toBe(false);
      expect(opts.teams).toBeUndefined();
      expect(opts.hideShipsFromTeammates).toBeUndefined();
    });
  });

  describe('setTeamConfig', () => {
    function buildDto(
      overrides: Partial<SetTeamConfigDto> = {},
    ): SetTeamConfigDto {
      return {
        roomId: 'r1',
        teams: [
          { id: 't1', name: 'Team 1', color: '#E11D48', targetSize: 2 },
          { id: 't2', name: 'Team 2', color: '#2563EB', targetSize: 2 },
        ],
        ...overrides,
      } as SetTeamConfigDto;
    }

    it('rejects when teams.length < 2', async () => {
      const room = makeRoom({ gameOptions: { teamMode: true, teams: [] } });
      model.set(room);
      const dto = buildDto({
        teams: [{ id: 't1', name: 'Team 1', color: '#E11D48', targetSize: 2 }],
      });
      await expect(service.setTeamConfig('host', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when total targetSize > 8', async () => {
      const room = makeRoom({ gameOptions: { teamMode: true, teams: [] } });
      model.set(room);
      const dto = buildDto({
        teams: [
          { id: 't1', name: 'Team 1', color: '#E11D48', targetSize: 5 },
          { id: 't2', name: 'Team 2', color: '#2563EB', targetSize: 5 },
        ],
      });
      await expect(service.setTeamConfig('host', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when any team targetSize < 2', async () => {
      const room = makeRoom({ gameOptions: { teamMode: true, teams: [] } });
      model.set(room);
      const dto = buildDto({
        teams: [
          { id: 't1', name: 'Team 1', color: '#E11D48', targetSize: 1 },
          { id: 't2', name: 'Team 2', color: '#2563EB', targetSize: 2 },
        ],
      });
      await expect(service.setTeamConfig('host', dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects when teamMode is not enabled', async () => {
      const room = makeRoom({ gameOptions: {} });
      model.set(room);
      await expect(
        service.setTeamConfig('host', buildDto()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('preserves playerIds for matching team ids and clamps to new targetSize', async () => {
      const room = makeRoom({
        gameOptions: {
          teamMode: true,
          teams: [
            {
              id: 't1',
              name: 'Old 1',
              color: '#000000',
              targetSize: 4,
              playerIds: ['host', 'p2', 'p3', 'p4'],
            },
            {
              id: 'tDropped',
              name: 'Dropped',
              color: '#000000',
              targetSize: 2,
              playerIds: ['p5', 'p6'],
            },
          ],
        },
      });
      model.set(room);
      const dto = buildDto({
        teams: [
          { id: 't1', name: 'Team 1', color: '#E11D48', targetSize: 2 },
          { id: 't2', name: 'Team 2', color: '#2563EB', targetSize: 2 },
        ],
      });
      await service.setTeamConfig('host', dto);
      const teams = getTeams(room);
      expect(teams).toHaveLength(2);
      expect(teams[0].id).toBe('t1');
      expect(teams[0].playerIds).toEqual(['host', 'p2']);
      expect(teams[0].targetSize).toBe(2);
      expect(teams[1].id).toBe('t2');
      expect(teams[1].playerIds).toEqual([]);
    });
  });

  describe('toggleHideShips', () => {
    it('requires team mode on', async () => {
      const room = makeRoom({ gameOptions: {} });
      model.set(room);
      await expect(
        service.toggleHideShips('host', 'r1', true),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('sets hideShipsFromTeammates when team mode is enabled', async () => {
      const room = makeRoom({ gameOptions: { teamMode: true } });
      model.set(room);
      await service.toggleHideShips('host', 'r1', true);
      expect(getOpts(room).hideShipsFromTeammates).toBe(true);
      await service.toggleHideShips('host', 'r1', false);
      expect(getOpts(room).hideShipsFromTeammates).toBe(false);
    });
  });
});
