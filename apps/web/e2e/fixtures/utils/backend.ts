import * as fs from 'fs';
import * as path from 'path';

export function checkNoBackendErrors() {
  const logPath = path.join(process.cwd(), '../be/backend-e2e-errors.log');
  if (fs.existsSync(logPath)) {
    const errors = fs.readFileSync(logPath, 'utf8');
    if (errors.trim()) {
      fs.writeFileSync(logPath, '');
      throw new Error(`Backend Errors: ${errors}`);
    }
  }
}
