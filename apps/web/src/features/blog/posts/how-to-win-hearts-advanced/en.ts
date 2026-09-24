import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-win-hearts-advanced',
  locale: 'en',
  title:
    'Advanced Hearts Strategy — Reading Opponents, Multi-Hand Planning, and Moon-Shooting Tells',
  excerpt:
    'Take your Hearts game beyond voids and low cards: how to read opponent tells, plan across multiple hands, recognize moon-shooting setups, and execute endgame pip counts.',
  publishedAt: '2026-09-16',
  author: 'Arcadeum team',
  tags: ['Hearts', 'Card Game', 'Strategy', 'Advanced', 'Trick-Taking'],
  readingTimeMinutes: 10,
  body: [
    {
      type: 'paragraph',
      text: 'Most Hearts advice stops at "void a suit and avoid the Queen." That is the right foundation, but the players who consistently win — hand after hand, game after game — do something more: they read the table. They infer unseen hands from bidding and discard patterns, they plan passing strategy across multiple hands simultaneously, and they recognize the tells that announce an opponent is shooting the moon before it is too late. This guide covers the layer above the basics.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Reading opponents from their passes',
      id: 'reading-passes',
    },
    {
      type: 'paragraph',
      text: 'The pass phase is the richest source of information in Hearts. Before a single card is played, you have already received three cards from one opponent — and that tells you something about what they kept.',
    },
    {
      type: 'list',
      items: [
        'They passed you high cards → they are weak in that suit. If you receive the Queen of Spades in the pass, the passer either holds no spades or is planning a moon attempt. Either way, be cautious.',
        'They passed you low cards → they kept their high cards. If you receive 2, 3, 4 of clubs, the passer likely held their aces and kings. Watch for moon-shooting behavior.',
        'They passed you middle cards → they have a balanced hand. Middle cards (7, 8, 9) passed suggests the passer is trying to void one suit. Note which suit they might have cleared.',
        'They passed you the Queen of Spades → very unusual. Almost always means the passer holds no other spades and cannot protect the Queen, OR they are shooting the moon and do not care about the Queen.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Recognizing moon-shooting tells',
      id: 'moon-tells',
    },
    {
      type: 'paragraph',
      text: 'A moon shot reveals itself through behavioral patterns early in the hand. The earlier you recognize it, the cheaper it is to block.',
    },
    {
      type: 'list',
      items: [
        'They take the first heart willingly. Normal players avoid hearts. A player who wins a heart on trick 2 or 3 without looking pained is either reckless or shooting.',
        'They lead high in a non-spade suit. Leading the Ace of Clubs or Ace of Hearts means they want to control the trick sequence — shooters lead high to win tricks on their terms.',
        'They hold the Queen of Spades AND take hearts. In a moon run, the Queen is a feature, not a bug. A player holding the Queen and collecting hearts is almost certainly shooting.',
        'They win multiple tricks in a row. Shooters build momentum. If the same player wins 4 straight tricks, they are not getting lucky — they have a plan.',
        'Blocking rule: win ONE heart. You do not need to defeat the shooter — you need one heart to escape their hand. Win a single heart trick when you can, and the 26 points stay on the shooter.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Multi-hand planning — the game beyond the hand',
      id: 'multi-hand',
    },
    {
      type: 'paragraph',
      text: 'Hearts is won over a game, not a single hand. Multi-hand planning means making decisions in the current hand that improve your position across the next 2-4 hands.',
    },
    {
      type: 'list',
      items: [
        'Target the player who is trailing. The player closest to 100 is desperate — they will shoot the moon, take wild risks. Prioritize blocking them over everyone else.',
        'Protect the player who is leading. If one player has 8 points while you have 22, let that player win tricks they can handle. Do not accidentally hand the leader extra points — their low score is keeping you out of last place.',
        'Engineer the passing rotation. The pass direction rotates (left, right, across, hold). Plan your passes around who you will pass to and receive from in the NEXT hand, not just the current one. If you know you will receive from a dangerous moon-shooter next hand, hold high cards to defend against them.',
        'Score control in the final hands. When someone is at 85-90 points, every hand could end the game. Switch to aggressive blocking — take the Queen of Spades yourself if it means preventing others from taking it and scoring only 13 instead of losing the game.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Endgame pip counting — knowing what is still out',
      id: 'pip-counting',
    },
    {
      type: 'paragraph',
      text: 'In the final 4-5 tricks, strong Hearts players count exactly which cards remain. This eliminates guesswork about whether the Queen is still out, whether hearts have been exhausted, and whether an opponent can ruff.',
    },
    {
      type: 'list',
      items: [
        'Track the Queen of Spades obsessively. Every experienced Hearts player knows exactly when the Queen has been played and who took it.',
        'Count heart singletons. As hearts get played, track whether each opponent is down to their last heart. A player with one heart left will either play it or dump it on the next opportunity.',
        'Count spades remaining. If 11 spades have been played and the Queen has not appeared, exactly two spades remain — one of which is the Queen. The next spade lead is almost certainly fatal to someone.',
        'Force plays in the endgame. When you hold the last club and everyone is void in clubs except you, leading it forces specific discards. Use exhausted suits to force players to play hearts or spades on cue.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'The Queen of Spades — offensive use',
      id: 'queen-offensive',
    },
    {
      type: 'paragraph',
      text: 'The conventional wisdom is to dump the Queen as fast as possible. Advanced players sometimes hold the Queen as a weapon.',
    },
    {
      type: 'list',
      items: [
        'The Queen as a blocker: if you hold the Queen and the player to your left is shooting the moon, you can win a key spade trick they would otherwise take, breaking their run.',
        'The Queen as a finisher: if one player is at 87 points and you are at 40, slam them with the Queen to end the game before they moon-shoot their way to victory.',
        'The Queen dump on a forced lead: if an opponent leads spades and you hold only the Queen and one low spade, save the Queen for a moment when you know the Ace and King have been played. Dump the low spade first to see what remains.',
        'Never hold the Queen into the final three tricks. You are likely to be forced to lead spades — and that is 13 points you cannot escape.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Advanced passing strategy',
      id: 'passing-advanced',
    },
    {
      type: 'list',
      items: [
        'Pass the second-highest spades, not the Queen. The Queen passed is expected — a passed King of Spades is a surprise that leaves the receiver exposed. The recipient often plays it into the Queen and loses 13 points.',
        "Pass cards that create problems, not cards that solve your hand. Passing your 3 worst cards is amateur. Passing cards that create voids in the receiver's dangerous suits is professional.",
        "Pass to the moon-shooter's weakness. If you suspect a player is going to shoot, pass them cards in the suit they need — it forces them to reconsider or execute with weaker cards.",
        'The right-to-left pass: when passing right, you are passing to the person who just passed to you. If they passed you high hearts, pass them back the Queen of Spades — they likely cannot void spades fast enough.',
      ],
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: 'Apply advanced Hearts strategy — play on Arcadeum',
      description:
        'Real-time four-player Hearts with full rule set including moon-shooting. Share a room link and practice these techniques with friends.',
    },
    {
      type: 'cta',
      href: '/blog/how-to-play-hearts',
      text: 'New to Hearts? Read the beginner guide first',
      description:
        'Covers setup, tricks, passing direction, and shooting the moon — everything before the advanced layer.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the advanced Hearts checklist',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Read the pass: high cards passed = the passer is weak there; low cards passed = the passer kept their high cards.',
        'Spot moon-shooting at trick 3: a player collecting multiple tricks and leading high is likely shooting. Block with one heart.',
        'Plan across hands, not just the current one — protect the leader, target the trailer.',
        'Count hearts and spades remaining in the final 4 tricks to force plays.',
        'Hold the Queen as a weapon when it benefits you — dump it when forced.',
      ],
    },
  ],
  faq: [
    {
      question: 'How do I know when someone is shooting the moon?',
      answer:
        'Watch for three signals: they voluntarily win hearts in the first 4 tricks, they lead high cards rather than low ones to control trick timing, and they hold or welcome the Queen of Spades. If you see two of these three, assume they are shooting and win one heart immediately.',
    },
    {
      question: 'Is it worth holding the Queen of Spades to use as a weapon?',
      answer:
        'Yes, in two situations: when a specific player is moon-shooting and the Queen can stop them, or when a player is close to 100 and you can end the game by forcing the Queen onto them. Otherwise, dump it as soon as you safely can.',
    },
    {
      question: 'What is the best card to pass when passing left?',
      answer:
        'Usually your highest card in the suit you have fewest of (creating a void), unless that card is the Queen of Spades. Your second priority is high cards in suits the player to your left tends to hold — passing into their strength creates problems for them.',
    },
    {
      question: 'How do I count hearts effectively mid-game?',
      answer:
        'Count by suit. Each suit has 13 cards. After each trick, note what was played. By trick 7-8, you should know how many hearts remain and which players likely still hold them — enabling you to force or avoid heart tricks precisely.',
    },
  ],
};
