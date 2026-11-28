import { expect, type Page } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';

const ALICE = {
  kind: 'user',
  name: 'Alice Feed',
  profileId: '64b7f0c2a1b2c3d4e5f60001',
  avatarId: null,
  frameId: null,
  role: null,
};
const BOT = { ...ALICE, kind: 'bot', name: null, profileId: null };
const GUEST = { ...ALICE, kind: 'guest', name: null, profileId: null };

const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString();

function item(id: string, over: Record<string, unknown> = {}) {
  return {
    id,
    type: 'game_completed',
    timestamp: minutesAgo(5),
    gameId: 'sea_battle_v1',
    actor: ALICE,
    opponents: [BOT],
    teammates: [],
    result: 'win',
    endReason: null,
    score: null,
    ratingDelta: null,
    replayId: null,
    achievement: null,
    level: null,
    streak: null,
    tournament: null,
    ...over,
  };
}

const FEED = {
  items: [
    item('w1', { timestamp: minutesAgo(1) }),
    item('w2', { timestamp: minutesAgo(5) }),
    item('w3', { timestamp: minutesAgo(9) }),
    item('d1', {
      timestamp: minutesAgo(20),
      actor: GUEST,
      opponents: [ALICE],
      gameId: 'chess_v1',
      result: 'draw',
    }),
    item('r1', {
      timestamp: minutesAgo(30),
      gameId: 'chess_v1',
      opponents: [GUEST],
      ratingDelta: 14,
      score: { actor: 1, opponents: [0] },
      replayId: 'rp-e2e',
    }),
    item('a1', {
      timestamp: minutesAgo(40),
      type: 'achievement_unlocked',
      gameId: null,
      opponents: [],
      result: null,
      achievement: { id: 'first_win', name: 'First Blood' },
    }),
  ],
  hasMore: false,
};

async function mockFeed(page: Page, body: unknown) {
  await page.route('**/activity/feed**', (route) =>
    route.fulfill({ json: body }),
  );
}

async function openFeed(page: Page) {
  await navigateTo(page, '/en');
  const section = page.getByTestId('home-recent-activity');
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible();
  return section;
}

test.describe('Home recent activity feed', () => {
  test('shows real names, grouped wins, result chips and links', async ({
    page,
  }) => {
    await mockFeed(page, FEED);
    const section = await openFeed(page);

    const group = section.getByTestId('activity-group');
    await expect(group).toHaveCount(1);
    await expect(group).toContainText('Alice Feed');
    await expect(group).toContainText('3 wins in the last hour');
    await expect(
      group.getByRole('link', { name: 'Alice Feed' }),
    ).toHaveAttribute('href', /\/players\/64b7f0c2a1b2c3d4e5f60001/);

    const cards = section.getByTestId('activity-card');
    await expect(cards).toHaveCount(3);
    const draw = cards.nth(0);
    await expect(draw).toContainText('Guest');
    await expect(draw.getByTestId('activity-result')).toContainText('Draw');

    const ranked = cards.nth(1);
    await expect(ranked).toContainText('+14');
    await expect(ranked).toContainText('1 - 0');
    await expect(ranked.getByTestId('activity-action-replay')).toHaveAttribute(
      'href',
      '/en/replay/rp-e2e',
    );

    await expect(cards.nth(2)).toContainText('Unlocked First Blood');
    await expect(section).not.toContainText('Player won a game');

    // Absolute time is available on hover.
    const time = ranked.locator('time');
    await expect(time).toHaveAttribute('title', /2\d{3}/);
  });

  test('filter tabs request the filtered feed', async ({ page }) => {
    await mockFeed(page, FEED);
    const section = await openFeed(page);
    const request = page.waitForRequest((r) => r.url().includes('filter=wins'));
    await section.getByTestId('activity-filter-wins').click();
    await request;
  });

  test('empty feed offers a call to action', async ({ page }) => {
    await mockFeed(page, { items: [], hasMore: false });
    const section = await openFeed(page);
    await expect(section).toContainText('No recent activity yet');
    await expect(
      section.getByRole('link', { name: 'Play a game' }),
    ).toBeVisible();
  });

  test('fits a 360px screen without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await mockFeed(page, FEED);
    const section = await openFeed(page);
    await expect(section.getByTestId('activity-group')).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
