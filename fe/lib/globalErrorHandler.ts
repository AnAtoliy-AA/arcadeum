type ErrorHandler = (message: string, options?: { duration?: number }) => void;

let handler: ErrorHandler | undefined;

export function registerGlobalErrorHandler(fn: ErrorHandler) {
  handler = fn;
}

export function unregisterGlobalErrorHandler(fn: ErrorHandler) {
  if (handler === fn) {
    handler = undefined;
  }
}

export function emitGlobalError(message: string, options?: { duration?: number }) {
  handler?.(message, options);
}
