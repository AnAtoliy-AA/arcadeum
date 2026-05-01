import { expect, test, mockGameSocket } from './fixtures/test-utils';
import { mockSession } from './fixtures/utils/auth';
import { mockRoomInfo } from './fixtures/utils/room';

test.describe('Games Control Panel Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    const roomId = '507f191e810c19729de860ea';
    const userId = '507f191e810c19729de860ea';

    await mockSession(page);
    await mockRoomInfo(page, {
      room: {
        id: roomId,
        name: 'Test Responsive Room',
        gameId: 'critical_v1',
      },
    });
    await mockGameSocket(page, roomId, userId);
  });

  test('should display full labels on desktop', async ({ page }) => {
    // Set desktop resolution
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/games/rooms/507f191e810c19729de860ea');

    // Wait for the control panel to be visible
    const controlPanel = page.getByTestId('games-control-panel');
    await expect(controlPanel).toBeVisible();

    // Fullscreen button should have text
    await expect(
      page.getByRole('button', { name: /fullscreen/i }),
    ).toBeVisible();
  });

  test('should hide labels and wrap on mobile', async ({ page }) => {
    // Set mobile resolution
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/games/rooms/507f191e810c19729de860ea');

    // Fullscreen button should NOT have text, but icon should be visible
    const fullscreenBtn = page.getByTestId('fullscreen-button');
    await expect(fullscreenBtn).toBeVisible();

    // Use toPass to wait for media queries to settle in Firefox/Webkit
    await expect(async () => {
      const box = await fullscreenBtn.boundingBox();
      // On mobile, icon only should be small
      expect(box?.width).toBeLessThan(70);
      await expect(page.getByText('Fullscreen')).not.toBeVisible();
    }).toPass({});
  });
});
