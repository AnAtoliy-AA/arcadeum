import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import {
  navigateTo,
  mockSession,
  mockGameSocket,
  mockRoomInfo,
  waitForRoomReady,
  checkNoBackendErrors,
  MOCK_OBJECT_ID,
} from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

const ROOM_ID = '647f1a2b3c4d5e6f7a8b9c0d';

test.describe('Tutorial Overlay', () => {
  test.afterEach(() => {
    checkNoBackendErrors();
  });

  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockGameSocket(page, ROOM_ID, MOCK_OBJECT_ID);
    await mockRoomInfo(page, {
      room: {
        id: ROOM_ID,
        gameId: 'chess_v1',
        name: 'Test Room',
        status: 'lobby',
        members: [
          {
            id: MOCK_OBJECT_ID,
            userId: MOCK_OBJECT_ID,
            displayName: 'Host User',
            isHost: true,
          },
        ],
        playerCount: 1,
      },
    });
  });

  test('does not auto-open on room mount and opens/dismisses on demand', async ({
    page,
  }) => {
    await navigateTo(page, routes.gameRoom(ROOM_ID));
    await waitForRoomReady(page);

    const tutorialOverlay = page.getByTestId('tutorial-overlay');
    await expect(tutorialOverlay).toBeHidden();

    const showTutorialBtn = page.getByTestId('show-tutorial-button');
    await expect(showTutorialBtn).toBeVisible();
    await showTutorialBtn.click();

    await expect(tutorialOverlay).toBeVisible();
    await expect(page.getByTestId('tutorial-step-title')).toBeVisible();

    const closeBtn = page.getByTestId('tutorial-close-button');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(tutorialOverlay).toBeHidden();

    await showTutorialBtn.click();
    await expect(tutorialOverlay).toBeVisible();

    const blocker = page.getByTestId('tutorial-blocker');
    await blocker.click({ position: { x: 10, y: 10 } });
    await expect(tutorialOverlay).toBeHidden();
  });
});
