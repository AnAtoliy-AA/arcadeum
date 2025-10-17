export type JoinErrorType =
  | 'invite-required'
  | 'invite-invalid'
  | 'room-full'
  | 'room-locked'
  | 'unknown';

export interface JoinErrorResult {
  type: JoinErrorType;
  message: string;
}

function coerceMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || 'Something went wrong.';
  }
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  try {
    return JSON.stringify(error);
  } catch {
    return 'Something went wrong.';
  }
}

export function interpretJoinError(error: unknown): JoinErrorResult {
  const message = coerceMessage(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('invite code required')) {
    return {
      type: 'invite-required',
      message,
    };
  }

  if (normalized.includes('game room not found')) {
    return {
      type: 'invite-invalid',
      message,
    };
  }

  if (normalized.includes('room is full')) {
    return {
      type: 'room-full',
      message,
    };
  }

  if (normalized.includes('no longer accepting players')) {
    return {
      type: 'room-locked',
      message,
    };
  }

  if (normalized.includes('room is no longer accepting players')) {
    return {
      type: 'room-locked',
      message,
    };
  }

  return {
    type: 'unknown',
    message,
  };
}
