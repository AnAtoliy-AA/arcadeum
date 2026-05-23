import type { TranslationKey } from '@/shared/lib/useTranslation';
import { formatMessage } from '@/shared/i18n/context';

export function buildLabels(t: (k: TranslationKey) => string) {
  const tr = (key: string, fallback: string): string =>
    t(key as TranslationKey) || fallback;

  const upTo = (n: number) =>
    formatMessage(tr('games.create.upTo', 'Up to {{n}}'), { n }) ??
    `Up to ${n}`;

  return {
    tr,
    upTo,
    // Accessible/page heading — used as the H1's accessible name and the
    // browser tab fallback. The visible editorial title below is intentionally
    // softer.
    heading: tr('games.create.title', 'Create Game Room'),
    eyebrow: tr('games.create.eyebrow', 'New room'),
    titleMain: tr('games.create.title2', 'A new table.'),
    titleAccent: tr('games.create.titleAccent', 'Set in seconds.'),
    intro: tr(
      'games.create.intro',
      "Pick a game, dial in the rules, and we'll spin up a room and shareable link.",
    ),
    optional: tr('games.create.optional', 'Optional'),
    sectionGame: tr('games.create.sectionGame', 'Select a game'),
    sectionExpansions: tr('games.create.sectionExpansions', 'Expansion packs'),
    sectionTheme: tr('games.create.sectionVariant', 'Game theme'),
    sectionRules: tr('games.create.sectionHouseRules', 'House rules'),
    sectionDetails: tr('games.create.sectionDetails', 'Room details'),
    coreOnly: tr('games.create.coreOnly', 'Core only'),
    presets: [
      {
        id: 'ranked' as const,
        label: tr('games.create.presets.ranked', 'Ranked 1v1'),
        icon: '★',
      },
      {
        id: 'friends' as const,
        label: tr('games.create.presets.friends', 'Friends'),
        icon: '✦',
      },
      {
        id: 'party' as const,
        label: tr('games.create.presets.party', 'Big party'),
        icon: '☉',
      },
    ],
    gamePicker: {
      selected: tr('games.create.selected', 'Selected'),
      comingSoon: tr('games.create.comingSoon', 'Coming Soon'),
    },
    expansion: {
      barTitle: tr(
        'games.create.expansionBarTitle',
        'Mix card packs to spice up the deck',
      ),
      barDesc: tr(
        'games.create.expansionBarDesc',
        'Combine multiple expansions for chaotic, dense games.',
      ),
      selectAll: tr('games.create.selectAllPacks', 'Select all'),
      clearExtras: tr('games.create.clearExtras', 'Clear extras'),
      show: tr('games.create.showPacks', 'Show'),
      hide: tr('games.create.hidePacks', 'Hide'),
      alwaysOn: tr('games.create.alwaysOn', 'always on'),
      coreSummary: tr('games.create.coreOnly', 'Core only'),
      cardsSuffix: tr('games.create.cardsSuffix', 'cards'),
    },
    rules: {
      combos: {
        title: tr('games.create.rules.combos.title', 'Action card combos'),
        desc: tr(
          'games.create.rules.combos.desc',
          'Allow any pair as a combo, not just official sets.',
        ),
      },
      idle: {
        title: tr('games.create.rules.idle.title', 'Idle timer autoplay'),
        desc: tr(
          'games.create.rules.idle.desc',
          'Auto-play a sensible move after 15s of inactivity.',
        ),
      },
      teams: {
        title: tr('games.create.rules.teams.title', 'Team mode'),
        desc: tr(
          'games.create.rules.teams.desc',
          'Pair players into fleets — 2v2 or 3v3.',
        ),
      },
      spectators: {
        title: tr('games.create.rules.spectators.title', 'Allow spectators'),
        desc: tr(
          'games.create.rules.spectators.desc',
          'Anyone with the link can watch silently.',
        ),
      },
    },
    details: {
      roomName: tr('games.create.fieldName', 'Room name'),
      required: tr('games.create.required', 'required'),
      roomNamePlaceholder: tr('games.create.namePlaceholder', "Anatoli's game"),
      maxPlayers: tr('games.create.fieldMaxPlayers', 'Max players'),
      auto: tr('games.create.autoPlaceholder', 'Auto'),
      upTo,
      visibility: tr('games.create.fieldVisibility', 'Visibility'),
      visibilityPublic: tr('games.create.visibility.public', 'Public'),
      visibilityUnlisted: tr('games.create.visibility.unlisted', 'Unlisted'),
      visibilityPrivate: tr('games.create.visibility.private', 'Private'),
      notes: tr('games.create.fieldNotes', 'Notes'),
      notesShownTo: tr('games.create.notesShownTo', 'shown to joiners'),
      notesPlaceholder: tr(
        'games.create.notesPlaceholder',
        'No bots · EU evenings · first-timers welcome.',
      ),
    },
    rail: (defaultRoomName: string) => ({
      livePreview: tr('games.create.livePreview', 'LIVE PREVIEW'),
      defaultRoomName,
      game: tr('games.create.summary.game', 'Game'),
      expansion: tr('games.create.summary.expansion', 'Expansion'),
      theme: tr('games.create.summary.theme', 'Theme'),
      maxPlayers: tr('games.create.summary.maxPlayers', 'Max players'),
      visibility: tr('games.create.summary.visibility', 'Visibility'),
      rules: tr('games.create.summary.rules', 'House rules'),
      coreOnly: tr('games.create.coreOnly', 'Core only'),
      packsSuffix: tr('games.create.packsSuffix', 'packs'),
      auto: tr('games.create.autoPlaceholder', 'Auto'),
      upTo,
      visibilityPublic: tr('games.create.visibility.public', 'Public'),
      visibilityUnlisted: tr('games.create.visibility.unlisted', 'Unlisted'),
      visibilityPrivate: tr('games.create.visibility.private', 'Private'),
      noRules: tr('games.create.noRules', 'Default'),
      ruleNames: {
        combos: tr('games.create.summary.ruleCombos', 'Combos'),
        idle: tr('games.create.summary.ruleIdle', 'Idle autoplay'),
        teams: tr('games.create.summary.ruleTeams', 'Teams'),
        spectators: tr(
          'games.create.summary.ruleSpectators',
          'Allow spectators',
        ),
      },
    }),
    cta: {
      create: tr('games.common.createRoom', 'Create room'),
      creating: tr('games.create.submitCreating', 'Creating room…'),
      comingSoon: tr('games.create.comingSoon', 'Coming Soon'),
      shortcut: tr(
        'games.create.shortcut',
        '⌘ ↵ to create · share link is generated instantly',
      ),
    },
  };
}
