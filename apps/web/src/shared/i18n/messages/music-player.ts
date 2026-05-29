import type { DeepPartial } from '../base-types';

export const en = {
  nowPlaying: 'Now playing',
  play: 'Play',
  pause: 'Pause',
  stop: 'Stop',
  next: 'Next track',
  prev: 'Previous track',
  volume: 'Volume',
};

export type MusicPlayerMessages = DeepPartial<typeof en>;

export const es: MusicPlayerMessages = {
  nowPlaying: 'Reproduciendo',
  play: 'Reproducir',
  pause: 'Pausar',
  stop: 'Detener',
  next: 'Pista siguiente',
  prev: 'Pista anterior',
  volume: 'Volumen',
};

export const fr: MusicPlayerMessages = {
  nowPlaying: 'Lecture en cours',
  play: 'Lire',
  pause: 'Pause',
  stop: 'Arrêter',
  next: 'Piste suivante',
  prev: 'Piste précédente',
  volume: 'Volume',
};

export const ru: MusicPlayerMessages = {
  nowPlaying: 'Сейчас играет',
  play: 'Воспроизвести',
  pause: 'Пауза',
  stop: 'Остановить',
  next: 'Следующий трек',
  prev: 'Предыдущий трек',
  volume: 'Громкость',
};

export const by: MusicPlayerMessages = {
  nowPlaying: 'Зараз грае',
  play: 'Прайграць',
  pause: 'Паўза',
  stop: 'Спыніць',
  next: 'Наступны трэк',
  prev: 'Папярэдні трэк',
  volume: 'Гучнасць',
};
