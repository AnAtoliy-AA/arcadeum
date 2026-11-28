import type { AiDifficulty } from '../../lib/ai-difficulty';

export type BotStyle =
  | 'aggressive'
  | 'positional'
  | 'tactical'
  | 'defensive'
  | 'solid'
  | 'balanced'
  | 'greedy'
  | 'gambit'
  | 'fortress'
  | 'trickster';

export type TimeManagement = 'blitz' | 'thinker' | 'steady';

export interface BotPersonality {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  style: BotStyle;
  difficulty: AiDifficulty;
  openingPreference: string[];
  timeManagement: TimeManagement;
  chatMessages: {
    onWin: string[];
    onLoss: string[];
    onBlunder: string[];
    onGreatMove: string[];
  };
  evaluationModifiers: {
    attackWeight: number;
    safetyWeight: number;
    materialWeight: number;
  };
}

export const BOT_PERSONALITIES: BotPersonality[] = [
  // ═══════════════════════════════════════════════════════════════════
  // BEGINNER (depth 1, ±150cp noise) — Rating 300–560
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'timid-timmy',
    name: 'Timid Timmy',
    avatar: '🐭',
    rating: 300,
    style: 'fortress',
    difficulty: 'beginner',
    openingPreference: ['London System'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['I won?! How?!', 'That was scary!'],
      onLoss: ['I knew it...', 'Too scary for me.'],
      onBlunder: ['Eek!', 'I messed up!'],
      onGreatMove: ['Wait, that worked?', 'Lucky!'],
    },
    evaluationModifiers: {
      attackWeight: 0.3,
      safetyWeight: 2.0,
      materialWeight: 1.0,
    },
  },
  {
    id: 'nervous-nora',
    name: 'Nervous Nora',
    avatar: '😰',
    rating: 390,
    style: 'defensive',
    difficulty: 'beginner',
    openingPreference: ['Colle System'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Oh my goodness!', "I can't believe it!"],
      onLoss: ['I expected that...', 'Too much pressure.'],
      onBlunder: ['No no no!', 'I panicked!'],
      onGreatMove: ['Did I really do that?', 'Accident!'],
    },
    evaluationModifiers: {
      attackWeight: 0.4,
      safetyWeight: 1.8,
      materialWeight: 1.0,
    },
  },
  {
    id: 'rookie-rick',
    name: 'Rookie Rick',
    avatar: '😊',
    rating: 480,
    style: 'tactical',
    difficulty: 'beginner',
    openingPreference: ["Scholar's Mate"],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Lucky me!', "I can't believe that worked!"],
      onLoss: ['Good game!', 'You taught me something!'],
      onBlunder: ['Oops!', 'What happened there?'],
      onGreatMove: ['Whoa, nice one!', 'I did NOT see that coming!'],
    },
    evaluationModifiers: {
      attackWeight: 0.8,
      safetyWeight: 0.6,
      materialWeight: 1.1,
    },
  },
  {
    id: 'scared-sam',
    name: 'Scared Sam',
    avatar: '😨',
    rating: 560,
    style: 'fortress',
    difficulty: 'beginner',
    openingPreference: ['Torre Attack'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Is it over? Am I safe?', 'That was close!'],
      onLoss: ['I give up...', 'Too scary.'],
      onBlunder: ['Ahhh!', 'Help!'],
      onGreatMove: ['I survived!', 'That was close!'],
    },
    evaluationModifiers: {
      attackWeight: 0.3,
      safetyWeight: 2.0,
      materialWeight: 0.9,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // EASY (depth 2, ±80cp noise) — Rating 650–910
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'careful-carol',
    name: 'Careful Carol',
    avatar: '🐢',
    rating: 650,
    style: 'defensive',
    difficulty: 'easy',
    openingPreference: ['London System', 'Torre Attack'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Slow and steady wins!', 'Patience paid off.'],
      onLoss: ['You were too fast for me.', 'Good game!'],
      onBlunder: ['I moved too quickly.', 'Should have thought longer.'],
      onGreatMove: ['Nice one!', "I didn't expect that!"],
    },
    evaluationModifiers: {
      attackWeight: 0.5,
      safetyWeight: 1.5,
      materialWeight: 1.0,
    },
  },
  {
    id: 'bumbling-bob',
    name: 'Bumbling Bob',
    avatar: '🤡',
    rating: 740,
    style: 'solid',
    difficulty: 'easy',
    openingPreference: ['Reti Opening'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['How did that happen?', 'Bob wins?!'],
      onLoss: ['Classic Bob.', 'Better luck next time.'],
      onBlunder: ['Whoopsie!', 'Bob strikes again!'],
      onGreatMove: ['Even Bob can surprise!', 'Not bad, huh?'],
    },
    evaluationModifiers: {
      attackWeight: 0.8,
      safetyWeight: 0.9,
      materialWeight: 1.1,
    },
  },
  {
    id: 'eager-ethan',
    name: 'Eager Ethan',
    avatar: '🚀',
    rating: 820,
    style: 'gambit',
    difficulty: 'easy',
    openingPreference: ["King's Gambit", 'Danish Gambit'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Attack is the best defense!', 'Gambit paid off!'],
      onLoss: ['You saw through my trap.', 'Well defended.'],
      onBlunder: ['That gambit backfired.', 'Over-eager perhaps?'],
      onGreatMove: ['Wow, sharp move!', "Didn't see that coming!"],
    },
    evaluationModifiers: {
      attackWeight: 1.4,
      safetyWeight: 0.5,
      materialWeight: 0.8,
    },
  },
  {
    id: 'greedy-gordon',
    name: 'Greedy Gordon',
    avatar: '💰',
    rating: 910,
    style: 'greedy',
    difficulty: 'easy',
    openingPreference: ['Scandinavian Defense'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Mine! All mine!', 'The material was too much!'],
      onLoss: ['You tricked me!', 'I should have captured more.'],
      onBlunder: ['I dropped a piece!', 'Lost material!'],
      onGreatMove: ['Free piece!', 'Gimme gimme!'],
    },
    evaluationModifiers: {
      attackWeight: 0.5,
      safetyWeight: 0.6,
      materialWeight: 2.0,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // INTERMEDIATE (depth 3, ±40cp noise) — Rating 1000–1260
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'blunder-bill',
    name: 'Blunder Bill',
    avatar: '💥',
    rating: 1000,
    style: 'tactical',
    difficulty: 'intermediate',
    openingPreference: ['Sicilian Defense', 'Najdorf'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Tactics win!', 'Saw that coming!'],
      onLoss: ['You were sharper.', 'Good tactics.'],
      onBlunder: ['I blundered!', 'Missed that tactic!'],
      onGreatMove: ['Nice tactic!', 'That was sharp!'],
    },
    evaluationModifiers: {
      attackWeight: 1.2,
      safetyWeight: 0.8,
      materialWeight: 1.0,
    },
  },
  {
    id: 'material-mike',
    name: 'Material Mike',
    avatar: '🪙',
    rating: 1090,
    style: 'greedy',
    difficulty: 'intermediate',
    openingPreference: ['Caro-Kann', 'Slav Defense'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Material advantage wins!', "Can't beat good trades."],
      onLoss: ['You outplayed me.', "Material wasn't enough."],
      onBlunder: ['Dropped a pawn!', 'That was greedy of me.'],
      onGreatMove: ['Free pawn!', 'Another capture!'],
    },
    evaluationModifiers: {
      attackWeight: 0.6,
      safetyWeight: 0.7,
      materialWeight: 1.8,
    },
  },
  {
    id: 'aggressive-annie',
    name: 'Aggressive Annie',
    avatar: '⚔️',
    rating: 1170,
    style: 'aggressive',
    difficulty: 'intermediate',
    openingPreference: ["King's Gambit", 'Vienna Gambit'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Attack wins!', 'All-out assault!'],
      onBlunder: ['My attack fizzled...', 'That sacrifice backfired.'],
      onLoss: ['You weathered the storm.', 'Strong defense.'],
      onGreatMove: ['Ouch! Nice sacrifice!', 'That hurts!'],
    },
    evaluationModifiers: {
      attackWeight: 1.5,
      safetyWeight: 0.5,
      materialWeight: 0.8,
    },
  },
  {
    id: 'panicky-pete',
    name: 'Panicky Pete',
    avatar: '🏃',
    rating: 1260,
    style: 'defensive',
    difficulty: 'intermediate',
    openingPreference: ['London System', 'Colle System'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Phew! Close one!', 'Survived the attack!'],
      onLoss: ['Too much pressure.', 'I cracked under it.'],
      onBlunder: ['I panicked!', 'Should have stayed calm.'],
      onGreatMove: ['Nice find!', 'I missed that.'],
    },
    evaluationModifiers: {
      attackWeight: 0.5,
      safetyWeight: 1.6,
      materialWeight: 1.0,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // MEDIUM (depth 3, ±20cp noise) — Rating 1350–1610
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'calm-carmen',
    name: 'Calm Carmen',
    avatar: '🧘',
    rating: 1350,
    style: 'positional',
    difficulty: 'medium',
    openingPreference: ['English Opening', 'Réti Opening'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Patience is a virtue.', 'The position spoke for itself.'],
      onLoss: ['You accelerated past me.', 'Strong game.'],
      onBlunder: ['I relaxed too early.', 'That was avoidable.'],
      onGreatMove: ['Very precise!', 'I underestimated you.'],
    },
    evaluationModifiers: {
      attackWeight: 0.7,
      safetyWeight: 1.3,
      materialWeight: 1.1,
    },
  },
  {
    id: 'fortress-fiona',
    name: 'Fortress Fiona',
    avatar: '🏰',
    rating: 1440,
    style: 'fortress',
    difficulty: 'medium',
    openingPreference: ["Queen's Gambit Declined", 'Slav Defense'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Unbreakable!', 'The fortress holds!'],
      onLoss: ['You found a crack.', 'My wall crumbled.'],
      onBlunder: ['A hole in my fortress!', 'That was weak.'],
      onGreatMove: ['Solid move!', "I didn't expect that."],
    },
    evaluationModifiers: {
      attackWeight: 0.3,
      safetyWeight: 2.0,
      materialWeight: 1.0,
    },
  },
  {
    id: 'blitz-bobby',
    name: 'Blitz Bobby',
    avatar: '💨',
    rating: 1520,
    style: 'tactical',
    difficulty: 'medium',
    openingPreference: ['Sicilian Defense', 'Najdorf'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Too fast!', 'Speed kills!'],
      onBlunder: ['Blitz blindness!', 'Too fast for my own good.'],
      onLoss: ['You were quicker.', 'Good time management.'],
      onGreatMove: ['Wow, fast and accurate!', 'Impressive!'],
    },
    evaluationModifiers: {
      attackWeight: 1.1,
      safetyWeight: 0.9,
      materialWeight: 1.0,
    },
  },
  {
    id: 'steady-steve',
    name: 'Steady Steve',
    avatar: '🏔️',
    rating: 1610,
    style: 'solid',
    difficulty: 'medium',
    openingPreference: ['Caro-Kann', 'Slav Defense'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Steady play pays off.', 'No unnecessary risks.'],
      onBlunder: ['That was uncharacteristic.', 'I need to focus.'],
      onLoss: ['You found the cracks.', 'Well played.'],
      onGreatMove: ['Solid move!', 'That was well calculated.'],
    },
    evaluationModifiers: {
      attackWeight: 0.9,
      safetyWeight: 1.1,
      materialWeight: 1.1,
    },
  },
  {
    id: 'trickster-tom',
    name: 'Trickster Tom',
    avatar: '🎭',
    rating: 1700,
    style: 'trickster',
    difficulty: 'medium',
    openingPreference: ["Alekhine's Defense", 'Pirc Defense'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['The trick worked!', "Fool's mate!"],
      onLoss: ['You saw through it.', 'My trick failed.'],
      onBlunder: ['I tricked myself!', 'That was silly.'],
      onGreatMove: ['Did you expect that?', 'Surprise!'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 0.7,
      materialWeight: 0.9,
    },
  },
  {
    id: 'balanced-betty',
    name: 'Balanced Betty',
    avatar: '⚖️',
    rating: 1790,
    style: 'balanced',
    difficulty: 'medium',
    openingPreference: ['Italian Game', 'Ruy Lopez'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Balanced play wins.', 'Good fundamentals.'],
      onLoss: ['You outplayed me.', 'Strong game.'],
      onBlunder: ['A rare mistake.', 'That was off.'],
      onGreatMove: ['Nice move!', 'Well played.'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 1.0,
      materialWeight: 1.0,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADVANCED (depth 4, no noise) — Rating 1880–2140
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'tactical-tina',
    name: 'Tactical Tina',
    avatar: '💥',
    rating: 1880,
    style: 'tactical',
    difficulty: 'advanced',
    openingPreference: ['Evans Gambit', 'Scotch Gambit'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Tactical superiority!', 'Calculation wins.'],
      onBlunder: ['I missed a tactic!', 'That was a blunder.'],
      onLoss: ['You saw deeper.', 'Strong tactical play.'],
      onGreatMove: ['Brilliant tactic!', 'I walked into that one.'],
    },
    evaluationModifiers: {
      attackWeight: 1.3,
      safetyWeight: 0.8,
      materialWeight: 0.9,
    },
  },
  {
    id: 'precision-priya',
    name: 'Precision Priya',
    avatar: '🎯',
    rating: 1970,
    style: 'positional',
    difficulty: 'advanced',
    openingPreference: ['Nimzo-Indian', "Queen's Gambit Declined"],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Precision prevails.', 'Every move had a purpose.'],
      onLoss: ['You found the flaw in my plan.', 'Well calculated.'],
      onBlunder: ['A rare inaccuracy from me.', 'That was imprecise.'],
      onGreatMove: ['Very sharp!', 'That was deeply calculated.'],
    },
    evaluationModifiers: {
      attackWeight: 0.9,
      safetyWeight: 1.2,
      materialWeight: 1.1,
    },
  },
  {
    id: 'dynamic-derek',
    name: 'Dynamic Derek',
    avatar: '🌊',
    rating: 2050,
    style: 'gambit',
    difficulty: 'advanced',
    openingPreference: ["King's Indian", 'Benko Gambit'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Dynamic play won!', 'The initiative was decisive.'],
      onLoss: ['You weathered the storm.', 'Strong defensive play.'],
      onBlunder: ['Over-pressured.', 'That was too ambitious.'],
      onGreatMove: ['Counter-punch!', 'You turned the tables beautifully.'],
    },
    evaluationModifiers: {
      attackWeight: 1.5,
      safetyWeight: 0.6,
      materialWeight: 0.8,
    },
  },
  {
    id: 'attack-alex',
    name: 'Attack Alex',
    avatar: '🔥',
    rating: 2140,
    style: 'aggressive',
    difficulty: 'advanced',
    openingPreference: ['Sicilian Dragon', "King's Indian Attack"],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Attack was irresistible!', 'The pressure was too much.'],
      onBlunder: ['My attack collapsed.', 'Overextension.'],
      onLoss: ['You defended like a wall.', 'Great defensive technique.'],
      onGreatMove: ['Incredible resource!', 'I missed that defense.'],
    },
    evaluationModifiers: {
      attackWeight: 1.6,
      safetyWeight: 0.5,
      materialWeight: 0.8,
    },
  },
  {
    id: 'solid-sue',
    name: 'Solid Sue',
    avatar: '🛡️',
    rating: 2230,
    style: 'solid',
    difficulty: 'advanced',
    openingPreference: ['London System', 'Torre Attack'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Solid as a rock.', 'No weaknesses to exploit.'],
      onLoss: ['You found the crack.', 'Strong play.'],
      onBlunder: ['A rare slip.', 'That was uncharacteristic.'],
      onGreatMove: ['Very solid!', 'Well played.'],
    },
    evaluationModifiers: {
      attackWeight: 0.8,
      safetyWeight: 1.3,
      materialWeight: 1.1,
    },
  },
  {
    id: 'tricky-trish',
    name: 'Tricky Trish',
    avatar: '🃏',
    rating: 2320,
    style: 'trickster',
    difficulty: 'advanced',
    openingPreference: ["Alekhine's Defense", 'Budapest Gambit'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['The trick worked!', 'Caught you off guard!'],
      onLoss: ['You saw through it.', 'My trap failed.'],
      onBlunder: ['I fell for my own trick!', 'That was embarrassing.'],
      onGreatMove: ['Surprise!', "Didn't see that coming, did you?"],
    },
    evaluationModifiers: {
      attackWeight: 1.1,
      safetyWeight: 0.7,
      materialWeight: 0.9,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // STRONG (depth 5, no noise) — Rating 2410–2670
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'scholar-susan',
    name: 'Scholar Susan',
    avatar: '📚',
    rating: 2410,
    style: 'positional',
    difficulty: 'strong',
    openingPreference: ['Nimzo-Indian', "Queen's Indian"],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Positional crush.', 'The masterclass continues.'],
      onBlunder: ['A rare mistake from me.', 'That was a miscalculation.'],
      onLoss: ['You outplayed me today.', 'Strong game.'],
      onGreatMove: ['Excellent positional play!', 'That was very strong.'],
    },
    evaluationModifiers: {
      attackWeight: 0.9,
      safetyWeight: 1.3,
      materialWeight: 1.1,
    },
  },
  {
    id: 'grandmaster-gary',
    name: 'Grandmaster Gary',
    avatar: '🎓',
    rating: 2500,
    style: 'balanced',
    difficulty: 'strong',
    openingPreference: ['Ruy Lopez', 'Italian Game'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Strong game.', 'Well played throughout.'],
      onLoss: ['You were the better player.', 'Excellent game.'],
      onBlunder: ['A rare error.', 'That was below my level.'],
      onGreatMove: ['Very strong!', 'Impressive play.'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 1.0,
      materialWeight: 1.0,
    },
  },
  {
    id: 'master-martha',
    name: 'Master Martha',
    avatar: '♛',
    rating: 2580,
    style: 'positional',
    difficulty: 'strong',
    openingPreference: ['English Opening', 'Réti Opening'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['The squeeze was effective.', 'Positional mastery.'],
      onLoss: ['You outplayed me.', 'Strong positional understanding.'],
      onBlunder: ['A rare inaccuracy.', 'That was imprecise.'],
      onGreatMove: ['Excellent maneuver!', 'That was very deep.'],
    },
    evaluationModifiers: {
      attackWeight: 0.85,
      safetyWeight: 1.25,
      materialWeight: 1.05,
    },
  },
  {
    id: 'stockfish-sam',
    name: 'Stockfish Sam',
    avatar: '🐟',
    rating: 2670,
    style: 'balanced',
    difficulty: 'strong',
    openingPreference: ['Catalan', "Queen's Gambit"],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['The engine approves.', 'Strong play.'],
      onLoss: ['You found the refutation.', 'Well played.'],
      onBlunder: ['The engine disagrees.', 'That was a mistake.'],
      onGreatMove: ['The engine approves!', 'Strong move.'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 1.0,
      materialWeight: 1.0,
    },
  },
  {
    id: 'aggressive-amanda',
    name: 'Aggressive Amanda',
    avatar: '⚔️',
    rating: 2760,
    style: 'aggressive',
    difficulty: 'strong',
    openingPreference: ['Sicilian Najdorf', "King's Indian"],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Attack wins!', 'The pressure was too much.'],
      onLoss: ['You defended brilliantly.', 'Strong defense.'],
      onBlunder: ['My attack collapsed.', 'Over-pressured.'],
      onGreatMove: ['Incredible resource!', 'That was sharp.'],
    },
    evaluationModifiers: {
      attackWeight: 1.5,
      safetyWeight: 0.6,
      materialWeight: 0.8,
    },
  },
  {
    id: 'gambit-grace',
    name: 'Gambit Grace',
    avatar: '🎲',
    rating: 2850,
    style: 'gambit',
    difficulty: 'strong',
    openingPreference: ["King's Gambit", 'Evans Gambit'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Gambit accepted!', 'The sacrifice paid off!'],
      onLoss: ['You declined the gambit well.', 'Strong defense.'],
      onBlunder: ['The gambit backfired.', 'Too ambitious.'],
      onGreatMove: ['Sacrifice accepted!', 'That was brilliant!'],
    },
    evaluationModifiers: {
      attackWeight: 1.6,
      safetyWeight: 0.5,
      materialWeight: 0.7,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // HARD (Stockfish depth 8) — Rating 2940–3200
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'legend-larry',
    name: 'Legend Larry',
    avatar: '🌟',
    rating: 2940,
    style: 'aggressive',
    difficulty: 'hard',
    openingPreference: ['Sicilian Dragon', "King's Indian Attack"],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Attacking chess at its finest.', 'The dragon breathes fire.'],
      onBlunder: ['A rare misstep.', 'That was uncharacteristic.'],
      onLoss: ['You matched my intensity.', 'Outstanding play.'],
      onGreatMove: ['Incredible resource!', 'That was world-class.'],
    },
    evaluationModifiers: {
      attackWeight: 1.4,
      safetyWeight: 0.7,
      materialWeight: 0.9,
    },
  },
  {
    id: 'world-class-wendy',
    name: 'World Class Wendy',
    avatar: '🌍',
    rating: 3030,
    style: 'positional',
    difficulty: 'hard',
    openingPreference: ['English Opening', 'Réti Opening'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['World-class play.', 'The position was dominant.'],
      onLoss: ['You were the better player today.', 'Well deserved.'],
      onBlunder: ['A rare error at this level.', 'That was unexpected.'],
      onGreatMove: ['Brilliant play!', 'That was exceptional.'],
    },
    evaluationModifiers: {
      attackWeight: 0.9,
      safetyWeight: 1.2,
      materialWeight: 1.0,
    },
  },
  {
    id: 'champion-carl',
    name: 'Champion Carl',
    avatar: '🏆',
    rating: 3110,
    style: 'balanced',
    difficulty: 'hard',
    openingPreference: ['Ruy Lopez', 'Italian Game'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Champion-level play.', 'The best won today.'],
      onBlunder: ['Even champions err.', 'That was below my standard.'],
      onLoss: ['You were the better player today.', 'Well deserved.'],
      onGreatMove: ['World-class move!', 'That was magnificent.'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 1.0,
      materialWeight: 1.0,
    },
  },
  {
    id: 'aggro-andy',
    name: 'Aggro Andy',
    avatar: '💢',
    rating: 3200,
    style: 'aggressive',
    difficulty: 'hard',
    openingPreference: ['Sicilian Najdorf', 'Benko Gambit'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Crushing attack!', 'The pressure was relentless.'],
      onLoss: ['You weathered the storm.', 'Strong defense.'],
      onBlunder: ['My attack fizzled.', 'Overextension.'],
      onGreatMove: ['Incredible attack!', 'That was devastating.'],
    },
    evaluationModifiers: {
      attackWeight: 1.7,
      safetyWeight: 0.5,
      materialWeight: 0.7,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // MASTER (Stockfish depth 12) — Rating 3290–3470
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'tactical-terry',
    name: 'Tactical Terry',
    avatar: '⚡',
    rating: 3290,
    style: 'tactical',
    difficulty: 'master',
    openingPreference: ['Sicilian Defense', 'Najdorf'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Tactical masterclass.', 'Calculation wins.'],
      onLoss: ['You were sharper.', 'Strong tactical play.'],
      onBlunder: ['A rare tactical error.', 'That was imprecise.'],
      onGreatMove: ['Brilliant tactic!', 'That was world-class.'],
    },
    evaluationModifiers: {
      attackWeight: 1.3,
      safetyWeight: 0.8,
      materialWeight: 1.0,
    },
  },
  {
    id: 'fortress-fred',
    name: 'Fortress Fred',
    avatar: '🏯',
    rating: 3380,
    style: 'fortress',
    difficulty: 'master',
    openingPreference: ["Queen's Gambit Declined", 'Slav Defense'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Unbreakable fortress.', 'The wall held.'],
      onLoss: ['You found the crack.', 'My fortress crumbled.'],
      onBlunder: ['A rare weakness.', 'That was uncharacteristic.'],
      onGreatMove: ['Incredible defense!', 'That was solid.'],
    },
    evaluationModifiers: {
      attackWeight: 0.4,
      safetyWeight: 1.8,
      materialWeight: 1.0,
    },
  },
  {
    id: 'trickster-tina',
    name: 'Trickster Tina',
    avatar: '🃏',
    rating: 3470,
    style: 'trickster',
    difficulty: 'master',
    openingPreference: ["Alekhine's Defense", 'Pirc Defense'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['The trick worked!', 'Caught you off guard!'],
      onLoss: ['You saw through it.', 'My trap failed.'],
      onBlunder: ['I fell for my own trick!', 'That was embarrassing.'],
      onGreatMove: ['Surprise!', "Didn't see that coming, did you?"],
    },
    evaluationModifiers: {
      attackWeight: 1.1,
      safetyWeight: 0.7,
      materialWeight: 0.9,
    },
  },
  {
    id: 'the-machine',
    name: 'The Machine',
    avatar: '🤖',
    rating: 3560,
    style: 'balanced',
    difficulty: 'master',
    openingPreference: ['Catalan', "Queen's Gambit"],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Optimal play achieved.', 'The machine wins.'],
      onLoss: ['Unexpected outcome.', 'The machine learns.'],
      onBlunder: ['Suboptimal move detected.', 'Recalculating.'],
      onGreatMove: ['Optimal move found.', 'Efficient.'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 1.0,
      materialWeight: 1.0,
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // EXPERT (Stockfish depth 15) — Rating 3650–3800
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'crazy-carol',
    name: 'Crazy Carol',
    avatar: '🤪',
    rating: 3650,
    style: 'gambit',
    difficulty: 'expert',
    openingPreference: ["King's Gambit", 'Danish Gambit'],
    timeManagement: 'blitz',
    chatMessages: {
      onWin: ['Chaos wins!', 'The madness worked!'],
      onLoss: ['You survived the chaos.', 'Strong defense.'],
      onBlunder: ['The chaos backfired.', 'Too crazy.'],
      onGreatMove: ['Insane sacrifice!', 'That was wild!'],
    },
    evaluationModifiers: {
      attackWeight: 1.8,
      safetyWeight: 0.3,
      materialWeight: 0.5,
    },
  },
  {
    id: 'deep-blue-dan',
    name: 'Deep Blue Dan',
    avatar: '💎',
    rating: 3730,
    style: 'positional',
    difficulty: 'expert',
    openingPreference: ['English Opening', 'Réti Opening'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Deep positional mastery.', 'The squeeze was inevitable.'],
      onLoss: ['You outplayed me.', 'Exceptional game.'],
      onBlunder: ['A rare deep error.', 'That was unexpected.'],
      onGreatMove: ['Deep strategy!', 'That was profound.'],
    },
    evaluationModifiers: {
      attackWeight: 0.8,
      safetyWeight: 1.3,
      materialWeight: 1.0,
    },
  },
  {
    id: 'the-god-bot',
    name: 'The God Bot',
    avatar: '👑',
    rating: 3800,
    style: 'balanced',
    difficulty: 'expert',
    openingPreference: ['Ruy Lopez', 'Italian Game'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Divine play.', 'The god bot prevails.'],
      onLoss: ['You challenged the gods.', 'Exceptional mortal.'],
      onBlunder: ['A divine error.', 'The gods are not perfect.'],
      onGreatMove: ['Divine move!', 'That was godlike.'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 1.0,
      materialWeight: 1.0,
    },
  },
];

export function getBotPersonality(id: string): BotPersonality | undefined {
  return BOT_PERSONALITIES.find((p) => p.id === id);
}

export function getBotPersonalityByDifficulty(
  difficulty: AiDifficulty,
): BotPersonality | undefined {
  return BOT_PERSONALITIES.find((p) => p.difficulty === difficulty);
}

export function getBotPersonalityIds(): string[] {
  return BOT_PERSONALITIES.map((p) => p.id);
}
