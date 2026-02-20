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

  test('should allow joining a private room as anonymous via invite link', async ({
    context,
    page,
  }) => {
    // 1. Create a private room as a logged in user (or another browser context)
    // For simplicity, we can just use the existing page to create it, then open a new context
    await page.goto('/games/create');
    await page.getByLabel('Room Name').fill('Private Link Test');
    await page.getByRole('button', { name: /Public|Private/i }).click();
    await page.getByRole('button', { name: 'Create Room' }).click();

    await expect(page).toHaveURL(/\/games\/rooms\//, { timeout: 15000 });
    const inviteUrl = page.url();
    const roomId = inviteUrl.match(/\/games\/rooms\/([^/?]+)/)?.[1];

    // Wait for the room to actually load its ID in the URL.
    await page.waitForTimeout(1500); // Give it a brief moment to settle the URL redirect
    const roomInviteUrl = await page.evaluate(() => window.location.href);

    // 2. Open the invite link in a new context (anonymous user)
    const newPage = await context.newPage();
    await newPage.goto(roomInviteUrl);

    // 3. Verify they are joined
    await expect(newPage.getByText('Joining...')).not.toBeVisible({
      timeout: 10000,
    });
    await expect(newPage.getByRole('button', { name: /Exit/i })).toBeVisible();
    await expect(
      newPage.getByText(/Waiting for host/i).or(newPage.getByText(/Lobby/i)),
    ).toBeVisible();

    createdRoomId = roomId ?? null;
    anonymousId = await newPage.evaluate(() =>
      localStorage.getItem('aico_anon_id'),
    );
  });
});
