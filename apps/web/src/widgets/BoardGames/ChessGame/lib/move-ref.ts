/**
 * Formats a move reference the way chess players write it:
 * index 0 with "e4" is "1. e4", index 1 with "e5" is "1... e5".
 */
export function formatMoveRef(index: number, san: string): string {
  const number = Math.floor(index / 2) + 1;
  const dots = index % 2 === 0 ? '.' : '...';
  return `${number}${dots} ${san}`.trim();
}
