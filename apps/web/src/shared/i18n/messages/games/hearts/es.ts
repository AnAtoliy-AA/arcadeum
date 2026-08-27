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
        subtitle: 'Juega en mesas ciber, retro y de fantasía.',
      },
      sections: {
        faqTitle: 'Preguntas Frecuentes',
        faqKicker: 'FAQ',
        rulesTitle: 'Cómo Jugar',
        rulesKicker: 'Reglas',
        themesKicker: 'Temas',
        highlightsTitle: '¿Por qué jugar Corazones?',
        highlightsKicker: 'Aspectos Destacados',
        howToPlayTitle: 'Cómo Empezar',
        howToPlayKicker: 'Inicio Rápido',
        finalCtaTitle: 'Pasa, Juega y Dispara a la Luna',
        finalCtaSubtitle:
          'Desafía a bots inteligentes o juega contra amigos en partidas en tiempo real.',
        backToGames: 'Todos los Juegos',
        heroEyebrow: 'Clásico de Bazas para 4 Jugadores',
        heroIntro:
          'Un juego de cartas estratégico de pases, seguir palo y evitar puntos de penalti.',
        heroCategory: 'Juego de Cartas',
        playersBadge: '4 Jugadores',
        durationBadge: '20–30 min',
        difficultyBadge: 'Estrategia',
        chipTrickTaking: 'Bazas',
        chipCardPassing: 'Pase de Cartas',
        chipShootTheMoon: 'Disparar a la Luna',
        chipAiBots: 'Bots IA',
        tipCreate: 'Elige tu tema visual y configura las opciones.',
        tipJoin: 'Juega con amigos o llena los asientos con bots IA.',
        tipPlay:
          '¡Pasa cartas, sigue palo y evita Corazones y la Reina de Espadas!',
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
    gameOver: {
      won: '¡Ganaste!',
      lost: 'Perdiste.',
      draw: 'Es un empate.',
      messages: {
        won: 'La puntuación más baja de la mesa — ¡bien jugado!',
        lost: 'Alguien más tuvo una mano más limpia. ¿Revancha?',
        draw: 'Empate en puntos. ¿Otra partida?',
      },
    },
    game: {
      yourTurn: 'Tu turno para jugar',
      waitingForOpponent: 'Esperando oponente...',
      selectCardsToPass: 'Selecciona 3 cartas para pasar',
      passCards: 'Pasar Cartas',
      followSuit: 'Debes seguir palo',
      gameOver: 'Fin del Juego',
      passingPhase: 'Fase de pase',
      playerTurn: 'Turno de {{player}}',
      handLabel: 'Mano {{n}}',
      trickLabel: 'Truco {{n}}',
      heartsBroken: 'Corazones rotos',
    },
    card: {
      name: '{{rank}} de {{suit}}',
      ranks: {
        two: 'Dos',
        three: 'Tres',
        four: 'Cuatro',
        five: 'Cinco',
        six: 'Seis',
        seven: 'Siete',
        eight: 'Ocho',
        nine: 'Nueve',
        ten: 'Diez',
        jack: 'Sota',
        queen: 'Reina',
        king: 'Rey',
        ace: 'As',
      },
      suits: {
        spades: 'Espadas',
        hearts: 'Corazones',
        diamonds: 'Diamantes',
        clubs: 'Tréboles',
      },
    },
    tutorial: {
      s1: {
        title: 'Escapa de los puntos',
        body: 'Sirve palo si puedes; la carta más alta del palo de salida se lleva la baza — y todas sus cartas de castigo.',
      },
      s2: {
        title: 'Teme a la Reina',
        body: 'Cada corazón vale 1 punto y la Reina de Picas 13. Antes de cada mano pasa cartas peligrosas: izquierda, derecha, enfrente y sin pasar.',
      },
      s3: {
        title: 'Dispara a la luna',
        body: '¿Te sientes valiente? Captura los 26 puntos para dejar tu marcador en cero y endosarle 26 a todos los demás.',
      },
      s4: {
        title: 'Cuenta lo que falta',
        body: 'Sigue qué palos se han jugado, gestiona sonido y música y abre el libro de Reglas ante cualquier duda.',
      },
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
