/** Moved to @arcadeum/games-core (ARC-900). Nest provider shim preserves DI metadata. */
import { Injectable } from '@nestjs/common';
import { BackgammonEngine as CoreBackgammonEngine } from '@arcadeum/games-core/games/backgammon/backgammon.engine';

@Injectable()
export class BackgammonEngine extends CoreBackgammonEngine {}
