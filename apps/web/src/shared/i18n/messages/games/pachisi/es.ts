export const esMessages = {
  pachisi_v1: {
    name: 'Pachisi',
    description:
      'Clásico juego de carrera de cruz y círculo: saca un seis, captura rivales y lleva todas tus fichas a casa',
    summary:
      '¡Tira el dado, corre con tus fichas por el tablero, captura rivales y sé el primero en llevarlas todas a casa!',
    variants: {
      standard: {
        name: 'Estándar',
        description: 'Reglas clásicas con cuatro fichas por jugador',
      },
      quick: {
        name: 'Rápido',
        description: 'Partida más veloz con dos fichas por jugador',
      },
    },
    landing: {
      meta: {
        title:
          'Pachisi — Juego de Mesa de Carrera Multijugador Gratis | Arcadeum',
        description:
          'Juega al Pachisi (Ludo) gratis en línea en Arcadeum. Saca un seis para lanzar tus fichas, captura rivales y llega primero a casa. 2–4 jugadores, bots IA, tableros temáticos.',
        keywords:
          'pachisi, ludo, juego de mesa, dados, multijugador, en línea, gratis, familia, carrera, clásico',
      },
      hero: {
        title: 'Pachisi',
        subtitle:
          'El juego de persecución eterno. ¡Saca un seis, lanza tus fichas y captura rivales camino a casa!',
        ctaQuickplay: 'Jugar vs IA',
        ctaQuickplayError: 'Error al crear la partida',
        createRoom: 'Crear sala',
        browseRooms: 'Ver salas',
      },
      highlights: {
        players: {
          title: '2–4 Jugadores',
          body: 'Compite con amigos o bots IA',
        },
        dice: {
          title: 'Seises y Tiradas Extra',
          body: 'Saca un seis para salir del corral y tira otra vez al instante',
        },
        capture: {
          title: 'Captura Rivales',
          body: 'Cae sobre un rival para devolverlo al inicio',
        },
        safe: {
          title: 'Estrellas Seguras',
          body: 'Las casillas de estrella te protegen: planifica rutas por terreno protegido.',
        },
      },
      steps: {
        create: {
          title: 'Crea una Sala',
          body: 'Elige tu tema y empieza una partida.',
        },
        join: {
          title: 'Invita Amigos o Bots',
          body: 'Juega en compañía o practica contra la IA.',
        },
        play: {
          title: 'Tira y Corre a Casa',
          body: '¡Lanza fichas con un seis, esquiva capturas y llega primero!',
        },
      },
      themes: {
        title: 'Temas Visuales',
        subtitle: 'Juega en tableros cyber, retro y de fantasía.',
      },
      sections: {
        faqTitle: 'Preguntas Frecuentes',
        faqKicker: 'FAQ',
        rulesKicker: 'Reglamento',
        themesKicker: 'Personalización Visual',
        themesCta: 'Jugar con Tema',
        highlightsTitle: 'Juego Ancestral, Tableros Modernos',
        highlightsKicker: 'Características',
        howToPlayTitle: 'Cómo Jugar al Pachisi',
        howToPlayKicker: 'Inicio Rápido',
        howToPlayIntro:
          'Domina los fundamentos de lanzar, correr, capturar y llegar a casa.',
        finalCtaTitle: 'Saca un Seis y Corre a Casa',
        finalCtaSubtitle:
          'Desafía a bots inteligentes o juega contra amigos en partidas en tiempo real.',
        backToGames: 'Todos los Juegos',
        heroEyebrow: 'La Clásica Carrera de Cruz y Círculo',
        heroIntro:
          'El juego de persecución eterno: dados, capturas y rectas finales; fácil de aprender, infinitamente rejugable.',
        heroCategory: 'Juego de Mesa',
        playersBadge: '2–4 Jugadores',
        durationBadge: '10–20 min',
        difficultyBadge: 'Casual',
        chipDiceRolls: 'Dados',
        chipCaptures: 'Capturas',
        chipSafeStars: 'Estrellas Seguras',
        chipAiBots: 'Bots IA',
        tipCreate: 'Configura temas, modos de juego y opciones de invitación.',
        tipJoin: 'Juega contra amigos o entrena con bots IA.',
        tipPlay:
          'Saca un seis para lanzar, captura rivales en plena carrera y llega primero a casa.',
      },
      faq: {
        gameOver: {
          won: '¡Victoria!',
          lost: 'Derrota',
          draw: 'Empate',
          messages: {
            won: 'Todas tus fichas están en casa: ¡primer puesto!',
            lost: 'Te han ganado la carrera. ¡Suerte la próxima vez!',
            draw: 'La partida terminó en empate.',
          },
        },
        rules: {
          question: '¿Cómo se gana en Pachisi?',
          answer:
            'Mueve todas tus fichas fuera del corral, da la vuelta al tablero, sube tu carril de color y entra en el centro antes que los demás.',
        },
        capture: {
          question: '¿Qué pasa cuando capturan una ficha?',
          answer:
            'Caer en una casilla ocupada por un rival devuelve su ficha al corral. Las casillas de estrella y de salida son seguras.',
        },
        sixes: {
          question: '¿Qué hace sacar un seis?',
          answer:
            'Un seis te permite sacar una ficha del corral y te da otra tirada. Tres seges seguidos anulan el turno.',
        },
        botAI: {
          question: '¿Cómo funciona la IA?',
          answer:
            'La IA valora salidas, capturas, aterrizajes seguros y zonas de peligro para desafiarte en cada nivel.',
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
            'La carrera clásica: cuatro fichas, capturas, estrellas seguras y tiradas extra con seis.',
        },
        quick: {
          name: 'Rápido',
          description:
            'Las mismas reglas con solo dos fichas por jugador: partida ágil e intensa.',
        },
      },
    },
    game: {
      rollDice: 'Tirar Dado',
      rolling: 'Tirando...',
      diceRolled: 'Sacaste',
      yourTurnToRoll: 'Tu turno de tirar el dado',
      yourTurnToMove: 'Tu turno de mover una ficha',
      waitingForOpponentRoll: 'Esperando a que el rival tire...',
      waitingForOpponentMove: 'Esperando a que el rival mueva...',
      tokensHome: 'En Casa',
      captured: '¡Capturada!',
      noLegalMoves: 'Sin movimientos legales con esta tirada',
      tapToken: 'Toca una ficha resaltada para moverla',
      moveTokenAria: 'Mover ficha {{id}}',
      dieValue: 'Dado: {{value}}',
    },
    tutorial: {
      s1: {
        title: 'Con un 6 sales',
        body: 'Tira un dado en tu turno y mueve una ficha. Necesitas un 6 para salir del corral — y sacarlo te da otra tirada.',
      },
      s2: {
        title: 'Mándalos a casa',
        body: 'Cae en la casilla de una ficha rival para devolverla a su corral. Las casillas de estrella y de salida son refugios seguros.',
      },
      s3: {
        title: 'Marcha a casa',
        body: 'Da la vuelta al tablero en sentido horario, sube tu callejón de color y mete todas tus fichas en el centro para ganar.',
      },
      s4: {
        title: 'La codicia cuesta',
        body: 'Sacar tres 6 seguidos anula todo tu turno — a veces la jugada segura es la mejor.',
      },
    },
    rules: {
      title: 'Reglas de Pachisi',
      objectiveTitle: 'Objetivo',
      objective:
        'Lleva todas tus fichas desde tu corral, alrededor del tablero en sentido horario, por tu carril de color y hasta el centro. Gana quien primero meta todas sus fichas.',
      movementTitle: 'Tirar y Mover',
      movement:
        'En tu turno tira un dado y mueve una ficha tantas casillas como indique. Necesitas un 6 para sacar una ficha del corral a tu casilla de salida.',
      captureTitle: 'Capturas y Casillas Seguras',
      capture:
        'Caer en una casilla ocupada por un rival devuelve su ficha al corral. Las casillas de estrella y tu salida son seguras: nadie puede capturarte allí.',
      sixesTitle: 'Seises',
      sixes:
        'Sacar un 6 otorga otra tirada. Sacar tres seges seguidos pierde el turno por completo.',
    },
  },
};
