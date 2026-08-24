import type { GameActionContext } from '../../base/game-engine.interface';
import type { MovePayload, MoveStep } from './checkers.types';

export function ctx(userId: string): GameActionContext {
  return {
    userId,
    roomId: 'room-1',
    sessionId: 'session-1',
    timestamp: new Date(),
  };
}

export function s(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  capturedRow?: number,
  capturedCol?: number,
): MoveStep {
  const step: MoveStep = { fromRow, fromCol, toRow, toCol };
  if (capturedRow !== undefined) step.capturedRow = capturedRow;
  if (capturedCol !== undefined) step.capturedCol = capturedCol;
  return step;
}

export function singleStep(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): MovePayload {
  return { steps: [s(fromRow, fromCol, toRow, toCol)] };
}

export function capture(
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  capRow: number,
  capCol: number,
): MovePayload {
  return { steps: [s(fromRow, fromCol, toRow, toCol, capRow, capCol)] };
}

export function multiCapture(steps: MoveStep[]): MovePayload {
  return { steps };
}
