import { test, expect } from '@playwright/test';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

test.describe('Anonymous Play', () => {
  let createdRoomId: string | null = null;
  let anonymousId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdRoomId && anonymousId) {
      await request.post(`${API_BASE}/games/rooms/delete`, {
        headers: { 'x-anonymous-id': anonymousId },
        data: { roomId: createdRoomId },
      });
    }
    createdRoomId = null;
    anonymousId = null;
  });

  test('should allow creating a room without login', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Play with Bots' }).click();

    await expect(page).toHaveURL(/\/games\/create/);

    await page.getByLabel('Room Name').fill('Anonymous Bot Game');

    await page.getByRole('button', { name: 'Create Room' }).click();

    await expect(page).toHaveURL(/\/games\/rooms\//, { timeout: 15000 });

    const url = page.url();
    const match = url.match(/\/games\/rooms\/([^/?]+)/);
    createdRoomId = match?.[1] ?? null;

    anonymousId = await page.evaluate(() =>
      localStorage.getItem('aico_anon_id'),
    );

    try {
      await expect(page.getByText('Joining...')).not.toBeVisible({
        timeout: 2000,
      });
    } catch {
      // Ignore
    }

    await expect(page.getByRole('button', { name: /Exit/i })).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Start Game|Start with/i }),
    ).toBeVisible();
  });
});
