export const esMessages = {
  sea_battle_v1: {
    name: 'Batalla Naval',
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
  },
  seaBattle: {
    table: {
      state: {
        yourBoard: 'Tu Tablero',
        opponentBoard: 'Tablero Oponente',
        shipsRemaining: 'Barcos Restantes',
      },
      players: {
        you: 'Tú',
        alive: 'Vivo',
        eliminated: 'Eliminado',
        yourTurn: 'Tu turno',
        yourTurnAttack: '🎯 ¡Tu turno! - ¡Ataca a un oponente!',
        placeShips: 'Coloca tus barcos',
        waitingFor: 'Esperando a {{player}}...',
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
        fire: '¡Fuego!',
        autoPlace: 'Auto Colocar',
        randomize: 'Aleatorio',
        resetPlacement: 'Reiniciar',
        waitingForOthers: 'Esperando a otros...',
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
      chat: {
        title: 'Chat de Batalla',
        empty: 'Sin mensajes aún',
        send: 'Enviar',
        placeholder: 'Escribe un mensaje...',
      },
    },
  },
};
