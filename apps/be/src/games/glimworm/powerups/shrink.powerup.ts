import { GLIMWORM_POWERUP_DURATION_MS } from '../glimworm.constants';
import type { Food } from '../glimworm.types';
import type { PowerupDef } from './powerup.def';
import { registerPowerup } from './powerup.def';

const MIN_LENGTH = 5;
const DROP_FRACTION = 0.3;

export const shrinkPowerup: PowerupDef = {
  kind: 'shrink',
  durationMs: GLIMWORM_POWERUP_DURATION_MS.shrink,
  apply(worm, session) {
    if (worm.segments.length <= MIN_LENGTH) return;
    const dropCount = Math.floor(worm.segments.length * DROP_FRACTION);
    const newLength = Math.max(MIN_LENGTH, worm.segments.length - dropCount);
    const droppedSegments = worm.segments.slice(newLength);
    worm.segments = worm.segments.slice(0, newLength);

    droppedSegments.forEach((seg, i) => {
      const food: Food = {
        id: `food-shrink-${worm.id}-${session.tickNum}-${i}`,
        pos: { x: seg.x, y: seg.y },
        value: 1,
      };
      session.food.push(food);
    });
  },
};

registerPowerup(shrinkPowerup);
