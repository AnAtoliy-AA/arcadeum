/**
 * Fan-layout math for the desktop player hand.
 *
 * Returns per-card rotation (deg) and vertical offset (px) so the cards form a
 * symmetric fan pivoting around the bottom-center of each card. The formula
 * keeps the centre card at 0 deg, sweeps outwards in 2 deg steps, and clamps
 * to +/- 14 deg for very large hands — matching the Task 12 spec
 * ("+/-7 deg for ~7 cards, +/-14 deg for larger hands").
 */
export interface FanTransform {
  angle: number;
  offsetY: number;
}

const STEP_DEG = 2;
const MAX_DEG = 14;

export function getFanTransform(index: number, total: number): FanTransform {
  if (total <= 1) {
    return { angle: 0, offsetY: 0 };
  }

  const centre = (total - 1) / 2;
  const rawAngle = (index - centre) * STEP_DEG;
  const angle = Math.max(-MAX_DEG, Math.min(MAX_DEG, rawAngle));

  // Cards farther from centre sit slightly lower so the fan arcs upward.
  // offsetY grows quadratically with distance from the centre.
  const distance = Math.abs(index - centre);
  const offsetY = Math.round(distance * distance * 0.8);

  return { angle, offsetY };
}
