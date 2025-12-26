import type { GamesMessages, Locale } from '../../types';
import { explodingCatsMessages } from './exploding-cats';
import { texasHoldemMessages } from './texas-holdem';
import { sharedMessages, type SharedGamesMessages } from './shared';

type ExtendedGamesMessages = GamesMessages &
  Partial<SharedGamesMessages> & {
    'exploding-kittens'?: { name: string };
    'exploding-cats'?: { name: string };
    'texas-holdem'?: { name: string };
    coup?: { name: string };
    'pandemic-lite'?: { name: string };
    rooms?: GamesMessages['rooms'] & {
      hostLabel?: string;
      playersLabel?: string;
      statusLabel?: string;
      visibilityLabel?: string;
      visibility?: {
        public?: string;
        private?: string;
      };
    };
    table?: {
      cards?: {
        explodingCat?: string;
        defuse?: string;
        attack?: string;
        skip?: string;
        favor?: string;
        shuffle?: string;
        seeTheFuture?: string;
        tacocat?: string;
        hairyPotatoCat?: string;
        rainbowRalphingCat?: string;
        cattermelon?: string;
        beardedCat?: string;
        generic?: string;
      };
      actions?: {
        start?: string;
        starting?: string;
        draw?: string;
        drawing?: string;
        playSkip?: string;
        playingSkip?: string;
        playAttack?: string;
        playingAttack?: string;
      };
      state?: {
        deck?: string;
        discard?: string;
        pendingDraws?: string;
        cards?: string;
        card?: string;
      };
      players?: {
        you?: string;
        alive?: string;
        eliminated?: string;
        yourTurn?: string;
        waitingFor?: string;
      };
      lobby?: {
        waitingToStart?: string;
        playersInLobby?: string;
        needTwoPlayers?: string;
        hostCanStart?: string;
        waitingForHost?: string;
      };
      hand?: {
        title?: string;
        empty?: string;
      };
      log?: {
        title?: string;
        empty?: string;
      };
      chat?: {
        title?: string;
        empty?: string;
        send?: string;
        show?: string;
        hide?: string;
        placeholderAll?: string;
        placeholderPlayers?: string;
        hintAll?: string;
        hintPlayers?: string;
        scope?: {
          all?: string;
          players?: string;
        };
      };
      eliminated?: {
        title?: string;
        message?: string;
      };
      fullscreen?: {
        enter?: string;
        exit?: string;
        hint?: string;
      };
      modals?: {
        common?: {
          cancel?: string;
        };
        catCombo?: {
          title?: string;
          selectMode?: string;
          pair?: string;
          pairDesc?: string;
          trio?: string;
          trioDesc?: string;
          selectTarget?: string;
          selectCard?: string;
          cardsCount?: string;
          confirm?: string;
        };
        seeTheFuture?: {
          title?: string;
          confirm?: string;
        };
        favor?: {
          title?: string;
          selectPlayer?: string;
          selectCard?: string;
          cardsCount?: string;
          confirm?: string;
        };
      };
      controlPanel?: {
        fullscreen?: string;
        exitFullscreen?: string;
        enterFullscreen?: string;
        leaveRoom?: string;
        moveControls?: {
          moveUp?: string;
          moveDown?: string;
          moveLeft?: string;
          moveRight?: string;
          centerView?: string;
          shortcuts?: {
            up?: string;
            down?: string;
            left?: string;
            right?: string;
            center?: string;
            fullscreen?: string;
            exitFullscreen?: string;
          };
        };
      };
    };
  };

export const gamesMessages: Record<Locale, ExtendedGamesMessages> = {
  en: {
    ...sharedMessages.en,
    ...explodingCatsMessages.en,
    ...texasHoldemMessages.en,
  },
  es: {
    ...sharedMessages.es,
    ...explodingCatsMessages.es,
    ...texasHoldemMessages.es,
  },
  fr: {
    ...sharedMessages.fr,
    ...explodingCatsMessages.fr,
    ...texasHoldemMessages.fr,
  },
};
