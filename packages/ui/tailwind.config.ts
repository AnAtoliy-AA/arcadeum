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
        'animated-dice-shake': {
          '0%': { transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0) scale(1)' },
          '20%': { transform: 'perspective(600px) rotateX(45deg) rotateY(-35deg) rotateZ(-20deg) translateY(-14px) scale(1.12)' },
          '40%': { transform: 'perspective(600px) rotateX(-50deg) rotateY(40deg) rotateZ(25deg) translateY(-6px) scale(0.95)' },
          '60%': { transform: 'perspective(600px) rotateX(35deg) rotateY(-45deg) rotateZ(-15deg) translateY(-12px) scale(1.08)' },
          '80%': { transform: 'perspective(600px) rotateX(-25deg) rotateY(25deg) rotateZ(10deg) translateY(-2px) scale(1.02)' },
          '100%': { transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
        'animated-dice-shake-alt': {
          '0%': { transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0) scale(1)' },
          '20%': { transform: 'perspective(600px) rotateX(-40deg) rotateY(45deg) rotateZ(25deg) translateY(-16px) scale(1.1)' },
          '40%': { transform: 'perspective(600px) rotateX(45deg) rotateY(-30deg) rotateZ(-20deg) translateY(-4px) scale(0.96)' },
          '60%': { transform: 'perspective(600px) rotateX(-30deg) rotateY(40deg) rotateZ(15deg) translateY(-10px) scale(1.06)' },
          '80%': { transform: 'perspective(600px) rotateX(20deg) rotateY(-20deg) rotateZ(-10deg) translateY(-2px) scale(1.02)' },
          '100%': { transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
        'animated-dice-land': {
          '0%': { transform: 'translateY(-28px) scale(1.18) rotateX(18deg) rotateY(-22deg)', opacity: '0.85' },
          '40%': { transform: 'translateY(4px) scale(0.92) rotateX(-6deg) rotateY(8deg)', opacity: '1' },
          '65%': { transform: 'translateY(-7px) scale(1.04) rotateX(3deg) rotateY(-4deg)' },
          '82%': { transform: 'translateY(2px) scale(0.98) rotateX(-1deg) rotateY(1deg)' },
          '92%': { transform: 'translateY(-1px) scale(1.01)' },
          '100%': { transform: 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)' },
        },
        'animated-dice-shadow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '25%, 75%': { transform: 'scale(0.65)', opacity: '0.15' },
          '50%': { transform: 'scale(0.85)', opacity: '0.3' },
        },
        'animated-dice-3d-tumble': {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0)' },
          '25%': { transform: 'rotateX(180deg) rotateY(270deg) rotateZ(90deg) translateY(-22px) scale(1.08)' },
          '50%': { transform: 'rotateX(360deg) rotateY(540deg) rotateZ(180deg) translateY(-6px) scale(0.96)' },
          '75%': { transform: 'rotateX(540deg) rotateY(810deg) rotateZ(270deg) translateY(-18px) scale(1.06)' },
          '100%': { transform: 'rotateX(720deg) rotateY(1080deg) rotateZ(360deg) translateY(0)' },
        },
        'animated-dice-3d-tumble-alt': {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0)' },
          '25%': { transform: 'rotateX(-180deg) rotateY(-270deg) rotateZ(-90deg) translateY(-24px) scale(1.08)' },
          '50%': { transform: 'rotateX(-360deg) rotateY(-540deg) rotateZ(-180deg) translateY(-8px) scale(0.96)' },
          '75%': { transform: 'rotateX(-540deg) rotateY(-810deg) rotateZ(-270deg) translateY(-16px) scale(1.06)' },
          '100%': { transform: 'rotateX(-720deg) rotateY(-1080deg) rotateZ(-360deg) translateY(0)' },
        },
        'animated-dice-3d-land-1': {
          '0%': { transform: 'rotateX(360deg) rotateY(540deg) rotateZ(180deg) translateY(-24px) scale(1.18)' },
          '55%': { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(2px) scale(0.93)' },
          '78%': { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-3px) scale(1.04)' },
          '100%': { transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
        'animated-dice-3d-land-2': {
          '0%': { transform: 'rotateX(270deg) rotateY(540deg) rotateZ(180deg) translateY(-24px) scale(1.18)' },
          '55%': { transform: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translateY(2px) scale(0.93)' },
          '78%': { transform: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translateY(-3px) scale(1.04)' },
          '100%': { transform: 'rotateX(-90deg) rotateY(0deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
        'animated-dice-3d-land-3': {
          '0%': { transform: 'rotateX(360deg) rotateY(450deg) rotateZ(180deg) translateY(-24px) scale(1.18)' },
          '55%': { transform: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translateY(2px) scale(0.93)' },
          '78%': { transform: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translateY(-3px) scale(1.04)' },
          '100%': { transform: 'rotateY(-90deg) rotateX(0deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
        'animated-dice-3d-land-4': {
          '0%': { transform: 'rotateX(360deg) rotateY(630deg) rotateZ(180deg) translateY(-24px) scale(1.18)' },
          '55%': { transform: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translateY(2px) scale(0.93)' },
          '78%': { transform: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translateY(-3px) scale(1.04)' },
          '100%': { transform: 'rotateY(90deg) rotateX(0deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
        'animated-dice-3d-land-5': {
          '0%': { transform: 'rotateX(450deg) rotateY(540deg) rotateZ(180deg) translateY(-24px) scale(1.18)' },
          '55%': { transform: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translateY(2px) scale(0.93)' },
          '78%': { transform: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translateY(-3px) scale(1.04)' },
          '100%': { transform: 'rotateX(90deg) rotateY(0deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
        'animated-dice-3d-land-6': {
          '0%': { transform: 'rotateX(360deg) rotateY(720deg) rotateZ(180deg) translateY(-24px) scale(1.18)' },
          '55%': { transform: 'rotateX(0deg) rotateY(180deg) rotateZ(0deg) translateY(2px) scale(0.93)' },
          '78%': { transform: 'rotateX(0deg) rotateY(180deg) rotateZ(0deg) translateY(-3px) scale(1.04)' },
          '100%': { transform: 'rotateX(0deg) rotateY(180deg) rotateZ(0deg) translateY(0) scale(1)' },
        },
      },
      animation: {
        shimmer: 'arcadeum-shimmer 2s ease-in-out infinite',
        'dice-tumble': 'animated-dice-shake 0.55s ease-in-out infinite',
        'dice-tumble-alt': 'animated-dice-shake-alt 0.6s ease-in-out infinite',
        'dice-land': 'animated-dice-land 0.68s cubic-bezier(0.2, 0.85, 0.3, 1) forwards',
        'dice-shadow': 'animated-dice-shadow 0.92s ease-in-out infinite',
        'dice-3d-tumble': 'animated-dice-3d-tumble 0.92s cubic-bezier(0.35, 0.15, 0.35, 1) infinite',
        'dice-3d-tumble-alt': 'animated-dice-3d-tumble-alt 0.96s cubic-bezier(0.35, 0.15, 0.35, 1) infinite',
        'dice-3d-land-1': 'animated-dice-3d-land-1 0.68s cubic-bezier(0.2, 0.85, 0.3, 1) forwards',
        'dice-3d-land-2': 'animated-dice-3d-land-2 0.68s cubic-bezier(0.2, 0.85, 0.3, 1) forwards',
        'dice-3d-land-3': 'animated-dice-3d-land-3 0.68s cubic-bezier(0.2, 0.85, 0.3, 1) forwards',
        'dice-3d-land-4': 'animated-dice-3d-land-4 0.68s cubic-bezier(0.2, 0.85, 0.3, 1) forwards',
        'dice-3d-land-5': 'animated-dice-3d-land-5 0.68s cubic-bezier(0.2, 0.85, 0.3, 1) forwards',
        'dice-3d-land-6': 'animated-dice-3d-land-6 0.68s cubic-bezier(0.2, 0.85, 0.3, 1) forwards',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.preserve-3d': { 'transform-style': 'preserve-3d' },
        '.backface-hidden': { 'backface-visibility': 'hidden' },
        '.dice-perspective': { perspective: '800px' },
        '.dice-cube-sm': { width: '28px', height: '28px', '--dice-half': '14px' },
        '.dice-cube-md': { width: '36px', height: '36px', '--dice-half': '18px' },
        '.dice-cube-lg': { width: '48px', height: '48px', '--dice-half': '24px' },
        '.dice-cube-xl': { width: '64px', height: '64px', '--dice-half': '32px' },
        '.dice-cube-2xl': { width: '80px', height: '80px', '--dice-half': '40px' },
        '.dice-face-front': { transform: 'rotateY(0deg) translateZ(var(--dice-half, 18px))' },
        '.dice-face-back': { transform: 'rotateY(180deg) translateZ(var(--dice-half, 18px))' },
        '.dice-face-top': { transform: 'rotateX(90deg) translateZ(var(--dice-half, 18px))' },
        '.dice-face-bottom': { transform: 'rotateX(-90deg) translateZ(var(--dice-half, 18px))' },
        '.dice-face-right': { transform: 'rotateY(90deg) translateZ(var(--dice-half, 18px))' },
        '.dice-face-left': { transform: 'rotateY(-90deg) translateZ(var(--dice-half, 18px))' },
        '.dice-orient-1': { transform: 'rotateX(0deg) rotateY(0deg)' },
        '.dice-orient-2': { transform: 'rotateX(-90deg) rotateY(0deg)' },
        '.dice-orient-3': { transform: 'rotateY(-90deg) rotateX(0deg)' },
        '.dice-orient-4': { transform: 'rotateY(90deg) rotateX(0deg)' },
        '.dice-orient-5': { transform: 'rotateX(90deg) rotateY(0deg)' },
        '.dice-orient-6': { transform: 'rotateX(0deg) rotateY(180deg)' },
      });
    }),
  ],
} satisfies Config;