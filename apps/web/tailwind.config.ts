import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * Tailwind for apps/web — used by the home page.
 *
 * - preflight is disabled: the app already resets via reset.scss
 *   (global box-sizing: border-box etc.), so enabling Tailwind's
 *   preflight would double-reset and shift styling across the app.
 * - Colors map to the runtime CSS variables emitted by the theme provider
 *   (--color, --glassBg, --primary, ...) and tokens.scss, so dark / light /
 *   neon / purple themes keep working unchanged.
 * - The home-specific keyframes that previously lived in
 *   home/components/styles/*.scss are defined here so home markup can use
 *   `animate-*` utilities instead of SCSS classes.
 */
export default {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'muted-color': 'var(--muted-foreground)',
        color: 'var(--color)',
        'text-secondary': 'var(--textSecondary, rgba(180, 180, 200, 0.7))',
        'glass-bg': 'var(--glassBg)',
        'glass-border': 'var(--glassBorder)',
        'glass-border-hover': 'var(--glassBorderHover)',
        primary: 'var(--primary)',
        accent: 'var(--accent)',
        secondary: 'var(--secondary)',
        'secondary-text': 'var(--secondaryText)',
        'grad-start': 'var(--secondaryGradientStart)',
        'grad-end': 'var(--secondaryGradientEnd)',
        'border-color': 'var(--borderColor)',
        gold: 'var(--goldAccent, #ffd166)',
      },
      backgroundImage: {
        'hero-overlay':
          'radial-gradient(circle at 50% 50%, transparent 20%, var(--background) 95%), linear-gradient(to bottom, transparent 60%, var(--background) 100%)',
        'hero-overlay-mobile':
          'radial-gradient(circle at 50% 50%, transparent 40%, var(--background) 110%), linear-gradient(to bottom, transparent 60%, var(--background) 100%)',
        'hero-glow':
          'radial-gradient(circle at 20% 25%, var(--backgroundRadialStart) 0%, transparent 45%), radial-gradient(circle at 80% 75%, var(--backgroundRadialStart) 0%, transparent 45%), radial-gradient(circle at 50% 50%, var(--primaryGradientStart) 0%, transparent 50%)',
        'hero-noise':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        'featured-cover':
          'radial-gradient(120% 80% at 30% 20%, color-mix(in srgb, var(--game-accent) 35%, transparent), transparent 60%), radial-gradient(80% 80% at 100% 100%, color-mix(in srgb, var(--game-accent) 12%, transparent), transparent 60%), repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0 2px, transparent 2px 16px), #08191a',
        'card-cover-fade':
          'linear-gradient(180deg, transparent, color-mix(in srgb, var(--glassBg) 90%, transparent))',
        'scrim-top':
          'linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.25) 60%, rgba(0, 0, 0, 0) 100%)',
        'scrim-bottom':
          'linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 55%, rgba(0, 0, 0, 0) 100%)',
        'gold-gradient': 'linear-gradient(160deg, #ffe866 0%, #ff9500 100%)',
        'glass-gradient':
          'linear-gradient(160deg, var(--secondaryGradientStart) 0%, var(--secondaryGradientEnd) 100%)',
        'glass-gradient-hover':
          'linear-gradient(160deg, var(--accent) 0%, var(--secondaryGradientStart) 100%)',
        'card-shimmer':
          'linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.08) 50%, transparent 70%)',
        'step-connector-v':
          'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent)',
        'step-connector-h':
          'linear-gradient(to right, transparent, rgba(87, 195, 255, 0.3), transparent)',
        'video-overlay':
          'radial-gradient(circle at center, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%)',
        'presentation-top':
          'linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 100%)',
        'presentation-bottom':
          'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%)',
      },
      boxShadow: {
        card: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 6px 14px rgba(0, 0, 0, 0.3), 0 20px 40px -10px rgba(0, 0, 0, 0.55)',
        'card-hover':
          'inset 0 0 0 1px rgba(255, 255, 255, 0.18), 0 12px 24px rgba(0, 0, 0, 0.4), 0 30px 60px -12px rgba(0, 0, 0, 0.7)',
      },
      textShadow: {
        hero3d:
          '1px 1px var(--accent), 2px 2px var(--accent), 3px 3px var(--primary), 4px 4px var(--primary), 5px 5px var(--secondary), 6px 6px var(--secondary), 12px 18px 30px rgba(0, 0, 0, 0.6)',
        hero3dSub:
          '1px 1px var(--accent), 2px 2px var(--primary), 3px 3px var(--secondary), 10px 14px 24px rgba(0, 0, 0, 0.6)',
        'card-text': '0 1px 2px rgba(0, 0, 0, 0.6)',
        'title-soft': '0 2px 16px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'hero-float-3d': {
          '0%, 100%': { transform: 'translateY(0) rotateX(0) rotateY(0)' },
          '25%': { transform: 'translateY(-10px) rotateX(4deg) rotateY(4deg)' },
          '50%': {
            transform: 'translateY(-5px) rotateX(-2deg) rotateY(-6deg)',
          },
          '75%': { transform: 'translateY(-8px) rotateX(2deg) rotateY(2deg)' },
        },
        'sub-hue-shift': {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '33%': { filter: 'hue-rotate(120deg)' },
          '66%': { filter: 'hue-rotate(240deg)' },
        },
        'hero-color-shift': {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(180deg)' },
        },
        'pulse-animation': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'btn-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 171, 0, 0.4)',
          },
          '70%': {
            transform: 'scale(1.03)',
            boxShadow: '0 0 0 15px rgba(255, 171, 0, 0)',
          },
        },
        'btn-jump': {
          '0%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-6px)' },
          '70%': { transform: 'translateY(2px)' },
          '100%': { transform: 'translateY(0)' },
        },
        'btn-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '60%, 100%': { transform: 'translateX(280%)' },
        },
        'arcadeum-shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'hero-float-3d': 'hero-float-3d 6s ease-in-out infinite',
        'sub-hue-shift': 'sub-hue-shift 15s linear infinite',
        'hero-color-shift': 'hero-color-shift 15s linear infinite',
        'pulse-ring': 'pulse-animation 2s infinite',
        shimmer: 'arcadeum-shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      addUtilities(
        Object.fromEntries(
          Object.entries(theme('textShadow') ?? {}).map(([name, value]) => [
            `.text-shadow-${name}`,
            { textShadow: value },
          ]),
        ),
      );
    }),
  ],
} satisfies Config;
