export const esMessages = {
  go_v1: {
    name: 'Go',
    description:
      'Go clásico en tableros de 9×9, 13×13 y 19×19 con capturas, regla de ko y puntuación por área',
    summary:
      '¡Rodea territorio, captura grupos y supera a tu oponente en el juego de tablero más elegante jamás inventado!',
    landing: {
      meta: {
        title: 'Go — Juego de Tablero Multijugador Online Gratis | Arcadeum',
        description:
          'Juega al Go online gratis en Arcadeum. Reglas clásicas de Baduk/Weiqi en tableros de 9×9, 13×13 y 19×19 con capturas, regla de ko, puntuación por área e oponentes IA.',
        keywords:
          'go, baduk, weiqi, igo, juego de mesa, multijugador, online, gratis, estrategia',
      },
      hero: {
        title: 'Go',
        subtitle:
          'El antiguo juego de rodear territorio. Reglas simples, profundidad infinita.',
        ctaQuickplay: 'Jugar vs IA',
        ctaQuickplayError: 'Error al crear la partida',
        createRoom: 'Crear sala',
        browseRooms: 'Ver salas',
      },
      highlights: {
        players: {
          title: '2 Jugadores',
          body: 'Estrategia pura frente a frente',
        },
        boards: {
          title: 'Tres Tableros',
          body: 'Aprende en 9×9, mejora en 13×13, domina 19×19',
        },
        captures: {
          title: 'Capturas y Ko',
          body: 'Rodea grupos para eliminarlos — la regla de ko lo mantiene justo',
        },
        botAI: {
          title: 'Oponentes IA',
          body: 'Cuatro niveles de dificultad, desde aleatorios hasta búsqueda MCTS',
        },
      },
      steps: {
        create: {
          title: 'Crea una Sala',
          body: 'Elige tamaño de tablero y tema, y comparte el enlace con un amigo.',
          tip: 'Consejo: empieza en 9×9 si eres nuevo en Go.',
        },
        join: {
          title: 'Invita a Tu Oponente',
          body: 'O completa el asiento vacío con un bot de IA a cualquier dificultad.',
          tip: 'Las negras siempre mueven primero.',
        },
        play: {
          title: 'Rodea y Captura',
          body: 'Coloca piedras, rodea territorio y captura grupos — dos pases terminan la partida y la puntuación por área decide al ganador.',
          tip: 'El komi de 7.5 puntos compensa a las blancas por mover segundo.',
        },
      },
      themes: {
        title: 'Juega a Tu Estilo',
        subtitle:
          'Todos los temas compartidos de Arcadeum están disponibles — el tablero se adapta a tu estilo.',
      },
      sections: {
        faqTitle: 'Preguntas Frecuentes',
        faqKicker: 'FAQ',
        rulesTitle: 'Reglas Oficiales del Go',
        rulesKicker: 'Manual de Reglas',
        themesKicker: 'Personalización Visual',
        highlightsTitle: 'Reglas Simples, Profundidad Infinita',
        highlightsKicker: 'Características Clave',
        howToPlayTitle: 'Cómo Jugar al Go',
        howToPlayKicker: 'Inicio Rápido',
        howToPlayIntro:
          'Aprende los fundamentos del territorio, las capturas y la puntuación.',
        relatedTitle: 'Más Juegos de Tablero',
        relatedKicker: 'Descubre',
        finalCtaTitle: 'Rodea Más, Gana Más',
        finalCtaSubtitle:
          'Desafía a bots inteligentes o juega contra amigos en partidas en tiempo real.',
        backToGames: 'Todos los Juegos',
        heroEyebrow: 'El Antiguo Juego del Territorio',
        heroIntro:
          'Coloca piedras, rodea territorio y captura grupos en el tablero de estrategia más elegante jamás creado.',
        heroCategory: 'Juego de Tablero',
        playersBadge: '2 Jugadores',
        durationBadge: '10–40 min',
        difficultyBadge: 'Estrategia Profunda',
        chipTerritory: 'Capturas',
        chipKoRule: 'Regla de Ko',
        chipAreaScoring: 'Puntuación por Área',
        chipAiBots: 'Bots IA',
      },
      faq: {
        whatIsGo: {
          question: '¿Qué es el Go?',
          answer:
            'El Go (también llamado Baduk o Weiqi) es un juego de tablero milenario donde dos jugadores colocan piedras negras y blancas para rodear más territorio que su rival. Sus reglas se aprenden en minutos, pero su estrategia es más profunda que la del ajedrez.',
        },
        scoring: {
          question: '¿Cómo se decide el ganador?',
          answer:
            'Arcadeum usa puntuación por área china: tu puntuación son tus piedras en el tablero más los puntos vacíos rodeados completamente por tus piedras. Las blancas reciben 7.5 puntos de komi por mover segundo, así que no hay empates.',
        },
        koRule: {
          question: '¿Qué es la regla de ko?',
          answer:
            'No puedes recapturar inmediatamente si eso recrea la posición anterior del tablero. Tras una captura de ko debes jugar en otro lugar — el punto prohibido aparece marcado en el tablero.',
        },
        boardSize: {
          question: '¿Qué tamaño de tablero elegir?',
          answer:
            'Las partidas de 9×9 duran unos 10 minutos y son perfectas para aprender. 13×13 es un término medio, mientras que 19×19 es la experiencia clásica completa usada en juego profesional.',
        },
      },
    },
    lobby: {
      boardSize: 'Tamaño del tablero',
      boardSizeHint: '9×9 ≈ 10 min · 13×13 ≈ 20 min · 19×19 ≈ 40+ min',
      startWithBots: 'Empezar con bots',
    },
    status: {
      yourTurn: 'Tu turno',
      playerTurn: 'Turno de {{name}}',
      waiting: 'Esperando…',
      gameOver: 'Partida terminada',
    },
    game: {
      pass: 'Pasar',
    },
    board: {
      ariaLabel: 'Tablero de Go ({{size}}×{{size}})',
    },
    gameOver: {
      won: '¡Victoria!',
      lost: 'Derrota',
      draw: 'Empate',
      messages: {
        won: '¡Victoria! Has rodeado más territorio. ¿Listo para otra partida?',
        lost: 'Derrota — tu rival controló más área. ¿Quieres la revancha?',
        draw: 'Empate — tablero perfectamente equilibrado. ¿Jugar de nuevo?',
      },
    },
    tutorial: {
      s1: {
        title: 'Rodea territorio',
        body: 'Coloca piedras para cercar puntos vacíos. Cuando ambos pasen, gana el área mayor — Blanco empieza con la compensación del komi.',
      },
      s2: {
        title: 'Corta las libertades',
        body: 'Un grupo sin puntos vacíos adyacentes (libertades) se captura y se retira. Rodea piedras enemigas para quitarles su última libertad.',
      },
      s3: {
        title: 'Ojo con el ko',
        body: 'No puedes recapturar al instante recreando la posición anterior — juega en otro sitio primero. Dos pases consecutivos terminan la partida.',
      },
      s4: {
        title: 'Herramientas del oficio',
        body: 'Sonido, música, pantalla completa y el libro de Reglas esperan aquí mientras tramas tu próxima jugada.',
      },
    },
    rules: {
      title: 'Reglas del Go',
      objectiveTitle: 'Objetivo',
      objective:
        'Controla más territorio que tu oponente rodeando puntos vacíos y capturando grupos enemigos.',
      captureTitle: 'Capturas',
      capture:
        'Un grupo sin puntos vacíos adyacentes (libertades) es capturado y retirado del tablero.',
      koTitle: 'Regla de Ko',
      ko: 'Recapturar inmediatamente recreando la posición anterior está prohibido — juega primero en otro lugar.',
      passTitle: 'Pases',
      pass: 'Dos pases consecutivos terminan la partida. Pasa cuando no queden jugadas valiosas.',
      scoringTitle: 'Puntuación',
      scoring:
        'Puntuación por área china: piedras + territorio rodeado; las blancas empiezan con 7.5 de komi.',
    },
  },
};
