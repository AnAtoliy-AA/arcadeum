export const esMessages = {
  minesweeper_v1: {
    name: 'Buscaminas',
    description:
      'El clásico Buscaminas — despeja el tablero sin detonar ni una sola mina',
    summary:
      'El rompecabezas lógico icónico: descubre cada casilla segura, marca las minas y vence al reloj.',
    board: {
      label: 'Campo minado',
      loading: 'Despejando…',
      cellHidden: 'Casilla oculta',
      cellFlagged: 'Casilla marcada',
      cellMine: 'Mina',
      cellEmpty: 'Casilla vacía',
    },
    hud: {
      mines: 'Minas restantes',
      time: 'Tiempo',
      newGame: 'Nueva partida',
      flagMode: 'Modo bandera',
      flagModeHint:
        'Actívalo para poner banderas con un toque — ideal en pantallas táctiles',
      difficulty: 'Dificultad',
    },
    difficulty: {
      beginner: 'Principiante (9×9 · 10 minas)',
      intermediate: 'Intermedio (16×16 · 40 minas)',
      expert: 'Experto (22×16 · 80 minas)',
    },
    result: {
      wonTitle: '¡Campo despejado!',
      wonBody: 'Has revelado todas las casillas seguras. Impecable.',
      lostTitle: '¡Boom!',
      lostBody: 'Ahí había una mina. Estudia los números y vuelve a intentarlo.',
      playAgain: 'Jugar de nuevo',
    },
    rules: {
      objective:
        'Revela todas las casillas que no escondan una mina. Descubre todas las casillas seguras para ganar.',
      gameplay:
        'Los números indican cuántas de las ocho casillas vecinas contienen una mina. Marca las sospechosas con clic derecho o pulsación larga; toca un número completo para abrir sus vecinas.',
      scoring:
        'Tu primer toque siempre es seguro y arranca el cronómetro. Despeja el campo lo más rápido posible — el tiempo es tu única puntuación.',
    },
    landing: {
      tagline: 'Un jugador · Sin registro',
      meta: {
        title: 'Buscaminas — Juego de rompecabezas clásico gratis online | Arcadeum',
        description:
          'Juega al Buscaminas gratis online en Arcadeum. Tableros de principiante a experto, banderas, cronómetro y progreso guardado. Sin descargas ni registro.',
        keywords:
          'buscaminas, minesweeper, juego de puzzle, juego de lógica, un jugador, gratis, online, juego de navegador',
      },
      hero: {
        title: 'Buscaminas',
        subtitle:
          'El rompecabezas legendario. Lee los números, marca las bombas y despeja tableros desde 9×9 hasta nivel experto.',
        ctaPlay: 'Jugar ahora',
      },
      features: {
        solo: {
          title: 'Totalmente individual',
          body: 'Sin cuentas ni salas de espera — un campo minado nuevo a un clic.',
        },
        progress: {
          title: 'Progreso guardado',
          body: 'Cierra la pestaña a mitad de partida y el campo quedará tal como lo dejaste.',
        },
        stats: {
          title: 'Resultados registrados',
          body: 'Victorias y derrotas alimentan automáticamente tu panel de estadísticas de Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: '¿Es gratis jugar al Buscaminas?',
          answer:
            'Sí — el Buscaminas de Arcadeum es completamente gratis, sin descargas y sin necesidad de cuenta.',
        },
        q2: {
          question: '¿Cómo pongo banderas en el móvil?',
          answer:
            'Activa el modo bandera o mantén pulsada una casilla oculta. En escritorio funciona el clic derecho.',
        },
        q3: {
          question: '¿Se guarda mi progreso?',
          answer:
            'Sí. El campo actual, la dificultad y tus estadísticas se guardan localmente para continuar cuando quieras.',
        },
      },
      steps: {
        create: {
          title: 'Elige tu tablero',
          body: 'Empieza en el campo 9×9 para principiantes o salta directo al nivel experto.',
        },
        join: {
          title: 'Lee los números',
          body: 'Cada número cuenta las minas que tocan esa casilla. Toca para descubrir, mantén para marcar.',
        },
        play: {
          title: 'Despeja el campo',
          body: 'Usa los números completos para abrir casillas seguras rápido y esquivar todas las bombas.',
        },
      },
    },
  },
};
