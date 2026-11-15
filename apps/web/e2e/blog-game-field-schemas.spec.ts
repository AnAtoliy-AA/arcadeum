import { test, expect } from '@playwright/test';

test.describe('Blog Real Game Field Schemas', () => {
  test('renders 10x10 sea battle board diagrams in sea-battle-best-strategies-and-placements', async ({
    page,
  }) => {
    await page.goto('/en/blog/sea-battle-best-strategies-and-placements', {
      waitUntil: 'domcontentloaded',
    });

    const diagrams = page.getByTestId('board-diagram');
    await expect(diagrams.first()).toBeVisible();

    const shorelineDiagram = page.locator('#schema-shoreline');
    await expect(shorelineDiagram).toBeVisible();
    await expect(
      shorelineDiagram.getByText(
        'Strategy 1: Perimeter (Shoreline) Placement Scheme',
      ),
    ).toBeVisible();
    await expect(shorelineDiagram.getByText('Fleet Ships')).toBeVisible();
    await expect(shorelineDiagram.getByText('Buffer Zones')).toBeVisible();
    await expect(
      shorelineDiagram.getByText('A', { exact: true }),
    ).toBeVisible();
    await expect(
      shorelineDiagram.getByText('J', { exact: true }),
    ).toBeVisible();

    const parityDiagram = page.locator('#schema-parity-search');
    await expect(parityDiagram).toBeVisible();
    await expect(
      parityDiagram.getByText(
        'Parity Search: 50% Reduction Checkerboard Fire Grid',
      ),
    ).toBeVisible();
    await expect(parityDiagram.getByText('Direct Hit (Target)')).toBeVisible();
    await expect(parityDiagram.getByText('Parity Probe')).toBeVisible();
  });

  test('renders localized 10x10 sea battle board diagrams in Russian locale', async ({
    page,
  }) => {
    await page.goto('/ru/blog/sea-battle-best-strategies-and-placements', {
      waitUntil: 'domcontentloaded',
    });

    const shorelineDiagram = page.locator('#schema-shoreline-ru');
    await expect(shorelineDiagram).toBeVisible();
    await expect(
      shorelineDiagram.getByText(
        'Схема 1: Расстановка «Береговая линия» (Периметр)',
      ),
    ).toBeVisible();
    await expect(shorelineDiagram.getByText('Корабли флота')).toBeVisible();
    await expect(shorelineDiagram.getByText('Мертвые зоны')).toBeVisible();
    await expect(
      shorelineDiagram.getByText('А', { exact: true }),
    ).toBeVisible();
    await expect(
      shorelineDiagram.getByText('К', { exact: true }),
    ).toBeVisible();
  });

  test('renders chess board diagrams in chess-opening-traps', async ({
    page,
  }) => {
    await page.goto('/en/blog/chess-opening-traps', {
      waitUntil: 'domcontentloaded',
    });

    const scholarsMate = page.locator('#schema-scholars-mate');
    await expect(scholarsMate).toBeVisible();
    await expect(
      scholarsMate.getByText("Scholar's Mate: 4-Move Checkmate on f7"),
    ).toBeVisible();
    await expect(scholarsMate.getByText('White Pieces')).toBeVisible();
    await expect(scholarsMate.getByText('Black Pieces')).toBeVisible();
    await expect(scholarsMate.getByText('a', { exact: true })).toBeVisible();
    await expect(scholarsMate.getByText('h', { exact: true })).toBeVisible();
  });

  test('renders checkers starting board in how-to-play-checkers', async ({
    page,
  }) => {
    await page.goto('/en/blog/how-to-play-checkers', {
      waitUntil: 'domcontentloaded',
    });

    const checkersSetup = page.locator('#schema-checkers-starting-setup');
    await expect(checkersSetup).toBeVisible();
    await expect(
      checkersSetup.getByText('Checkers Starting Position (8×8)'),
    ).toBeVisible();
    await expect(checkersSetup.getByText('Dark pieces (12)')).toBeVisible();
    await expect(checkersSetup.getByText('Light pieces (12)')).toBeVisible();
  });

  test('renders minesweeper 1-2-1 logic diagram in how-to-play-minesweeper', async ({
    page,
  }) => {
    await page.goto('/en/blog/how-to-play-minesweeper', {
      waitUntil: 'domcontentloaded',
    });

    const minesweeper121 = page.locator('#schema-minesweeper-121');
    await expect(minesweeper121).toBeVisible();
    await expect(
      minesweeper121.getByText('Classic 1-2-1 Boundary Deduction'),
    ).toBeVisible();
    await expect(
      minesweeper121.getByText('Deducted mine (flag)'),
    ).toBeVisible();
    await expect(
      minesweeper121.getByText('Guaranteed safe square'),
    ).toBeVisible();
  });

  test('renders go atari diagram in how-to-play-go', async ({ page }) => {
    await page.goto('/en/blog/how-to-play-go', {
      waitUntil: 'domcontentloaded',
    });

    const goAtari = page.locator('#schema-go-atari');
    await expect(goAtari).toBeVisible();
    await expect(goAtari.getByText('Atari Situation (9×9)')).toBeVisible();
    await expect(goAtari.getByText('Black stone (in atari)')).toBeVisible();
    await expect(goAtari.getByText('Surrounding White stones')).toBeVisible();
  });

  test('renders tic-tac-toe fork diagram in how-to-win-tic-tac-toe', async ({
    page,
  }) => {
    await page.goto('/en/blog/how-to-win-tic-tac-toe', {
      waitUntil: 'domcontentloaded',
    });

    const forkDiagram = page.locator('#schema-fork');
    await expect(forkDiagram).toBeVisible();
    await expect(
      forkDiagram.getByText('Fork Scheme: Unstoppable Double Threat'),
    ).toBeVisible();
    await expect(forkDiagram.getByText('Winning fork move')).toBeVisible();
  });
});
