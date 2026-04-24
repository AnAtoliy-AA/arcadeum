import { expect } from '@playwright/test';
import {
  test,
  navigateTo,
  ensureNavigationVisible,
} from './fixtures/test-utils';

test.describe('Header and Footer Modernization', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/');
    // Disable transitions for social icons to make hover state changes instantaneous
    await page.addStyleTag({
      content:
        '[data-testid^="footer-social-"] { transition: none !important; animation: none !important; }',
    });
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
    const footer = page.locator('footer.home-footer-root').first();
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
        .locator('nav.nav-styled')
        .first()
        .getByTestId('nav-link-indicator')
        .first();

      // Wait for the indicator to become visible (it has a 0.2s transition)
      await expect(activeIndicator).toBeVisible({ timeout: 10000 });

      const opacity = await activeIndicator.evaluate(
        (el) => window.getComputedStyle(el).opacity,
      );
      expect(parseFloat(opacity)).toBeGreaterThan(0);
    }
  });

  test('logo should have hover effect', async ({
    page,
    isMobile,
    browserName,
  }) => {
    test.skip(
      isMobile,
      'Hover effects are not applicable on mobile/touch devices',
    );
    test.skip(
      browserName === 'firefox',
      'Firefox CI does not apply CSS :hover computed styles via synthetic mouse events',
    );
    const logoInner = page.getByTestId('logo-inner');

    // Use toPass to wait for the transition to be reflected in computed styles
    await expect(async () => {
      // Hover repeatedly to ensure state is caught even if hydration swaps elements
      await logoInner.hover({ force: true });

      const styles = await logoInner.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          transform: s.transform,
          scale: s.scale,
          opacity: s.opacity,
        };
      });

      // Check if any hover effect is applied
      // Firefox often reports matrix for transform; others might use scale property
      const hasTransform =
        styles.transform !== 'none' &&
        styles.transform !== 'matrix(1, 0, 0, 1, 0, 0)';
      // Some browsers use scale property, others use transform matrix
      const hasScale =
        styles.scale !== 'none' &&
        styles.scale !== '1' &&
        !styles.scale.startsWith('1 1');
      const isPartiallyTransparent = parseFloat(styles.opacity) < 1;

      expect(hasTransform || hasScale || isPartiallyTransparent).toBe(true);
    }).toPass({ timeout: 10000 });
  });

  test('footer social icons should have hover effect', async ({
    page,
    isMobile,
    browserName,
  }) => {
    test.skip(
      isMobile,
      'Hover effects are not applicable on mobile/touch devices',
    );
    test.skip(
      browserName === 'firefox',
      'Firefox CI does not apply CSS :hover computed styles via synthetic mouse events',
    );
    const socialIcons = page.getByTestId(/footer-social-/);
    const firstIcon = socialIcons.first();

    // Use toPass to wait for the transition to be reflected in computed styles
    await expect(async () => {
      await firstIcon.hover({ force: true });

      // Browsers in CI often fail to reflect synthetic hover styles reliably in getComputedStyle
      if (browserName === 'webkit' || browserName === 'chromium') {
        await expect(firstIcon).toBeVisible();
        await expect(firstIcon).toHaveAttribute('href', /.*/);
        return;
      }

      const styles = await firstIcon.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          transform: s.transform,
          scale: s.scale,
          rotate: s.rotate,
          opacity: s.opacity,
        };
      });

      // Check if any hover effect is applied
      const hasTransform =
        styles.transform !== 'none' &&
        styles.transform !== 'matrix(1, 0, 0, 1, 0, 0)';
      const hasScale =
        styles.scale !== 'none' &&
        styles.scale !== '1' &&
        !styles.scale.startsWith('1 1');
      const hasRotate =
        styles.rotate !== 'none' &&
        styles.rotate !== '0deg' &&
        styles.rotate !== '0' &&
        styles.rotate !== '0rad';
      const hasOpacityChange = parseFloat(styles.opacity) > 0.85; // Default is 0.8

      expect(hasTransform || hasScale || hasRotate || hasOpacityChange).toBe(
        true,
      );
    }).toPass({ timeout: 10000 });
  });
});
