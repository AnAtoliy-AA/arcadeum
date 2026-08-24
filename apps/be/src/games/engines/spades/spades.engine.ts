/** Moved to @arcadeum/games-core (ARC-900). Nest provider shim preserves DI metadata. */
import { Injectable } from '@nestjs/common';
import { SpadesEngine as CoreSpadesEngine } from '@arcadeum/games-core/games/spades/spades.engine';

@Injectable()
export class SpadesEngine extends CoreSpadesEngine {}
