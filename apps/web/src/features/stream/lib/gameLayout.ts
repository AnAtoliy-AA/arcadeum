import type { StreamGameId } from './streamConfig';

/**
 * Per-game tuning for the broadcast board area.
 *
 * `scale` shrinks (below 1) or grows (above 1) the whole game widget inside
 * the board panel. The widget is laid out in a box of `100% / scale` and then
 * scaled back, so it keeps filling the panel while its internal breakpoints
 * and spacing see a larger or smaller canvas.
 *
 * `verdict` records how the game looked when reviewed in the stream scene:
 * `good` is ready for rotation, `followup` renders but needs polish (see the
 * PR notes), so the director may include or skip it.
 */
export interface StreamGameLayout {
  scale: number;
  verdict: 'good' | 'followup';
}

/**
 * Size, in CSS px, of the canvas game widgets are laid out on: the board
 * panel of the 1920x1080 scene. Smaller captures scale this canvas down.
 */
export const STREAM_BOARD_DESIGN = { width: 1312, height: 874 } as const;

const DEFAULT_LAYOUT: StreamGameLayout = { scale: 1, verdict: 'followup' };

export const STREAM_GAME_LAYOUT: Record<StreamGameId, StreamGameLayout> = {
  chess_v1: { scale: 1, verdict: 'good' },
  checkers_v1: { scale: 1, verdict: 'good' },
  tic_tac_toe_v1: { scale: 1, verdict: 'good' },
  cascade_v1: { scale: 1, verdict: 'good' },
  critical_v1: { scale: 1, verdict: 'followup' },
  sea_battle_v1: { scale: 1, verdict: 'followup' },
  cat_dash_v1: { scale: 0.9, verdict: 'followup' },
  backgammon_v1: { scale: 1.3, verdict: 'good' },
  hearts_v1: { scale: 1.2, verdict: 'followup' },
  spades_v1: { scale: 1.2, verdict: 'followup' },
  go_v1: { scale: 1.15, verdict: 'good' },
  pachisi_v1: { scale: 0.8, verdict: 'good' },
};

export function getStreamGameLayout(gameId: string): StreamGameLayout {
  return (
    (STREAM_GAME_LAYOUT as Record<string, StreamGameLayout | undefined>)[
      gameId
    ] ?? DEFAULT_LAYOUT
  );
}
