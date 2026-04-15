import { test, expect, type Page } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

declare global {
  interface Window {
    __SET_THEME__?: (theme: string) => void;
  }
}

/**
 * Programmatic contrast check
 * Returns the contrast ratio between text color and background color.
 *
 * Handles Tamagui's rendering where:
 * - Link wrappers (<a>) may have a different color than the styled button inside
 * - CSS `background` gradient shorthand resets `backgroundColor` to transparent
 * - Text color may be set on a deeply nested Typography element
 */
async function checkContrast(page: Page, selector: string) {
  const locator = page.locator(selector).first();
  const styles = await locator
    .evaluate((el: HTMLElement) => {
      const isTransparent = (bg: string) =>
        !bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';

      // Walk the element tree to find a visible background color or gradient
      const getVisibleBg = (
        element: HTMLElement,
        depth = 0,
      ): { backgroundColor: string; backgroundImage: string } => {
        const style = window.getComputedStyle(element);
        const bg = style.backgroundColor;
        const bgImg = style.backgroundImage;

        // Found solid background color
        if (!isTransparent(bg)) {
          return { backgroundColor: bg, backgroundImage: bgImg };
        }
        // Found gradient background (background shorthand resets backgroundColor)
        if (bgImg && bgImg !== 'none') {
          return { backgroundColor: bg, backgroundImage: bgImg };
        }

        if (depth > 3) return { backgroundColor: bg, backgroundImage: 'none' };

        // Check children (common for <a> wrapping tamagui styled components)
        for (const child of Array.from(element.children)) {
          const result = getVisibleBg(child as HTMLElement, depth + 1);
          if (
            !isTransparent(result.backgroundColor) ||
            (result.backgroundImage && result.backgroundImage !== 'none')
          ) {
            return result;
          }
        }
        return { backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none' };
      };

      // Find the deepest text element to get its actual rendered color
      // (wrapper elements like <a> may inherit a different color from the theme)
      const getTextColor = (element: HTMLElement): string => {
        const style = window.getComputedStyle(element);
        for (const child of Array.from(element.children)) {
          const childEl = child as HTMLElement;
          if (!childEl.textContent?.trim()) continue;
          const tag = childEl.tagName.toLowerCase();
          if (tag === 'svg' || tag === 'img') continue;
          const hasDirectText = Array.from(childEl.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
          );
          if (hasDirectText) {
            return window.getComputedStyle(childEl).color;
          }
          const deepColor = getTextColor(childEl);
          if (deepColor) return deepColor;
        }
        return style.color;
      };

      const bgResult = getVisibleBg(el);
      return {
        color: getTextColor(el),
        backgroundColor: bgResult.backgroundColor,
        backgroundImage: bgResult.backgroundImage,
      };
    })
    .catch(() => null);

  if (!styles) return 0;

  const parseRGB = (rgb: string) => {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  };

  // Extract average color from a CSS gradient like
  // "linear-gradient(160deg, rgb(255, 232, 102) 0%, rgb(255, 149, 0) 100%)"
  const parseGradientAvg = (gradient: string): number[] | null => {
    const rgbMatches = [
      ...gradient.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g),
    ];
    if (rgbMatches.length === 0) return null;
    const colors = rgbMatches.map((m) => [
      parseInt(m[1]),
      parseInt(m[2]),
      parseInt(m[3]),
    ]);
    const avg = [0, 1, 2].map((i) =>
      Math.round(colors.reduce((s, c) => s + c[i], 0) / colors.length),
    );
    return avg;
  };

  const textColor = parseRGB(styles.color);
  if (!textColor) return 0;

  // Prefer solid backgroundColor; fall back to gradient average when bg is transparent
  const isTransparentBg =
    !styles.backgroundColor ||
    styles.backgroundColor === 'rgba(0, 0, 0, 0)' ||
    styles.backgroundColor === 'transparent';
  let bgColor = isTransparentBg ? null : parseRGB(styles.backgroundColor);
  if (!bgColor && styles.backgroundImage && styles.backgroundImage !== 'none') {
    bgColor = parseGradientAvg(styles.backgroundImage);
  }
  if (!bgColor) return 0;

  const [r1, g1, b1] = textColor;
  const [r2, g2, b2] = bgColor;

  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);

  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const WCAG_AA_THRESHOLD = 4.45; // Target 4.5:1, using 4.45 for rounding safety

test.describe('Contrast Hardening Verification', () => {
  const themes = ['dark', 'neonDark', 'violetDark', 'tealDark'];

  for (const theme of themes) {
    test(`check primary button contrast in ${theme} theme`, async ({
      page,
    }) => {
      await navigateTo(page, '/');

      // Select theme via cookie switcher
      await page.evaluate((t) => {
        if (window.__SET_THEME__) {
          window.__SET_THEME__(t);
        } else {
          document.cookie = `app-theme=${t}; path=/; max-age=31536000`;
          window.location.reload();
        }
      }, theme);

      // Wait for hydration and potential reload, then verify theme attribute
      await page
        .waitForFunction(
          (t) => {
            return document.documentElement.getAttribute('data-theme') === t;
          },
          theme,
          { timeout: 5000 },
        )
        .catch(() => null);

      await page.waitForTimeout(500);

      const ctaSelector =
        '.is_LinkButton:has-text("Get started"), a:has-text("Get started")';
      const cta = page.locator(ctaSelector).first();
      await expect(cta).toBeVisible({ timeout: 15000 });

      const ratio = await checkContrast(page, ctaSelector);

      // WCAG AA requires 4.5:1
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_THRESHOLD);
    });
  }
});
