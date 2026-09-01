import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * Tailwind for the @arcadeum/ui package (Storybook preview).
 *
 * - preflight is disabled: consuming apps (web, mobile) own their reset.
 * - Colors map to runtime CSS variables minted by theme providers, so the
 *   button tokens resolve under any theme the host app applies.
 * - The shared Button/LinkButton and the home page reference these classes;
 *   consuming apps must scan this package's sources too (web does via a
 *   content glob pointing at this package's src directory).
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      keyframes: {
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
        shimmer: 'arcadeum-shimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;