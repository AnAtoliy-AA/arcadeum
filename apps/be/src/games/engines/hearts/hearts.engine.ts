/** Moved to @arcadeum/games-core (ARC-900). Nest provider shim preserves DI metadata. */
import { Injectable } from '@nestjs/common';
import { HeartsEngine as CoreHeartsEngine } from '@arcadeum/games-core/games/hearts/hearts.engine';

@Injectable()
export class HeartsEngine extends CoreHeartsEngine {}
