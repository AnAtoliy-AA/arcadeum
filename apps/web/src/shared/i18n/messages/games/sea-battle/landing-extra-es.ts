export const seaBattleLandingExtraEs = {
  sea_battle_v1: {
    landing: {
      extra: {
        category: 'Estrategia',
        badges: {
          players: '2-8 jugadores',
          duration: '15-25 min',
          difficulty: 'Combate naval',
        },
        highlights: {
          salvo: {
            title: 'Modo Salva',
            body: 'Dispara varias veces por turno: un disparo por cada barco superviviente. La variante competitiva clásica que premia la puntería precisa.',
          },
          speed: {
            title: 'Modo Velocidad',
            body: 'Un temporizador de 30 segundos por turno mantiene la presión. Piensa rápido, dispara más rápido: no hay tiempo para dudar.',
          },
          abilities: {
            title: 'Habilidades de barcos',
            body: 'Cada clase de barco tiene un poder único: el Explorador revela zonas, la Descarga dispara tiros extra, el Torpedo garantiza un impacto y más.',
          },
          keyboard: {
            title: 'Controles de teclado',
            body: 'Muévete por la cuadrícula con las flechas o WASD y dispara con Enter. Compatibilidad total con teclado para jugar rápido y con precisión.',
          },
          sonar: {
            title: 'Sónar y radar',
            body: 'Las armas especiales revelan barcos ocultos. El sónar escanea un área de 3×3 y el radar barre filas o columnas enteras.',
          },
          ai: {
            title: 'Rivales de IA de 4 niveles',
            body: 'Desde el Fácil para principiantes hasta el devastador Experto: la IA usa mapas de densidad probabilística y apuntado en modo caza.',
          },
          grids: {
            title: 'Tamaños de tablero flexibles',
            body: 'Juega en cuadrículas de 10×10, 15×15 o 20×20 con un número de barcos configurable. Personaliza cada partida a tu gusto.',
          },
          multiplayer: {
            title: 'Hasta 8 jugadores',
            body: 'Todos contra todos hasta 6 jugadores, o batallas por equipos de hasta 8 en 2-4 equipos. Multijugador en tiempo real con chat.',
          },
        },
        tips: {
          create:
            'Elige el tamaño del tablero y activa las plazas de espectador si quieres que tus amigos miren.',
          place:
            'Separa los barcos para evitar que las salvas enemigas los alcancen juntos.',
          fire: 'Usa la búsqueda por paridad (apuntado en tablero de ajedrez) para encontrar los barcos grandes con eficacia.',
          win: 'Hundir un barco enemigo muestra un anuncio de confirmación.',
        },
        specs: {
          title: 'Especificaciones del juego',
          kicker: 'Detalles',
          players: {
            label: 'Jugadores',
            value: '2-8',
            hint: 'Todos contra todos hasta 6, equipos hasta 8',
          },
          duration: { label: 'Duración', value: '15-25 min' },
          modes: {
            label: 'Modos de juego',
            value: 'Clásico, Salva, Velocidad',
            badge: '3 modos',
          },
          grids: { label: 'Tamaños de cuadrícula' },
          fleet: { label: 'Flota', value: '7 clases, 26 barcos' },
          ai: {
            label: 'Dificultad de la IA',
            value: 'Fácil, Media, Difícil, Experto',
            badge: '4 niveles',
          },
          weapons: {
            label: 'Armas especiales',
            value: 'Sónar, radar, onda de escaneo',
          },
          abilities: {
            label: 'Habilidades de barcos',
            value: '6 poderes únicos con enfriamiento',
            badge: 'NUEVO',
          },
          team: {
            label: 'Modo por equipos',
            value: '2-4 equipos, hasta 8 jugadores',
          },
          themes: { label: 'Temas', value: '13 temas visuales' },
          cost: {
            label: 'Precio',
            value: 'Gratis para jugar',
            badge: 'Sin anuncios',
          },
          platform: { label: 'Multiplataforma', value: 'Web + móvil' },
        },
        comparison: {
          title: '¿Por qué Batalla Naval en Arcadeum?',
          kicker: 'Comparación',
          subtitle:
            'Mira cómo se compara Arcadeum con otros juegos de combate naval',
          feature: 'Característica',
          usBadge: 'NOSOTROS',
          rows: {
            modes: 'Modos de juego',
            maxPlayers: 'Máximo de jugadores',
            abilities: 'Habilidades de barcos',
            boards: 'Tamaños de tablero',
            ai: 'Dificultad de la IA',
            weapons: 'Armas especiales',
            keyboard: 'Controles de teclado',
            sounds: 'Efectos de sonido',
            cost: 'Precio',
          },
          values: {
            modes: '3 (Clásico, Salva, Velocidad)',
            maxPlayers: '8 (modo por equipos)',
            abilities: '6 poderes únicos',
            ai: '4 niveles',
            weapons: 'Sónar + radar',
            abilitiesShort: 'Habilidades',
            sounds: '8 sonidos',
            basic: 'Básicos',
            full: 'Completos',
            free: 'Gratis',
            freeIap: 'Gratis + compras',
            freeCosmetic: 'Gratis (cosméticos)',
          },
        },
        themesCta: 'Desplegar con este tema',
        rulesFallbackTitle: 'Reglas del combate naval',
        related: { title: 'Más batallas tácticas', kicker: 'Descubre' },
        battleship: {
          title: 'Hundir la flota',
          badges: {
            players: '2-4 jugadores',
            duration: '15-25 min',
            difficulty: 'Combate naval',
          },
          highlightsTitle: 'Por qué jugar a Hundir la flota',
          howToTitle: 'Cómo jugar a Hundir la flota',
          strategyTitle:
            'Estrategia de Hundir la flota: cómo ganar más partidas',
          faqTitle: 'Preguntas frecuentes',
          finalTitle: '¿Listo para jugar a Hundir la flota?',
        },
      },
    },
  },
};
