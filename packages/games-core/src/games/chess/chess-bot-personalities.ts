import type { AiDifficulty } from '../../lib/ai-difficulty';

export type BotStyle =
  | 'aggressive'
  | 'positional'
  | 'tactical'
  | 'defensive'
  | 'solid'
  | 'balanced';

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
  {
    id: 'rookie-rick',
    name: 'Rookie Rick',
    avatar: '😊',
    rating: 400,
    style: 'tactical',
    difficulty: 'easy',
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
    id: 'defensive-dana',
    name: 'Defensive Dana',
    avatar: '🛡️',
    rating: 600,
    style: 'defensive',
    difficulty: 'easy',
    openingPreference: ['London System', 'Colle System'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Solid as a rock.', 'Defense wins games!'],
      onBlunder: ['That was a bit careless.', 'I need to be more careful.'],
      onLoss: ['You broke through my wall.', 'Well defended beats well attacked.'],
      onGreatMove: ['Interesting... I missed that.', 'Good find!'],
    },
    evaluationModifiers: {
      attackWeight: 0.6,
      safetyWeight: 1.4,
      materialWeight: 1.0,
    },
  },
  {
    id: 'aggressive-annie',
    name: 'Aggressive Annie',
    avatar: '⚔️',
    rating: 800,
    style: 'aggressive',
    difficulty: 'easy',
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
    id: 'positional-pete',
    name: 'Positional Pete',
    avatar: '🧠',
    rating: 1000,
    style: 'positional',
    difficulty: 'medium',
    openingPreference: ["Queen's Gambit", 'Catalan'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Positional mastery.', 'Slow and steady.'],
      onBlunder: ['My structure collapsed.', 'That was a positional error.'],
      onLoss: ['You outplayed me positionally.', 'Strong positional understanding.'],
      onGreatMove: ['Excellent maneuver!', 'That was a subtle move.'],
    },
    evaluationModifiers: {
      attackWeight: 0.8,
      safetyWeight: 1.2,
      materialWeight: 1.1,
    },
  },
  {
    id: 'blitz-bobby',
    name: 'Blitz Bobby',
    avatar: '⚡',
    rating: 1200,
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
    rating: 1400,
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
    id: 'tactical-tina',
    name: 'Tactical Tina',
    avatar: '💥',
    rating: 1600,
    style: 'tactical',
    difficulty: 'hard',
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
    id: 'attack-alex',
    name: 'Attack Alex',
    avatar: '🔥',
    rating: 1800,
    style: 'aggressive',
    difficulty: 'hard',
    openingPreference: ["King's Indian", 'Benko Gambit'],
    timeManagement: 'steady',
    chatMessages: {
      onWin: ['Attack was irresistible!', 'The pressure was too much.'],
      onBlunder: ['My attack collapsed.', 'Overextension.'],
      onLoss: ['You defended like a wall.', 'Great defensive technique.'],
      onGreatMove: ['Incredible resource!', 'I missed that defense.'],
    },
    evaluationModifiers: {
      attackWeight: 1.6,
      safetyWeight: 0.6,
      materialWeight: 0.8,
    },
  },
  {
    id: 'scholar-susan',
    name: 'Scholar Susan',
    avatar: '📚',
    rating: 2000,
    style: 'positional',
    difficulty: 'hard',
    openingPreference: ['Nimzo-Indian', 'Queen\'s Indian'],
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
    id: 'master-mike',
    name: 'Master Mike',
    avatar: '🎯',
    rating: 2200,
    style: 'balanced',
    difficulty: 'expert',
    openingPreference: ['Ruy Lopez', 'Italian Game'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Clean game.', 'Well calculated.'],
      onBlunder: ['Unexpected error.', 'I need to review that.'],
      onLoss: ['You outperformed me.', 'Strong performance.'],
      onGreatMove: ['Precise move!', 'That was excellent.'],
    },
    evaluationModifiers: {
      attackWeight: 1.0,
      safetyWeight: 1.0,
      materialWeight: 1.0,
    },
  },
  {
    id: 'grandmaster-grace',
    name: 'Grandmaster Grace',
    avatar: '👑',
    rating: 2400,
    style: 'positional',
    difficulty: 'expert',
    openingPreference: ['English Opening', 'Reti Opening'],
    timeManagement: 'thinker',
    chatMessages: {
      onWin: ['Positional mastery.', 'The squeeze was effective.'],
      onBlunder: ['A rare inaccuracy.', 'That was suboptimal.'],
      onLoss: ['You played brilliantly.', 'Exceptional game.'],
      onGreatMove: ['Brilliant concept!', 'That was very deep.'],
    },
    evaluationModifiers: {
      attackWeight: 0.85,
      safetyWeight: 1.25,
      materialWeight: 1.05,
    },
  },
  {
    id: 'legend-larry',
    name: 'Legend Larry',
    avatar: '🌟',
    rating: 2600,
    style: 'aggressive',
    difficulty: 'expert',
    openingPreference: ['Sicilian Dragon', 'King\'s Indian Attack'],
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
    id: 'champion-carl',
    name: 'Champion Carl',
    avatar: '🏆',
    rating: 2800,
    style: 'balanced',
    difficulty: 'expert',
    openingPreference: ['Open Games', 'Four Knights'],
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
