import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  ensureNavigationVisible,
} from './fixtures/test-utils';

test.describe('Header and Footer Modernization', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
  });

  test('header should have glassmorphism effect', async ({ page }) => {
    const header = page.locator('header').first();
    const backdropFilter = await header.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return (
        styles.backdropFilter ||
        (styles as CSSStyleDeclaration & { webkitBackdropFilter?: string })
          .webkitBackdropFilter ||
        ''
      );
    });
    // The actual value might be "blur(32px) saturate(200%)" or similar depending on browser
    expect(backdropFilter).toContain('blur');
  });

  test('footer should have glassmorphism effect', async ({ page }) => {
    const footer = page.locator('footer > div').first();
    const backdropFilter = await footer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      // webkit uses -webkit-backdrop-filter; standard uses backdrop-filter
      return (
        styles.backdropFilter ||
        (styles as CSSStyleDeclaration & { webkitBackdropFilter?: string })
          .webkitBackdropFilter ||
        ''
      );
    });
    expect(backdropFilter).toContain('blur');
  });

  test('navigation links should have indicators', async ({
    page,
    isMobile,
  }) => {
    // Navigate to /games so the games nav link becomes active
    await navigateTo(page, '/games');
    await ensureNavigationVisible(page);

    if (isMobile) {
      // On mobile, the active link in the mobile menu should have a distinct background
      const activeLink = page.getByTestId('mobile-nav-games');
      await expect(activeLink).toBeVisible();
      const backgroundColor = await activeLink.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      // 'rgba(87, 195, 255, 0.1)' or similar, but may be 'rgb(37, 42, 46)' if opaque
      expect(backgroundColor).toMatch(/rgba?\(/);
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(backgroundColor).not.toBe('transparent');
    } else {
      // Desktop link in nav should be active — its indicator should have opacity > 0
      const activeIndicator = page
        .locator('nav > div')
        .first()
        .getByTestId('nav-link-indicator');
      await expect(activeIndicator).toBeVisible();
      const opacity = await activeIndicator.evaluate(
        (el) => window.getComputedStyle(el).opacity,
      );
      expect(parseFloat(opacity)).toBeGreaterThan(0);
    }
  });

  test('logo should have hover effect', async ({ page, isMobile }) => {
    test.skip(
      isMobile,
      'Hover effects are not applicable on mobile/touch devices',
    );
    const logo = page.locator('header a[href="/"]').first();
    const logoInner = logo.locator('> div').first();

    // Hover directly on the inner div that has the hoverStyle
    await logoInner.hover();

    // Use toPass to wait for the transition to be reflected in computed styles
    await expect(async () => {
      const transform = await logoInner.evaluate(
        (el) => window.getComputedStyle(el).transform,
      );
      // "scale(1.02)" results in a matrix like matrix(1.02, 0, 0, 1.02, 1, 0)
      expect(transform).toContain('matrix');
    }).toPass();
  });

  test('footer social icons should have hover effect', async ({
    page,
    isMobile,
  }) => {
    test.skip(
      isMobile,
      'Hover effects are not applicable on mobile/touch devices',
    );
    const socialIcons = page.getByTestId(/footer-social-/);
    const firstIcon = socialIcons.first();

    await firstIcon.hover();

    // Use toPass to wait for the transition to be reflected in computed styles
    await expect(async () => {
      const transform = await firstIcon.evaluate(
        (el) => window.getComputedStyle(el).transform,
      );
      expect(transform).toContain('matrix');
    }).toPass();
  });
});
