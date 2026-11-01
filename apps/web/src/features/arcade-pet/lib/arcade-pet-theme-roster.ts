import type { PetSpecies } from '@arcadeum/games-core';

export interface ThemePetDefinition {
  species: PetSpecies;
  name: string;
  theme: string;
  tagline: string;
  isSignature?: boolean;
}

const p = (
  species: PetSpecies,
  name: string,
  theme: string,
  tagline: string,
  isSignature?: boolean,
): ThemePetDefinition => ({
  species,
  name,
  theme,
  tagline,
  ...(isSignature ? { isSignature: true } : {}),
});

export const THEME_PET_ROSTER: Record<string, readonly ThemePetDefinition[]> = {
  cyberpunk: [
    p(
      'cyber_cat',
      'Neon Cyber Cat',
      'cyberpunk',
      'Synthesized cyber feline with glowing neon whiskers',
      true,
    ),
    p(
      'dragon',
      'Glitch Drake',
      'cyberpunk',
      'Holographic wyrm that sparks neon data packets',
    ),
    p(
      'dino',
      'Mech Raptor',
      'cyberpunk',
      'Chrome-plated bipedal speedster with cyber augments',
    ),
    p(
      'blob',
      'Holo Jelly',
      'cyberpunk',
      'Luminescent gelatinous plasma core floating in cyberspace',
    ),
    p(
      'slime',
      'Nano Ooze',
      'cyberpunk',
      'Self-replicating microscopic nanite colony',
    ),
  ],
  underwater: [
    p(
      'blob',
      'Abyssal Pearl Blob',
      'underwater',
      'Deep ocean bioluminescent pearl with playful fins',
      true,
    ),
    p(
      'dragon',
      'Leviathan Serpent',
      'underwater',
      'Tidal wyrm ruler of the deepest oceanic trenches',
    ),
    p(
      'cyber_cat',
      'Aqua Whiskers',
      'underwater',
      'Hydrodynamic feline with gills and coral fur',
    ),
    p(
      'dino',
      'Mosasaur Rex',
      'underwater',
      'Aquatic prehistoric apex swimmer with paddle tail',
    ),
    p(
      'slime',
      'Bioluminescent Slime',
      'underwater',
      'Glowing marine algae essence from twilight depths',
    ),
  ],
  adventure: [
    p(
      'dino',
      'Jungle Raptor',
      'adventure',
      'Fierce tracker scouting across lost ancient ruins',
      true,
    ),
    p(
      'cyber_cat',
      'Panther Scout',
      'adventure',
      'Silent explorer leaping through dense rainforest canopies',
    ),
    p(
      'dragon',
      'Volcano Wyrm',
      'adventure',
      'Lava-crested drake basking in geothermal caldera caverns',
    ),
    p(
      'blob',
      'Canopy Spore',
      'adventure',
      'Floating blossom spirit from sacred temple banyan trees',
    ),
    p(
      'slime',
      'Mudstone Slime',
      'adventure',
      'Mineral-rich living forest loam and amber pebbles',
    ),
  ],
  fantasy: [
    p(
      'dragon',
      'Arcane Mystic Dragon',
      'fantasy',
      'Breathes iridescent starlight flames and ancient wards',
      true,
    ),
    p(
      'cyber_cat',
      'Fey Lynx',
      'fantasy',
      'Teleporting companion from the moonlit fae realm',
    ),
    p(
      'dino',
      'Rune Brontosaur',
      'fantasy',
      'Gentle giant herbivore etched with luminescent sigils',
    ),
    p(
      'blob',
      'Wisp Bubble',
      'fantasy',
      'Playful spirit born in enchanted fairy groves',
    ),
    p(
      'slime',
      'Mana Slime',
      'fantasy',
      'Crystallized essence of pure magical spellcraft',
    ),
  ],
  steampunk: [
    p(
      'dragon',
      'Clockwork Brass Dragon',
      'steampunk',
      'Gears and steam-powered bronze wings with whistle breath',
      true,
    ),
    p(
      'cyber_cat',
      'Copper Whiskers',
      'steampunk',
      'Spring-wound brass mouse hunter with cog tail',
    ),
    p(
      'dino',
      'Steam Rex',
      'steampunk',
      'Coal-fired mechanical stomper with exhaust pipes',
    ),
    p(
      'blob',
      'Boiler Puffer',
      'steampunk',
      'Pressurized brass steam bubble on tiny valves',
    ),
    p(
      'slime',
      'Gear Oil Slime',
      'steampunk',
      'Lubricated clockwork residue that rolls smoothly',
    ),
  ],
  zen: [
    p(
      'blob',
      'Zen Koi Blob',
      'zen',
      'Peaceful ripples in a tranquil monastery reflection pond',
      true,
    ),
    p(
      'cyber_cat',
      'Tranquil Spirit Cat',
      'zen',
      'Naps soundly under weeping cherry blossoms',
    ),
    p(
      'dragon',
      'Jade Sky Dragon',
      'zen',
      'Gentle guardian of bamboo mountain peaks',
    ),
    p(
      'dino',
      'Bonsai Stegosaur',
      'zen',
      'Sprouts miniature pine foliage plates on its back',
    ),
    p(
      'slime',
      'Bamboo Dew Slime',
      'zen',
      'Clear morning condensation come to life',
    ),
  ],
  galaxy: [
    p(
      'cyber_cat',
      'Nebula Star Cat',
      'galaxy',
      'Cosmic feline with swirling constellations on its coat',
      true,
    ),
    p(
      'dragon',
      'Supernova Drake',
      'galaxy',
      'Born from the radiant core of a dying star',
    ),
    p(
      'dino',
      'Meteor Dino',
      'galaxy',
      'Armored in crystalline space meteorite scales',
    ),
    p(
      'blob',
      'Cosmic Void Blob',
      'galaxy',
      'Miniature black hole with friendly sparkling eyes',
    ),
    p(
      'slime',
      'Stardust Slime',
      'galaxy',
      'Glittering remnants of Saturnian planetary rings',
    ),
  ],
  western: [
    p(
      'dino',
      'Sheriff Canyon Rex',
      'western',
      'Badge-wearing champion of the frontier mesa',
      true,
    ),
    p(
      'cyber_cat',
      'Bandit Puma',
      'western',
      'Quick-draw feline with leather boots and bandolier',
    ),
    p(
      'dragon',
      'Dustdevil Drake',
      'western',
      'Kicks up sand whirlwinds across desert canyons',
    ),
    p(
      'blob',
      'Tumbleweed Blob',
      'western',
      'Bounces merrily down dusty frontier main streets',
    ),
    p(
      'slime',
      'Cactus Sap Slime',
      'western',
      'Prickly desert blossom ooze surviving any drought',
    ),
  ],
  egypt: [
    p(
      'cyber_cat',
      'Anubis Shadow Cat',
      'egypt',
      'Gold-collared sentinel of the royal pyramids',
      true,
    ),
    p(
      'dragon',
      'Ra Sun Drake',
      'egypt',
      'Radiates solar warmth of the golden sun god',
    ),
    p(
      'dino',
      'Dune Triceratops',
      'egypt',
      'Carved like sandstone temple guardians at Karnak',
    ),
    p(
      'blob',
      'Scarab Gem Blob',
      'egypt',
      'Polished lapis lazuli jewel moving with divine poise',
    ),
    p(
      'slime',
      'Nile Mud Slime',
      'egypt',
      'Fertile river silt alive with timeless Egyptian magic',
    ),
  ],
  horror: [
    p(
      'slime',
      'Eldritch Abyssal Slime',
      'horror',
      'Bubbling ooze from nameless shadows and fog',
      true,
    ),
    p(
      'cyber_cat',
      'Phantom Shadow Cat',
      'horror',
      'Phases silently through haunted corridors',
    ),
    p(
      'dragon',
      'Nether Bone Drake',
      'horror',
      'Skeletal flyer shrouded in ghostly mist',
    ),
    p(
      'dino',
      'Fossil Screamer',
      'horror',
      'Rattles its prehistoric bone plates in the dark',
    ),
    p(
      'blob',
      'Eyeball Blob',
      'horror',
      'Friendly multi-pupil watcher from the twilight',
    ),
  ],
  crime: [
    p(
      'cyber_cat',
      'Midnight Detective Cat',
      'crime',
      'Fedora-wearing gumshoe prowling noir alleyways',
      true,
    ),
    p(
      'dragon',
      'Syndicate Dragon',
      'crime',
      'Speaks in whispers and rules the neon undercity',
    ),
    p(
      'dino',
      'Underworld Hound Rex',
      'crime',
      'Sniffs out hidden clues and forgotten vaults',
    ),
    p(
      'blob',
      'Smoke Ring Blob',
      'crime',
      'Drifts like haze under flickering rainy streetlamps',
    ),
    p('slime', 'Tarmac Slime', 'crime', 'Rain-slicked city pavement essence'),
  ],
  'high-altitude-hike': [
    p(
      'dragon',
      'Blizzard Wyvern',
      'high-altitude-hike',
      'Rides freezing thermals above mountain summits',
      true,
    ),
    p(
      'cyber_cat',
      'Snow Leopard Scout',
      'high-altitude-hike',
      'Master of icy crags and frozen alpine passes',
    ),
    p(
      'dino',
      'Glacier Ankylosaur',
      'high-altitude-hike',
      'Ice-shelled defender against high mountain winds',
    ),
    p(
      'blob',
      'Hailstone Blob',
      'high-altitude-hike',
      'Chilly crystal bouncing across the permafrost',
    ),
    p(
      'slime',
      'Frost Slime',
      'high-altitude-hike',
      'Sub-zero glacial jelly that sparkles in cold air',
    ),
  ],
  retro: [
    p(
      'slime',
      'Pixel 8-Bit Slime',
      'retro',
      'Classic pixelated arcade companion',
      true,
    ),
    p(
      'cyber_cat',
      'Chiptune Cat',
      'retro',
      'Meows in vibrant 4-channel square waves',
    ),
    p(
      'dragon',
      'Arcade Boss Dragon',
      'retro',
      'Guards the final stage high score podium',
    ),
    p('dino', 'Pixel Rex', 'retro', 'Jumps over hurdles at a crisp 60fps'),
    p(
      'blob',
      'Pac Sprite Blob',
      'retro',
      'Munches glowing energy pellets across retro mazes',
    ),
  ],
};

export const GAME_THEME_IDS = Object.keys(THEME_PET_ROSTER);

export function getThemePets(themeId: string): readonly ThemePetDefinition[] {
  return THEME_PET_ROSTER[themeId] ?? THEME_PET_ROSTER.cyberpunk ?? [];
}

export function getSignaturePet(themeId: string): ThemePetDefinition {
  const pets = getThemePets(themeId);
  return (
    pets.find((petDef) => petDef.isSignature) ??
    pets[0] ?? {
      species: 'cyber_cat',
      name: 'Arcade Companion',
      theme: themeId,
      tagline: 'Friendly Arcadeum companion',
      isSignature: true,
    }
  );
}

export function getPetByThemeAndSpecies(
  themeId: string,
  species: PetSpecies,
): ThemePetDefinition | undefined {
  const pets = getThemePets(themeId);
  return pets.find((petDef) => petDef.species === species);
}
