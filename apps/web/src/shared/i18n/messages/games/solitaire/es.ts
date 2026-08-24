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
