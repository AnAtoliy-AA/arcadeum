export const esMessages = {
  chess_v1: {
    name: 'Ajedrez',
    description:
      'El clásico juego de tablero de estrategia con reglas completas incluyendo enroque, captura al paso y promoción',
    summary:
      'Desafía a amigos o bots a una partida de ajedrez con variantes estándar y Chess960 con controles de tiempo opcionales.',
    landing: {
      meta: {
        title: 'Ajedrez Online — Bullet, Blitz, Rápido, Diario y Chess960 | Arcadeum',
        description:
          'Juega al ajedrez online con análisis del motor Stockfish 19, controles de tiempo bullet/blitz/rapido/diario, 6 variantes, 12 personalidades IA, Puzzle Rush, deshacer movimientos, importación PGN, tablas de finales, emparejamiento automático y revisión de partidas — todo gratis.',
        keywords:
          'ajedrez online, juego de ajedrez, ajedrez multijugador, chess960, ajedrez bullet, blitz, rapido, ajedrez diario, stockfish 19, puzzles de ajedrez, puzzle rush, análisis de ajedrez, tablas de finales, syzygy, jugar ajedrez gratis, motor de ajedrez online, IA ajedrez, variantes de ajedrez, ajedrez atómico, crazyhouse, rey de la colina, tres jaques, torneos de ajedrez, clubes de ajedrez',
        howToPlayTitle: 'Cómo jugar a {{gameName}}',
      },
      hero: {
        title: 'Ajedrez — el juego de estrategia atemporal',
        subtitle:
          'Impulsado por Stockfish 19. Bullet, blitz, rápido, diario y Chess960. Juega contra amigos, 12 personalidades IA o toda la comunidad.',
        createRoom: 'Crear sala',
        ctaQuickplay: 'Jugar contra la IA',
        ctaQuickplayError: 'No se pudo iniciar la partida — inténtalo de nuevo',
        browseRooms: 'Explorar salas',
        backToGames: '← Juegos',
      },
      highlights: {
        players: {
          title: '2 jugadores + 12 bots IA',
          body: 'Desafía a un amigo o elige entre 12 personalidades IA (rating 400–2800), cada una con estilo de juego y repertorio de aperturas único.',
        },
        variants: {
          title: '6 variantes',
          body: 'Estándar, Chess960, Rey de la Colina, Tres Jaques, Crazyhouse y Atómico — cada uno con condiciones de victoria únicas.',
        },
        clock: {
          title: 'Todo control de tiempo',
          body: 'Bullet (1+0, 2+1), Blitz (3+0, 5+0, 5+3), Rápido (10+0, 15+10), Clásico (30+0) y Diario (1–14 días por jugada).',
        },
      },
      steps: {
        create: {
          title: 'Crea una sala',
          body: 'Elige una variante, control de tiempo y tema visual. Pública o solo por invitación.',
        },
        join: {
          title: 'Invita a un amigo o añade un bot',
          body: 'Comparte el enlace, usa el emparejamiento rápido o empieza con un bot para jugar al instante.',
        },
        play: {
          title: 'Juega, analiza y mejora',
          body: 'Análisis Stockfish 19 en tiempo real, deshacer movimientos, importación PGN y revisión con puntuación de precisión.',
        },
      },
      faq: {
        chess960: {
          question: '¿Qué es Chess960?',
          answer:
            'Chess960 (Fischer Random) usa una posición inicial aleatoria con 960 configuraciones posibles. Las reglas de enroque se adaptan, pero todas las demás reglas del ajedrez permanecen iguales.',
        },
        clock: {
          question: '¿Cómo funcionan los controles de tiempo?',
          answer:
            'Cada jugador tiene un reloj. Cuando es tu turno, tu reloj cuenta hacia atrás. Si se acaba tu tiempo, pierdes. Algunos controles añaden tiempo después de cada movimiento. Bullet: 1–2 minutos, blitz: 3–5 minutos, rápido: 10–15 minutos.',
        },
        promotion: {
          question: '¿Cómo funciona la promoción de peón?',
          answer:
            'Cuando un peón llega al extremo opuesto del tablero, debes promocionarlo a dama, torre, alfil o caballo.',
        },
        stockfish: {
          question: '¿Qué es Stockfish 19?',
          answer:
            'Stockfish 19 es la última versión del motor de ajedrez de código abierto más fuerte del mundo. Utiliza la arquitectura de red neuronal SFNNv16 y alimenta todo el análisis en tiempo real, la revisión de partidas y la dificultad de los bots IA en Arcadeum.',
        },
        takeback: {
          question: '¿Puedo deshacer un movimiento?',
          answer:
            'Sí — usa el botón de Deshacer para solicitar una reversión. Tu oponente debe aceptar antes de que el movimiento se revierta. Disponible tanto en partidas casuales como clasificatorias.',
        },
        puzzlerush: {
          question: '¿Qué es Puzzle Rush?',
          answer:
            'Puzzle Rush es un modo de puzzles cronometrado. En Supervivencia tienes 3 vidas e intentas resolver la mayor cantidad de puzzles posible. En Modo Tiempo tienes 3 minutos.',
        },
      },
    },
    lobby: {
      variant: 'Variante',
      timeControl: 'Control de tiempo',
      startWithBots: 'Empezar con bots',
      waitingForPlayers: 'Esperando jugadores…',
      minPlayers: 'Mínimo 2 jugadores',
      standard: 'Estándar',
      chess960: 'Chess960',
      kingOfTheHill: 'Rey de la Colina',
      threeCheck: 'Tres Jaque',
      crazyhouse: 'Crazyhouse',
      atomic: 'Atómico',
      standardDesc: 'Posición inicial clásica',
      chess960Desc: 'Posición inicial aleatoria',
      kingOfTheHillDesc: 'Gana llegando al centro',
      threeCheckDesc: 'Gana con 3 jaques',
      crazyhouseDesc: 'Las piezas capturadas se pueden usar',
      atomicDesc: 'Las capturas explotan piezas',
      noClock: 'Sin reloj',
      unlimitedTime: 'Tiempo ilimitado',
      blitz: 'Blitz',
      rapid: 'Rápido',
      classical: 'Clásico',
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
      botPersonality: 'Personalidad del Bot',
    },
    profile: {
      notFound: 'Perfil no encontrado',
      games: 'Juegos',
      winRate: 'Tasa de victoria',
      puzzleRating: 'Clasificación de puzzles',
      puzzlesSolved: 'Puzzles resueltos',
      ratings: 'Clasificaciones',
      style: 'Estilo de juego',
      noGames: 'Aún no hay juegos',
      recentGames: 'Juegos recientes',
      challenge: 'Desafiar',
    },
    clubs: {
      search: 'Buscar clubes...',
      noClubs: 'No se encontraron clubes',
      members: 'miembros',
    },
    spectator: {
      viewers: 'espectadores',
      joinGame: 'Unirse',
    },
    tutorial: {
      s1: {
        title: 'Da mate al rey',
        body: 'Mueve tus piezas por el tablero de 8×8 para atacar al rey enemigo. Atrápalo para que no pueda escapar y gana por jaque mate.',
      },
      s2: {
        title: 'Mover piezas',
        body: 'Haz clic en una de tus piezas para resaltar sus casillas legales y luego en un destino. Se admiten enroque, captura al paso y coronación.',
      },
      s3: {
        title: 'Vigila el reloj',
        body: 'Tu reloj cuenta atrás en tu turno — quedarte sin tiempo pierde la partida. El sonido, la música y compartir están en este panel.',
      },
      s4: {
        title: 'Ayuda cuando la necesites',
        body: 'Abre el libro de Reglas cuando quieras repasar, usa las pistas donde estén disponibles y chatea con tu rival mientras juegas.',
      },
    },
    rules: {
      title: 'Reglas del Ajedrez',
      objective: 'Objetivo',
      objectiveText:
        'Jaque mate al rey de tu oponente. El rey está en jaque mate cuando está en jaque y no hay movimiento legal para escapar.',
      pieces: 'Piezas',
      special: 'Movimientos Especiales',
      castling:
        'El rey mueve dos casillas hacia una torre, y la torre salta sobre el rey. Debe estar despejado, el rey no en jaque, y ninguna pieza se ha movido.',
      enPassant:
        'Un peón puede capturar un peón oponente que acaba de mover dos casillas adelante, como si hubiera movido solo una.',
      promotion:
        'Un peón que alcanza el extremo opuesto se promociona a dama, torre, alfil o caballo.',
      drawConditions: 'Condiciones de Empate',
      drawStalemate: 'Tablas (sin movimientos legales, no en jaque)',
      drawFiftyMove:
        'Regla de 50 movimientos (50 movimientos sin capturas ni movimientos de peón)',
      drawRepetition: 'Triple repetición',
      drawMaterial: 'Material insuficiente',
      gotIt: 'Entendido',
    },
    gameOver: {
      won: '¡Ganaste!',
      lost: 'Perdiste.',
      draw: 'Empate.',
      messages: {
        won: '¡Jaque mate! Derrotaste a tu oponente. ¿Listo para otra partida?',
        lost: '¡Jaque mate! Tu oponente ganó. ¿Quieres revancha?',
        draw: 'La partida terminó en empate. ¿Prueba otra variante?',
      },
    },
    analysis: {
      title: 'Análisis de la partida',
      view: 'Ver análisis',
      back: 'Volver al resultado',
      centipawns: 'cp',
      empty: 'No hay suficientes movimientos para analizar.',
      summary: {
        inaccuracies: 'Imprecisiones',
        mistakes: 'Errores',
        blunders: 'Errores graves',
        turningPoint: 'Punto de inflexión',
        finalEval: 'Evaluación final',
      },
      quality: {
        good: 'Bien',
        inaccuracy: 'Imprecisión',
        mistake: 'Error',
        blunder: 'Error grave',
      },
    },
    coach: {
      title: 'Pistas de entrenador',
      hint: 'Pista',
      move: 'Jugada sugerida: {{symbol}} a {{square}}',
      capture:
        'Jugada sugerida: {{symbol}} a {{square}}, capturando {{target}}',
      castleKing: 'Jugada sugerida: enroque corto',
      castleQueen: 'Jugada sugerida: enroque largo',
      promote:
        'Jugada sugerida: {{symbol}} a {{square}}, coronar a {{promotion}}',
    },
    actions: {
      move: 'Mover pieza',
      resign: 'Rendirse',
      rematch: 'Revancha',
      leave: 'Salir',
      draw: 'Empate',
      drawOffered: 'Empate ofrecido',
      acceptDraw: 'Aceptar empate',
      declineDraw: 'Rechazar',
      moveList: 'Lista de movimientos',
      copyPGN: 'Copiar PGN',
    },
    chat: {
      move: '{{name}} movió {{notation}}',
      check: '¡{{name}} está en jaque!',
      checkmate: '¡{{name}} gana por jaque mate!',
      castle: '{{name}} enrocó',
      capture: '{{name}} capturó {{piece}}',
      promotion: '{{name}} promocionó a {{piece}}',
      resign: '{{name}} se rindió',
      draw: 'La partida terminó en empate',
      joined: '{{name}} se unió.',
      left: '{{name}} salió.',
    },
    errors: {
      notYourTurn: 'Aún no es tu turno.',
      invalidMove: 'Ese no es un movimiento legal.',
      gameOver: 'La partida ha terminado.',
      gameNotStarted: 'La partida aún no ha comenzado.',
    },
    status: {
      turn: 'Turno de {{player}}',
      yourTurn: 'Tu turno',
      white: 'Blancas',
      black: 'Negras',
      toMove: 'a mover',
      check: '¡Jaque!',
      checkmate: '¡Jaque mate!',
      winner: '{{player}} ganó',
      draw: 'Empate',
      moves: '{{count}} movimientos',
      promotionTitle: 'Promocionar peón a:',
      collapse: 'Colapsar',
      showAll: 'Mostrar todo ({{count}})',
      copied: '¡Copiado!',
      spectating: 'Observando',
      boardLabel: 'Tablero de ajedrez, {{color}} a mover',
    },
    puzzles: {
      title: 'Problemas de ajedrez',
      subtitle: 'Resuelve problemas tácticos para mejorar tu puntuación',
      loading: 'Cargando problema...',
      noPuzzles: 'No hay problemas disponibles',
      yourTurn: 'Tu turno — encuentra la mejor jugada',
      opponentThinking: 'Oponente pensando...',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto — intenta de nuevo',
      nextPuzzle: 'Siguiente problema',
      getHint: 'Obtener pista',
      themes: 'Temas',
      rating: 'Puntuación',
      streak: '{{count}} seguidas',
      daily: 'Problema del día',
      rated: 'Problemas con puntuación',
      themed: 'Problemas por tema',
    },
    tournament: {
      title: 'Torneos de ajedrez',
      join: 'Unirse',
      leave: 'Salir',
      arena: 'Arena',
      swiss: 'Suizo',
      live: 'EN VIVO AHORA',
      upcoming: 'PRÓXIMAMENTE',
      completed: 'FINALIZADO',
      players: 'Jugadores',
      timeControl: 'Control de tiempo',
      duration: 'Duración',
      rounds: 'Rondas',
      prize: 'Premio',
      noTournaments: 'No hay torneos disponibles aún.',
      standings: {
        title: 'Clasificación',
        player: 'Jugador',
        points: 'Pts',
        score: 'Puntos',
        streak: 'Racha',
        wins: 'G',
        draws: 'E',
        losses: 'P',
      },
      timer: {
        startsIn: 'Comienza en',
        timeRemaining: 'Tiempo restante',
        ended: 'Torneo finalizado',
      },
    },
  },
};
