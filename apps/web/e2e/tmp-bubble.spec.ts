import { test } from '@playwright/test';
import { mockGameSocket } from './fixtures/socket-mocks';
import { mockRoomInfo, waitForRoomReady } from './fixtures/utils/room';
import { MOCK_OBJECT_ID } from './fixtures/utils/auth';

const anonId = 'anon-bubble-check';

test('TMP bubble bg', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((id) => {
    window.isPlaywright = true;
    localStorage.setItem('arcadeum_anon_id', id);
  }, anonId);
  await mockRoomInfo(page, {
    room: {
      id: MOCK_OBJECT_ID,
      name: 'Bubble',
      gameId: 'critical_v1',
      status: 'lobby',
      visibility: 'public',
      maxPlayers: 8,
      playerCount: 1,
      members: [
        { id: anonId, userId: anonId, displayName: 'Guest', isHost: true },
      ],
      hostId: anonId,
    },
  });
  await mockGameSocket(page, MOCK_OBJECT_ID, anonId);
  await page.goto(`/en/games/rooms/${MOCK_OBJECT_ID}?mode=play`);
  await waitForRoomReady(page, { autoCloseRules: false });
  await page.evaluate(() => {
    document.querySelector('[data-testid="rules-modal"]')?.remove();
  });

  await page.evaluate(() => {
    const panel = document.querySelector(
      '[data-testid="game-chat-panel"]',
    ) as HTMLElement | null;
    const list = panel?.querySelector(
      '[aria-live="polite"]',
    ) as HTMLElement | null;
    if (list) {
      const html = `
        <div style="display:flex;flex-direction:column;gap:8px;padding:8px">
          <div style="align-self:flex-start;max-width:85%">
            <div data-testid="test-incoming" style="padding:10px 16px;border-radius:16px;background-color:var(--glassBg);border:1px solid var(--glassBorder)">hello from player</div>
          </div>
          <div style="align-self:flex-end;max-width:85%">
            <div data-testid="test-own" style="padding:10px 16px;border-radius:16px;background-color:var(--primary)">my reply</div>
          </div>
        </div>`;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      list.appendChild(wrapper);
    }
  });

  const m = await page.evaluate(() => {
    const panel = document.querySelector(
      '[data-testid="game-chat-panel"]',
    ) as HTMLElement | null;
    const panelBg = panel ? getComputedStyle(panel).backgroundColor : null;
    const incoming = document.querySelector(
      '[data-testid="test-incoming"]',
    ) as HTMLElement | null;
    const own = document.querySelector(
      '[data-testid="test-own"]',
    ) as HTMLElement | null;
    return {
      panelBg,
      panelBgImage: panel ? getComputedStyle(panel).backgroundImage : null,
      incomingBg: incoming ? getComputedStyle(incoming).backgroundColor : null,
      ownBg: own ? getComputedStyle(own).backgroundColor : null,
    };
  });
  console.log('BUBBLE', JSON.stringify(m, null, 2));
});
