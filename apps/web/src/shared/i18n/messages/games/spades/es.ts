export const esMessages = {
  spades_v1: {
    name: 'Espadas',
    description:
      'Clásico juego de cartas de pareja para 4 jugadores — apuesta tus bazas y deja que las Espadas triunfen',
    summary:
      'Apuesta cuántas bazas tomarás, haz equipo con tu pareja y ¡deja que las Espadas triunfen!',
    variants: {},
    landing: {
      meta: {
        title: 'Espadas — Juego de Cartas Multijugador Gratis | Arcadeum',
        description:
          'Juega Espadas gratis en Arcadeum. Clásico juego de cartas de parejas de 4 jugadores con apuestas, Nil, bolsas y oponentes IA.',
        keywords:
          'espadas, juego de cartas, trick-taking, multijugador, online, gratis, estrategia, apuestas, nil',
      },
      hero: {
        title: 'Espadas',
        subtitle:
          'Clásico juego de cartas por parejas para 4 jugadores. ¡Apuesta, juega y deja que las Espadas triunfen!',
        ctaQuickplay: 'Jugar vs IA',
        ctaQuickplayError: 'Error al crear juego',
        createRoom: 'Crear Sala',
        browseRooms: 'Buscar Salas',
      },
      highlights: {
        players: {
          title: 'Parejas 2v2',
          body: 'Haz equipo con el jugador frente a ti',
        },
        bidding: {
          title: 'Apuestas y Nil',
          body: 'Apuesta tus bazas — o arríesgalo todo con una apuesta Nil',
        },
        sandbagging: {
          title: 'Penalización de Bolsas',
          body: 'Las bazas extra se convierten en bolsas; cada 10 cuestan 100 puntos',
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
          title: 'Apuesta, Juega y Anota',
          body: '¡Sigue palo, cumple tus apuestas y evita bolsas extra!',
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
        highlightsTitle: '¿Por Qué Jugar Espadas?',
        highlightsKicker: 'Destacados',
        howToPlayTitle: 'Para Empezar',
        howToPlayKicker: 'Inicio Rápido',
        finalCtaTitle: 'Apuesta Bien y Toma Tus Bazas',
        finalCtaSubtitle:
          'Desafía a bots inteligentes o juega contra amigos en partidas en tiempo real.',
        backToGames: 'Todos los Juegos',
        heroEyebrow: 'Clásico Trick-Taking por Parejas de 4 Jugadores',
        heroIntro:
          'Un juego de estrategia por parechas de apuestas, seguir palo y dejar que las espadas triunfen.',
        heroCategory: 'Juego de Cartas',
        playersBadge: '4 Jugadores · 2v2',
        durationBadge: '30–45 min',
        difficultyBadge: 'Estrategia',
        chipTrickTaking: 'Trick-Taking',
        chipPartnership: 'Parejas 2v2',
        chipBidding: 'Apuestas y Nil',
        chipAiBots: 'Bots IA',
        tipCreate: 'Elige tu tema visual y configura las opciones.',
        tipJoin: 'Juega con amigos o completa con bots IA.',
        tipPlay:
          '¡Apuesta tus bazas, sigue palo y deja que las espadas triunfen!',
      },
      faq: {
        rules: {
          question: '¿Cómo se gana en Espadas?',
          answer:
            'Los equipos anotan puntos cumpliendo su apuesta combinada (10 puntos por baza apostada más uno por cada baza extra). El primer equipo en alcanzar la puntuación objetivo —normalmente 500— gana la partida.',
        },
        nil: {
          question: '¿Qué es una apuesta Nil?',
          answer:
            'Una apuesta Nil significa que prometes no tomar ninguna baza. Si lo logras, tu equipo gana 100 puntos extra; si falla, pierde 100. Tu compañero sigue jugando para cumplir su propia apuesta.',
        },
        breaking: {
          question: '¿Cuándo puedes liderar con Espadas?',
          answer:
            'Las Espadas no pueden liderar una baza hasta que han sido "rotas" — es decir, hasta que un jugador sin palo descartó una espada. Una vez rotas, cualquier espada puede liderar.',
        },
        bags: {
          question: '¿Qué son las bolsas?',
          answer:
            'Cada baza extra por encima de la apuesta del equipo cuenta como bolsa. Cada vez que un equipo acumula 10 bolsas, se le descuentan 100 puntos — por eso apuntar bien importa.',
        },
      },
    },
    lobby: {
      variant: 'Tema',
      rules: 'Reglas del Juego',
      startWithBots: 'Empezar con Bot',
      aiDifficulty: 'Dificultad IA',
      nilEnabled: 'Permitir apuestas Nil',
      targetScore: 'Puntuación Objetivo',
    },
    gameOver: {
      won: '¡Ganaste!',
      lost: 'Perdiste.',
      draw: 'Es un empate.',
      messages: {
        won: '¡Vuestra pareja tomó exactamente lo que prometió — bien jugado!',
        lost: 'La otra pareja os superó esta vez. ¿Revancha?',
        draw: 'Ambos equipos terminaron igualados. ¿Otra partida?',
      },
    },
    game: {
      yourTurn: 'Tu turno de jugar',
      waitingForOpponent: 'Esperando al oponente...',
      selectBid: 'Coloca tu apuesta',
      confirmBid: 'Confirmar Apuesta',
      nilBid: 'Nil',
      bidsLabel: 'Apuestas',
      bagsLabel: 'Bolsas',
      partnerLabel: 'Compañero',
      followSuit: 'Debes seguir palo',
      gameOver: 'Fin del Juego',
      biddingPhase: 'Fase de apuestas',
      playerTurn: 'Turno de {{player}}',
      handLabel: 'Mano {{n}}',
      trickLabel: 'Baza {{n}} de 13',
      spadesBroken: 'Espadas rotas',
      lastHand: 'Última mano: {{even}} pares / {{odd}} impares',
      bidNil: 'Nil',
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
        title: 'Primero la puja',
        body: 'Antes de jugar, puja cuántas bazas crees ganar. Tu pareja suma 10 × su puja combinada si la cumple.',
      },
      s2: {
        title: 'Picas son triunfo',
        body: 'Sirve palo si puedes; si estás vacío, vale cualquier carta. Las picas no pueden salir hasta romperse — pero cuando lo hacen, ganan a todo.',
      },
      s3: {
        title: 'Nil es una apuesta',
        body: 'Puja Nil para perseguir cero bazas por ±100 puntos — suelta tus picas pronto y escapa de todas las bazas.',
      },
      s4: {
        title: 'Las bolsas cobran',
        body: 'Cada baza extra es una bolsa: junta diez y pierdes 100 puntos. El primer equipo en alcanzar la puntuación objetivo gana.',
      },
    },
    rules: {
      title: 'Reglas de Espadas',
      objectiveTitle: 'Objetivo',
      objective:
        'Cumple la apuesta de tu pareja. Los equipos ganan 10 puntos por baza apostada más un punto por baza extra; el primer equipo en alcanzar la puntuación objetivo gana.',
      setupTitle: 'Preparación',
      setup:
        '4 jugadores en parejas fijas (sentados uno frente al otro) reciben 13 cartas cada uno de una baraja estándar de 52 cartas.',
      biddingTitle: 'Apuestas',
      bidding:
        'Cada jugador apuesta el número de bazas que espera ganar, empezando por el jugador a la izquierda del repartidor. Una apuesta de cero es una apuesta Nil que vale ±100 puntos.',
      gameplayTitle: 'Desarrollo',
      gameplay:
        'El primer jugador en apostar lidera. Sigue palo si es posible; si estás vacío, juega cualquier carta. Las Espadas siempre triunfan pero no pueden liderar hasta romperse. La espada más alta gana; si no, la carta más alta del palo líder.',
      scoringTitle: 'Puntuación',
      scoring:
        'Apuesta cumplida: 10 × apuesta del equipo + uno por baza extra. Apuesta fallida: −10 × apuesta del equipo. El Nil exitoso suma 100, el fallido resta 100. Cada 10 bolsas acumuladas cuestan 100 puntos.',
    },
  },
};
