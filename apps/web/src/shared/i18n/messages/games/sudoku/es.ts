export const esMessages = {
  sudoku_v1: {
    name: 'Sudoku',
    description:
      'Sudoku clásico — rellena la cuadrícula 9×9 para que cada fila, columna y caja contenga el 1–9 una sola vez',
    summary:
      'El rompecabezas numérico favorito del mundo: lógica pura, tres dificultades y notas a lápiz incluidas.',
    board: {
      loading: 'Preparando…',
    },
    hud: {
      time: 'Tiempo',
      mistakes: 'Errores',
      newGame: 'Nueva partida',
      difficulty: 'Dificultad',
    },
    difficulty: {
      easy: 'Fácil',
      medium: 'Medio',
      hard: 'Difícil',
    },
    controls: {
      notes: 'Notas',
      notesHint:
        'Activa los apuntes — los dígitos se escriben en la casilla como candidatos, no como respuestas',
      erase: 'Borrar',
      placeDigit: 'Poner el dígito {{digit}}',
      noteDigit: 'Nota {{digit}}',
    },
    result: {
      wonTitle: '¡Resuelto!',
      wonBody:
        'Cuadrícula completada con {{mistakes}} error(es) por el camino. Bien hecho.',
      flawlessBody: 'Resolución impecable — ni un solo error.',
      playAgain: 'Jugar de nuevo',
    },
    rules: {
      objective:
        'Rellena toda la cuadrícula 9×9 para que cada fila, cada columna y cada caja 3×3 contengan los dígitos del 1 al 9 exactamente una vez.',
      gameplay:
        'Toca una casilla y elige un dígito del teclado en pantalla o físico. Cambia al modo Notas para anotar candidatos antes de decidirte.',
      scoring:
        'Las entradas incorrectas cuentan como errores pero permanecen en el tablero para corregirlos: el objetivo es resolver limpio y rápido.',
    },
    landing: {
      tagline: 'Un jugador · Sin registro',
      meta: {
        title:
          'Sudoku — Juego de rompecabezas numérico gratis online | Arcadeum',
        description:
          'Juega al Sudoku gratis online en Arcadeum. Niveles fácil, medio y difícil con solución única, notas a lápiz, juego con teclado y progreso guardado. Sin descargas ni registro.',
        keywords:
          'sudoku, rompecabezas numérico, juego de lógica, un jugador, gratis, online, juego de navegador, sudoku online',
      },
      hero: {
        title: 'Sudoku',
        subtitle:
          'El rompecabezas lógico 9×9 clásico con niveles de dificultad afinados, notas a lápiz y cero anuncios.',
        ctaPlay: 'Jugar ahora',
      },
      features: {
        solo: {
          title: 'Totalmente individual',
          body: 'Sin cuentas ni salas de espera — un puzzle único nuevo a un clic.',
        },
        progress: {
          title: 'Progreso guardado',
          body: 'Cierra la pestaña a mitad de partida y la cuadrícula quedará tal como la dejaste.',
        },
        stats: {
          title: 'Resultados registrados',
          body: 'Cada cuadrícula terminada alimenta automáticamente tu panel de estadísticas de Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: '¿Es gratis jugar al Sudoku?',
          answer:
            'Sí — el Sudoku de Arcadeum es completamente gratis, sin descargas y sin necesidad de cuenta.',
        },
        q2: {
          question: '¿Cada puzzle tiene una única solución?',
          answer:
            'Sí. Cada puzzle generado se verifica para admitir exactamente una solución — siempre podrás llegar a ella razonando.',
        },
        q3: {
          question: '¿Puedo jugar desde el móvil?',
          answer:
            'Por supuesto. El teclado numérico es táctil y el modo Notas permite anotar candidatos como en papel.',
        },
        q4: {
          question: '¿Cuáles son las reglas básicas del Sudoku?',
          answer:
            'Rellena la cuadrícula de 9×9 de modo que cada fila, columna y caja de 3×3 contenga los números del 1 al 9 sin repetir ninguno.',
        },
        q5: {
          question: '¿Cómo ayuda el modo Notas a resolver cuadrículas?',
          answer:
            'Activar Notas te permite apuntar números candidatos a lápiz en casillas vacías para visualizar opciones y patrones lógicos.',
        },
        q6: {
          question: '¿Qué son los números únicos desnudos y ocultos?',
          answer:
            'Un único desnudo es una casilla con una sola cifra posible, mientras que un único oculto es un dígito que solo cabe en una celda de la fila o caja.',
        },
        q7: {
          question: '¿Hace falta adivinar en algún momento?',
          answer:
            'Nunca. Cada cuadrícula en Arcadeum tiene demostrada una única solución alcanzable enteramente mediante deducción lógica.',
        },
        q8: {
          question: '¿Qué niveles de dificultad hay disponibles?',
          answer:
            'Puedes elegir entre Fácil (introductorio), Medio (razonamiento equilibrado) y Difícil (técnicas avanzadas de eliminación).',
        },
        q9: {
          question: '¿El juego avisa de errores y números duplicados?',
          answer:
            'Sí. El resaltado de conflictos te muestra de inmediato números repetidos en filas, columnas o cajas para facilitar el aprendizaje.',
        },
        q10: {
          question: '¿Se guardan mis tiempos de resolución?',
          answer:
            'Sí. Cada partida completada se mide con cronómetro y se registra en tus estadísticas personales de Arcadeum.',
        },
      },
      steps: {
        create: {
          title: 'Elige la dificultad',
          body: 'Las cuadrículas fáciles tienen unas cuarenta pistas; las difíciles bajan a veintiséis.',
        },
        join: {
          title: 'Escanea las filas',
          body: 'Encuentra dónde encaja un dígito por eliminación — toca la casilla y luego su número.',
        },
        play: {
          title: 'Completa la cuadrícula',
          body: 'Usa Notas para registrar candidatos y rellena cada casilla del 1 al 9 sin repeticiones.',
        },
      },
    },
  },
};
