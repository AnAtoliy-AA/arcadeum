// Games messages index - aggregates all game-related messages
import { gameNamesMessages } from './game-names';
import { commonGameMessages } from './common';
import { loungeMessages } from './lounge';
import { texasHoldemMessages } from './texas-holdem';
import { roomsMessages } from './rooms';
import {
  gameAlertsMessages,
  inviteDialogMessages,
  gameErrorsMessages,
  shareMessages,
} from './shared-ui';
import { createRoomMessages } from './create-room';
import { gameDetailMessages, roomDetailMessages } from './detail-pages';
import { criticalMessages } from './critical';

export const gamesMessages = {
  en: {
    ...gameNamesMessages.en,
    common: commonGameMessages.en,
    lounge: loungeMessages.en,
    texasHoldem: texasHoldemMessages.en,
    rooms: roomsMessages.en,
    alerts: gameAlertsMessages.en,
    inviteDialog: inviteDialogMessages.en,
    errors: gameErrorsMessages.en,
    share: shareMessages.en,
    create: createRoomMessages.en,
    detail: gameDetailMessages.en,
    room: roomDetailMessages.en,
    table: criticalMessages.en,
  },
  es: {
    ...gameNamesMessages.es,
    common: commonGameMessages.es,
    lounge: loungeMessages.es,
    texasHoldem: texasHoldemMessages.es,
    rooms: roomsMessages.es,
    alerts: gameAlertsMessages.es,
    inviteDialog: inviteDialogMessages.es,
    errors: gameErrorsMessages.es,
    share: shareMessages.es,
    create: createRoomMessages.es,
    detail: gameDetailMessages.es,
    room: roomDetailMessages.es,
    table: criticalMessages.es,
  },
  fr: {
    ...gameNamesMessages.fr,
    common: commonGameMessages.fr,
    lounge: loungeMessages.fr,
    texasHoldem: texasHoldemMessages.fr,
    rooms: roomsMessages.fr,
    alerts: gameAlertsMessages.fr,
    inviteDialog: inviteDialogMessages.fr,
    errors: gameErrorsMessages.fr,
    share: shareMessages.fr,
    create: createRoomMessages.fr,
    detail: gameDetailMessages.fr,
    room: roomDetailMessages.fr,
    table: criticalMessages.fr,
  },
};
