import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ArcadeumLogger handles production log filtering and E2E error capturing.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class ArcadeumLogger extends ConsoleLogger {
  private readonly logFilePath: string;
  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor(context?: string) {
    super(context || '');
    this.logFilePath = path.join(process.cwd(), 'backend-e2e-errors.log');
  }

  log(message: unknown, context?: string) {
    const ctx = context || this.context;
    if (this.isProduction && ctx === 'GamesGateway') {
      return;
    }
    super.log(message, context);
  }

  verbose(message: unknown, context?: string) {
    const ctx = context || this.context;
    if (this.isProduction && ctx === 'GamesGateway') {
      return;
    }
    super.verbose(message, context);
  }

  error(message: unknown, stack?: string, context?: string) {
    const ctx = context || this.context;

    // Capture GamesGateway errors for E2E tests in non-production
    if (!this.isProduction && ctx === 'GamesGateway') {
      const logEntry = `[${new Date().toISOString()}] [${ctx}] ERROR: ${String(message)}\n${stack ? stack + '\n' : ''}`;
      try {
        fs.appendFileSync(this.logFilePath, logEntry);
      } catch {
        // Fallback to super.error
      }
    }

    super.error(message, stack, context);
  }
}
