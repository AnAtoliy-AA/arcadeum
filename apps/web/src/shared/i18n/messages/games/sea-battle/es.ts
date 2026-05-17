export const esMessages = {
  sea_battle_v1: {
    name: 'Batalla Naval',
    description: 'Clásico juego de combate naval para hasta 6 jugadores',
    colors: {
      ship: 'Barco',
      hit: 'Impacto',
      miss: 'Fallo',
      empty: 'Vacío',
    },
    challengePlayer: '¿Desafiar a {{name}} a Batalla Naval?',
    rules: {
      title: 'Reglas del Juego',
      headers: {
        objective: 'Objetivo',
        gameplay: 'Jugabilidad',
        placement: 'Colocación de Barcos',
        battle: 'Fase de Batalla',
        ships: 'Tu Flota',
      },
      objective:
        '¡Hunde todos los barcos enemigos antes de que hundan los tuyos! El último jugador con barcos restantes gana.',
      gameplay:
        'El juego tiene dos fases: Colocación y Batalla. Primero, coloca secretamente tus barcos en tu cuadrícula de 10×10. Luego turnaos para disparar a las cuadrículas de los oponentes para encontrar y hundir sus barcos.',
      placement:
        'Coloca los 5 barcos en tu cuadrícula antes de que comience la batalla. Los barcos no pueden superponerse ni tocarse. Haz clic para colocar, usa el botón para rotar.',
      battle:
        'En tu turno, haz clic en la cuadrícula de un oponente para disparar. Los aciertos se marcan en rojo, los fallos en blanco. ¡Cuando todas las celdas de un barco son golpeadas, se hunde!',
      ships: `• Portaaviones (5 celdas) - El barco más grande
• Acorazado (4 celdas) - Crucero pesado
• Crucero (3 celdas) - Barco de ataque rápido
• Submarino (3 celdas) - Embarcación sigilosa
• Destructor (2 celdas) - Pequeño pero ágil`,
    },
    variants: {
      classic: {
        name: 'Clásico',
        description: 'Tema tradicional de batalla naval',
      },
      modern: {
        name: 'Moderno II',
        description: 'Guerra naval moderna',
      },
      pixel: {
        name: 'Pixel Art',
        description: 'Estilo pixel art retro',
      },
      cartoon: {
        name: 'Dibujos animados',
        description: 'Divertidos personajes de dibujos animados',
      },
      cyber: {
        name: 'Cyberpunk',
        description: 'Guerra de neón de alta tecnología',
      },
      vintage: {
        name: 'Vintage',
        description: 'Viejo mapa marítimo',
      },
      nebula: {
        name: 'Nebulosa',
        description: 'Flota del espacio profundo',
      },
      forest: {
        name: 'Bosque',
        description: 'Operaciones de camuflaje',
      },
      sunset: {
        name: 'Atardecer',
        description: 'Compromiso al atardecer',
      },
      monochrome: {
        name: 'Noir',
        description: 'Estilo monocromático elegante',
      },
    },
    table: {
      state: {
        yourBoard: 'Tu tablero',
        opponentBoard: 'Tablero oponente',
        shipsRemaining: 'Barcos restantes',
        shipsPalette: 'Barcos para colocar',
        vertical: 'Vertical',
        horizontal: 'Horizontal',
        cells: 'Celdas',
      },
      players: {
        you: 'Tú',
        alive: 'Vivo',
        eliminated: 'Eliminado',
        yourTurn: 'Tu turno',
        yourTurnAttack: '🎯 ¡Tu turno! - ¡Ataca a un oponente!',
        placeShips: 'Coloca tus barcos',
        waitingFor: 'Esperando a {{player}}...',
        targetBadge: 'Objetivo',
        defendingBadge: 'Defendiendo',
        opponentBadge: 'Oponente',
      },
      phase: {
        lobby: 'Vestíbulo',
        placement: 'Colocación',
        battle: 'Batalla',
        completed: 'Juego Terminado',
      },
      actions: {
        start: 'Iniciar Juego',
        starting: 'Iniciando...',
        confirmPlacement: 'Confirmar Colocación',
        rotate: 'Rotar',
        challenge: 'Desafío',
        fire: '¡Fuego!',
        autoPlace: 'Auto Colocar',
        randomize: 'Aleatorio',
        resetPlacement: 'Reiniciar',
        waitingForOthers: 'Esperando a otros...',
        dragHint: 'Arrastra al tablero · Haz clic para seleccionar',
      },
      attack: {
        hit: '¡Impacto!',
        miss: 'Fallo',
        sunk: '¡Hundido!',
        shipSunk: '¡{{ship}} ha sido hundido!',
      },
      lobby: {
        waitingToStart: 'Esperando a que comience el juego...',
        playersInLobby: 'Jugadores en el vestíbulo',
        needTwoPlayers: 'Se necesitan al menos 2 jugadores',
        maxFourPlayers: 'Máximo 4 jugadores',
        hostCanStart: "Haz clic en 'Iniciar Juego' cuando estés listo",
        waitingForHost: 'Esperando al anfitrión',
        hostControls: 'Controles del Anfitrión',
        theme: 'Tema',
        roomInfo: 'Información de la Sala',
        host: 'Anfitrión',
      },
      victory: {
        title: '¡Victoria!',
        message: '¡Has hundido todos los barcos enemigos!',
      },
      defeat: {
        title: 'Derrota',
        message: 'Todos tus barcos han sido hundidos.',
      },
      controlPanel: {
        spectating: 'Espectando',
        fullscreen: 'Pantalla completa',
        exitFullscreen: 'Salir de pantalla completa',
        enterFullscreen: 'Entrar en pantalla completa',
        rules: 'Reglas',
        leaveRoom: 'Salir',
        leaveConfirmMessage:
          '¿Estás seguro de que quieres salir de la partida? Serás eliminado de la lista de participantes.',
        exitRoom: 'Salir',
        exitRoomTooltip: 'Volver al vestíbulo pero mantenerte en el juego',
        leaveGameTooltip: 'Eliminarte del juego y volver al vestíbulo',
      },
      chat: {
        title: 'Chat de Batalla',
        empty: 'Sin mensajes aún',
        send: 'Enviar',
        show: 'Mostrar chat',
        hide: 'Ocultar chat',
        placeholder: 'Escribe un mensaje...',
      },
    },
    teamMode: {
      enableLabel: 'Modo equipo',
      disableLabel: 'Desactivar modo equipo',
      hideShipsLabel: 'Ocultar barcos a tus compañeros',
      teammateBadge: 'Compañero',
      cannotAttackTeammate: 'No puedes atacar a un compañero',
      description:
        'Juega en equipos. Configura el número de equipos y los tamaños — los jugadores pueden elegir o ser asignados por el anfitrión.',
      setup: {
        title: 'Configuración de equipos',
        teamNamePlaceholder: 'Nombre del equipo',
        teamColorLabel: 'Color',
        slotCountLabel: 'Espacios',
        addTeam: 'Añadir equipo',
        removeTeam: 'Eliminar equipo',
        addBot: 'Añadir bot',
        removeBot: 'Eliminar',
        totalSlots: 'Espacios totales: {{used}} / {{max}}',
        minTeamsHint: 'Se requieren al menos 2 equipos',
        maxTeamsHint: 'Hasta 4 equipos (cada uno con al menos 2 jugadores)',
        minSizeHint: 'Cada equipo necesita al menos 2 espacios',
      },
      slots: {
        joinTeam: 'Unirse al equipo',
        leaveTeam: 'Salir del equipo',
        moveTo: 'Mover a {{team}}',
        botLabel: 'Bot',
        emptySlot: 'Espacio libre',
      },
      unassigned: {
        title: 'Sin asignar',
        empty: 'Todos están en un equipo',
      },
      start: {
        disabledNotFull:
          'Todos los espacios deben estar ocupados antes de iniciar',
        disabledNotEnoughTeams: 'Se requieren al menos 2 equipos',
      },
      errors: {
        roomFull: 'La sala no puede superar 8 jugadores en modo equipo',
        teamFull: 'Este equipo está lleno',
        teamNotFound: 'Equipo no encontrado',
        notHost: 'Solo el anfitrión puede cambiar la configuración del equipo',
      },
      chat: {
        channelTeam: 'Equipo',
        channelAll: 'Todos',
        channelPrivate: 'Privado',
      },
      banner: {
        eliminatedSpectator:
          'Has sido eliminado. Aún puedes chatear con tu equipo y ver la batalla.',
        teamWon: '¡{{team}} gana!',
      },
    },
    landing: {
      meta: {
        title: 'Batalla Naval — Juega Online Gratis con Amigos | Arcadeum',
        description:
          'Juega Batalla Naval online gratis. Combate naval clásico para 2–4 jugadores, con bots de IA, modo equipos y más de 10 temas. Sin descargas ni registros — crea una sala y comparte el enlace.',
        ogTitle: 'Batalla Naval Online — Multijugador Gratis',
        ogDescription:
          'Coloca tu flota, dispara a las cuadrículas enemigas y hunde todos sus barcos. Juega en el navegador con amigos o contra la IA.',
        keywords:
          'batalla naval, batalla naval online, jugar batalla naval, batallas navales multijugador, batalla naval gratis',
      },
      hero: {
        title: 'Batalla Naval',
        tagline:
          'Juega al clásico Batalla Naval online — gratis y multijugador',
        intro:
          'Batalla Naval es el atemporal juego de combate naval en el que dos o más almirantes colocan sus flotas en secreto sobre una cuadrícula 10×10 y se intercambian salvas hasta que sólo queda una flota a flote. En Arcadeum puedes jugar a Batalla Naval directamente en el navegador — sin descargas ni registros — con amigos, desconocidos o contra bots de IA.',
        ctaPlay: 'Crear una sala de Batalla Naval',
        ctaRooms: 'Ver salas abiertas',
      },
      highlights: {
        title: 'Por qué jugar a Batalla Naval en Arcadeum',
        players: {
          title: '2 a 4 jugadores',
          body: 'Duelos cara a cara o batalla campal con hasta cuatro almirantes por sala.',
        },
        teams: {
          title: 'Modo equipos',
          body: 'Hasta cuatro equipos con tableros compartidos, chat de equipo privado y barcos ocultos opcionales.',
        },
        themes: {
          title: 'Más de 10 temas',
          body: 'Clásico, moderno, pixel-art, ciberpunk, nebulosa, vintage, atardecer y más.',
        },
        free: {
          title: 'Gratis e instantáneo',
          body: 'Sin instalaciones ni muros de pago. Abre una sala y comparte el enlace.',
        },
      },
      howToPlay: {
        title: 'Cómo jugar a Batalla Naval',
        steps: {
          create: {
            title: '1. Crea una sala',
            body: 'Elige un tema, invita amigos o añade bots de IA, elige duelo o modo equipos.',
          },
          place: {
            title: '2. Coloca tu flota',
            body: 'Arrastra tus cinco barcos a tu cuadrícula 10×10. Los barcos no pueden superponerse ni tocarse.',
          },
          fire: {
            title: '3. Dispara al enemigo',
            body: 'Por turnos elige una celda en la cuadrícula de cada oponente. Aciertos en rojo, fallos en blanco.',
          },
          win: {
            title: '4. Húndelos a todos',
            body: 'Gana el último almirante con al menos un barco a flote.',
          },
        },
      },
      faq: {
        title: 'Preguntas frecuentes',
        items: {
          free: {
            question: '¿Batalla Naval es gratis?',
            answer:
              'Sí. Batalla Naval en Arcadeum es totalmente gratis y se juega en el navegador sin descargas.',
          },
          players: {
            question: '¿Cuántos jugadores puede tener una partida?',
            answer:
              'De dos a cuatro jugadores por sala. El modo equipos permite hasta cuatro equipos de dos o más jugadores.',
          },
          ai: {
            question: '¿Puedo jugar contra la computadora?',
            answer:
              'Sí. Puedes rellenar cualquier hueco con un bot de IA para practicar solo o completar un grupo pequeño.',
          },
          duration: {
            question: '¿Cuánto dura una partida de Batalla Naval?',
            answer:
              'Una partida típica dura unos 20 minutos, dependiendo del número de jugadores y la rapidez con la que disparen.',
          },
          rules: {
            question: '¿Cuáles son las reglas de Batalla Naval?',
            answer:
              'Cada jugador coloca en secreto una flota en una cuadrícula 10×10, luego los jugadores se turnan para disparar a una celda en la cuadrícula de cada oponente. Los aciertos se marcan en rojo y los fallos en blanco. Cuando todas las celdas de un barco son alcanzadas, el barco se hunde. Gana el último jugador con al menos un barco a flote.',
          },
        },
      },
      breadcrumb: {
        home: 'Inicio',
        games: 'Juegos',
        seaBattle: 'Batalla Naval',
      },
    },
  },
};
