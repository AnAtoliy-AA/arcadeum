// Expansion packs surfaced in the redesign. `core` is always selected.
// Other IDs map to ExpansionId in features/games/ui/create/constants.ts.
export interface ExpansionPack {
  id: string;
  name: string;
  desc: string;
  count: number;
  locked?: boolean;
}

export const EXPANSION_PACK_LIST: ExpansionPack[] = [
  {
    id: 'core',
    name: 'Core',
    desc: 'The base 31-card deck.',
    count: 31,
    locked: true,
  },
  {
    id: 'attack',
    name: 'Attack Pack',
    desc: 'Targeted strikes, mega evade, and invert chaos.',
    count: 13,
  },
  {
    id: 'future',
    name: 'Future Pack',
    desc: 'See, alter, and reveal the top of the deck.',
    count: 25,
  },
  {
    id: 'theft',
    name: 'Theft Pack',
    desc: 'Wildcards, marks, and steal-draw mayhem.',
    count: 12,
  },
  {
    id: 'chaos',
    name: 'Chaos Pack',
    desc: 'Critical implosions, fission, and blackouts.',
    count: 7,
  },
  {
    id: 'deity',
    name: 'Deity Pack',
    desc: 'Omniscience, miracles, smites, and rapture.',
    count: 9,
  },
];
