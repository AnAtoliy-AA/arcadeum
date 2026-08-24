export const esMessages = {
  game_2048_v1: {
    name: '2048',
    description:
      'El adictivo rompecabezas de fusionar fichas — desliza, combina y persigue la ficha 2048',
    summary:
      'Desliza las fichas numeradas, duplícalas una y otra vez y mira hasta dónde llegas después del 2048.',
    board: {
      loading: 'Repartiendo fichas…',
      controlsHint:
        'Flechas o WASD en escritorio · deslizar o el pad abajo en móvil',
    },
    hud: {
      score: 'Puntos',
      best: 'Récord',
      time: 'Tiempo',
      newGame: 'Nueva partida',
      movesLabel: 'Movimientos',
    },
    result: {
      wonTitle: '¡2048!',
      wonBody:
        'Creaste la ficha legendaria. ¿Seguir jugando por una puntuación aún mayor?',
      lostTitle: 'Tablero atascado',
      lostBody:
        'No quedan movimientos — todas las casillas están llenas. ¡Otra vez!',
      playAgain: 'Jugar de nuevo',
      keepGoing: 'Seguir jugando',
    },
    rules: {
      objective:
        'Desliza las fichas por la cuadrícula 4×4 y fusiona números iguales hasta crear la ficha 2048.',
      gameplay:
        'Cada movimiento desplaza todas las fichas un paso; los vecinos iguales se funden en su suma. Tras cada movimiento aparece una nueva ficha 2 o 4.',
      scoring:
        'Cada fusión suma su nuevo valor a tu puntuación. La partida termina cuando la cuadrícula se atasca sin movimientos.',
    },
    landing: {
      tagline: 'Un jugador · Sin registro',
      meta: {
        title: '2048 — Juego de rompecabezas de fichas gratis online | Arcadeum',
        description:
          'Juega al 2048 gratis online en Arcadeum. Desliza y fusiona fichas numeradas en una cuadrícula 4×4, bate tu récord, con progreso guardado. Sin descargas ni registro.',
        keywords:
          '2048, juego de fichas, juego de fusionar, puzzle, un jugador, gratis, online, juego de navegador',
      },
      hero: {
        title: '2048',
        subtitle:
          'El famoso rompecabezas adictivo de fusionar. Reglas simples, profundidad infinita — ¿hasta dónde llegarás?',
        ctaPlay: 'Jugar ahora',
      },
      features: {
        solo: {
          title: 'Totalmente individual',
          body: 'Sin cuentas ni salas de espera — un tablero nuevo a un clic.',
        },
        progress: {
          title: 'Progreso guardado',
          body: 'Cierra la pestaña a mitad de partida y el tablero con tu récord te estarán esperando.',
        },
        stats: {
          title: 'Resultados registrados',
          body: 'Cada partida terminada alimenta automáticamente tu panel de estadísticas de Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: '¿Es gratis jugar al 2048?',
          answer:
            'Sí — el 2048 de Arcadeum es completamente gratis, sin descargas y sin necesidad de cuenta.',
        },
        q2: {
          question: '¿Cómo se juega en el móvil?',
          answer:
            'Solo desliza sobre el tablero — arriba, abajo, izquierda o derecha. En escritorio usa las flechas o WASD.',
        },
        q3: {
          question: '¿Qué pasa cuando llego a 2048?',
          answer:
            'Ganas — y puedes seguir en el mismo tablero para lograr una puntuación aún mayor.',
        },
      },
      steps: {
        create: {
          title: 'Empieza a deslizar',
          body: 'Hay dos fichas en el tablero. Desliza o pulsa una flecha para mover todo a la vez.',
        },
        join: {
          title: 'Fusiona iguales',
          body: 'Cuando dos fichas idénticas chocan se funden en una de doble valor.',
        },
        play: {
          title: 'Persigue el 2048',
          body: 'Planifica esquinas y cadenas — la cuadrícula se llena rápido y un atasco acaba la partida.',
        },
      },
    },
  },
};
