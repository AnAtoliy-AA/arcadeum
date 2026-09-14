export const esMessages = {
  solitaire_v1: {
    name: 'Solitario',
    description:
      'El clásico solitario Klondike: construye las cuatro bases del as al rey',
    summary:
      'El rompecabezas de cartas eterno: descubre el tablero, alterna colores en las columnas y apila cada palo del as al rey.',
    board: {
      draw: 'Robar carta',
      recycle: 'Reciclar el descarte',
      foundation: 'Base',
      pile: 'Columna',
      selectedHint: 'Carta seleccionada: elige un destino',
      loading: 'Barajando…',
    },
    hud: {
      score: 'Puntos',
      moves: 'Movimientos',
      time: 'Tiempo',
      newGame: 'Nueva partida',
    },
    result: {
      wonTitle: '¡Has ganado!',
      wonBody: 'Las cuatro bases están completas. ¡Partida brillante!',
      lostTitle: 'Sin movimientos',
      lostBody: 'La mesa está bloqueada. ¡Baraja y prueba otra vez!',
      playAgain: 'Jugar otra vez',
    },
    rules: {
      objective:
        'Mueve las 52 cartas a las cuatro bases, construyendo cada palo en orden ascendente del as al rey.',
      gameplay:
        'Las cartas se reparten en siete columnas. Voltea las cartas descubiertas, ordena las columnas en colores alternos descendentes y roba del mazo si te atascas.',
      scoring:
        'Cada movimiento a una base vale 10 puntos, a una columna 5, y cada carta revelada añade 5 más.',
    },
    landing: {
      tagline: 'Un jugador · Sin registro',
      meta: {
        title: 'Solitario — Juego de cartas Klondike gratis online | Arcadeum',
        description:
          'Juega al solitario Klondike clásico gratis online en Arcadeum. Sin descargas ni registro: rompecabezas de cartas para un jugador con puntuación, cronómetro y progreso guardado.',
        keywords:
          'solitario, klondike, paciencia, juego de cartas, un jugador, gratis, online, sin descarga',
      },
      hero: {
        title: 'Solitario',
        subtitle:
          'El rompecabezas de cartas favorito del mundo. Descubre el tablero, alterna los colores y construye cada palo del as al rey.',
        ctaPlay: 'Jugar ahora',
      },
      features: {
        solo: {
          title: 'Un jugador de verdad',
          body: 'Sin cuentas ni esperas: reparte al instante y juega a tu ritmo.',
        },
        progress: {
          title: 'Progreso guardado',
          body: 'Cierra la pestaña a mitad de partida y continúa exactamente donde lo dejaste.',
        },
        stats: {
          title: 'Resultados registrados',
          body: 'Victorias y derrotas alimentan automáticamente tu panel de estadísticas de Arcadeum.',
        },
      },
      faq: {
        q1: {
          question: '¿Es gratis jugar al solitario?',
          answer:
            'Sí: el solitario de Arcadeum es totalmente gratuito, sin descargas y sin necesidad de cuenta para empezar.',
        },
        q2: {
          question: '¿Necesito un oponente?',
          answer:
            'No. El solitario es un juego para un jugador que funciona íntegramente en tu navegador, perfecto para un descanso.',
        },
        q3: {
          question: '¿Se guarda mi progreso?',
          answer:
            'Sí. Tu mesa actual, puntos y estadísticas se guardan localmente para que continues cuando quieras.',
        },
        q4: {
          question: '¿Cuál es el objetivo del solitario Klondike?',
          answer:
            'Construir cuatro montones de base por palo en orden ascendente del As al Rey, organizando las columnas en orden descendente con colores alternos.',
        },
        q5: {
          question: '¿Se puede colocar cualquier carta en una columna vacía?',
          answer:
            'Según las reglas estándar de Klondike, solo un Rey o una escalera encabezada por un Rey puede ocupar un hueco vacío.',
        },
        q6: {
          question: '¿Qué diferencia hay entre robar 1 y robar 3 cartas?',
          answer:
            'Robar 1 carta muestra una sola carta del mazo para una partida más accesible, mientras que robar 3 cartas exige mayor planificación táctica.',
        },
        q7: {
          question: '¿Todas las partidas de solitario se pueden ganar?',
          answer:
            'No todas las partidas son resolubles debido al azar del reparto, pero destapar cartas ocultas rápido maximiza tus probabilidades de éxito.',
        },
        q8: {
          question:
            '¿Se pueden devolver cartas desde las bases a las columnas?',
          answer:
            'Sí. Puedes regresar cartas de las bases al tablero si eso te ayuda a desbloquear cartas ocultas en otras columnas.',
        },
        q9: {
          question: '¿Se puede jugar al solitario en dispositivos móviles?',
          answer:
            'Sí. El solitario de Arcadeum está optimizado para pantallas táctiles con controles de toque directo y animaciones fluidas.',
        },
        q10: {
          question: '¿Dispone el juego de opción de deshacer movimientos?',
          answer:
            'Sí. Puedes deshacer jugadas en cualquier momento para corregir errores o explorar rutas alternativas de cartas.',
        },
      },
      steps: {
        create: {
          title: 'Reparte las cartas',
          body: 'Abre el juego y la mesa se reparte al instante: siete columnas con la carta superior boca arriba.',
        },
        join: {
          title: 'Aprende los movimientos',
          body: 'Toca una carta para seleccionarla y toca su destino. Un doble toque envía la carta a su base.',
        },
        play: {
          title: 'Construye las bases',
          body: 'Apila cada palo del as al rey. Despeja todas las cartas para ganar.',
        },
      },
    },
  },
};
