import { expect } from '@playwright/test';
import {
  test,
  mockSession,
  navigateTo,
  mockRoomInfo,
  MOCK_OBJECT_ID,
  waitForRoomReady,
  mockGameSocket,
} from './fixtures/test-utils';

test.describe('Room Clear Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);
    await mockRoomInfo(page, {
      room: {
        id: MOCK_OBJECT_ID,
        hostId: 'user-1',
        name: 'Clear Test Room',
        members: [
          {
            id: 'user-1',
            userId: 'user-1',
            displayName: 'Test User',
            isHost: true,
          },
        ],
      },
    });
    await mockGameSocket(page, MOCK_OBJECT_ID, 'user-1');

    // Mock delete endpoint
    await page.route('**/games/rooms/delete', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();

      const postData = await route.request().postDataJSON();
      if (postData?.roomId === MOCK_OBJECT_ID) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should allow host to delete the room and see confirmation modal', async ({
    page,
  }) => {
    await navigateTo(page, `/games/rooms/${MOCK_OBJECT_ID}`);
    await waitForRoomReady(page);

    // Verify "Delete Room" button is visible for host
    const deleteButton = page.getByRole('button', { name: /delete room/i });
    await expect(deleteButton).toBeVisible();

    // Click "Delete Room" - should open custom modal
    await deleteButton.click();

    // Verify custom ConfirmationModal is visible
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(
      /are you sure you want to delete this room/i,
    );

    // Verify modal buttons
    const confirmBtn = modal
      .getByRole('button', { name: /delete room/i })
      .first();
    const cancelBtn = modal.getByRole('button', { name: /keep room/i });
    await expect(confirmBtn).toBeVisible();
    await expect(cancelBtn).toBeVisible();

    // Click Cancel first
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();

    // Open again and confirm
    await deleteButton.click();
    await confirmBtn.click();

    // Verify redirection to games list
    await expect(page).toHaveURL(/\/games/);
  });
});
