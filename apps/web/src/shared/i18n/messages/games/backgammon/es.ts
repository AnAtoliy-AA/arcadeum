export const esMessages = {
  backgammon_v1: {
    name: 'Backgammon',
    description:
      'Clásico juego de mesa de 24 puntos con tiradas de dados, descarte y capturas al bar',
    summary:
      '¡Tira los dados, mueve las fichas, come las fichas rivales y sé el primero en sacarlas todas!',
    variants: {
      standard: {
        name: 'Estándar',
        description:
          'Reglas tradicionales de backgammon con capturas y descarte',
      },
      long: {
        name: 'Nardis Largos',
        description: 'Reglas tradicionales de nardis largos sin capturas',
      },
      hyper: {
        name: 'Hipergammon',
        description: 'Partida rápida y táctica con 3 fichas por jugador',
      },
      tavla: {
        name: 'Tavla',
        description: 'Reglas rápidas de Tavla tradicional',
      },
      nackgammon: {
        name: 'Nackgammon',
        description: 'Variante estratégica con 2 fichas en el punto 23',
      },
      gulbara: {
        name: 'Gulbara',
        description:
          'Juego sin capturas donde los dobles juegan todos los números superiores',
      },
    },
    landing: {
      meta: {
        title: 'Backgammon — Juego de Mesa Multijugador Gratis | Arcadeum',
        description:
          'Juega al Backgammon gratis en línea en Arcadeum. Tablero clásico de 24 casillas con dados, descarte, capturas y oponentes IA.',
        keywords:
          'backgammon, tablas reales, juego de mesa, multijugador, online, gratis, estrategia, dados',
      },
      hero: {
        title: 'Backgammon',
        subtitle:
          'Carrera clásica y estrategia en un tablero de 24 puntos. ¡Tira, come fichas y gana!',
        ctaQuickplay: 'Jugar contra IA',
        ctaQuickplayError: 'Error al crear la partida',
        createRoom: 'Crear Sala',
        browseRooms: 'Explorar Salas',
      },
      highlights: {
        players: {
          title: '2 Jugadores',
          body: 'Duelo estratégico cara a cara',
        },
        dice: {
          title: 'Dados y Dobles',
          body: 'Tira parejas, obtén 4 movimientos con dobles y planea tu ruta',
        },
        bearOff: {
          title: 'Sacar Fichas',
          body: 'Lleva todas las fichas a casa y vacía el tablero para ganar',
        },
      },
      steps: {
        create: {
          title: 'Crea una Sala',
          body: 'Elige tu tema visual y comienza una partida.',
        },
        join: {
          title: 'Invita a un Amigo o Bot',
          body: 'Juega con amigos o ponte a prueba contra la IA.',
        },
        play: {
          title: 'Tira y Corre',
          body: 'Tira los dados, avanza fichas, come las del oponente y sácalas.',
        },
      },
      themes: {
        title: 'Temas Visuales',
        subtitle: 'Juega en hermosos tableros con estilos únicos.',
      },
      faq: {
        rules: {
          question: '¿Cómo se gana en el Backgammon?',
          answer:
            'Lleva tus 15 fichas a tu tablero interno y sácalas del tablero antes que tu oponente.',
        },
        hitting: {
          question: '¿Qué pasa al comer una ficha?',
          answer:
            'Al caer en un punto con una sola ficha rival, va a la barra. El rival debe reintroducirla antes de mover otras fichas.',
        },
        doubles: {
          question: '¿Qué ocurre al sacar dobles?',
          answer:
            'Cuando sacas números iguales (ej. 4-4), puedes mover ese valor cuatro veces en lugar de dos.',
        },
        botAI: {
          question: '¿Cómo funciona la IA?',
          answer:
            'La IA evalúa posiciones tácticas, puntos seguros y carreras de pips.',
        },
      },
    },
    lobby: {
      variant: 'Tema',
      ruleVariant: 'Modo de Juego',
      rules: 'Reglas del Juego',
      startWithBots: 'Empezar con Bot',
      aiDifficulty: 'Dificultad IA',
      ruleVariants: {
        standard: {
          name: 'Estándar',
          description:
            'Backgammon clásico con 15 fichas, capturas al bar y descarte.',
        },
        long: {
          name: 'Nardis Largos',
          description:
            'Nardis largos tradicionales: 15 fichas en cabeza y sin capturas.',
        },
        hyper: {
          name: 'Hipergammon',
          description:
            'Partida ultrarrápida donde cada jugador tiene solo 3 fichas.',
        },
        tavla: {
          name: 'Tavla',
          description:
            'Tavla turca tradicional con ritmo veloz y capturas directas.',
        },
        nackgammon: {
          name: 'Nackgammon',
          description:
            'Variante táctica profunda con 2 fichas situadas en el punto 23.',
        },
        gulbara: {
          name: 'Gulbara',
          description:
            'Variante oriental sin capturas donde los dobles juegan pares sucesivos.',
        },
      },
    },
    game: {
      rollDice: 'Tirar Dados',
      rolling: 'Tirando...',
      diceRolled: 'Tirada',
      yourTurnToRoll: 'Tu turno de tirar los dados',
      yourTurnToMove: 'Tu turno de mover fichas',
      waitingForOpponentRoll: 'Esperando que el rival tire los dados...',
      waitingForOpponentMove: 'Esperando que el rival mueva...',
      barCount: 'Barra',
      barZone: 'Zona de barra',
      bearOffZone: 'Zona de retirada',
      offCount: 'Fuera',
      pipCount: 'Pips',
      movesRemaining: 'movimientos restantes',
      noLegalMoves: 'Sin movimientos legales posibles',
      checkerMoved: 'Ficha movida',
      checkerHit: '¡Ficha enviada a la barra!',
    },
    tutorial: {
      s1: {
        title: 'Tira y avanza',
        body: 'Tira dos dados y mueve tus fichas según los pips. Con dobles juegas el número cuatro veces.',
      },
      s2: {
        title: 'Golpea los blots',
        body: 'Una ficha sola es un blot — cae en ella y la mandas a la barra. Las fichas en la barra deben reingresar antes de mover cualquier otra cosa.',
      },
      s3: {
        title: 'Saca fichas para ganar',
        body: 'Lleva las quince fichas a tu hogar y luego retíralas con tiradas exactas. Gana quien retire las quince primero.',
      },
      s4: {
        title: 'Entre tiradas',
        body: 'El sonido, la música, la pantalla completa y el libro de Reglas completo viven en este panel.',
      },
    },
    rules: {
      title: 'Reglas del Backgammon',
      objectiveTitle: 'Objetivo',
      objective:
        'El objetivo es mover las quince fichas a tu tablero interno y luego sacarlas del juego.',
      movementTitle: 'Movimiento y Dados',
      movement:
        'Los jugadores alternan tiradas de dos dados. Las fichas avanzan según los valores obtenidos.',
      hittingTitle: 'Comer y Entrar',
      hitting:
        'Una ficha sola en una casilla es vulnerable. Al caer en ella va a la barra central.',
      bearingOffTitle: 'Sacar Fichas',
      bearingOff:
        'Cuando todas las fichas están en casa, puedes sacarlas del tablero con los dados adecuados.',
      modes: {
        standard: {
          objectiveTitle: 'Objetivo',
          objective:
            'Mueve las 15 fichas a tu tablero interno y sácalas antes que tu oponente.',
          movementTitle: 'Movimiento y Dados',
          movement:
            'Tira dos dados y mueve tus fichas la cantidad lanzada. Al sacar dobles (ej. 4-4) obtienes cuatro movimientos en lugar de dos.',
          hittingTitle: 'Comer y Barra',
          hitting:
            'Al caer en un punto con una sola ficha rival (blot), esta va a la barra. Las fichas en la barra deben reingresar al tablero interno del oponente antes de otros movimientos.',
          bearingOffTitle: 'Sacar Fichas',
          bearingOff:
            'Cuando las 15 fichas están en tu tablero interno, sácalas con el número exacto o mayor. Si no quedan fichas más atrás, se permite el exceso.',
        },
        long: {
          objectiveTitle: 'Objetivo',
          objective:
            'Conduce las 15 fichas desde la cabeza hasta tu tablero interno y sácalas. Todas empiezan en un solo punto — la carrera es de resistencia.',
          movementTitle: 'Movimiento y Dados',
          movement:
            'Tira dos dados y mueve tus fichas. Con dobles son cuatro movimientos. Los puntos ocupados por el oponente están completamente bloqueados — no puedes pasar ni quedarte.',
          hittingTitle: 'Sin Capturas',
          hitting:
            'Las capturas no están permitidas. Los puntos del oponente siempre están bloqueados. Debes esquivar sus pilas — la posición lo decide todo.',
          bearingOffTitle: 'Sacar Fichas',
          bearingOff:
            'Cuando las 15 fichas están en tu tablero interno, sácalas con el número exacto o mayor. La prohibición de capturas hace que llegar a casa sea el mayor desafío.',
        },
        hyper: {
          objectiveTitle: 'Objetivo',
          objective:
            'Solo 3 fichas por jugador — saca las tres antes que tu oponente. Cada movimiento cuenta.',
          movementTitle: 'Movimiento y Dados',
          movement:
            'Tira dos dados y mueve tus fichas. Con dobles son cuatro movimientos. Con tan pocas fichas, las partidas son rápidas y tácticas.',
          hittingTitle: 'Comer y Barra',
          hitting:
            'Las capturas están permitidas. Al caer en una ficha rival sola, va a la barra. Una sola captura puede decidir la partida.',
          bearingOffTitle: 'Sacar Fichas',
          bearingOff:
            'Cuando las 3 fichas están en tu tablero interno, sácalas. Con tan pocas fichas, la salida es rápida y cada pip cuenta.',
        },
        tavla: {
          objectiveTitle: 'Objetivo',
          objective:
            'Mueve las 15 fichas a tu tablero interno y sácalas. Tavla sigue las reglas clásicas con tradición turca.',
          movementTitle: 'Movimiento y Dados',
          movement:
            'Tira dos dados y mueve tus fichas. Con dobles son cuatro movimientos. Tavla enfatiza el juego rápido y agresivo.',
          hittingTitle: 'Comer y Barra',
          hitting:
            'Al caer en una ficha rival sola (blot), va a la barra. Las fichas en la barra deben reingresar antes de otros movimientos.',
          bearingOffTitle: 'Sacar Fichas',
          bearingOff:
            'Cuando las 15 fichas están en tu tablero interno, sácalas con el número exacto o mayor.',
        },
        nackgammon: {
          objectiveTitle: 'Objetivo',
          objective:
            'Mueve las 15 fichas a tu tablero interno y sácalas. La posición inicial modificada crea aperturas estratégicas más profundas.',
          movementTitle: 'Movimiento y Dados',
          movement:
            'Tira dos dados y mueve tus fichas. Con dobles son cuatro movimientos. Las 2 fichas en el punto 23 reducen los lanzamientos iniciales desordenados.',
          hittingTitle: 'Comer y Barra',
          hitting:
            'Las capturas están permitidas. La apertura modificada crea decisiones complejas sobre cuándo comer y cuándo construir anclajes.',
          bearingOffTitle: 'Sacar Fichas',
          bearingOff:
            'Cuando las 15 fichas están en tu tablero interno, sácalas con el número exacto o mayor.',
        },
        gulbara: {
          objectiveTitle: 'Objetivo',
          objective:
            'Conduce las 15 fichas desde la cabeza hasta tu tablero interno y sácalas. Sin capturas — estrategia pura de carrera.',
          movementTitle: 'Movimiento y Dados',
          movement:
            'Tira dos dados y mueve tus fichas. Los puntos del oponente están bloqueados. Al sacar dobles, se juegan todos los dobles superiores posteriores.',
          hittingTitle: 'Sin Capturas',
          hitting:
            'Las capturas no están permitidas. Los puntos del oponente son infranqueables. La posición y el timing lo son todo.',
          bearingOffTitle: 'Sacar Fichas',
          bearingOff:
            'Cuando las 15 fichas están en tu tablero interno, sácalas con el número exacto o mayor.',
        },
      },
    },
  },
};
