export const esMessages = {
  cat_dash_v1: {
    name: 'Cat Dash',
    description: 'Carrera de gatos con dados, habilidades únicas y temas',
    summary:
      '¡Corre con tu gato por la pista, lanza dados, usa habilidades y sé el primero en cruzar la meta!',
    variants: {
      neon: { name: 'Cyber Neón', description: 'Paisaje cyberpunk brillante' },
      village: {
        name: 'Aldea Clásica',
        description: 'Carreras rurales acogedoras',
      },
      space: {
        name: 'Gatos Espaciales',
        description: 'Carrera cósmica en ingravidez',
      },
      nature: {
        name: 'Naturaleza Salvaje',
        description: 'Senderos de bosque y pradera',
      },
    },
    landing: {
      meta: {
        title: 'Cat Dash — juego de carrera de gatos con dados multijugador',
        description:
          'Juega Cat Dash online gratis. 2–6 jugadores, gatos únicos, dados + habilidades, cuatro pistas temáticas.',
        keywords:
          'juego de gatos, juego de dados, carrera, multijugador, juego familiar',
      },
      hero: {
        title: 'Cat Dash — corre con tu gato hacia la victoria',
        subtitle:
          'Lanza los dados, esquiva obstáculos y usa las habilidades de los gatos para llegar primero a la meta.',
        ctaQuickplay: 'Jugar vs IA',
        ctaQuickplayError: 'No se pudo iniciar — intenta de nuevo',
        createRoom: 'Crear sala',
        browseRooms: 'Ver salas',
      },
      highlights: {
        players: {
          title: '2–6 jugadores',
          body: 'Compite con amigos o completa con bots.',
        },
        cats: {
          title: '6 gatos únicos',
          body: 'Cada gato tiene habilidades especiales.',
        },
        themes: {
          title: '4 pistas temáticas',
          body: 'Cyber Neón, Aldea Clásica, Gatos Espaciales y Naturaleza Salvaje.',
        },
      },
      steps: {
        create: { title: 'Crea una sala', body: 'Elige el tema de la pista.' },
        join: {
          title: 'Invita a un amigo o añade un bot',
          body: 'Comparte el enlace o juega con bots.',
        },
        play: {
          title: 'Lanza y corre',
          body: 'Lanza los dados, esquiva obstáculos y cruza la meta.',
        },
      },
      themes: {
        title: 'Elige una pista',
        subtitle: 'Cada tema cambia el estilo visual de la pista.',
      },
      rules: {
        title: 'Reglas',
        objective: 'Sé el primer gato en llegar al espacio 20 — la meta.',
        howToPlay: 'En tu turno, haz clic en "Lanzar Dados".',
        abilities:
          'Cada gato tiene 2 habilidades únicas. Gasta tokens de poder (3 por partida).',
        trackSpaces:
          '🟢 Normal — sin efecto. 🔴 Obstáculo — pierde tu próximo turno. 🟡 Bonusa — lanza de nuevo.',
      },
      faq: {
        abilities: {
          question: '¿Qué hacen las habilidades?',
          answer:
            'Cada gato tiene dos habilidades únicas — una ofensiva y una defensiva.',
        },
        tokens: {
          question: '¿Cómo funcionan los tokens?',
          answer:
            'Empiezas con 3 tokens. Cada uso de habilidad cuesta 1 token.',
        },
        bots: {
          question: '¿Cómo juegan los bots?',
          answer: 'Los bots lanzan dados automáticamente cada turno.',
        },
      },
    },
    lobby: {
      theme: 'Tema de pista',
      trackType: 'Tipo de pista',
      columns: 'Ancho del tablero (columnas)',
      columnsUnit: 'columnas',
      trackLength: 'Longitud de la pista (espacios)',
      spacesUnit: 'espacios',
      startWithBots: 'Empezar con bots',
      addBot: 'Añadir bot',
      waitingForPlayers: 'Esperando jugadores…',
      minPlayers: 'Mínimo 2 jugadores',
    },
    tutorial: {
      s1: {
        title: 'Tira y corre',
        body: 'En tu turno pulsa Tirar Dado para avanzar. El primer gato que llegue a la casilla 20 gana la carrera.',
      },
      s2: {
        title: 'Cuidado con la pista',
        body: 'Los obstáculos rojos te quitan el próximo turno, las bonificaciones amarillas dan otra tirada y las horquillas azules ofrecen atajos arriesgados.',
      },
      s3: {
        title: 'Gasta fichas con cabeza',
        body: 'Cada gato tiene dos habilidades únicas — gasta tus tres fichas de poder en el momento justo.',
      },
      s4: {
        title: 'Final de foto',
        body: 'Cruza primero la línea de meta y luego pide revancha o celebra en el chat.',
      },
    },
    rules: {
      title: 'Reglas de Cat Dash',
      objective: 'Sé el primer gato en llegar a la meta (espacio 20).',
      howToPlay:
        'En tu turno, haz clic en "Lanzar Dados". Dado estándar de 6 caras.',
      trackSpaces:
        '🟢 Normal. 🔴 Obstáculo — pierde turno. 🟡 Bonusa — lanza de nuevo. 🔵 Bifurcación — elige camino.',
      abilities:
        'Cada gato tiene 2 habilidades. Usa tokens de poder (3 por partida).',
      cats: '🐱 Gato Neón: Dash Digital + Escudo Neón. 🐱bigotes: Vida Extra + Poder de Ronroneo. 🐱 Polvo Estelar: Salto Warp + Escudo Estelar. 🐱 Felix: Camino de la Naturaleza + Carga Salvaje.',
      trackTypes:
        'Lineal — carrera directa. Circular — atajos y obstáculos. Múltiples caminos — bifurcaciones.',
    },
    gameOver: {
      won: '¡Ganaste!',
      lost: 'Perdiste.',
      draw: 'Empate.',
      you: 'Tú',
      messages: {
        won: '¡Tu gato cruzó la meta primero! ¿Otra carrera?',
        lost: 'Otro gato ganó. ¿Revancha?',
        draw: 'La carrera terminó en empate.',
      },
    },
    actions: {
      rollDice: 'Lanzar Dados',
      useAbility: 'Usar Habilidad',
      choosePath: 'Elegir Camino',
      rematch: 'Revancha',
      leave: 'Salir',
      forfeit: 'Rendirse',
    },
    chat: {
      rolled: '{{name}} lanzó {{roll}} y avanzó {{move}} espacios.',
      ability: '¡{{name}} usó una habilidad!',
      won: '{{name}} cruzó la meta!',
      joined: '{{name}} se unió a la carrera.',
      left: '{{name}} dejó la carrera.',
      forfeit: '{{name}} se rindió.',
    },
    errors: {
      notYourTurn: 'Aún no es tu turno.',
      gameOver: 'El juego ha terminado.',
      gameNotStarted: 'El juego no ha comenzado.',
    },
    status: {
      turn: '{{player}} lanzando…',
      winner: '¡{{name}} ganó la carrera!',
      draw: 'Empate',
    },
  },
};
