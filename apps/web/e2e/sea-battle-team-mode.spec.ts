import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  handleRoute,
  mockRoomInfo,
  mockGameSocket,
  waitForRoomReady,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';

/**
 * Integration smoke tests for Sea Battle Team Mode UI.
 *
 * Verifies that the team-mode lobby + battle screens render the right controls
 * given a known room/session shape. Multi-user gameplay correctness (rotation,
 * win condition, sanitization, etc.) is covered by the backend engine unit
 * tests — these tests only assert the front-end view given a fixed payload.
 */

const VIEWER_USER_ID = MOCK_OBJECT_ID;
const OTHER_HOST_ID = '507f1f77bcf86cd799439aa1';
const TEAMMATE_ID = '507f1f77bcf86cd799439aa2';
const ENEMY_A_ID = '507f1f77bcf86cd799439aa3';
const ENEMY_B_ID = '507f1f77bcf86cd799439aa4';

const RED_TEAM = { id: 't1', name: 'Red', color: '#E11D48', targetSize: 2 };
const BLUE_TEAM = { id: 't2', name: 'Blue', color: '#2563EB', targetSize: 2 };

interface Member {
  id: string;
  userId: string;
  displayName: string;
  isHost: boolean;
}

function member(userId: string, displayName: string, isHost = false): Member {
  return { id: userId, userId, displayName, isHost };
}

const FOUR_PLAYER_BATTLE_MEMBERS: Member[] = [
  member(VIEWER_USER_ID, 'Me', true),
  member(TEAMMATE_ID, 'Teammate'),
  member(ENEMY_A_ID, 'Enemy A'),
  member(ENEMY_B_ID, 'Enemy B'),
];

interface RoomShape {
  hostId: string;
  status: 'lobby' | 'battle';
  members: Member[];
  redPlayerIds: string[];
  bluePlayerIds: string[];
}

function buildRoom(roomId: string, opts: RoomShape) {
  return {
    id: roomId,
    name: 'Team Mode Test Room',
    gameId: 'sea_battle_v1',
    status: opts.status,
    hostId: opts.hostId,
    playerCount: opts.members.length,
    maxPlayers: 8,
    members: opts.members,
    gameOptions: {
      variant: 'classic',
      teamMode: true,
      hideShipsFromTeammates: false,
      teams: [
        { ...RED_TEAM, playerIds: opts.redPlayerIds },
        { ...BLUE_TEAM, playerIds: opts.bluePlayerIds },
      ],
    },
  };
}

interface BattleStateOpts {
  viewerAlive: boolean;
  redPlayerIds: string[];
  bluePlayerIds: string[];
}

function buildBattleSessionState(opts: BattleStateOpts) {
  const allIds = [...opts.redPlayerIds, ...opts.bluePlayerIds];
  const players = allIds.map((id) => ({
    playerId: id,
    alive: id === VIEWER_USER_ID ? opts.viewerAlive : true,
    board: Array(10)
      .fill(null)
      .map(() => Array(10).fill(0)),
    ships: [],
    shipsRemaining: 10,
    placementComplete: true,
  }));
  return {
    phase: 'battle' as const,
    players,
    playerOrder: allIds,
    currentTurnIndex: 0,
    teams: [
      {
        ...RED_TEAM,
        playerIds: opts.redPlayerIds,
        currentShooterIndex: 0,
      },
      {
        ...BLUE_TEAM,
        playerIds: opts.bluePlayerIds,
        currentShooterIndex: 0,
      },
    ],
    teamOrder: [RED_TEAM.id, BLUE_TEAM.id],
    currentTeamIndex: 0,
    hideShipsFromTeammates: false,
    logs: [],
  };
}

