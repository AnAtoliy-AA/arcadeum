export interface ConfettiParticle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

const PARTICLE_COUNT = 30;
const LEFT_OFFSET_MULTIPLIER = 17;
const DELAY_MULTIPLIER = 1.3;
const MAX_DELAY = 5;
const MIN_DURATION = 3;
const DURATION_VARIANCE_MULTIPLIER = 2.7;
const MAX_DURATION_VARIANCE = 5;

export const particles = ((): ConfettiParticle[] => {
  const colors = ['#22c55e', '#86efac', '#ffffff', '#fbbf24', '#60a5fa'];
  return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
    id: i,
    // Use deterministic math based on index to avoid hydration mismatches
    left: (i * LEFT_OFFSET_MULTIPLIER) % 100,
    delay: (i * DELAY_MULTIPLIER) % MAX_DELAY,
    duration:
      MIN_DURATION +
      ((i * DURATION_VARIANCE_MULTIPLIER) % MAX_DURATION_VARIANCE),
    color: colors[i % colors.length],
  }));
})();
