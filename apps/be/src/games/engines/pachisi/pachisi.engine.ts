/** Moved to @arcadeum/games-core (ARC-900). Nest provider shim preserves DI metadata. */
import { Injectable } from '@nestjs/common';
import { PachisiEngine as CorePachisiEngine } from '@arcadeum/games-core/games/pachisi/pachisi.engine';

@Injectable()
export class PachisiEngine extends CorePachisiEngine {}
