export const esMessages = {
  tic_tac_toe_v1: {
    name: 'Tres en raya',
    description:
      'Clásico de 3 en línea con variantes temáticas y tableros 3×3 – 9×9',
    summary:
      'Coloca tu marca, alinea la cantidad necesaria y juega en seis variantes temáticas.',
    variants: {
      classic: {
        name: 'Clásico',
        description: 'Rejilla negra nítida sobre blanco papel',
      },
      neon: { name: 'Neón', description: 'Marcas violeta y cian brillantes' },
      paper: {
        name: 'Papel',
        description: 'Trazo manuscrito sobre pergamino cálido',
      },
      pixel: { name: 'Pixel', description: 'Verdes 8-bit retro' },
      chalkboard: { name: 'Pizarra', description: 'Tiza suelta sobre pizarra' },
      retro: { name: 'TV Retro', description: 'Ámbar atardecer y rojo cálido' },
    },
    landing: {
      meta: {
        title: 'Tres en raya — multijugador en tableros 3×3, 5×5, 7×7, 9×9',
        description:
          'Juega al tres en raya multijugador online. Seis variantes temáticas, 2–4 jugadores, modo equipos opcional, bots desde el primer día. Gratis, salas instantáneas, sin instalación.',
        keywords:
          'tres en raya, tic tac toe online, multijugador tres en raya, gomoku, cinco en raya, juegos de mesa',
      },
      hero: {
        title: 'Tres en raya — refinado y multijugador',
        subtitle:
          'Tableros temáticos, equipos y bots. Entra solo o con amigos, en tableros del 3×3 al 9×9.',
        createRoom: 'Crear sala',
        browseRooms: 'Buscar salas',
      },
      highlights: {
        players: {
          title: '2–4 jugadores',
          body: 'Todos contra todos o por equipos; los bots llenan asientos vacíos.',
        },
        sizes: {
          title: '4 tamaños de tablero',
          body: 'Desde rondas rápidas de 3×3 hasta partidas épicas de cinco en raya en 9×9.',
        },
        themes: {
          title: '6 variantes temáticas',
          body: 'Clásico, Neón, Papel, Pixel, Pizarra, TV Retro.',
        },
      },
      steps: {
        create: {
          title: 'Crea una sala',
          body: 'Elige variante y tamaño de tablero. Pública o solo con invitación.',
        },
        join: {
          title: 'Invita a un amigo o añade un bot',
          body: 'Comparte el enlace o pulsa “Empezar con bots” para jugar al instante.',
        },
        play: {
          title: 'Juega y chatea',
          body: 'Por turnos, alinea la cantidad necesaria y chatea en cada movimiento.',
        },
      },
      themes: {
        title: 'Elige el ambiente',
        subtitle:
          'Cada variante reestiliza el tablero, las marcas y la rejilla.',
      },
      faq: {
        sizes: {
          question: '¿Cómo cambia las reglas el tamaño del tablero?',
          answer:
            'La longitud ganadora escala con el tablero: 3 en línea en 3×3, 4 en línea en 5×5, 5 en línea tanto en 7×7 como en 9×9.',
        },
        teams: {
          question: '¿Podemos jugar por equipos?',
          answer:
            'Sí — activa el modo equipos en la sala. Hasta 4 jugadores divididos en dos equipos; los miembros comparten marca y alternan turnos.',
        },
        bots: {
          question: '¿Los bots son buenos?',
          answer:
            'En 3×3 el bot juega minimax perfecto — nunca pierde. En 5×5 bloquea amenazas inmediatas y prefiere el centro. En 7×7 y 9×9 juega heurísticas rápidas de ganar/bloquear con espaciado aleatorio.',
        },
      },
    },
    lobby: {
      boardSize: 'Tamaño del tablero',
      teamMode: 'Modo por equipos',
      startWithBots: 'Empezar con bots',
      addBot: 'Añadir bot',
      waitingForPlayers: 'Esperando jugadores…',
      minPlayers: 'Mínimo 2 jugadores',
    },
    rules: {
      title: 'Reglas',
      objective:
        'Sé el primero en colocar tu marca en {{winLength}} casillas en línea — horizontal, vertical o diagonal.',
      steps:
        '• En tu turno, haz clic en una casilla vacía.\n• Gana completando una línea.\n• Si el tablero se llena sin ganador, la ronda es empate.',
      winLengths:
        'Longitud ganadora por tablero: 3×3 → 3, 5×5 → 4, 7×7 → 5, 9×9 → 5.',
    },
    gameOver: {
      won: '¡Has ganado!',
      lost: 'Has perdido.',
      draw: 'Empate.',
      you: 'Tú',
      team: 'Equipo {{name}}',
    },
    actions: {
      place: 'Colocar marca',
      rematch: 'Revancha',
      leave: 'Salir',
      forfeit: 'Abandonar',
    },
    chat: {
      markPlaced: '{{name}} colocó una marca en ({{row}},{{col}})',
      won: '¡{{name}} gana la ronda!',
      draw: 'La ronda termina en empate.',
      joined: '{{name}} se unió.',
      left: '{{name}} se fue.',
      forfeit: '{{name}} abandonó.',
    },
    errors: {
      notYourTurn: 'Aún no es tu turno.',
      cellTaken: 'Esa casilla ya está ocupada.',
      gameOver: 'La partida ha terminado.',
      gameNotStarted: 'La partida no ha empezado.',
    },
    status: {
      turn: 'Turno de {{player}}',
      winner: '{{player}} ganó',
      draw: 'Empate',
    },
    score: {
      x: 'Victorias de X',
      o: 'Victorias de O',
      draws: 'Empates',
    },
  },
};
