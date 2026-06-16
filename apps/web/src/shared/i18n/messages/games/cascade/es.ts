export const esMessages = {
  cascade_v1: {
    name: 'Cascade',
    description:
      'Empareja por color o número, encadena cartas Roba-Dos y Comodín +4 para inundar al siguiente jugador, y vacía tu mano primero para ganar.',
    summary:
      'Un juego de cartas de descarte de la familia Ochos Locos — cuatro temas seleccionables, 2–10 jugadores, penalizaciones encadenables.',
    variants: {
      cosmic: {
        name: 'Cósmico',
        description:
          'Tipos de estrellas, supernovas y agujeros de gusano entre los colores.',
      },
      arcane: {
        name: 'Arcano',
        description: 'Escuelas de magia: piromancia, druídica y más.',
      },
      cyberpunk: {
        name: 'Cyberpunk',
        description:
          'Facciones de hackers de neón: Carmesí, Voltaje, Matriz, Cobalto.',
      },
      elemental: {
        name: 'Elemental',
        description: 'Fuego, Piedra, Hoja y Marea — paleta natural y limpia.',
      },
    },
    landing: {
      meta: {
        title: 'Cascade — juego de cartas multijugador de descarte en línea',
        description:
          'Juega a Cascade en línea — un juego de cartas de descarte con cadenas de Roba-Dos / Comodín +4 y cuatro temas visuales. 2–10 jugadores, salas gratis al instante, sin instalación.',
        keywords:
          'cascade, ochos locos, juego de cartas multijugador, juego de cartas en línea, juego de descarte, juego de cartas de combinación',
      },
      hero: {
        title: 'Cascade — el juego de cartas de encadenado, reinventado',
        subtitle:
          'Combina color o número. Encadena penalizaciones. Elige entre cuatro temas visuales. 2–10 jugadores.',
        createRoom: 'Crear sala',
        browseRooms: 'Buscar salas',
      },
      highlights: {
        players: {
          title: '2–10 jugadores',
          body: 'Todos contra todos; los bots llenan los asientos vacíos para empezar al instante.',
        },
        themes: {
          title: '4 temas visuales',
          body: 'Cósmico, Arcano, Cyberpunk, Elemental — las reglas no cambian, el aspecto sí.',
        },
        stacking: {
          title: 'Penalizaciones encadenables',
          body: 'Roba-Dos sobre Roba-Dos; Comodín +4 sobre Comodín +4. Ahoga al siguiente jugador.',
        },
      },
      steps: {
        create: {
          title: 'Crea una sala',
          body: 'Elige un tema. Pública o solo con invitación.',
        },
        join: {
          title: 'Invita amigos o añade un bot',
          body: 'Comparte el enlace o empieza con bots para jugar al instante.',
        },
        play: {
          title: 'Vacía tu mano',
          body: 'Empareja por color o número, guarda los comodines y canta Última Carta.',
        },
      },
      themes: {
        title: 'Elige tu estilo',
        subtitle:
          'Mismas reglas, cuatro paletas de color e iconos de acción distintos.',
      },
      faq: {
        differences: {
          question: '¿Qué tipo de juego de cartas es Cascade?',
          answer:
            'Cascade es un juego de cartas de descarte original en la familia Ochos Locos. Empareja por color o número, encadena cartas Roba-Dos y Comodín +4 para inundar al siguiente jugador, y vacía tu mano primero para ganar. Las mecánicas de los juegos de cartas no son objeto de copyright; Cascade trae su propio nombre, paletas e iconografía.',
        },
        stacking: {
          question: '¿Qué es el encadenado?',
          answer:
            'Cuando alguien te juega un Roba-Dos, puedes jugar otro Roba-Dos para pasar la penalización +2 más al siguiente jugador. Lo mismo con Comodín +4 sobre Comodín +4. Si no puedes encadenar, robas toda la pila acumulada y pierdes tu turno.',
        },
        bots: {
          question: '¿Son buenos los bots?',
          answer:
            'Los bots prefieren jugadas que coincidan en color, guardan el Comodín +4 para turnos atascados, y eligen el color del que tienen más cartas al nombrar después de un comodín. Casuales pero creíbles.',
        },
      },
    },
    lobby: {
      stacking: 'Permitir penalizaciones encadenables',
      lastCardCall:
        'Carrera por la Última Carta (pulsa Cascade cuando un rival llegue a 1)',
      startWithBots: 'Empezar con bots',
      addBot: 'Añadir bot',
      waitingForPlayers: 'Esperando a los jugadores…',
      minPlayers: 'Mínimo 2 jugadores',
    },
    modes: {
      classic: {
        name: 'Clásico',
        description:
          'Reglas completas. Encadena Roba-Dos y Comodín +4 para inundar al siguiente jugador.',
      },
      pure: {
        name: 'Puro',
        description:
          'Sin encadenado. Roba-Dos y Comodín +4 se resuelven al instante. Más fácil para principiantes.',
      },
      speed: {
        name: 'Velocidad',
        description:
          'Temporizador de 15 segundos por turno. Con encadenado; robo automático si no juegas a tiempo.',
      },
    },
    themedCards: {
      cosmic: {
        SKIP: 'Eclipse',
        REVERSE: 'Agujero de gusano',
        DRAW_TWO: 'Lluvia de meteoros',
        WILD: 'Singularidad',
        WILD_DRAW_FOUR: 'Supernova',
      },
      arcane: {
        SKIP: 'Destierro',
        REVERSE: 'Espejo',
        DRAW_TWO: 'Maleficio',
        WILD: 'Polimorfia',
        WILD_DRAW_FOUR: 'Cataclismo',
      },
      cyberpunk: {
        SKIP: 'Firewall',
        REVERSE: 'Loopback',
        DRAW_TWO: 'DDoS',
        WILD: 'Glitch',
        WILD_DRAW_FOUR: 'Rootkit',
      },
      elemental: {
        SKIP: 'Bloque',
        REVERSE: 'Corriente',
        DRAW_TWO: 'Temblor',
        WILD: 'Tormenta',
        WILD_DRAW_FOUR: 'Tempestad',
      },
    },
    board: {
      last: 'ÚLTIMA',
      draw: 'Robar',
      discard: 'Descarte',
      yourTurn: 'Tu turno',
      waitingOn: 'Esperando a {{player}}',
      waiting: 'Esperando…',
      clockwise: 'Sentido horario',
      counterClockwise: 'Sentido antihorario',
      stacked: '+{{n}} encadenados',
      chooseColor: 'Elige un color',
      cards: '{{count}} cartas',
      callCascade: '¡Cascade!',
      callCascadeSelf: '¡Cascade! — sálvate',
      backToGames: '← Juegos',
    },
    rules: {
      title: 'Reglas',
      objective:
        'Sé el primero en vaciar tu mano. Empareja la carta superior del descarte por color o número, o juega un Comodín.',
      steps:
        '• En tu turno, juega cualquier carta que coincida o un Comodín.\n• Si no puedes jugar, roba 1 carta.\n• El primer jugador en llegar a 0 cartas gana.',
      actionCards:
        'Saltar omite al siguiente jugador. Reversa invierte la dirección (actúa como Saltar con 2 jugadores). Roba-Dos fuerza +2; el Comodín te permite cambiar el color activo; el Comodín +4 fuerza +4 y cambia el color.',
      stacking:
        'Un Roba-Dos puede pasarse con otro Roba-Dos de cualquier color. Un Comodín +4 puede pasarse con otro Comodín +4. El encadenado cruzado (R2 sobre +4 o viceversa) no está permitido.',
      headers: {
        objective: 'Objetivo',
        howToPlay: 'Cómo jugar',
        actionCards: 'Cartas de acción',
        stacking: 'Penalizaciones encadenables',
      },
    },
    gameOver: {
      won: '¡Has ganado!',
      lost: 'Has perdido.',
      draw: 'Ronda terminada.',
      messages: {
        won: 'Vaciaste tu mano primero. ¿Listo para otra ronda?',
        lost: 'Alguien más llegó a cero primero. ¿Quieres la revancha?',
        draw: 'Ronda terminada. ¿Otra?',
      },
    },
    actions: {
      play: 'Jugar carta',
      draw: 'Robar',
      nameColor: 'Elegir color',
      rematch: 'Revancha',
      leave: 'Salir',
      forfeit: 'Rendirse',
    },
    chat: {
      played: '{{name}} jugó una carta.',
      drew: '{{name}} robó una carta.',
      drewStack: '{{name}} robó {{n}} de la pila.',
      namedColor: '{{name}} eligió {{color}}.',
      won: '¡{{name}} vació su mano!',
      joined: '{{name}} se unió.',
      left: '{{name}} salió.',
      forfeit: '{{name}} se rindió.',
    },
    errors: {
      notYourTurn: 'Aún no es tu turno.',
      notPlayable: 'Esa carta no se puede jugar ahora.',
      colorRequired: 'Elige un color primero.',
      gameOver: 'La partida ha terminado.',
    },
    status: {
      turn: 'Turno de {{player}}',
      winner: '{{player}} ganó',
      pendingDraw: '+{{n}} encadenados',
      activeColor: 'Color activo: {{color}}',
    },
    cardColors: {
      R: 'Rojo',
      Y: 'Amarillo',
      G: 'Verde',
      B: 'Azul',
      W: 'Comodín',
    },
    hiddenCard: 'Carta oculta',
  },
};
