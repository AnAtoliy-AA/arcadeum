import type { PetSpecies } from '@arcadeum/games-core';

export interface ThemePetDefinition {
  species: PetSpecies;
  name: string;
  theme: string;
  tagline: string;
  isSignature?: boolean;
}

export const THEME_PET_ROSTER: Record<string, readonly ThemePetDefinition[]> = {
  cyberpunk: [
    {
      species: 'cyber_cat',
      name: 'Neon Cyber Cat',
      theme: 'cyberpunk',
      tagline: 'Synthesized cyber feline with glowing neon whiskers',
      isSignature: true,
    },
    {
      species: 'dragon',
      name: 'Glitch Drake',
      theme: 'cyberpunk',
      tagline: 'Holographic wyrm that sparks neon data packets',
    },
    {
      species: 'dino',
      name: 'Mech Raptor',
      theme: 'cyberpunk',
      tagline: 'Chrome-plated bipedal speedster with cyber augments',
    },
    {
      species: 'blob',
      name: 'Holo Jelly',
      theme: 'cyberpunk',
      tagline: 'Luminescent gelatinous plasma core floating in cyberspace',
    },
    {
      species: 'slime',
      name: 'Nano Ooze',
      theme: 'cyberpunk',
      tagline: 'Self-replicating microscopic nanite colony',
    },
  ],
  underwater: [
    {
      species: 'blob',
      name: 'Abyssal Pearl Blob',
      theme: 'underwater',
      tagline: 'Deep ocean bioluminescent pearl with playful fins',
      isSignature: true,
    },
    {
      species: 'dragon',
      name: 'Leviathan Serpent',
      theme: 'underwater',
      tagline: 'Tidal wyrm ruler of the deepest oceanic trenches',
    },
    {
      species: 'cyber_cat',
      name: 'Aqua Whiskers',
      theme: 'underwater',
      tagline: 'Hydrodynamic feline with gills and coral fur',
    },
    {
      species: 'dino',
      name: 'Mosasaur Rex',
      theme: 'underwater',
      tagline: 'Aquatic prehistoric apex swimmer with paddle tail',
    },
    {
      species: 'slime',
      name: 'Bioluminescent Slime',
      theme: 'underwater',
      tagline: 'Glowing marine algae essence from twilight depths',
    },
  ],
  adventure: [
    {
      species: 'dino',
      name: 'Jungle Raptor',
      theme: 'adventure',
      tagline: 'Fierce tracker scouting across lost ancient ruins',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Panther Scout',
      theme: 'adventure',
      tagline: 'Silent explorer leaping through dense rainforest canopies',
    },
    {
      species: 'dragon',
      name: 'Volcano Wyrm',
      theme: 'adventure',
      tagline: 'Lava-crested drake basking in geothermal caldera caverns',
    },
    {
      species: 'blob',
      name: 'Canopy Spore',
      theme: 'adventure',
      tagline: 'Floating blossom spirit from sacred temple banyan trees',
    },
    {
      species: 'slime',
      name: 'Mudstone Slime',
      theme: 'adventure',
      tagline: 'Mineral-rich living forest loam and amber pebbles',
    },
  ],
  fantasy: [
    {
      species: 'dragon',
      name: 'Arcane Mystic Dragon',
      theme: 'fantasy',
      tagline: 'Breathes iridescent starlight flames and ancient wards',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Fey Lynx',
      theme: 'fantasy',
      tagline: 'Teleporting companion from the moonlit fae realm',
    },
    {
      species: 'dino',
      name: 'Rune Brontosaur',
      theme: 'fantasy',
      tagline: 'Gentle giant herbivore etched with luminescent sigils',
    },
    {
      species: 'blob',
      name: 'Wisp Bubble',
      theme: 'fantasy',
      tagline: 'Playful spirit born in enchanted fairy groves',
    },
    {
      species: 'slime',
      name: 'Mana Slime',
      theme: 'fantasy',
      tagline: 'Crystallized essence of pure magical spellcraft',
    },
  ],
  steampunk: [
    {
      species: 'dragon',
      name: 'Clockwork Brass Dragon',
      theme: 'steampunk',
      tagline: 'Gears and steam-powered bronze wings with whistle breath',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Copper Whiskers',
      theme: 'steampunk',
      tagline: 'Spring-wound brass mouse hunter with cog tail',
    },
    {
      species: 'dino',
      name: 'Steam Rex',
      theme: 'steampunk',
      tagline: 'Coal-fired mechanical stomper with exhaust pipes',
    },
    {
      species: 'blob',
      name: 'Boiler Puffer',
      theme: 'steampunk',
      tagline: 'Pressurized brass steam bubble on tiny valves',
    },
    {
      species: 'slime',
      name: 'Gear Oil Slime',
      theme: 'steampunk',
      tagline: 'Lubricated clockwork residue that rolls smoothly',
    },
  ],
  zen: [
    {
      species: 'blob',
      name: 'Zen Koi Blob',
      theme: 'zen',
      tagline: 'Peaceful ripples in a tranquil monastery reflection pond',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Tranquil Spirit Cat',
      theme: 'zen',
      tagline: 'Naps soundly under weeping cherry blossoms',
    },
    {
      species: 'dragon',
      name: 'Jade Sky Dragon',
      theme: 'zen',
      tagline: 'Gentle guardian of bamboo mountain peaks',
    },
    {
      species: 'dino',
      name: 'Bonsai Stegosaur',
      theme: 'zen',
      tagline: 'Sprouts miniature pine foliage plates on its back',
    },
    {
      species: 'slime',
      name: 'Bamboo Dew Slime',
      theme: 'zen',
      tagline: 'Clear morning condensation come to life',
    },
  ],
  galaxy: [
    {
      species: 'cyber_cat',
      name: 'Nebula Star Cat',
      theme: 'galaxy',
      tagline: 'Cosmic feline with swirling constellations on its coat',
      isSignature: true,
    },
    {
      species: 'dragon',
      name: 'Supernova Drake',
      theme: 'galaxy',
      tagline: 'Born from the radiant core of a dying star',
    },
    {
      species: 'dino',
      name: 'Meteor Dino',
      theme: 'galaxy',
      tagline: 'Armored in crystalline space meteorite scales',
    },
    {
      species: 'blob',
      name: 'Cosmic Void Blob',
      theme: 'galaxy',
      tagline: 'Miniature black hole with friendly sparkling eyes',
    },
    {
      species: 'slime',
      name: 'Stardust Slime',
      theme: 'galaxy',
      tagline: 'Glittering remnants of Saturnian planetary rings',
    },
  ],
  western: [
    {
      species: 'dino',
      name: 'Sheriff Canyon Rex',
      theme: 'western',
      tagline: 'Badge-wearing champion of the frontier mesa',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Bandit Puma',
      theme: 'western',
      tagline: 'Quick-draw feline with leather boots and bandolier',
    },
    {
      species: 'dragon',
      name: 'Dustdevil Drake',
      theme: 'western',
      tagline: 'Kicks up sand whirlwinds across desert canyons',
    },
    {
      species: 'blob',
      name: 'Tumbleweed Blob',
      theme: 'western',
      tagline: 'Bounces merrily down dusty frontier main streets',
    },
    {
      species: 'slime',
      name: 'Cactus Sap Slime',
      theme: 'western',
      tagline: 'Prickly desert blossom ooze surviving any drought',
    },
  ],
  egypt: [
    {
      species: 'cyber_cat',
      name: 'Anubis Shadow Cat',
      theme: 'egypt',
      tagline: 'Gold-collared sentinel of the royal pyramids',
      isSignature: true,
    },
    {
      species: 'dragon',
      name: 'Ra Sun Drake',
      theme: 'egypt',
      tagline: 'Radiates solar warmth of the golden sun god',
    },
    {
      species: 'dino',
      name: 'Dune Triceratops',
      theme: 'egypt',
      tagline: 'Carved like sandstone temple guardians at Karnak',
    },
    {
      species: 'blob',
      name: 'Scarab Gem Blob',
      theme: 'egypt',
      tagline: 'Polished lapis lazuli jewel moving with divine poise',
    },
    {
      species: 'slime',
      name: 'Nile Mud Slime',
      theme: 'egypt',
      tagline: 'Fertile river silt alive with timeless Egyptian magic',
    },
  ],
  horror: [
    {
      species: 'slime',
      name: 'Eldritch Abyssal Slime',
      theme: 'horror',
      tagline: 'Bubbling ooze from nameless shadows and fog',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Phantom Shadow Cat',
      theme: 'horror',
      tagline: 'Phases silently through haunted corridors',
    },
    {
      species: 'dragon',
      name: 'Nether Bone Drake',
      theme: 'horror',
      tagline: 'Skeletal flyer shrouded in ghostly mist',
    },
    {
      species: 'dino',
      name: 'Fossil Screamer',
      theme: 'horror',
      tagline: 'Rattles its prehistoric bone plates in the dark',
    },
    {
      species: 'blob',
      name: 'Eyeball Blob',
      theme: 'horror',
      tagline: 'Friendly multi-pupil watcher from the twilight',
    },
  ],
  crime: [
    {
      species: 'cyber_cat',
      name: 'Midnight Detective Cat',
      theme: 'crime',
      tagline: 'Fedora-wearing gumshoe prowling noir alleyways',
      isSignature: true,
    },
    {
      species: 'dragon',
      name: 'Syndicate Dragon',
      theme: 'crime',
      tagline: 'Speaks in whispers and rules the neon undercity',
    },
    {
      species: 'dino',
      name: 'Underworld Hound Rex',
      theme: 'crime',
      tagline: 'Sniffs out hidden clues and forgotten vaults',
    },
    {
      species: 'blob',
      name: 'Smoke Ring Blob',
      theme: 'crime',
      tagline: 'Drifts like haze under flickering rainy streetlamps',
    },
    {
      species: 'slime',
      name: 'Tarmac Slime',
      theme: 'crime',
      tagline: 'Rain-slicked city pavement essence',
    },
  ],
  'high-altitude-hike': [
    {
      species: 'dragon',
      name: 'Blizzard Wyvern',
      theme: 'high-altitude-hike',
      tagline: 'Rides freezing thermals above mountain summits',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Snow Leopard Scout',
      theme: 'high-altitude-hike',
      tagline: 'Master of icy crags and frozen alpine passes',
    },
    {
      species: 'dino',
      name: 'Glacier Ankylosaur',
      theme: 'high-altitude-hike',
      tagline: 'Ice-shelled defender against high mountain winds',
    },
    {
      species: 'blob',
      name: 'Hailstone Blob',
      theme: 'high-altitude-hike',
      tagline: 'Chilly crystal bouncing across the permafrost',
    },
    {
      species: 'slime',
      name: 'Frost Slime',
      theme: 'high-altitude-hike',
      tagline: 'Sub-zero glacial jelly that sparkles in cold air',
    },
  ],
  retro: [
    {
      species: 'slime',
      name: 'Pixel 8-Bit Slime',
      theme: 'retro',
      tagline: 'Classic pixelated arcade companion',
      isSignature: true,
    },
    {
      species: 'cyber_cat',
      name: 'Chiptune Cat',
      theme: 'retro',
      tagline: 'Meows in vibrant 4-channel square waves',
    },
    {
      species: 'dragon',
      name: 'Arcade Boss Dragon',
      theme: 'retro',
      tagline: 'Guards the final stage high score podium',
    },
    {
      species: 'dino',
      name: 'Pixel Rex',
      theme: 'retro',
      tagline: 'Jumps over hurdles at a crisp 60fps',
    },
    {
      species: 'blob',
      name: 'Pac Sprite Blob',
      theme: 'retro',
      tagline: 'Munches glowing energy pellets across retro mazes',
    },
  ],
};

export const GAME_THEME_IDS = Object.keys(THEME_PET_ROSTER);

export function getThemePets(themeId: string): readonly ThemePetDefinition[] {
  return THEME_PET_ROSTER[themeId] ?? THEME_PET_ROSTER.cyberpunk ?? [];
}

export function getSignaturePet(themeId: string): ThemePetDefinition {
  const pets = getThemePets(themeId);
  return (
    pets.find((p) => p.isSignature) ??
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
  return pets.find((p) => p.species === species);
}
