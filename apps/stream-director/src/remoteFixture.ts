/** Test fixture: a valid remote settings payload. */
import type { RemoteSettings } from './remoteConfig';

export const IDS = [
  'chess_v1',
  'checkers_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'critical_v1',
  'sea_battle_v1',
  'cat_dash_v1',
  'backgammon_v1',
  'hearts_v1',
  'spades_v1',
  'go_v1',
  'pachisi_v1',
];

export function settings(over: Partial<RemoteSettings> = {}): RemoteSettings {
  return {
    enabled: true,
    stopGracefully: false,
    games: Object.fromEntries(
      IDS.map((id) => [
        id,
        {
          enabled: true,
          weight: 1,
          themes: ['zen', 'galaxy'],
          maxDurationSec: 600,
        },
      ]),
    ) as RemoteSettings['games'],
    bot: { difficulty: 'expert', moveDelayMs: 2000 },
    secondsBetweenGames: 15,
    overlay: {
      joinUrl: '',
      showQr: true,
      parts: { players: true, status: true, cta: true, moves: true, arc: true },
      bannerText: '',
    },
    music: { volume: 25, tracks: [] },
    video: {
      resolution: '720p',
      fps: 30,
      bitrateKbps: 3500,
      preset: 'veryfast',
    },
    sceneLanguage: 'en',
    ...over,
  };
}
