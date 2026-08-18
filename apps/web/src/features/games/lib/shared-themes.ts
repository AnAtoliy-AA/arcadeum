export interface GameTheme {
  id: string;
  /** i18n key: 'games.themes.<id>.name' */
  nameKey: string;
  /** i18n key: 'games.themes.<id>.description' */
  descriptionKey: string;
  emoji: string;
  gradient: string;
  bgImage?: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
}

export const SHARED_THEMES: readonly GameTheme[] = [
  {
    id: 'cyberpunk',
    nameKey: 'games.themes.cyberpunk.name',
    descriptionKey: 'games.themes.cyberpunk.description',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
    colors: {
      primary: '#FF0080',
      accent: '#7928CA',
      background: '#0f0a1e',
      surface: '#1a1030',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
  },
  {
    id: 'underwater',
    nameKey: 'games.themes.underwater.name',
    descriptionKey: 'games.themes.underwater.description',
    emoji: '🦑',
    gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)',
    colors: {
      primary: '#007CF0',
      accent: '#00DFD8',
      background: '#04101f',
      surface: '#0a2038',
      text: '#e2f2ff',
      textSecondary: '#7fa8c9',
    },
  },
  {
    id: 'crime',
    nameKey: 'games.themes.crime.name',
    descriptionKey: 'games.themes.crime.description',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
    colors: {
      primary: '#F5A623',
      accent: '#F8E71C',
      background: '#12100c',
      surface: '#1e1a12',
      text: '#f5efe6',
      textSecondary: '#a39a87',
    },
  },
  {
    id: 'horror',
    nameKey: 'games.themes.horror.name',
    descriptionKey: 'games.themes.horror.description',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
    colors: {
      primary: '#7928CA',
      accent: '#FF0080',
      background: '#12060d',
      surface: '#1f0d1a',
      text: '#fae8f2',
      textSecondary: '#b78aa8',
    },
  },
  {
    id: 'adventure',
    nameKey: 'games.themes.adventure.name',
    descriptionKey: 'games.themes.adventure.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
    colors: {
      primary: '#4F566B',
      accent: '#FF4D4D',
      background: '#10131a',
      surface: '#1b2029',
      text: '#f0f2f6',
      textSecondary: '#9aa3b5',
    },
  },
  {
    id: 'high-altitude-hike',
    nameKey: 'games.themes.high-altitude-hike.name',
    descriptionKey: 'games.themes.high-altitude-hike.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #7dd3fc 0%, #1e3a8a 100%)',
    colors: {
      primary: '#7dd3fc',
      accent: '#1e3a8a',
      background: '#0a1526',
      surface: '#12233d',
      text: '#eaf6ff',
      textSecondary: '#8fb2d4',
    },
  },
  {
    id: 'galaxy',
    nameKey: 'games.themes.galaxy.name',
    descriptionKey: 'games.themes.galaxy.description',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #6b21a8 0%, #1e1b4b 100%)',
    bgImage: '/images/variants/galaxy_bg.webp',
    colors: {
      primary: '#6b21a8',
      accent: '#1e1b4b',
      background: '#0b0918',
      surface: '#151233',
      text: '#ede9ff',
      textSecondary: '#8f86c8',
    },
  },
  {
    id: 'fantasy',
    nameKey: 'games.themes.fantasy.name',
    descriptionKey: 'games.themes.fantasy.description',
    emoji: '🐉',
    gradient: 'linear-gradient(135deg, #065f46 0%, #d4af37 100%)',
    bgImage: '/images/variants/fantasy_bg.webp',
    colors: {
      primary: '#065f46',
      accent: '#d4af37',
      background: '#07120d',
      surface: '#0f2418',
      text: '#eef7f1',
      textSecondary: '#93a89a',
    },
  },
  {
    id: 'western',
    nameKey: 'games.themes.western.name',
    descriptionKey: 'games.themes.western.description',
    emoji: '🤠',
    gradient: 'linear-gradient(135deg, #9a3412 0%, #fde68a 100%)',
    bgImage: '/images/variants/western_bg.webp',
    colors: {
      primary: '#9a3412',
      accent: '#fde68a',
      background: '#160d07',
      surface: '#241710',
      text: '#f6efe4',
      textSecondary: '#b3a28c',
    },
  },
  {
    id: 'egypt',
    nameKey: 'games.themes.egypt.name',
    descriptionKey: 'games.themes.egypt.description',
    emoji: '🏺',
    gradient: 'linear-gradient(135deg, #b45309 0%, #1e3a8a 100%)',
    bgImage: '/images/variants/egypt_bg.webp',
    colors: {
      primary: '#b45309',
      accent: '#1e3a8a',
      background: '#120c06',
      surface: '#20160b',
      text: '#f7efe2',
      textSecondary: '#b3a48a',
    },
  },
  {
    id: 'steampunk',
    nameKey: 'games.themes.steampunk.name',
    descriptionKey: 'games.themes.steampunk.description',
    emoji: '⚙️',
    gradient: 'linear-gradient(135deg, #78350f 0%, #fef3c7 100%)',
    bgImage: '/images/variants/steampunk_bg.webp',
    colors: {
      primary: '#78350f',
      accent: '#fef3c7',
      background: '#0f0b06',
      surface: '#1c150c',
      text: '#f5ede0',
      textSecondary: '#a5977f',
    },
  },
  {
    id: 'zen',
    nameKey: 'games.themes.zen.name',
    descriptionKey: 'games.themes.zen.description',
    emoji: '🏮',
    gradient: 'linear-gradient(135deg, #db2777 0%, #1e1b4b 100%)',
    bgImage: '/images/variants/zen_bg.webp',
    colors: {
      primary: '#db2777',
      accent: '#1e1b4b',
      background: '#0c0a1a',
      surface: '#171330',
      text: '#f6eff5',
      textSecondary: '#a394b3',
    },
  },
  {
    id: 'random',
    nameKey: 'games.themes.random.name',
    descriptionKey: 'games.themes.random.description',
    emoji: '🎲',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    colors: {
      primary: '#6366f1',
      accent: '#a855f7',
      background: '#0d0b1a',
      surface: '#191533',
      text: '#f2efff',
      textSecondary: '#a69dcc',
    },
  },
] as const;

const THEME_INDEX = new Map<string, GameTheme>(
  SHARED_THEMES.map((t) => [t.id, t]),
);

export function getThemeById(themeId: string): GameTheme | undefined {
  return THEME_INDEX.get(themeId);
}
