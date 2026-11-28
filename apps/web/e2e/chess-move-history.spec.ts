import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  mockGameSocket,
  handleRoute,
} from './fixtures/test-utils';

const MOCK_ROOM_ID = '507f1f77bcf86cd799439011';
const USER_WHITE_ID = '507f191e810c19729de860ea';
const USER_BLACK_ID = '507f1f77bcf86cd799439012';

function createInitialBoard() {
  return [
    [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' },
    ],
    Array(8).fill({ type: 'pawn', color: 'black' }),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill({ type: 'pawn', color: 'white' }),
    [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' },
    ],
  ];
}

test.describe('Chess move history navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await page.route('**/games/rooms/join', async (route) => {
      await handleRoute(route, { roomId: MOCK_ROOM_ID });
    });
    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      return handleRoute(route, {});
    });
  });

  test('steps back through earlier positions and returns to live', async ({
    page,
  }) => {
    await mockRoomInfo(page, {
      room: {
        id: MOCK_ROOM_ID,
        gameId: 'chess_v1',
        name: 'History Chess Game',
        status: 'playing',
        playerCount: 2,
        maxPlayers: 2,
      },
    });

    const board = createInitialBoard();
    board[6][4] = null;
    board[4][4] = { type: 'pawn', color: 'white' };
    board[1][4] = null;
    board[3][4] = { type: 'pawn', color: 'black' };

    const pawn = (color: 'white' | 'black') => ({ type: 'pawn', color });
    const chessState = {
      phase: 'playing',
      gameCreatedAt: Date.now() - 3000,
      variant: 'standard',
      timeControl: null,
      board,
      currentTurnColor: 'white',
      castlingRights: {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
      enPassantTarget: null,
      moveHistory: [
        {
          from: { file: 'e', rank: 2 },
          to: { file: 'e', rank: 4 },
          piece: pawn('white'),
          captured: null,
          promotion: null,
          isCastle: false,
          isEnPassant: false,
          notation: 'e4',
        },
        {
          from: { file: 'e', rank: 7 },
          to: { file: 'e', rank: 5 },
          piece: pawn('black'),
          captured: null,
          promotion: null,
          isCastle: false,
          isEnPassant: false,
          notation: 'e5',
        },
      ],
      players: [
        { playerId: USER_WHITE_ID, color: 'white', isBot: false },
        { playerId: USER_BLACK_ID, color: 'black', isBot: false },
      ],
      winnerColor: null,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDrawByRepetition: false,
      isDrawByFiftyMoveRule: false,
      isInsufficientMaterial: false,
      isDrawByAgreement: false,
      drawOfferedBy: null,
      takebackOfferedBy: null,
      takebackMoveIndex: null,
      clocks: null,
      positionHistory: [
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR',
        'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR',
      ],
      currentTurnIndex: 0,
      logs: [],
      halfMoveClock: 0,
      fullMoveNumber: 2,
      legalMovesForCurrentPlayer: [],
    };

    await mockGameSocket(page, MOCK_ROOM_ID, USER_WHITE_ID, {
      roomJoinedPayload: {
        id: MOCK_ROOM_ID,
        gameId: 'chess_v1',
        status: 'playing',
        members: [
          {
            id: USER_WHITE_ID,
            userId: USER_WHITE_ID,
            displayName: 'White Player',
            isHost: true,
          },
          {
            id: USER_BLACK_ID,
            userId: USER_BLACK_ID,
            displayName: 'Black Player',
            isHost: false,
          },
        ],
        session: {
          id: 'session-chess-history',
          roomId: MOCK_ROOM_ID,
          gameId: 'chess_v1',
          status: 'playing',
          state: chessState,
        },
      },
    });

    await navigateTo(page, `/rooms/${MOCK_ROOM_ID}`);

    const e5 = page.getByTestId('chess-e5');
    await expect(e5).toHaveAttribute('aria-label', /black pawn/);
    const banner = page.getByTestId('chess-history-banner');
    await expect(banner).toHaveCount(0);

    await page.getByRole('button', { name: 'Previous move' }).first().click();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('1. e4');
    await expect(e5).not.toHaveAttribute('aria-label', /pawn/);

    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.keyboard.press('ArrowLeft');
    await expect(banner).toContainText('start position');

    await banner.getByRole('button', { name: 'Back to live' }).click();
    await expect(banner).toHaveCount(0);
    await expect(e5).toHaveAttribute('aria-label', /black pawn/);
  });
});
