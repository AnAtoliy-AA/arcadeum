import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

type Engine = 'opencode' | 'mimo';

interface UserPreference {
  engine: Engine;
  defaultScope: string[];
}

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);
  private readonly preferences = new Map<number, UserPreference>();
  private readonly prefsPath: string;

  constructor(private readonly config: ConfigService) {
    const repoPath = this.config.get<string>('REPO_PATH') ?? process.cwd();
    this.prefsPath = join(repoPath, '.tasks', 'user-preferences.json');
    this.load();
  }

  private load() {
    try {
      if (existsSync(this.prefsPath)) {
        const raw = readFileSync(this.prefsPath, 'utf-8');
        const data = JSON.parse(raw) as Record<string, UserPreference>;
        for (const [key, value] of Object.entries(data)) {
          this.preferences.set(parseInt(key, 10), value);
        }
      }
    } catch {
      this.logger.warn('Could not load user preferences');
    }
  }

  private save() {
    try {
      const dir = join(
        this.config.get<string>('REPO_PATH') ?? process.cwd(),
        '.tasks',
      );
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const data = Object.fromEntries(this.preferences);
      writeFileSync(this.prefsPath, JSON.stringify(data, null, 2));
    } catch {
      this.logger.warn('Could not save user preferences');
    }
  }

  getEngine(userId: number): Engine {
    return this.preferences.get(userId)?.engine ?? 'opencode';
  }

  getScope(userId: number): string[] {
    return this.preferences.get(userId)?.defaultScope ?? ['web'];
  }

  setEngine(userId: number, engine: Engine) {
    const current = this.preferences.get(userId) ?? {
      engine: 'opencode' as Engine,
      defaultScope: ['web'],
    };
    this.preferences.set(userId, { ...current, engine });
    this.save();
  }

  setScope(userId: number, scope: string[]) {
    const current = this.preferences.get(userId) ?? {
      engine: 'opencode' as Engine,
      defaultScope: ['web'],
    };
    this.preferences.set(userId, { ...current, defaultScope: scope });
    this.save();
  }

  getAll(userId: number): UserPreference | undefined {
    return this.preferences.get(userId);
  }
}
