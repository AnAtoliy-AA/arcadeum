export const esMessages = {
  hearts_v1: {
    name: 'Corazones',
    description:
      'Clásico juego de cartas de 4 jugadores — evita las cartas de penalti y dispara a la luna',
    summary:
      'Pasa cartas estratégicamente, sigue palo, deshazte de Corazones y la Reina de Espadas, ¡e intenta disparar a la luna!',
    variants: {},
    landing: {
      meta: {
        title: 'Corazones — Juego de Cartas Multijugador Gratis | Arcadeum',
        description:
          'Juega Corazones gratis en Arcadeum. Clásico juego de cartas de 4 jugadores con pass, Corazones, Reina de Espadas y oponentes IA.',
        keywords:
          'corazones, juego de cartas, trick-taking, multijugador, online, gratis, estrategia, reina de espadas',
      },
      hero: {
        title: 'Corazones',
        subtitle:
          'Clásico juego de cartas para 4 jugadores. ¡Pasa, escapa y dispara a la luna!',
        ctaQuickplay: 'Jugar vs IA',
        ctaQuickplayError: 'Error al crear juego',
        createRoom: 'Crear Sala',
        browseRooms: 'Buscar Salas',
      },
      highlights: {
        players: {
          title: '4 Jugadores',
          body: 'Clásico trick-taking para cuatro',
        },
        passing: {
          title: 'Paso de Cartas',
          body: 'Pasa 3 cartas cada mano — Izquierda, Derecha, Cruzada, Sin Paso',
        },
        shooting: {
          title: 'Disparar a la Luna',
          body: 'Toma los 26 puntos de penalti para que los oponentes los reciban',
        },
      },
      steps: {
        create: {
          title: 'Crear Sala',
          body: 'Elige tu tema y comienza una partida.',
        },
        join: {
          title: 'Invitar Amigos o Bots',
          body: 'Juega con 3 amigos o completa con bots IA.',
        },
        play: {
          title: 'Pasa, Juega y Anota',
          body: '¡Pasa cartas, sigue palo, evita Corazones y la Reina de Espadas!',
        },
      },
      themes: {
        title: 'Temas Visuales',
        subtitle: 'Juega en hermosas mesas cyber, retro y de fantasía.',
      },
      faq: {
        rules: {
          question: '¿Cómo se gana en Corazones?',
          answer:
            'El juego termina cuando cualquier jugador alcanza 100 puntos. El jugador con menor puntuación gana. Anotas puntos tomando Corazones (1 cada uno) y la Reina de Espadas (13).',
        },
        shooting: {
          question: '¿Qué es Disparar a la Luna?',
          answer:
            'Si tomas TODOS los 26 puntos de penalti en una mano, anotas 0 y cada oponente anota 26.',
        },
        passing: {
          question: '¿Cómo funciona el paso de cartas?',
          answer:
            'Antes de cada mano, seleccionas 3 cartas para pasar. La dirección rota: Izquierda, Derecha, Cruzada, Sin Paso.',
        },
        breaking: {
          question: '¿Cuándo puedes liderar con Corazones?',
          answer:
            'Los Corazones no pueden liderar hasta que se han "roto" — es decir, se ha descartado un Corazón en un truco anterior.',
        },
      },
    },
    lobby: {
      variant: 'Tema',
      rules: 'Reglas del Juego',
      startWithBots: 'Empezar con Bot',
      aiDifficulty: 'Dificultad IA',
      passingEnabled: 'Paso de Cartas',
      targetScore: 'Puntuación Objetivo',
    },
    passDirection: {
      left: 'Pasar Izquierda',
      right: 'Pasar Derecha',
      across: 'Pasar Cruzada',
      hold: 'Sin Paso',
    },
    game: {
      yourTurn: 'Tu turno para jugar',
      waitingForOpponent: 'Esperando oponente...',
      selectCardsToPass: 'Selecciona 3 cartas para pasar',
      passCards: 'Pasar Cartas',
      followSuit: 'Debes seguir palo',
      gameOver: 'Fin del Juego',
    },
    rules: {
      title: 'Reglas de Corazones',
      objectiveTitle: 'Objetivo',
      objective:
        'Evita tomar puntos de penalti. Cada Corazón vale 1 punto y la Reina de Espadas vale 13 puntos. Cuando cualquier jugador alcanza 100 puntos, el jugador con menor puntuación gana.',
      setupTitle: 'Configuración',
      setup:
        '4 jugadores reciben 13 cartas cada uno de una baraja estándar de 52 cartas. El jugador con el 2 de Tréboles lidera el primer truco.',
      passingTitle: 'Paso de Cartas',
      passing:
        'Antes de cada mano, los jugadores pasan 3 cartas: Izquierda, Derecha, Cruzada, Sin Paso. La dirección rota cada mano.',
      gameplayTitle: 'Juego',
      gameplay:
        'Sigue el palo liderado si es posible. Si no tienes del palo, juega cualquier carta. Los Corazones no pueden liderar hasta que se rompen.',
      scoringTitle: 'Puntuación',
      scoring:
        'Cada Corazón = 1 punto. Reina de Espadas = 13 puntos. Disparar a la Luna: toma los 26 puntos para anotar 0 mientras tus oponentes anotan 26.',
    },
  },
};
