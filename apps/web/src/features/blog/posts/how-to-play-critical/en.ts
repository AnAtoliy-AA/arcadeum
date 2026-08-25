import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-critical',
  locale: 'en',
  title: 'How to Play Critical Online — Rules, Bomb Defusal, Strategy',
  excerpt:
    'A complete beginner-friendly guide to Critical: the Exploding Kittens-style card game where every draw could be your last. Learn bomb defusal, action cards, and deck-counting strategy.',
  publishedAt: '2026-08-04',
  author: 'Arcadeum team',
  tags: ['Critical', 'Card Game', 'How to Play', 'Strategy'],
  readingTimeMinutes: 6,
  body: [
    {
      type: 'paragraph',
      text: 'Critical is a fast-paced, high-stakes card game where every draw from the deck could be the fatal bomb that knocks you out. Inspired by the Exploding Kittens formula, players take turns drawing cards, playing action cards, and trying to survive longer than everyone else. The last player standing wins. The rules are simple, but the strategy — counting cards, timing defusals, and manipulating the deck — is what separates survivors from casualties.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Setup',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Each player starts with a set number of cards (typically 7) dealt from the deck. The remaining cards form the draw pile. Some cards are Critical bombs — when you draw one, you are eliminated unless you play a Defuse card. The game continues until only one player remains.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'How turns work',
      id: 'turns',
    },
    {
      type: 'paragraph',
      text: 'On your turn, you may play zero or more action cards from your hand, then you MUST draw one card from the top of the deck. Playing cards does not end your turn — your turn ends only after you draw or play a Skip card. This distinction is critical: you can set up defenses before drawing.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Card types',
      id: 'cards',
    },
    {
      type: 'list',
      items: [
        'Critical Bomb. When drawn, you are eliminated unless you play a Defuse. The bomb is removed from the game.',
        'Defuse. Saves you from a bomb draw. You then re-insert the bomb anywhere into the deck — a powerful tactical decision.',
        'Attack. Forces the next player to take two turns instead of one. Stackable.',
        'Skip. Ends your turn without drawing. Safe way to avoid the deck.',
        'Peek. Look at the top three cards of the deck and rearrange them.',
        "Steal. Take a random card from another player's hand.",
        'Favor. Force another player to give you a card of your choice.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Deck counting — the core skill',
      id: 'counting',
    },
    {
      type: 'paragraph',
      text: 'The most powerful skill in Critical is tracking how many bombs and defuse cards remain in the deck. If you know the deck contains 3 bombs and 2 defuses in 20 cards, your draw risk is 15%. When the deck is small and bomb-heavy, force opponents to draw instead. When the deck is large and bomb-light, drawing is relatively safe.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Strategy',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Hold your Defuse. A Defuse is your lifeline. Never play it proactively — save it for when you actually draw a bomb.',
        'Use Attack cards to pressure opponents. When the deck is dangerous, force others to draw.',
        'Re-insert bombs strategically. After defusing, place the bomb where the next player is most likely to draw it — typically near the top of a thinning deck.',
        'Track what opponents play. If someone plays a Defuse, the deck has fewer safeties remaining.',
        'Play Peek before drawing. Check the top cards and rearrange to avoid or place bombs.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Common mistakes',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Playing Defuse too early. Waste your safety net on a non-lethal draw.',
        'Ignoring deck count. Drawing blind when the deck is bomb-heavy is reckless.',
        'Stacking attacks carelessly. If you attack someone who has a Skip, they escape and you burned a card.',
        'Re-inserting bombs in obvious positions. Savvy opponents will Peek and rearrange.',
      ],
    },
    {
      type: 'cta',
      href: '/games/critical',
      text: 'Play Critical online — free, in your browser',
      description:
        'Open a Critical room, share the link with friends, or fill seats with AI bots. Fast rounds, high tension.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the four habits that win games',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Count bombs and defuses — know your draw risk every turn.',
        'Hold your Defuse until you actually need it.',
        'Use Attack and Skip cards to avoid dangerous draws.',
        'Re-insert defused bombs near the top to trap the next player.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Critical rewards card awareness and nerve. The player who tracks the deck and manipulates the odds will survive longest. Every card played tells a story — read it.',
    },
  ],
  howTo: {
    totalTime: 'PT15M',
    steps: [
      {
        name: 'Count bombs and defuses',
        text: 'Track how many bombs and defuses remain. Your draw risk changes every turn.',
        url: '#counting',
      },
      {
        name: 'Hold your Defuse',
        text: 'Never play Defuse proactively. Save it for the moment you draw a bomb.',
        url: '#strategy',
      },
      {
        name: 'Use Attack and Skip',
        text: 'When the deck is dangerous, force opponents to draw or skip your turn.',
        url: '#strategy',
      },
      {
        name: 'Re-insert bombs strategically',
        text: 'After defusing, place the bomb near the top of a thinning deck to trap the next player.',
        url: '#strategy',
      },
    ],
  },
  faq: [
    {
      question: 'What happens when you draw a Critical bomb?',
      answer:
        'You are eliminated unless you play a Defuse card. If you have no Defuse, you lose immediately.',
    },
    {
      question: "Can you play cards on other players' turns?",
      answer:
        'No. Cards are played only on your turn, before you draw. Some cards like Attack and Steal affect other players, but they are played during your turn.',
    },
    {
      question: 'How does deck counting work?',
      answer:
        'Track how many bombs and defuses have been played or removed. The remaining deck composition tells you your draw risk. For example, if 2 bombs remain in 15 cards, your risk is about 13%.',
    },
    {
      question: 'Where should you re-insert a defused bomb?',
      answer:
        'Near the top of a thinning deck to maximize the chance the next player draws it. Avoid predictable positions where opponents might Peek and rearrange.',
    },
  ],
};
