import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo, mockSession, handleRoute } from './fixtures/test-utils';

test.describe('Game History', () => {
  test.beforeEach(async ({ page }) => {
    await mockSession(page);

    // Add safe catch-all for headers/stats to prevent 500s
    await page.route('**/games/*', async (route) => {
      if (route.request().resourceType() === 'document') {
        return route.continue();
      }
      const url = route.request().url();
      // Let history/detail mocks handle their paths
      if (url.includes('/history') || url.includes('/rematch')) {
        return route.continue();
      }
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    // State for the mock
    let historyItems = [
      {
        roomId: 'game-1',
        sessionId: '507f191e810c19729de860f1',
        gameId: 'critical_v1',
        roomName: 'Awesome Battle',
        status: 'completed',
        lastActivityAt: new Date(Date.now() - 86000000).toISOString(),
        host: {
          id: '507f191e810c19729de860ea',
          username: 'testuser',
          isHost: true,
        },
        participants: [
          {
            id: '507f191e810c19729de860ea',
            username: 'testuser',
            isHost: true,
          },
          {
            id: '507f191e810c19729de860e2',
            username: 'otheruser',
            isHost: false,
          },
        ],
        gameOptions: {
          cardVariant: 'cyberpunk',
        },
      },
    ];

    // Mock room details for rematch target
    await page.route('**/games/rooms/rematch-room-id**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'rematch-room-id',
          name: 'Rematch Room',
          gameId: 'critical_v1',
          status: 'waiting',
          participants: [],
        }),
      });
    });

    // Combined Mock for all history requests
    await page.route('**/games/history**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (method === 'OPTIONS') {
        await handleRoute(route, null);
        return;
      }

      if (url.includes('rematch')) {
        if (method === 'POST') {
          await handleRoute(route, { room: { id: 'rematch-room-id' } });
        } else {
          await route.continue();
        }
        return;
      }

      if (method === 'DELETE') {
        // Remove item from state
        historyItems = [];
        await handleRoute(route, { success: true });
        return;
      }

      if (method === 'GET') {
        // Determine if it's a detail request (has ID at end) or list request
        const isList =
          url.endsWith('/history') ||
          url.includes('/history?') ||
          url.includes('/history/search');
        const isDetail = !isList;

        if (isDetail) {
          await handleRoute(route, {
            summary: historyItems[0] || {},
            logs: [
              {
                id: 'log-1',
                type: 'system',
                message: 'Game started',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
              },
            ],
          });
        } else {
          await handleRoute(route, {
            entries: historyItems,
            total: historyItems.length,
            hasMore: false,
            page: 0,
          });
        }
      } else {
        await handleRoute(route, {});
      }
    });
  });

  test('should display history list', async ({ page }) => {
    await navigateTo(page, '/history');

    await expect(
      page.locator('h1, h2, [class*="Title"]').first(),
    ).toBeVisible();

    // Use toPass for better resilience
    await expect(async () => {
      const card = page
        .getByTestId('history-card')
        .filter({ hasText: 'Awesome Battle' });
      await expect(card).toBeVisible();
      await expect(card.getByTestId('history-status')).toContainText(
        /completed/i,
      );
    }).toPass({});
  });

  test('should open detail modal', async ({ page }) => {
    await navigateTo(page, '/history');

    const entry = page.getByText('Awesome Battle');
    await expect(async () => {
      await expect(entry).toBeVisible();
      await entry.click({ force: true });
    }).toPass({});

    const modal = page.getByTestId('history-detail-modal');
    await expect(async () => {
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/completed/i);
    }).toPass({});
  });

  test('should handle rematch action', async ({ page }) => {
    await navigateTo(page, '/history');

    await page.getByText('Awesome Battle').click({ force: true });

    // Wait for modal content
    await expect(page.getByText('Game started')).toBeVisible({});

    const rematchBtn = page.getByTestId('rematch-button');
    await expect(rematchBtn).toBeVisible();

    // Select a participant if needed (our mock has 2)
    const participant = page.locator('input[type="checkbox"]').first();
    if (await participant.isVisible()) {
      await participant.check();
    }

    await rematchBtn.scrollIntoViewIfNeeded();
    await rematchBtn.click({ force: true });

    // Should redirect to new room
    // Use a more robust expectation with poll if needed, but toHaveURL should be enough if button click worked
    await expect(page).toHaveURL(/rematch-room-id/, {});
  });
});
