import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'go-life-death-problems',
  locale: 'en',
  title:
    'Go Life-and-Death Problems — 10 Essential Shapes Every Player Must Know',
  excerpt:
    'The corner, the side, the center — the 10 life-and-death shapes that appear in every Go game explained step-by-step: the eye-stealing tesuji, the bent four, and the L-group.',
  publishedAt: '2026-09-10',
  author: 'Arcadeum team',
  tags: ['Go', 'Baduk', 'Weiqi', 'Tactics', 'Life and Death', 'Advanced'],
  readingTimeMinutes: 11,
  body: [
    {
      type: 'paragraph',
      text: "Life and death is the most important skill in Go. A player who cannot reliably read whether their groups are alive, dead, or in seki will lose material constantly — not from bad strategy, but from failing to see that their stones are already doomed or that the opponent's can be killed. This guide walks through 10 fundamental shapes, explaining the key move in each position and why it works.",
    },
    {
      type: 'paragraph',
      text: 'Remember the rule: a group is alive if it has two separate internal liberties (eyes) that the opponent cannot fill simultaneously. A group is dead if the opponent can eventually fill all its liberties without violating the ko rule. Seki is a mutual standoff where neither group can capture the other without being captured first.',
    },
    {
      type: 'heading',
      level: 2,
      text: '1. The L-Group (Straight Three)',
      id: 'l-group',
    },
    {
      type: 'paragraph',
      text: 'The straight three is a group of three stones in a line with three connected internal spaces. The attacker plays the middle space — this is the vital point. After that play, the group has only two spaces left and one of them becomes a false eye (the corner). The group is dead.',
    },
    {
      type: 'paragraph',
      text: 'Key move: when attacking a straight three, always play the center of the three spaces. The defender cannot create two real eyes from the remaining two spaces. When defending a straight three, immediately extend it to four (bent four or L-group) — straight three cannot live without attack.',
    },
    {
      type: 'heading',
      level: 2,
      text: '2. Bent Four in the Corner',
      id: 'bent-four',
    },
    {
      type: 'paragraph',
      text: 'One of the most important shapes in Go — a group occupying four corner points in an L-shape. In most positions, this group is dead even if it appears to have two eyes, because the attacker can use ko threats and the specific corner geometry to kill it. In Japanese rules, "bent four in the corner" is unconditionally dead — the group is removed without playing it out.',
    },
    {
      type: 'paragraph',
      text: 'Why it dies: one of the "eyes" in the bent four is a shared liberty — the corner point is adjacent to both apparent eyes. The attacker can play into one eye, creating a ko, then win the ko (or the position is simply ruled dead in Japanese rules). Defenders must recognize this shape early and avoid it by extending the group outward before being sealed in.',
    },
    {
      type: 'heading',
      level: 2,
      text: '3. The Bulky Five',
      id: 'bulky-five',
    },
    {
      type: 'paragraph',
      text: 'A group of five connected stones that occupy a 2×3 rectangular shape minus one corner. This group can make two eyes if the defender plays the vital point. If the attacker plays the vital point first (the center of the cross), the group is dead.',
    },
    {
      type: 'paragraph',
      text: "Vital point: the center of the cross shape (the intersection shared by four of the five stones). Whoever plays there wins — the defender lives, the attacker kills. This is a race to the vital point — if it is your turn to play inside an opponent's nearly-enclosed bulky five, play the center immediately.",
    },
    {
      type: 'heading',
      level: 2,
      text: '4. The Clamp (Eye-Stealing Tesuji)',
      id: 'clamp',
    },
    {
      type: 'paragraph',
      text: "The clamp is a tesuji (clever move) used to steal an eye. The attacker places a stone between two of the defender's stones in a way that forces one of the apparent eyes to become false. A false eye is a space that appears to be an internal liberty but cannot become a real eye because it is adjacent to a stone that, when captured, recreates the same situation.",
    },
    {
      type: 'paragraph',
      text: 'Recognition: look for a group where two apparent eyes are connected by a single defender stone on a shared diagonal. Playing adjacent to that shared stone can make the eye false. The clamp is typically combined with a sequence of captures.',
    },
    {
      type: 'heading',
      level: 2,
      text: '5. The Hanged Man (Two Stones Hanging)',
      id: 'hanged-man',
    },
    {
      type: 'paragraph',
      text: 'Two isolated stones connected only by a diagonal (in a "hanging" formation) usually cannot make eyes without help. If the attacker can surround this shape with a net, the two stones die. The key is that the two-stone group has no natural eyespace — it must create eyes by capturing the surrounding stones, but the surrounding stones are already well-connected.',
    },
    {
      type: 'paragraph',
      text: 'Defending the hanged man: connect the two stones immediately (if possible) to create a connected group with more eyespace potential. Two isolated stones almost always die against accurate play.',
    },
    {
      type: 'heading',
      level: 2,
      text: '6. The Rectangular Six',
      id: 'rect-six',
    },
    {
      type: 'paragraph',
      text: 'A 2×3 internal space is called a rectangular six. This space is large enough to guarantee life — the group cannot be killed from the outside. However, if the space is not fully surrounded yet, the attacker may be able to reduce it before it becomes a full rectangular six. Two rectangular sixes that share a dividing wall: the attacker plays the wall; if the defender cannot recapture, one of the six spaces is now false — the group dies.',
    },
    {
      type: 'heading',
      level: 2,
      text: '7. Ko in a Corner',
      id: 'ko-corner',
    },
    {
      type: 'paragraph',
      text: 'Ko (positional recapture rule) creates some of the most complex life-and-death situations. A group that can only live by winning a ko is called a "ko group" — its life depends on ko threats and the opponent\'s response. In the corner specifically, two groups can form a "ko for all the marbles" where one side can kill the other by winning a ko fight.',
    },
    {
      type: 'paragraph',
      text: 'Key principle: if you enter a ko fight, count your threats before the fight starts. A ko threat must be large enough that the opponent answers it — a threat to take 2 points does not stop a ko worth 10 points. Save your largest ko threats for the most important ko fights.',
    },
    {
      type: 'heading',
      level: 2,
      text: '8. Seki — the mutual life',
      id: 'seki',
    },
    {
      type: 'paragraph',
      text: 'Seki is a position where two groups share liberties that neither can fill without dying. Neither player can move inside the seki without capturing their own group in the process. The liberties in seki are shared but not owned by either side — in Japanese rules, shared liberties do not count as territory.',
    },
    {
      type: 'paragraph',
      text: 'Recognizing seki: a seki usually arises when two groups are interlocked with shared outside liberties. Neither has two eyes; both have at least one. The key test: if you fill a shared liberty, does your group die? If yes, and the same is true for the opponent, it is seki. Do not try to kill a seki group unless you are certain the reading is correct.',
    },
    {
      type: 'heading',
      level: 2,
      text: '9. The Nakade (Inside Kill)',
      id: 'nakade',
    },
    {
      type: 'paragraph',
      text: 'Nakade refers to the tesuji of playing inside a large eyespace to reduce it below the minimum needed for two eyes. The vital point of any symmetric shape is the center. Playing there splits the space in a way that prevents two real eyes from forming.',
    },
    {
      type: 'list',
      items: [
        'Four-space straight: vital point is second from one end (not the center of four). After the nakade, one side has a real eye and one side has a false eye.',
        'Five-space shapes: vital points depend on the specific shape (straight five vs. cross five vs. L-five). Cross five has the center as the vital point — playing there makes two false eyes.',
        'Six-space shapes: several shapes are alive without any inside play (rectangular six). The T-six and L-six have vital points that kill them. Study these shapes — they appear in high-frequency patterns.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: '10. The Approach-Move Race (Miai)',
      id: 'miai',
    },
    {
      type: 'paragraph',
      text: 'Miai refers to two moves that are equivalent — if the opponent plays one, you play the other, and the result is symmetrical. In life-and-death, miai means a group has two options for making eyes, and as long as the defender gets one of them, the group lives. The attacker cannot play both simultaneously.',
    },
    {
      type: 'paragraph',
      text: "Practical use: when your group has miai options (two equivalent places to make an eye), it is alive even without playing — as long as you can respond to the opponent's move. The danger is when a ko or net removes one of the miai options, leaving the group dependent on a single eye location that the attacker can now threaten.",
    },
    {
      type: 'heading',
      level: 2,
      text: 'How to practice life-and-death reading',
      id: 'practice',
    },
    {
      type: 'list',
      items: [
        'Solve one life-and-death problem every day. Even 5 minutes of focused reading improves visualization dramatically over weeks.',
        'Read to the end, not just the first move. The vital point is often not the obvious move — read 4-6 moves deep before deciding.',
        'Play on a 9x9 board. Every game on a 9x9 board features multiple life-and-death fights in a short game. The density of these situations forces rapid improvement.',
        "After solving a problem, try to find the refutation: play out the defender's best response to your solution. If the group dies even with the best defense, the solution is correct.",
        'Study common shapes until they are automatic. The L-group, rectangular six, and bent four should require zero calculation — you should recognize them on sight.',
      ],
    },
    {
      type: 'cta',
      href: '/games/go',
      text: 'Practice these shapes in real games — play Go on Arcadeum',
      description:
        '9×9, 13×13, and 19×19 Go boards. The life-and-death situations from this guide appear in every game.',
    },
    {
      type: 'cta',
      href: '/blog/how-to-play-go',
      text: 'New to Go? Start with the beginner guide',
      description:
        'Liberties, captures, ko, territory, and the opening strategy that shapes every game.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — the life-and-death essentials',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Two real eyes = life. One eye or false eyes = dead.',
        'Find the vital point first: the center of symmetric shapes is usually the key move.',
        'Bent four in the corner is unconditionally dead in Japanese rules — avoid this shape.',
        'Seki groups are alive but score no territory — recognize and leave them.',
        'Solve one life-and-death problem per day to build reading speed.',
      ],
    },
  ],
  faq: [
    {
      question: 'How do I know if a group is in seki?',
      answer:
        "Test it: if you fill a shared liberty, does your group die? If yes, and the same test applies to the opponent's group, it is seki. The clearest sign is two groups sharing outside liberties with neither having two independent eyes.",
    },
    {
      question: 'What is a "false eye"?',
      answer:
        'A false eye is a space that appears to be an eye (internal empty liberty) but cannot function as a real eye. This happens when the surrounding stones are not fully connected — the opponent can eventually capture those stones, collapsing the false eye and leaving the group with only one real eye.',
    },
    {
      question: 'Is bent four really dead without playing it out?',
      answer:
        'In Japanese rules, yes — "bent four in the corner" is ruled dead by agreement at the end of the game, without playing out the sequence. In Chinese rules (area scoring), the sequence must be played out, and the result is a ko fight. Practically, both lead to the same outcome: the group is dead if the opponent plays correctly.',
    },
    {
      question: 'What is the minimum eyespace needed to guarantee life?',
      answer:
        "A rectangular 2×3 space (6 squares) is the minimum that guarantees life regardless of the attacker's moves — it can always be divided into two real eyes. Smaller spaces may live or die depending on the specific shape and who plays inside first.",
    },
  ],
};
