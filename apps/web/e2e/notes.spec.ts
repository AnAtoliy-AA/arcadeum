import { expect } from '@playwright/test';
import { test } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

test.describe('Payment Notes Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock notes API
    await page.route('**/payments/notes*', async (route) => {
      const url = new URL(route.request().url());
      const pageParam = url.searchParams.get('page') || '1';

      if (route.request().method() === 'GET') {
        const mockNotes =
          pageParam === '1'
            ? [
                {
                  id: 'note-1',
                  note: 'Great project! Keep up the amazing work!',
                  amount: 25,
                  currency: 'USD',
                  displayName: 'John Doe',
                  createdAt: '2026-01-15T10:30:00Z',
                },
                {
                  id: 'note-2',
                  note: 'Love this application, happy to support!',
                  amount: 50,
                  currency: 'USD',
                  displayName: null,
                  createdAt: '2026-01-14T15:45:00Z',
                },
                {
                  id: 'note-3',
                  note: 'Thanks for building this!',
                  amount: 10,
                  currency: 'USD',
                  displayName: 'Jane Smith',
                  createdAt: '2026-01-13T09:00:00Z',
                },
              ]
            : [];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notes: mockNotes,
            total: 3,
            page: Number(pageParam),
            limit: 12,
            totalPages: 1,
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should display notes page with title and subtitle', async ({
    page,
  }) => {
    await navigateTo(page, '/notes');

    // Check for page title
    await expect(
      page.getByRole('heading', { name: /supporter notes/i }),
    ).toBeVisible();

    // Check for subtitle
    await expect(
      page.getByText(/messages of support|community/i),
    ).toBeVisible();
  });

  test('should display notes from supporters', async ({ page }) => {
    await navigateTo(page, '/notes');

    // Check for John Doe's note
    await expect(
      page.getByText('Great project! Keep up the amazing work!'),
    ).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('$25')).toBeVisible();

    // Check for anonymous supporter note
    await expect(
      page.getByText('Love this application, happy to support!'),
    ).toBeVisible();
    await expect(page.getByText(/anonymous supporter/i)).toBeVisible();

    // Check for Jane Smith's note
    await expect(page.getByText('Thanks for building this!')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('should display note amounts with currency formatting', async ({
    page,
  }) => {
    await navigateTo(page, '/notes');

    // Wait for notes to load
    await page.waitForSelector('text=John Doe');

    // Check that amounts are displayed
    await expect(page.getByText('$25')).toBeVisible();
    await expect(page.getByText('$50')).toBeVisible();
    await expect(page.getByText('$10')).toBeVisible();
  });

  test('should display dates for notes', async ({ page }) => {
    await navigateTo(page, '/notes');

    // Wait for notes to load
    await page.waitForSelector('text=John Doe');

    // Check for formatted dates (format depends on locale)
    await expect(page.getByText(/jan.*15.*2026|15.*jan.*2026/i)).toBeVisible();
  });

  test('should show empty state when no notes exist', async ({ page }) => {
    // Override the mock to return empty notes
    await page.route('**/payments/notes*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notes: [],
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, '/notes');

    // Check for empty state message
    await expect(page.getByText(/no notes yet|be the first/i)).toBeVisible();
  });

  test('should support infinite scroll when more pages exist', async ({
    page,
  }) => {
    // Override to have multiple pages with different content per page
    await page.route('**/payments/notes*', async (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url());
        const pageParam = parseInt(url.searchParams.get('page') || '1', 10);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notes: [
              {
                id: `note-page-${pageParam}`,
                note: `Test note from page ${pageParam}`,
                amount: 25,
                currency: 'USD',
                displayName: 'Test User',
                createdAt: '2026-01-15T10:30:00Z',
              },
            ],
            total: 25,
            page: pageParam,
            limit: 12,
            totalPages: 3,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await navigateTo(page, '/notes');

    // Wait for first page notes to load
    await page.waitForSelector('text=Test note from page 1');

    // Verify the first page content is visible
    await expect(page.getByText('Test note from page 1')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Override to return error
    await page.route('**/payments/notes*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' }),
      });
    });

    await navigateTo(page, '/notes');

    // Page should still render (even if empty or with error state)
    await expect(
      page.getByRole('heading', { name: /supporter notes/i }),
    ).toBeVisible();
  });
});
