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
        title:
          '2048 — Juego de rompecabezas de fichas gratis online | Arcadeum',
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
        q4: {
          question: '¿Cuál es la mejor estrategia para llegar a la ficha 2048?',
          answer:
            'Fija tu ficha más alta en una esquina fija y construye cadenas decrecientes a lo largo del borde sin desplazar nunca la esquina.',
        },
        q5: {
          question: '¿Qué fichas nuevas aparecen tras cada movimiento?',
          answer:
            'Cada desplazamiento válido genera una nueva ficha en una casilla vacía: 90% de probabilidades de ser un 2 y 10% de ser un 4.',
        },
        q6: {
          question: '¿Cómo se calcula la puntuación en 2048?',
          answer:
            'Cada vez que dos fichas iguales chocan y se fusionan, el valor de la nueva ficha resultante se suma a tu puntuación total.',
        },
        q7: {
          question: '¿Cuándo termina la partida por derrota?',
          answer:
            'La partida termina cuando las 16 casillas están ocupadas y no existen fichas adyacentes iguales que puedan fusionarse.',
        },
        q8: {
          question:
            '¿Puede una ficha fusionada volver a combinarse en el mismo movimiento?',
          answer:
            'No. Una ficha recién fusionada no puede combinarse nuevamente en ese mismo desplazamiento, según las reglas clásicas de 2048.',
        },
        q9: {
          question: '¿Puedo deshacer un deslizamiento por error?',
          answer:
            'Sí. El 2048 de Arcadeum incluye opción de deshacer para corregir un movimiento involuntario y preservar tu estrategia.',
        },
        q10: {
          question: '¿Cuál es la ficha máxima posible en un tablero de 4×4?',
          answer:
            'El límite matemático teórico es la ficha 131.072, aunque alcanzar 4.096 u 8.192 ya constituye un hito sobresaliente.',
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