test.describe('Sea Battle Team Mode UI smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await page.route('**/socket.io/*', async (route) => {
      await handleRoute(route, { status: 'ok' });
    });
  });

  test('lobby host sees team mode toggle and team setup panel', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860f1';
    const members: Member[] = [
      member(VIEWER_USER_ID, 'Host', true),
      member(TEAMMATE_ID, 'Teammate'),
      member(ENEMY_A_ID, 'Player 3'),
      member(ENEMY_B_ID, 'Player 4'),
    ];
    // Leave one open slot per team so the host's "Add Bot" button renders
    // (TeamSlotsBoard hides it when a team is at target size).
    const room = buildRoom(roomId, {
      hostId: VIEWER_USER_ID,
      status: 'lobby',
      members,
      redPlayerIds: [VIEWER_USER_ID],
      bluePlayerIds: [TEAMMATE_ID],
    });

    await mockRoomInfo(page, { room, session: null });
    await mockGameSocket(page, roomId, VIEWER_USER_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: room,
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await expect(page.getByTestId('team-mode-toggle')).toBeVisible();
    await expect(page.getByTestId('team-setup-panel')).toBeVisible();
    const redCard = page.getByTestId(`team-card-${RED_TEAM.id}`);
    const blueCard = page.getByTestId(`team-card-${BLUE_TEAM.id}`);
    await expect(redCard).toBeVisible();
    await expect(blueCard).toBeVisible();
    // Host sees each team name in an editable Input, so assert the input value
    // inside each team card rather than free-floating text content.
    await expect(redCard.locator('input').first()).toHaveValue('Red');
    await expect(blueCard.locator('input').first()).toHaveValue('Blue');
    await expect(page.getByTestId(`add-bot-${RED_TEAM.id}`)).toBeVisible();
    await expect(page.getByTestId(`add-bot-${BLUE_TEAM.id}`)).toBeVisible();
  });

  test('lobby non-host sees team slots board but not the setup panel', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860f2';
    const members: Member[] = [
      member(OTHER_HOST_ID, 'Host', true),
      member(VIEWER_USER_ID, 'Me'),
      member(TEAMMATE_ID, 'Player 3'),
      member(ENEMY_A_ID, 'Player 4'),
    ];
    const room = buildRoom(roomId, {
      hostId: OTHER_HOST_ID,
      status: 'lobby',
      members,
      redPlayerIds: [OTHER_HOST_ID, VIEWER_USER_ID],
      bluePlayerIds: [],
    });

    await mockRoomInfo(page, { room, session: null });
    await mockGameSocket(page, roomId, VIEWER_USER_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: room,
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await expect(page.getByTestId('team-slots-board')).toBeVisible();
    await expect(page.getByTestId(`team-card-${RED_TEAM.id}`)).toBeVisible();
    await expect(page.getByTestId(`team-card-${BLUE_TEAM.id}`)).toBeVisible();
    await expect(page.getByTestId('team-mode-toggle')).toHaveCount(0);
    await expect(page.getByTestId('team-setup-panel')).toHaveCount(0);
    await expect(page.getByTestId(`add-bot-${RED_TEAM.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`add-bot-${BLUE_TEAM.id}`)).toHaveCount(0);
  });

  test('battle phase shows the eliminated banner when the viewer is dead', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860f3';
    const redIds = [VIEWER_USER_ID, TEAMMATE_ID];
    const blueIds = [ENEMY_A_ID, ENEMY_B_ID];
    const room = buildRoom(roomId, {
      hostId: VIEWER_USER_ID,
      status: 'battle',
      members: FOUR_PLAYER_BATTLE_MEMBERS,
      redPlayerIds: redIds,
      bluePlayerIds: blueIds,
    });
    const session = {
      id: 'session-eliminated',
      status: 'active' as const,
      state: buildBattleSessionState({
        viewerAlive: false,
        redPlayerIds: redIds,
        bluePlayerIds: blueIds,
      }),
    };

    await mockRoomInfo(page, { room, session });
    await mockGameSocket(page, roomId, VIEWER_USER_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: { ...room, session },
    });
    await page.route(`**/games/rooms/${roomId}/session*`, async (route) => {
      await handleRoute(route, { session });
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    await expect(page.getByText(/eliminated/i).first()).toBeVisible();
  });

  test('battle phase renders all four players when team mode is active', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860f4';
    const redIds = [VIEWER_USER_ID, TEAMMATE_ID];
    const blueIds = [ENEMY_A_ID, ENEMY_B_ID];
    const room = buildRoom(roomId, {
      hostId: VIEWER_USER_ID,
      status: 'battle',
      members: FOUR_PLAYER_BATTLE_MEMBERS,
      redPlayerIds: redIds,
      bluePlayerIds: blueIds,
    });
    const session = {
      id: 'session-roster',
      status: 'active' as const,
      state: buildBattleSessionState({
        viewerAlive: true,
        redPlayerIds: redIds,
        bluePlayerIds: blueIds,
      }),
    };

    await mockRoomInfo(page, { room, session });
    await mockGameSocket(page, roomId, VIEWER_USER_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: { ...room, session },
    });
    await page.route(`**/games/rooms/${roomId}/session*`, async (route) => {
      await handleRoute(route, { session });
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    // The viewer's own board renders alongside the three opponent boards.
    // AttackBoard tags every board with `player-board-name`.
    await expect(page.getByTestId('player-board-name')).toHaveCount(4);
    await expect(page.getByText('Teammate').first()).toBeVisible();
    await expect(page.getByText('Enemy A').first()).toBeVisible();
    await expect(page.getByText('Enemy B').first()).toBeVisible();
  });

  test('chat panel exposes the Team scope button when team mode is on', async ({
    page,
  }) => {
    const roomId = '507f191e810c19729de860f5';
    const redIds = [VIEWER_USER_ID, TEAMMATE_ID];
    const blueIds = [ENEMY_A_ID, ENEMY_B_ID];
    const room = buildRoom(roomId, {
      hostId: VIEWER_USER_ID,
      status: 'battle',
      members: FOUR_PLAYER_BATTLE_MEMBERS,
      redPlayerIds: redIds,
      bluePlayerIds: blueIds,
    });
    const session = {
      id: 'session-chat',
      status: 'active' as const,
      state: buildBattleSessionState({
        viewerAlive: true,
        redPlayerIds: redIds,
        bluePlayerIds: blueIds,
      }),
    };

    await mockRoomInfo(page, { room, session });
    await mockGameSocket(page, roomId, VIEWER_USER_ID, {
      gameId: 'sea_battle_v1',
      roomJoinedPayload: { ...room, session },
    });
    await page.route(`**/games/rooms/${roomId}/session*`, async (route) => {
      await handleRoute(route, { session });
    });

    // Wide viewport: GamePageLayout opens the chat panel by default on >md.
    await page.setViewportSize({ width: 1920, height: 1080 });
    await navigateTo(page, `/games/rooms/${roomId}`);
    await waitForRoomReady(page);

    const chatArea = page.getByTestId('game-chat-area');
    await expect(chatArea).toBeVisible();
    await expect(
      chatArea.getByRole('button', { name: 'Team', exact: true }),
    ).toBeVisible();
    await expect(
      chatArea.getByRole('button', { name: 'All', exact: true }),
    ).toBeVisible();
  });
});
