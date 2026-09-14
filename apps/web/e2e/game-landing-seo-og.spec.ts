import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Game Landing SEO, AEO, GEO & Social Sharing', () => {
  test('chess landing renders complete AEO summary, specifications matrix and schemas', async ({
    page,
  }) => {
    const res = await page.goto(routes.chessLanding, {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(200);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Chess');

    const quickplayBtn = page
      .locator('[data-testid="quickplay-ai-button"]')
      .first();
    await expect(quickplayBtn).toBeVisible();

    const specTable = page.locator('[data-testid="game-spec-table"]').first();
    await expect(specTable).toBeVisible();
    await expect(specTable).toContainText('Stockfish 19 NNUE');
    await expect(specTable).toContainText('Chess960');

    const howTo = page.locator('#how-to-play').first();
    await expect(howTo).toBeVisible();

    const faq = page.locator('#faq').first();
    await expect(faq).toBeVisible();
    const firstDetails = faq.locator('details').first();
    await expect(firstDetails).toBeVisible();

    const jsonLd = page.locator('script#json-ld-chess');
    await expect(jsonLd).toHaveCount(1);
    const content = await jsonLd.textContent();
    expect(content).toContain('VideoGame');
    expect(content).toContain('HowTo');
    expect(content).toContain('FAQPage');
    expect(content).toContain('BreadcrumbList');
    expect(content).toContain('Stockfish 19');
  });

  test('checkers and backgammon render specifications matrix and direct answers', async ({
    page,
  }) => {
    await navigateTo(page, routes.checkersLanding);
    const checkersHeading = page.locator('h1').first();
    await expect(checkersHeading).toBeVisible();
    await expect(checkersHeading).toContainText('Checkers');

    const checkersSpec = page
      .locator('[data-testid="game-spec-table"]')
      .first();
    await expect(checkersSpec).toBeVisible();
    await expect(checkersSpec).toContainText('American Draughts');

    await navigateTo(page, routes.backgammonLanding);
    const bgHeading = page.locator('h1').first();
    await expect(bgHeading).toBeVisible();
    await expect(bgHeading).toContainText('Backgammon');

    const bgSpec = page.locator('[data-testid="game-spec-table"]').first();
    await expect(bgSpec).toBeVisible();
    await expect(bgSpec).toContainText('24 Points');
  });

  test('chess page contains OpenGraph and Twitter card meta tags', async ({
    page,
  }) => {
    await page.goto(routes.chessLanding, {
      waitUntil: 'domcontentloaded',
    });

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);
    const ogImageContent = await ogImage.getAttribute('content');
    expect(ogImageContent).toContain('/games/chess/opengraph-image');

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveCount(1);
    expect(await twitterCard.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  test('root opengraph image route responds successfully with png content-type', async ({
    request,
  }) => {
    const rootOg = await request.get('/en/opengraph-image');
    expect(rootOg.status()).toBe(200);
    expect(rootOg.headers()['content-type']).toContain('image/png');
  });

  test('chess landing interactive hero demo executes move and receives Stockfish 19 reply', async ({
    page,
  }) => {
    await navigateTo(page, routes.chessLanding);

    const preview = page.locator('[data-testid="chess-landing-preview"]');
    await expect(preview).toBeVisible();

    const moveButton = preview.getByRole('button', { name: '1. e4' });
    await expect(moveButton).toBeVisible();
    await moveButton.click();

    await expect(preview).toContainText('Sicilian Defense');
    await expect(preview).toContainText('Stockfish 19 Eval');

    const resetButton = preview.getByRole('button', { name: 'Reset Board' });
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    await expect(preview.getByRole('button', { name: '1. e4' })).toBeVisible();
  });

  test('chess landing invite/share modal opens with QR code and copy link', async ({
    page,
  }) => {
    await navigateTo(page, routes.chessLanding);

    const inviteBtn = page.getByRole('button', { name: /Invite \/ Share/i });
    await expect(inviteBtn).toBeVisible();
    await inviteBtn.click();

    const modalContent = page.locator(
      '[data-testid="game-invite-modal-content"]',
    );
    await expect(modalContent).toBeVisible();
    await expect(modalContent).toContainText('Invite a Friend to Chess');

    const qrCode = modalContent.getByLabel('QR Code to join game');
    await expect(qrCode).toBeVisible();

    const copyBtn = modalContent.getByRole('button', { name: 'Copy Link' });
    await expect(copyBtn).toBeVisible();

    const shareAppsBtn = modalContent.getByTestId('share-via-apps-button');
    await expect(shareAppsBtn).toBeVisible();
    await shareAppsBtn.click();

    const popover = modalContent.getByTestId('share-game-popover');
    await expect(popover).toBeVisible();
    await expect(modalContent.getByTestId('share-via-telegram')).toBeVisible();
    await expect(modalContent.getByTestId('share-via-whatsapp')).toBeVisible();
    await expect(modalContent.getByTestId('share-via-twitter')).toBeVisible();
    await expect(modalContent.getByTestId('share-via-facebook')).toBeVisible();
    await expect(modalContent.getByTestId('share-via-copy')).toBeVisible();
    await expect(modalContent.getByTestId('share-via-qr')).toBeVisible();

    await shareAppsBtn.click();
    await expect(popover).not.toBeVisible();

    const closeBtn = modalContent.getByRole('button', {
      name: 'Close',
      exact: true,
    });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(modalContent).not.toBeVisible();
  });

  test('chess landing renders platform comparison table and daily puzzle teaser', async ({
    page,
  }) => {
    await navigateTo(page, routes.chessLanding);

    const comparisonTable = page.locator(
      '[data-testid="platform-comparison-table"]',
    );
    await expect(comparisonTable).toBeVisible();
    await expect(comparisonTable).toContainText(
      'Arcadeum Chess Advantages & Capabilities',
    );
    await expect(comparisonTable).toContainText('Stockfish 19 NNUE Engine');
    await expect(comparisonTable).toContainText('100% Free · Included');

    const puzzleTeaser = page.locator('[data-testid="chess-puzzle-teaser"]');
    await expect(puzzleTeaser).toBeVisible();
    await expect(puzzleTeaser).toContainText('Solve the Daily Chess Puzzle');
    await expect(puzzleTeaser).toContainText('White to Move');

    const solveBtn = puzzleTeaser.getByRole('button', {
      name: 'Solve Move (1. Qxf7+)',
    });
    await expect(solveBtn).toBeVisible();
    await solveBtn.scrollIntoViewIfNeeded();
    await solveBtn.click();

    await expect(puzzleTeaser).toContainText('Brilliant!! 1. Qxf7+!');
  });

  test('chess landing theme cycling and showcase preview selection work', async ({
    page,
  }) => {
    await navigateTo(page, routes.chessLanding);

    const cycleBtn = page.locator('[data-testid="cycle-theme-button"]');
    await expect(cycleBtn).toBeVisible();

    const currentThemeBtn = page.locator(
      '[data-testid="current-theme-button"]',
    );
    const initialThemeName = await currentThemeBtn.textContent();

    await cycleBtn.click();
    await expect(currentThemeBtn).not.toHaveText(initialThemeName ?? '');

    const cyberpunkCard = page.locator('[data-testid="theme-card-cyberpunk"]');
    await expect(cyberpunkCard).toBeVisible();
    await cyberpunkCard.scrollIntoViewIfNeeded();
    await cyberpunkCard.click();

    await expect(cyberpunkCard).toContainText('Previewing');
    await expect(currentThemeBtn).toHaveText('Cyberpunk');
  });
});
