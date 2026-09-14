import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-spades',
  locale: 'es',
  title:
    'Cómo jugar a Picas (Spades) online — Reglas, apuestas, Nil y estrategia',
  excerpt:
    'Guía completa para principiantes de Picas: parejas, reparto, apuestas incluyendo Nil, bazas, bolsas de penalización y hábitos de equipo ganadores.',
  publishedAt: '2026-07-21',
  author: 'Equipo Arcadeum',
  tags: ['Picas', 'Spades', 'Juego de cartas', 'Cómo jugar', 'Estrategia'],
  readingTimeMinutes: 8,
  body: [
    {
      type: 'paragraph',
      text: 'Picas (Spades) es el juego de bazas por parejas más popular del mundo: cuatro jugadores divididos en dos equipos fijos sentados frente a frente, compitiendo con una baraja estándar de 52 cartas repartidas de 13 en 13. A diferencia del Bridge o el Whist, no hay subasta para elegir el palo de triunfo: las picas son siempre triunfo y el núcleo del juego radica en cuántas bazas puede prometer con certeza tu equipo. Esta guía cubre las reglas, la apuesta Nil, el sistema de bolsas (bags) y las tácticas para alcanzar la meta de 500 puntos en Arcadeum.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Equipos, reparto y objetivo',
      id: 'teams',
    },
    {
      type: 'paragraph',
      text: 'Se juega entre cuatro personas en parejas fijas enfrentadas. La baraja de 52 cartas se reparte por completo, otorgando 13 cartas a cada jugador. El orden de las cartas es de mayor a menor: As, K, Q, J, 10 ... 2, siendo el As de picas la carta más poderosa de la partida. Cada mano se disputa a 13 bazas completas y la primera pareja en alcanzar la puntuación acordada (habitualmente 500 puntos) se alza con la victoria.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'La apuesta: el contrato del equipo',
      id: 'bidding',
    },
    {
      type: 'paragraph',
      text: 'Tras examinar sus cartas, cada jugador declara una apuesta: el número de bazas que espera ganar en esa mano. No existen contrasubastas: cada participante habla una sola vez en orden de turno. La apuesta mínima suele ser 1, sumándose las declaraciones de ambos compañeros para formar el contrato del equipo. Si tú declaras 3 y tu compañero 4, el equipo debe conseguir al menos 7 bazas en conjunto para no ser penalizado.',
    },
    {
      type: 'heading',
      level: 3,
      text: 'Nil: la apuesta a cero bazas',
      id: 'nil',
    },
    {
      type: 'paragraph',
      text: 'Nil es la apuesta más emocionante de Picas: el jugador se compromete a no ganar ninguna baza en toda la mano. Esta declaración no suma bazas al contrato del compañero y se evalúa de manera independiente: un Nil exitoso otorga una bonificación directa de +100 puntos, mientras que ganar aunque sea una sola baza supone una penalización inmediata de -100 puntos. El compañero debe jugar para proteger el Nil mientras cumple su propio contrato.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Juego de bazas y la regla de romper picas',
      id: 'trick-play',
    },
    {
      type: 'paragraph',
      text: 'El jugador situado a la izquierda de quien reparte inicia la primera baza. Puede salir con cualquier palo excepto picas: las picas no pueden liderarse hasta que hayan sido "rotas", es decir, cuando un jugador sin cartas del palo de salida se ve forzado o elige descartar una pica.',
    },
    {
      type: 'list',
      items: [
        'Es obligatorio asistir al palo de salida siempre que se tengan cartas de dicho palo.',
        'Si no se tienen cartas del palo de salida, se puede jugar cualquier carta, incluyendo picas.',
        'La carta más alta del palo de salida gana la baza, salvo que se jueguen picas, en cuyo caso la pica de mayor rango se lleva la mano.',
        'El ganador recoge la baza y abre la siguiente. Se disputan las 13 bazas en cada reparto.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Puntuación: contratos, bolsas (bags) y penalizaciones',
      id: 'scoring',
    },
    {
      type: 'list',
      items: [
        'Cumplir el contrato: la pareja suma 10 puntos por cada baza apostada (un contrato de 7 otorga 70 puntos).',
        'Cada baza adicional conseguida por encima del contrato se considera una "bolsa" (bag) y suma 1 punto.',
        'Acumular diez bolsas conlleva una dura penalización de -100 puntos: apostar por debajo de las bazas reales acaba costando caro.',
        'Incumplir el contrato: si el equipo consigue menos bazas de las prometidas, pierde 10 puntos por cada baza apostada.',
        'Nil logrado: +100 puntos; Nil fallido: -100 puntos para la pareja.',
        'La partida finaliza al llegar a 500 puntos; si ambas parejas superan el umbral en la misma mano, gana la de mayor total.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Estrategia en equipo: comunicación y lectura de juego',
      id: 'strategy',
    },
    {
      type: 'paragraph',
      text: 'Picas es una conversación silenciosa que se desarrolla mediante apuestas y descartes. Estos principios distinguen a los jugadores ganadores:',
    },
    {
      type: 'list',
      items: [
        'Apuesta con realismo basándote en cartas seguras y control de triunfos, no en ilusiones.',
        'Cuenta las picas en juego para anticipar cuándo los rivales se quedarán sin triunfos.',
        'Abre palos en los que intuyas que tu compañero no tiene cartas, permitiéndole cortar con picas bajas.',
      ],
    },
    {
      type: 'paragraph',
      text: 'El cálculo temporal de las cartas es fundamental:',
    },
    {
      type: 'list',
      items: [
        'Reserva picas altas para arrastrar los triunfos rivales cuando sea el momento adecuado.',
        'Gestiona las bolsas conscientemente: a veces es preferible ceder una baza para evitar acumular la décima bolsa.',
        'En la fase final de la partida, calcula con exactitud las puntuaciones para apostar justo lo necesario para superar los 500 puntos.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Evita estos fallos habituales:',
    },
    {
      type: 'list',
      items: [
        'Sobreestimar la fuerza de la mano y comprometer al equipo con apuestas inalcanzables.',
        'Olvidar el contador de bolsas hasta que la penalización de -100 ya es inevitable.',
        'Comprometer el Nil de tu compañero saliendo con cartas intermedias que no puede evitar ganar.',
        'Gastar bazas ganadoras demasiado pronto liberando las cartas del rival.',
      ],
    },
    {
      type: 'cta',
      href: '/games/spades',
      text: 'Jugar a Picas online — Gratis en el navegador',
      description:
        'Juega al instante contra otros usuarios o practica contra bots inteligentes sin descargas ni registro.',
    },
    {
      type: 'cta',
      href: '/games/hearts',
      text: '¿Prefieres otro clásico de cartas? Juega a Corazones online',
      description:
        'La otra gran tradición de cartas: misma baraja, objetivo inverso: esquivar los corazones y la reina de picas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Resumen: claves para dominar Picas',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Apuesta con disciplina y cumple el contrato para asegurar 10 puntos por baza.',
        'Respeta las reglas de palo y no lideres con picas antes de que se hayan roto.',
        'Controla las bolsas de penalización: 10 bolsas descuentan 100 puntos.',
        'Protege el Nil de tu compañero absorbiendo las bazas que puedan comprometerlo.',
        'Monitorea los triunfos jugados para maximizar tus cartas altas al final.',
        'Enfócate en alcanzar primero la meta de los 500 puntos con decisiones seguras.',
      ],
    },
    {
      type: 'paragraph',
      text: 'En Picas la constancia y la sincronización con el compañero siempre superan a la suerte. Únete a una mesa en Arcadeum y experimenta la emoción del juego en equipo.',
    },
  ],
  howTo: {
    totalTime: 'PT25M',
    steps: [
      {
        name: 'Apostar con precisión matemática',
        text: 'Declara las bazas que puedes asegurar; cumplir el contrato otorga 10 puntos por baza.',
        url: '#bidding',
      },
      {
        name: 'Respetar el palo y esperar a romper picas',
        text: 'Asiste al palo de salida y no juegues picas de apertura antes de que hayan sido rotas.',
        url: '#trick-play',
      },
      {
        name: 'Controlar el acumulo de bolsas',
        text: 'Vigila las bazas adicionales para evitar la penalización de 100 puntos cada 10 bolsas.',
        url: '#scoring',
      },
      {
        name: 'Dominar la estrategia de Nil',
        text: 'Apuesta cero bazas para sumar 100 puntos extra y coordina con tu pareja para defenderlo.',
        url: '#nil',
      },
      {
        name: 'Llevar la cuenta de triunfos',
        text: 'Lidera con palos secundarios para que tu compañero corte y arrastra las picas enemigas.',
        url: '#strategy',
      },
      {
        name: 'Cerrar la victoria a 500 puntos',
        text: 'Calcula las puntuaciones en el tramo final para cerrar la partida antes que los rivales.',
        url: '#scoring',
      },
    ],
  },
};
