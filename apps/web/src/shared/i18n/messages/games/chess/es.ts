export const esMessages = {
  chess_v1: {
    name: 'Ajedrez',
    description:
      'El clásico juego de tablero de estrategia con reglas completas incluyendo enroque, captura al paso y promoción',
    summary:
      'Desafía a amigos o bots a una partida de ajedrez con variantes estándar y Chess960 con controles de tiempo opcionales.',
    landing: {
      meta: {
        title: 'Ajedrez — multijugador con variantes estándar y Chess960',
        description:
          'Juega ajedrez multijugador en línea. Variantes estándar y Chess960, controles de tiempo opcionales, bots desde el primer día. Gratis, salas instantáneas.',
        keywords:
          'ajedrez, ajedrez online, ajedrez multijugador, chess960, juegos de tablero',
      },
      hero: {
        title: 'Ajedrez — el juego de estrategia atemporal',
        subtitle:
          'Reglas estándar, variante Chess960 y controles de tiempo opcionales. Juega contra amigos o bots.',
        createRoom: 'Crear sala',
        browseRooms: 'Explorar salas',
      },
      highlights: {
        players: {
          title: '2 jugadores',
          body: 'Desafía a un amigo o juega contra un oponente bot inteligente.',
        },
        variants: {
          title: '2 variantes',
          body: 'Posición estándar clásica y Chess960 con disposición aleatoria.',
        },
        clock: {
          title: 'Controles de tiempo',
          body: 'Rápido, blitz o clásico. O juega sin reloj.',
        },
      },
      steps: {
        create: {
          title: 'Crea una sala',
          body: 'Elige una variante y control de tiempo. Pública o solo por invitación.',
        },
        join: {
          title: 'Invita a un amigo o añade un bot',
          body: 'Comparte el enlace o haz clic en "Empezar con bots" para jugar al instante.',
        },
        play: {
          title: 'Juega y chatea',
          body: 'Haz tus movimientos, mira el reloj y charla durante la partida.',
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
            'Cada jugador tiene un reloj. Cuando es tu turno, tu reloj cuenta hacia atrás. Si se acaba tu tiempo, pierdes. Algunos controles añaden tiempo después de cada movimiento.',
        },
        promotion: {
          question: '¿Cómo funciona la promoción de peón?',
          answer:
            'Cuando un peón llega al extremo opuesto del tablero, debes promocionarlo a dama, torre, alfil o caballo.',
        },
      },
    },
    lobby: {
      variant: 'Variante',
      timeControl: 'Control de tiempo',
      startWithBots: 'Empezar con bots',
      waitingForPlayers: 'Esperando jugadores…',
      minPlayers: 'Mínimo 2 jugadores',
    },
    rules: {
      title: 'Reglas',
      objective:
        'Jaque mate al rey de tu oponente — ponlo en jaque sin posibilidad de escapar.',
      pieces:
        'Cada pieza se mueve diferente: rey (1 casilla), dama (cualquier dirección), torre (líneas rectas), alfil (diagonales), caballo (en L), peón (adelante, captura en diagonal).',
      special:
        'Movimientos especiales: enroque (rey + torre), captura al paso (captura de peón), promoción (peón llega a la última fila).',
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
    actions: {
      move: 'Mover pieza',
      resign: 'Rendirse',
      rematch: 'Revancha',
      leave: 'Salir',
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
      check: '¡Jaque!',
      checkmate: '¡Jaque mate!',
      winner: '{{player}} ganó',
      draw: 'Empate',
    },
  },
};
