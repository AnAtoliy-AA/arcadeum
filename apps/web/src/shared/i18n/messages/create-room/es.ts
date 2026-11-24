import type { CreateRoomMessages } from './en';

export const es: CreateRoomMessages = {
  header: {
    eyebrow: 'Sala nueva',
    title: 'Crear una sala',
    intro:
      'Elige un juego, un estilo y un nombre para tu sala. Después abrimos el lobby y te damos un enlace para compartir con tus amigos.',
    quick:
      'Todo está rellenado de antemano, así que puedes crear la sala ya. Cambia lo que quieras más abajo.',
  },
  progress: {
    label: 'Pasos para crear una sala',
    stepOf: 'Paso {{current}} de {{total}}',
    done: 'Listo',
  },
  steps: {
    game: {
      title: 'Elige un juego',
      why: 'Esto decide las reglas con las que jugará todo el mundo.',
    },
    preset: {
      title: 'Elige una configuración inicial',
      why: 'Un toque rellena valores razonables. Después puedes cambiar lo que quieras.',
    },
    look: {
      title: 'Elige un estilo',
      why: 'El tema solo cambia colores e ilustraciones. Las reglas siguen igual.',
    },
    packs: {
      title: 'Paquetes de cartas',
      why: 'Los paquetes extra añaden cartas nuevas y sorpresas. ¿Primera vez? Deja solo el básico, es lo más sencillo.',
    },
    room: {
      title: 'Ponle nombre a la sala',
      why: 'Tus amigos verán este nombre en la lista del lobby y en tu invitación.',
    },
    more: {
      title: 'Más opciones',
      why: 'Todo es opcional. Sáltalo si solo quieres jugar.',
      show: 'Mostrar más opciones',
      hide: 'Ocultar más opciones',
    },
  },
  game: {
    playing: 'Estás creando una sala para',
    change: 'Cambiar juego',
    done: 'Mantener este juego',
    pickerTitle: 'Todos los juegos',
    pickerHint: 'Elige un juego y tu elección se guarda al instante.',
    selected: 'Elegido',
    comingSoon: 'Próximamente',
    players: '{{label}} jugadores',
    cycleTheme: 'Siguiente tema',
  },
  presets: {
    label: 'Configuraciones iniciales',
    ranked: {
      label: 'Clasificatoria 1 contra 1',
      hint: 'Sala pública para 2 jugadores. El resultado cuenta para tu clasificación.',
    },
    friends: {
      label: 'Con amigos',
      hint: 'No aparece en la lista del lobby. Tus amigos entran con tu enlace.',
    },
    party: {
      label: 'Fiesta grande',
      hint: 'Sala pública con la mesa llena y todas las reglas divertidas activadas.',
    },
    custom:
      'Configuración personalizada. Cambiaste algo después de elegir una.',
  },
  theme: {
    groupLabel: 'Tema de {{game}}',
    current: 'Tema elegido: {{name}}',
  },
  packs: {
    summaryCore: 'Solo básico',
    summaryExtra: '{{n}} paquetes extra',
    selectAll: 'Añadir todos los paquetes',
    clearExtras: 'Volver a solo básico',
    show: 'Elegir paquetes',
    hide: 'Ocultar paquetes',
    alwaysOn: 'siempre incluido',
    cards: '{{n}} cartas',
  },
  rules: {
    title: 'Reglas de la casa',
    why: 'Pequeños cambios en cómo se juega. Déjalas desactivadas para las reglas estándar.',
    combos: {
      title: 'Combos de cartas de acción',
      desc: 'Permite jugar pares de cartas de acción como combo.',
    },
    idle: {
      title: 'Jugada automática por inactividad',
      desc: 'Si alguien deja de responder, el juego hace una jugada segura por esa persona para que nadie espere.',
    },
    teams: {
      title: 'Modo por equipos',
      desc: 'Los jugadores se dividen en equipos y ganan juntos.',
    },
    teamsPachisi: {
      title: 'Juego por equipos (2 contra 2)',
      desc: 'Cuatro jugadores, dos equipos. Los compañeros se sientan enfrente y ganan cuando todas sus fichas están en casa. Requiere exactamente 4 jugadores.',
    },
    none: 'Este juego no tiene reglas de la casa adicionales.',
    comingSoon: 'Próximamente',
  },
  details: {
    roomName: 'Nombre de la sala',
    required: 'obligatorio',
    roomNameHelp: 'Lo verá todo el que vea tu sala.',
    roomNamePlaceholder: 'Por ejemplo: Partida del viernes',
    errorRequired:
      'Ponle un nombre a la sala para que tus amigos la encuentren.',
    errorTooLong: 'El nombre debe tener menos de {{max}} caracteres.',
    players: 'Jugadores',
    playersHelp:
      'Auto llena la mesa de {{min}} a {{max}} jugadores. Elige un número para poner un límite.',
    auto: 'Auto',
    upTo: 'Hasta {{n}}',
    fixedPlayers: 'Este juego siempre se juega con {{n}} jugadores.',
    decrease: 'Menos jugadores',
    increase: 'Más jugadores',
    resetAuto: 'Volver a Auto',
    visibility: 'Quién puede entrar',
    visibilityHelp: {
      public: 'Pública: cualquiera la encuentra en el lobby y puede entrar.',
      unlisted:
        'Solo enlace: no aparece en la lista. Solo entra quien tenga tu enlace.',
      private:
        'Solo invitación: no aparece en la lista. Comparte tu enlace para dejar entrar a gente.',
    },
    visibilityPublic: 'Pública',
    visibilityUnlisted: 'Solo enlace',
    visibilityPrivate: 'Solo invitación',
    notes: 'Mensaje para los jugadores',
    notesHelp:
      'Una nota corta que verán al entrar, como "principiantes bienvenidos".',
    notesPlaceholder: 'Principiantes bienvenidos',
    password: 'Contraseña',
    passwordHelp:
      'Los jugadores deben escribirla para entrar. Déjala vacía si no quieres contraseña.',
    passwordPlaceholder: 'Define una contraseña',
    ranked: 'Partida clasificatoria',
    rankedHelp:
      'El resultado cambia la clasificación de cada jugador en este juego. Actívala para partidas en serio.',
  },
  summary: {
    title: 'Tu sala',
    subtitle: 'Vista previa. Se actualiza al cambiar los ajustes.',
    room: 'Sala',
    game: 'Juego',
    theme: 'Tema',
    players: 'Jugadores',
    access: 'Quién puede entrar',
    packs: 'Paquetes',
    rules: 'Reglas de la casa',
    rulesNone: 'Reglas estándar',
    ranked: 'Clasificatoria',
    yes: 'Sí',
    no: 'No',
    guide: 'Reglas y cómo jugar',
  },
  cta: {
    create: 'Crear sala',
    creating: 'Creando tu sala...',
    next: 'Al hacer clic creamos la sala y abrimos su lobby, donde tendrás un enlace para invitar a tus amigos.',
    shortcut: 'Consejo: pulsa Ctrl o Cmd + Enter para crear.',
    whyNeedName: 'Añade un nombre de sala arriba para continuar.',
    whyUnavailable:
      'Este juego o tema aún no está disponible, así que no se puede crear la sala.',
    comingSoon: 'Próximamente',
  },
  errors: {
    submitTitle: 'No pudimos crear tu sala',
    submitHelp:
      'Tus ajustes se conservan. Revisa tu conexión e inténtalo de nuevo.',
    retry: 'Reintentar',
    catalogTitle: 'No pudimos comprobar qué juegos están abiertos',
    catalogHelp: 'Aun así puedes intentar crear una sala.',
  },
};
