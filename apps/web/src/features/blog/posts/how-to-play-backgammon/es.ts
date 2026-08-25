import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-backgammon',
  locale: 'es',
  title: 'Cómo jugar al Backgammon online — reglas, cubo de doblar, estrategia',
  excerpt:
    'Guía completa para principiantes: reglas, movimiento de dados, captura de fichas, retiro del tablero, cubo de doblar y la estrategia que gana.',
  publishedAt: '2026-06-16',
  author: 'Equipo Arcadeum',
  tags: ['Backgammon', 'Cómo jugar', 'Estrategia', 'Juego de mesa', 'Dados'],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: 'El Backgammon es uno de los juegos de mesa más antiguos conocidos — una carrera entre dos jugadores que mueven fichas por un tablero de 24 puntos triangulares según las tiradas de dados. El objetivo es simple: mover las quince fichas a tu sector de casa y retirarlas antes que el rival. Pero bajo la meta simple hay una rica mezcla de probabilidad, gestión de riesgos y toma de decisiones tácticas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'El tablero y la posición inicial',
      id: 'board',
    },
    {
      type: 'paragraph',
      text: 'El tablero tiene 24 triángulos estrechos llamados puntos, numerados 1–24. Los puntos se agrupan en cuatro sectores de seis puntos: tu sector de casa (1–6), tu sector exterior (7–12), el sector exterior del rival (13–18) y el sector de casa del rival (19–24). Cada jugador comienza con 15 fichas en un patrón espejo: dos en el punto 24, cinco en el 13, tres en el 8 y cinco en el 6.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Movimiento con dados',
      id: 'movement',
    },
    {
      type: 'paragraph',
      text: 'En cada turno, tiras dos dados. Debes mover una ficha la suma de ambos dados, o dos fichas cada una el valor de un dado. Por ejemplo, sacar un 3 y un 5 permite mover una ficha 8 espacios o dos fichas — una 3 y otra 5. Debes usar ambos dados si es legalmente posible; si solo se puede usar uno, juegas el mayor. Con dobles (ej. doble 4), juegas el número cuatro veces.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Captura y la barra',
      id: 'hitting',
    },
    {
      type: 'paragraph',
      text: 'Un punto ocupado por dos o más fichas del mismo color es "poseído" — el rival no puede aterrizar allí. Una sola ficha es un blot. Si una ficha rival aterriza en tu blot, es capturada y colocada en la barra. Un jugador con fichas en la barra debe reentrar en el sector de casa del rival antes de cualquier otro movimiento. Si no hay punto abierto, el turno se pierde.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Retiro de fichas',
      id: 'bearing-off',
    },
    {
      type: 'paragraph',
      text: 'Una vez que las 15 fichas están en tu sector de casa, comienzas el retiro. Una ficha se retira con el número exacto del punto donde está. Si no hay ficha en el punto mostrado por el dado, puedes retirar la ficha del punto más alto ocupado.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Gammon y backgammon',
      id: 'scoring',
    },
    {
      type: 'paragraph',
      text: 'Un juego simple (1 punto) se gana cuando el perdedor ha retirado al menos una ficha. Un gammon (el perdedor no retiró ninguna) vale el doble. Un backgammon (el perdedor tiene ficha en la casa del ganador o en la barra) vale el triple. El cubo de doblar amplifica estas apuestas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'El cubo de doblar',
      id: 'doubling',
    },
    {
      type: 'paragraph',
      text: 'El cubo de doblar es un dado marcado 2, 4, 8, 16, 32, 64. Antes de tirar, si crees que tienes ventaja, puedes ofrecer un doblar — subir la apuesta de 1 a 2 puntos. El rival debe aceptar (y ahora poseer el cubo en 2) o rechazar (y perder 1 punto). Aceptar un doblar es correcto cuando tienes aproximadamente un 25% o más de posibilidades de ganar.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Estrategia — los dos modos de juego',
      id: 'strategy',
    },
    {
      type: 'list',
      items: [
        'Modo carrera. Cuando no hay contacto entre fuerzas, Backgammon se convierte en una carrera de pip-count. Cuenta tus pips totales — el menor gana. En una carrera, corre; no dejes blots innecesarios.',
        'Modo contacto. Cuando las fichas interactúan, la estrategia se centra en hacer puntos (poseer dos o más puntos adyacentes), anclar en la casa del rival y gestionar el riesgo de blots.',
        'Timing. Cuando vas en la carrera, minimiza el contacto. Cuando vas atrás, busca contacto — que el juego sea lo más caótico posible.',
        'Conteo de pips. Suma todos los puntos que tus fichas necesitan viajar para retirar. Conocer tu conteo antes de aceptar un doblar es esencial.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tácticas y errores comunes',
      id: 'tactics',
    },
    {
      type: 'list',
      items: [
        'Slotting: colocar una ficha en un punto clave que quieres poseer, esperando cubrirla siguiente turno. Arriesgado pero a veces necesario.',
        'Movimientos de doble propósito: un solo movimiento que mejora tu posición y golpea un blot rival.',
        'Sobrepilar: tener cuatro o más fichas en un solo punto desperdicia material y reduce flexibilidad.',
        'Ignorar la barra: no contar la probabilidad de reentrada al golpear.',
        'Errores del cubo: ofrecer un doblar demasiado pronto o demasiado tarde cuesta equidad significativa.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Variantes que verás online',
      id: 'variants',
    },
    {
      type: 'list',
      items: [
        'Match play. Jugar a un número fijo de puntos (ej. 7). La estrategia del cubo cambia dramáticamente.',
        'Speed gammon. Variante con reloj, añadiendo presión temporal.',
        'Acey-deucey. Variante popular donde doble-1 da turno libre y elección de doble.',
      ],
    },
    {
      type: 'cta',
      href: '/games/backgammon',
      text: 'Juega al Backgammon online — gratis, en tu navegador',
      description:
        'Abre una sala de Backgammon, comparte el enlace con amigos o juega contra bots IA.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Resumen — cuatro hábitos que ganan',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Haz puntos clave al inicio (especialmente tu punto 5 y 7) para controlar el tablero.',
        'Cuenta tus pips antes de aceptar o ofrecer un doblar — sabe si vas adelante en la carrera.',
        'Cambia entre modo carrera (minimiza contacto) y modo contacto (busca contacto).',
        'Evita sobrepilas y gestiona el riesgo de blots — cada blot es un golpe potencial del rival.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Backgammon recompensa a los jugadores que combinan pensamiento probabilístico con conciencia táctica. Los dados añaden varianza, pero el jugador que toma mejores decisiones consistentemente sale adelante. Practica tu conteo de pips, domina el cubo de doblar y juega muchas partidas.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Haz puntos clave al inicio',
        text: 'Busca poseer tu punto 5 y 7 al inicio. Los puntos poseídos bloquean la reentrada del rival.',
        url: '#strategy',
      },
      {
        name: 'Cuenta tus pips',
        text: 'Antes de aceptar un doblar, suma todos los puntos que tus fichas necesitan viajar.',
        url: '#strategy',
      },
      {
        name: 'Cambia entre modos',
        text: 'Adelante en la carrera, minimiza contacto. Atrás, busca contacto — que sea caótico.',
        url: '#strategy',
      },
      {
        name: 'Gestiona el riesgo de blots',
        text: 'Cada blot es un golpe potencial. Evita blots en posiciones peligrosas y usa movimientos de doble propósito.',
        url: '#tactics',
      },
    ],
  },
};
