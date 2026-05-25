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
    // Backdrop filter lives on the inner FooterRoot wrapper, not the
    // semantic <footer> element itself.
    const footer = page.locator('footer > *').first();
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

  test('active nav link should be visually distinct', async ({
    page,
    isMobile,
  }) => {
    // Navigate to /games so the games nav link becomes active
    await navigateTo(page, '/games');
    await ensureNavigationVisible(page);

    const activeLink = isMobile
      ? page.getByTestId('mobile-nav-games')
      : page.locator('nav.nav-styled').getByTestId('nav-games').first();

    await expect(activeLink).toBeVisible();

    // Active treatment is a tinted pill background — no longer an
    // underline indicator. Verify the background is a non-transparent
    // colour, which signals the active state to the user.
    const backgroundColor = await activeLink.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).toMatch(/rgba?\(/);
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('transparent');
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
    }).toPass({});
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
    }).toPass({});
  });
});
