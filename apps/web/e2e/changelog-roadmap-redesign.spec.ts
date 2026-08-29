import { expect } from '@playwright/test';
import { test, navigateTo } from './fixtures/test-utils';
import { routes } from '../src/shared/config/routes';

test.describe('Changelog and Roadmap UI Redesign', () => {
  test('changelog renders rich metrics, search, and category filters', async ({
    page,
  }) => {
    await navigateTo(page, routes.changelog);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Changelog|Список изменений/i }),
    ).toBeVisible();

    await expect(page.getByText(/releases/i).first()).toBeVisible();
    await expect(page.getByText(/changes/i).first()).toBeVisible();

    const searchInput = page.getByPlaceholder(
      /Search updates|Поиск по обновлениям/i,
    );
    await expect(searchInput).toBeVisible();

    await searchInput.fill('android');
    await expect(page.getByText(/ARC-892/i).first()).toBeVisible();

    await searchInput.fill('');

    const expandAllButton = page.getByRole('button', {
      name: /Expand all|Развернуть все/i,
    });
    await expect(expandAllButton).toBeVisible();
    await expandAllButton.click();

    const collapseAllButton = page.getByRole('button', {
      name: /Collapse all|Свернуть все/i,
    });
    await expect(collapseAllButton).toBeVisible();
    await collapseAllButton.click();

    const footer = page.locator('footer').first();
    await expect(footer).toBeAttached();
  });

  test('roadmap renders hero progress, view switcher, and interactive tabs', async ({
    page,
  }) => {
    await navigateTo(page, routes.roadmap);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Arcadeum Games Roadmap/i }),
    ).toBeVisible();

    await expect(
      page
        .getByText(/Platform Completion Progress|Прогресс платформы/i)
        .first(),
    ).toBeVisible();
    await expect(page.getByText('Implemented').first()).toBeVisible();
    await expect(page.getByText(/Quick Wins/i).first()).toBeVisible();
    await expect(page.getByText(/Core Additions/i).first()).toBeVisible();

    const timelineTab = page.getByRole('button', {
      name: /Phased Journey|Timeline|Этапы развития/i,
    });
    await expect(timelineTab).toBeVisible();
    await timelineTab.click();

    await expect(page.getByText(/Phase 1|Этап 1/i).first()).toBeVisible();

    const directoryTab = page.getByRole('button', {
      name: /All Features|Directory|Все функции/i,
    });
    await expect(directoryTab).toBeVisible();
    await directoryTab.click();

    const searchInput = page.getByPlaceholder(
      /Search features|Поиск по функциям/i,
    );
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Chess');
    await expect(page.getByText(/Chess Engine/i).first()).toBeVisible();

    const tiersTab = page.getByRole('button', {
      name: /Strategic Tiers|Tiers|Стратегические уровни/i,
    });
    await expect(tiersTab).toBeVisible();
    await tiersTab.click();

    await expect(
      page.getByText(/Retention & Habit Loops/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Performance & Latency/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/100% Legal|Все игры в общественном достоянии/i).first(),
    ).toBeVisible();

    const footer = page.locator('footer').first();
    await expect(footer).toBeAttached();
  });
});
