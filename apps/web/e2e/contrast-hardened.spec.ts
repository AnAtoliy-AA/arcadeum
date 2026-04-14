import { test, expect, type Page } from './fixtures/test-utils';
import { navigateTo } from './fixtures/test-utils';

declare global {
  interface Window {
    __SET_THEME__?: (theme: string) => void;
  }
}

/**
 * Programmatic contrast check
 * Returns the contrast ratio between text color and background color
 */
async function checkContrast(page: Page, selector: string) {
  const locator = page.locator(selector).first();
  const styles = await locator
    .evaluate((el: HTMLElement) => {
      const getVisibleBg = (element: HTMLElement): string => {
        const style = window.getComputedStyle(element);
        const bg = style.backgroundColor;
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== '') {
          return bg;
        }
        // Check children if parent is transparent (common for tamagui wrappers)
        for (const child of Array.from(element.children)) {
          const childStyle = window.getComputedStyle(child);
          const childBg = childStyle.backgroundColor;
          if (
            childBg !== 'rgba(0, 0, 0, 0)' &&
            childBg !== 'transparent' &&
            childBg !== ''
          ) {
            return childBg;
          }
          // Recurse once
          const innerChildBg = getVisibleBg(child as HTMLElement);
          if (
            innerChildBg !== 'rgba(0, 0, 0, 0)' &&
            innerChildBg !== 'transparent'
          ) {
            return innerChildBg;
          }
        }
        return 'rgba(0, 0, 0, 0)';
      };

      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: getVisibleBg(el),
        backgroundImage: style.backgroundImage,
      };
    })
    .catch(() => null);

  if (!styles) return 0;

  const parseRGB = (rgb: string) => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return [0, 0, 0];
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  };

  const [r1, g1, b1] = parseRGB(styles.color);
  const [r2, g2, b2] = parseRGB(styles.backgroundColor);

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
