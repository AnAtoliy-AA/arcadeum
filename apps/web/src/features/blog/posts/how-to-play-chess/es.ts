import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-chess',
  locale: 'es',
  title: 'Cómo jugar al ajedrez online — reglas, aperturas, táctica y finales',
  excerpt:
    'Guía completa para principiantes del ajedrez: reglas oficiales, movimientos especiales, principios de apertura, tácticas de medio juego y fundamentos del final — además de los hábitos que evitan errores garrafales.',
  publishedAt: '2026-06-02',
  author: 'Equipo Arcadeum',
  tags: [
    'Chess',
    'How to Play',
    'Strategy',
    'Ajedrez',
    'Cómo jugar',
    'Estrategia',
  ],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: 'El ajedrez es el juego de tablero más estudiado que se sigue jugando a gran escala: dos jugadores, un tablero de 64 casillas y un único objetivo — acorralar al rey rival para que no pueda escapar del ataque. Juegan las blancas primero, los turnos se alternan una jugada cada vez y todo lo demás nace de ese ritmo tan sencillo. Las reglas se aprenden en una tarde, pero el juego da para toda una vida. Esta guía cubre las reglas oficiales, incluidos los tres movimientos especiales; los principios de apertura que condicionan toda la partida; los patrones tácticos que deciden la mayoría de las partidas amateur; y las habilidades de final que convierten pequeñas ventajas en victorias — todo pensado para jugar al ajedrez online.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Las reglas: tablero, piezas y cómo termina una partida',
      id: 'rules',
    },
    {
      type: 'paragraph',
      text: 'El tablero es una cuadrícula de 8×8 con casillas claras y oscuras alternadas. Cada jugador empieza con 16 piezas: un rey, una dama, dos torres, dos alfiles, dos caballos y ocho peones, colocados según la posición inicial estándar — cada dama sobre su propio color. Los peones avanzan una casilla (dos desde su casilla de origen) y capturan en diagonal; los caballos saltan en forma de L; los alfiles se deslizan por las diagonales; las torres, por filas y columnas; la dama combina torre y alfil; y el rey se mueve una casilla en cualquier dirección.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Movimientos especiales: enroque, captura al paso y coronación',
      id: 'special-moves',
    },
    {
      type: 'list',
      items: [
        'Enroque. Una vez por partida rey y torre pueden moverse juntos: el rey avanza dos casillas hacia la torre y esta salta a la casilla contigua. Es legal solo si ninguna de las dos piezas se ha movido, no hay piezas entre ellas y el rey no está en jaque, no pasa por una casilla atacada ni aterriza en una.',
        'Captura al paso. Si un peón avanza dos casillas y aterriza justo al lado de un peón rival, este puede capturarlo en la jugada inmediatamente siguiente, como si solo hubiera avanzado una.',
        'Coronación. Un peón que llega a la última fila se corona como cualquier pieza salvo el rey — en la práctica, casi siempre una dama.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Se gana por jaque mate: el rey rival está atacado («en jaque») sin ninguna salida legal. No toda partida termina en mate, eso sí. Un jugador al que no le dan jaque pero no tiene jugadas legales está ahogado — son tablas, igual que el material insuficiente, la triple repetición de la posición o cincuenta jugadas consecutivas sin movimiento de peón ni captura.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Principios de apertura',
      id: 'opening',
    },
    {
      type: 'paragraph',
      text: 'No necesitas memorizar variantes larguísimas para llegar al medio juego con opciones — unos pocos principios cubren casi cualquier posición:',
    },
    {
      type: 'list',
      items: [
        'Pelea por el centro. Abre con un peón central (e4 o d4 con blancas, respondido con e5 o d5 con negras): las casillas centrales dan a tus piezas el máximo alcance.',
        'Desarrolla los caballos antes que los alfiles y dirígelos ambos hacia el centro, no hacia los flancos.',
        'Enroca pronto. En las diez primeras jugadas, la seguridad del rey pasa por delante de casi todo lo demás.',
        'No muevas dos veces la misma pieza sin motivo — cada tempo perdido deja que el rival se desarrolle gratis.',
        'No saques la dama demasiado pronto: se convierte en un blanco que las piezas rivales en desarrollo atacan sin coste.',
        'Evita cazar peones de flanco mientras vas atrás en desarrollo; las posiciones abiertas castigan la codicia.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Táctica de medio juego',
      id: 'tactics',
    },
    {
      type: 'paragraph',
      text: 'Los golpes tácticos deciden más partidas de club que los profundos planes estratégicos, y los patrones ganadores se repiten sin parar. Aprende estos seis hasta verlos sin buscarlos:',
    },
    {
      type: 'list',
      items: [
        'Tenedor. Una pieza ataca dos o más objetivos a la vez. El tenedor de caballo a rey y dama es el clásico: no hay forma de salvar a los dos.',
        'Clavada. La pieza atacada no puede o no debe moverse porque detrás hay algo más valioso; una clavada al rey paraliza por completo la pieza clavada.',
        'Rayos X (skewer). La clavada invertida: se ataca una pieza valiosa obligada a moverse, dejando expuesta a la captura la que tiene detrás.',
        'Ataque descubierto. Al mover una pieza se destapa el ataque de otra que estaba detrás; cuando la pieza destapada es una torre o un alfil que cae sobre una dama indefensa, el material simplemente cae.',
        'Eliminación del defensor. Captura o desvía la pieza que sostiene la posición rival y el resto se derrumba.',
        'Mate de pasillo. Un rey encerrado por sus propios peones puede recibir mate directo de una pieza pesada en la última fila — gánate una casilla de escape antes de que sea demasiado tarde.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Tras cada jugada del rival pregúntate qué ha cambiado: qué líneas se han abierto, qué piezas han quedado indefensas, qué jaques y capturas son posibles ahora. Antes de confirmar tu candidata, haz una revisión rápida contra errores garrafales: ¿tengo algo colgando, y mi jugada deja algo colgando?',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Fundamentos del final',
      id: 'endgame',
    },
    {
      type: 'paragraph',
      text: 'Cuando cambian las damas y el tablero se vacía, los papeles se invierten: el rey deja de esconderse y se convierte en pieza de combate. Tres habilidades convierten pequeñas ventajas en puntos:',
    },
    {
      type: 'list',
      items: [
        'Activa tu rey. Camínalo hacia el centro o hacia los peones que importan; en posiciones simplificadas un rey activo vale aproximadamente una pieza.',
        'Empuja los peones pasados. Un peón sin peones rivales delante corre hacia la coronación — casi siempre en dama, lo que prácticamente decide la partida.',
        'Entiende la oposición en finales de rey y peón: el bando al que le toca mover tiene que ceder, así que el turno decide quién escolta su peón hasta casa.',
        'Coloca las torres detrás de los peones pasados: los tuyos corren más rápido y los rivales se frenan desde lejos.',
        'Aprende los mates básicos. Rey y dama, y rey y torre, dan mate solos; rey con solo un alfil o caballo no puede forzar la victoria, así que cambia en consecuencia.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Errores típicos de principiante',
      id: 'mistakes',
    },
    {
      type: 'list',
      items: [
        'Sacar la dama demasiado pronto y perder tiempo esquivando ataques contra ella.',
        'Retrasar el enroque hasta que el rey ya está bajo fuego.',
        'Mover solo peones, o dar vueltas con una sola pieza mientras otras seis esperan en casa.',
        'Ignorar las amenazas del rival — cada jugada merece la pregunta: ¿qué ataca?',
        'Jugar con fe: elegir una jugada sin comprobar si tira una pieza o permite mate.',
        'Cambiar por inercia en lugar de preguntarse a quién beneficia cada cambio.',
      ],
    },
    {
      type: 'cta',
      href: '/games/chess',
      text: 'Jugar al ajedrez online — gratis, desde tu navegador',
      description:
        'Empieza una partida casual en segundos, invita a un amigo con un enlace o afina tu juego contra bots de IA — sin descargas ni registros.',
    },
    {
      type: 'cta',
      href: '/games/checkers',
      text: '¿Apetece algo más ligero? Juega a las damas online',
      description:
        'El otro clásico del juego de estrategia abstracto: se aprende más rápido y sigue siendo afiladísimo.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'TL;DR — los hábitos que ganan partidas',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Pelea por el centro y desarrolla los caballos antes que los alfiles',
        'Enroca pronto; no muevas repetidamente la misma pieza ni saques la dama demasiado pronto',
        'Cada jugada busca tenedores, clavadas, rayos X y ataques descubiertos — y revisa si dejas algo colgando',
        'En el final, activa tu rey y empuja los peones pasados hasta coronar',
        'Conoce los desenlaces: el jaque mate gana; el ahogado y la triple repetición son tablas',
      ],
    },
    {
      type: 'paragraph',
      text: 'El ajedrez premia exactamente los hábitos anteriores: controla espacio, desarrolla con eficiencia, calcula jugadas forzadas y encamina la partida hacia finales que entiendes. Nada de esto exige talento — solo repetición. Juega unas partidas en Arcadeum, repasa las que pierdas y la mejora se nota en cuestión de semanas.',
    },
  ],
  howTo: {
    totalTime: 'PT20M',
    steps: [
      {
        name: 'Pelea por el centro y desarrolla los caballos antes que los alfiles',
        text: 'Abre con un peón central (e4 o d4 con blancas, e5 o d5 con negras) y desarrolla los caballos hacia el centro antes que los alfiles. Las piezas centradas llegan a más casillas y sostienen la actividad temprana.',
        url: '#opening',
      },
      {
        name: 'Enroca pronto; no muevas repetidamente la misma pieza ni saques la dama demasiado pronto',
        text: 'La seguridad del rey va primero: enroca dentro de las diez primeras jugadas. Cada jugada extra con la misma pieza pierde un tempo, y una dama temprana se convierte en un blanco que las piezas rivales atacan gratis.',
        url: '#opening',
      },
      {
        name: 'Cada jugada busca tenedores, clavadas, rayos X y ataques descubiertos — y revisa si dejas algo colgando',
        text: 'La táctica decide la mayoría de las partidas amateur. Tras cada jugada rival pregúntate qué cambió, y antes de confirmar tu candidata comprueba si tienes algo colgando o si tu jugada dejaría algo colgando.',
        url: '#tactics',
      },
      {
        name: 'En el final, activa tu rey y empuja los peones pasados hasta coronar',
        text: 'Camina con el rey hacia la acción, escolta los peones pasados por el tablero — coronando casi siempre en dama — y recuerda que las torres van detrás de los peones pasados.',
        url: '#endgame',
      },
      {
        name: 'Conoce los desenlaces: el jaque mate gana; el ahogado y la triple repetición son tablas',
        text: 'Se gana atrapando al rey rival sin salida legal. Un jugador sin jugadas legales que no está en jaque está ahogado — tablas, igual que el material insuficiente, la triple repetición y la regla de las cincuenta jugadas.',
        url: '#rules',
      },
    ],
  },
};
