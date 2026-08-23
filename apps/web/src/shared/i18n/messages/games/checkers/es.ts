export const esMessages = {
  checkers_v1: {
    name: 'Damas',
    description:
      'Damas clásicas 8×8 con capturas obligatorias, salto múltiple y promoción de rey',
    summary:
      'Juego de mesa estratégico — ¡captura las piezas del oponente y llega al otro lado para convertirte en rey!',
    variants: {
      classic: { name: 'Clásico', description: 'Tablero de damas tradicional' },
      neon: { name: 'Neón', description: 'Estética neón brillante' },
      wood: { name: 'Madera', description: 'Tablero de madera cálido' },
      marble: { name: 'Mármol', description: 'Acabado de mármol elegante' },
      neon_glow: { name: 'Brillo Neón', description: 'Neón púrpura profundo' },
    },
    landing: {
      meta: {
        title: 'Damas — Juego de Mesa Multijugador Gratis | Arcadeum',
        description:
          'Juega damas online gratis en Arcadeum. Tablero clásico 8×8 con capturas obligatorias, salto múltiple, promoción de rey y oponentes IA.',
        keywords:
          'damas, juego de mesa, multijugador, online, gratis, estrategia',
      },
      hero: {
        title: 'Damas',
        subtitle:
          'Estrategia clásica en un tablero 8×8. ¡Captura, promociona y conquista!',
        ctaQuickplay: 'Jugar vs IA',
        ctaQuickplayError: 'Error al crear juego',
        createRoom: 'Crear Sala',
        browseRooms: 'Ver Salas',
      },
      highlights: {
        players: {
          title: '2 Jugadores',
          body: 'Batalla estratégica uno a uno',
        },
        captures: {
          title: 'Capturas Obligatorias',
          body: '¡Si puedes capturar, debes hacerlo!',
        },
        kings: {
          title: 'Promoción de Rey',
          body: 'Llega al extremo opuesto para coronar un rey',
        },
      },
      steps: {
        create: {
          title: 'Crear Sala',
          body: 'Elige un tema y comienza un nuevo juego.',
        },
        join: {
          title: 'Unirse o Agregar Bot',
          body: 'Invita a un amigo o juega contra IA.',
        },
        play: {
          title: 'Jugar',
          body: 'Muévete en diagonal, captura piezas del oponente y ¡gana!',
        },
      },
      themes: {
        title: 'Elige Tu Tema',
        subtitle: 'Selecciona un estilo visual que te guste.',
      },
      faq: {
        forcedCaptures: {
          question: '¿Qué son las capturas obligatorias?',
          answer:
            'Si tienes una captura disponible, debes tomarla. No puedes omitir una captura aunque otro movimiento parezca mejor.',
        },
        multiJump: {
          question: '¿Puedo capturar múltiples piezas en un turno?',
          answer:
            '¡Sí! Si después de una captura tu pieza puede capturar de nuevo, debes continuar la cadena de saltos múltiples.',
        },
        kings: {
          question: '¿Cómo se convierten las piezas en reyes?',
          answer:
            'Cuando una pieza llega al extremo opuesto del tablero, se promueve a rey. Los reyes pueden moverse y capturar en todas las direcciones diagonales.',
        },
        botAI: {
          question: '¿Qué tan buena es la IA?',
          answer:
            'El bot utiliza un algoritmo minimax con evaluación posicional. Juega a nivel intermedio fuerte.',
        },
      },
    },
    lobby: {
      variant: 'Tema',
      ruleVariant: 'Reglas',
      rules: 'Reglas del Juego',
      startWithBots: 'Iniciar con Bot',
      forcedCaptures: 'Capturas Obligatorias',
      backwardCaptures: 'Capturas Hacia Atrás',
      alwaysEnabled: 'siempre habilitadas',
      ruleVariants: {
        american: {
          name: 'Americanas',
          description: 'Tablero 8×8, 12 piezas, sin reyes voladores',
        },
        international: {
          name: 'Internacionales',
          description:
            'Tablero 10×10, 20 piezas, reyes voladores, capturas hacia atrás',
        },
        russian: {
          name: 'Rusas',
          description: 'Tablero 8×8, 8 piezas, reyes voladores',
        },
      },
    },
    tutorial: {
      s1: {
        title: 'Carrera a dama',
        body: 'Mueve tus fichas en diagonal hacia adelante una casilla cada vez. Llega al lado contrario para coronar una dama que se mueve en ambas direcciones.',
      },
      s2: {
        title: 'Salta para capturar',
        body: 'Salta sobre una pieza enemiga adyacente para capturarla. Las capturas son obligatorias y las cadenas de saltos deben completarse hasta el final.',
      },
      s3: {
        title: 'Gana por eliminación',
        body: 'Captura todas las piezas enemigas o deja a tu rival sin movimientos legales para llevarte la victoria.',
      },
      s4: {
        title: 'Herramientas de mesa',
        body: 'Activa el sonido y la música, entra en pantalla completa, consulta el libro de Reglas o invita amigos desde este panel.',
      },
    },
    rules: {
      title: 'Reglas de Damas',
      headers: {
        objective: 'Objetivo',
        howToPlay: 'Cómo Jugar',
        kingPromotion: 'Promoción de Rey',
        backwardCaptures: 'Capturas Hacia Atrás',
        forcedCaptures: 'Capturas Obligatorias',
        winConditions: 'Ganar y Perder',
      },
      objective:
        'Captura todas las piezas de tu oponente o bloquéalas para que no tengan movimientos legales.',
      steps:
        'Los jugadores se turnan para mover una pieza en diagonal hacia adelante.\nLas piezas claras se mueven hacia arriba; las oscuras hacia abajo.\nUna pieza puede moverse a una casilla diagonal vacía adyacente.\nPara capturar, salta sobre una pieza del oponente hasta la casilla vacía más allá.',
      kingPromotion:
        'Cuando una pieza llega al extremo opuesto del tablero, se convierte en rey.\nLos reyes pueden moverse y capturar en cualquier dirección diagonal (hacia adelante y hacia atrás).\nEn las reglas internacionales y rusas, los reyes pueden deslizarse múltiples casillas en una dirección (reyes voladores).',
      backwardCaptures:
        'En algunos conjuntos de reglas, las piezas normales (damas) pueden capturar piezas del oponente detrás de ellas.\nLas damas siempre se mueven hacia adelante, pero pueden capturar en cualquier dirección diagonal cuando las capturas hacia atrás están habilitadas.\nEsta opción siempre está activa en las reglas internacionales y se puede configurar en otras variantes.',
      forcedCaptures:
        'Si hay una captura disponible, el jugador debe tomarla.\nSi hay múltiples capturas disponibles, el jugador debe elegir una.\nUna cadena de saltos múltiples debe completarse en su totalidad — no puedes detenerte si hay más capturas disponibles.',
      winConditions:
        'Ganas cuando:\n• Capturas todas las piezas del oponente\n• El oponente no tiene movimientos legales en su turno\n\nPierdes cuando:\n• Todas tus piezas son capturadas\n• No tienes movimientos legales en tu turno\n\nEl juego es EMPATE cuando ambos jugadores solo tienen reyes con material igual y ninguno puede forzar una victoria.',
    },
    gameOver: {
      won: '¡Victoria!',
      lost: 'Derrota',
      draw: 'Empate',
      messages: {
        won: '¡Felicidades, ganaste!',
        lost: '¡Mejor suerte la próxima vez!',
        draw: 'El juego terminó en empate.',
      },
    },
    actions: {
      movePiece: 'Mover',
      forfeit: 'Rendirse',
    },
    errors: {
      notYourTurn: 'No es tu turno',
      invalidMove: 'Movimiento inválido',
      captureRequired: 'La captura es obligatoria',
      noPieceSelected: 'Selecciona una pieza primero',
    },
    status: {
      yourTurn: 'Tu turno',
      waiting: 'Esperando oponente...',
    },
  },
};
