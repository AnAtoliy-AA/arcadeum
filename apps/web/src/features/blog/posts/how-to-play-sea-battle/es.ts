import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'how-to-play-sea-battle',
  locale: 'es',
  title:
    'Cómo jugar a Batalla Naval (Battleship) en línea — Reglas, colocación y estrategia',
  excerpt:
    'Guía completa para principiantes: reglas oficiales, colocación de la flota, búsqueda hunt-and-target y los hábitos que distinguen a un jugador casual del almirante que hunde primero.',
  publishedAt: '2026-05-21',
  author: 'Equipo Arcadeum',
  tags: ['Batalla Naval', 'Battleship', 'Cómo jugar', 'Estrategia', 'Tutorial'],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Batalla Naval — conocida internacionalmente como Battleship — es uno de los juegos de estrategia con cuadrícula más antiguos que sigue activo. Dos rivales colocan en secreto una flota en una cuadrícula de 10×10 y se turnan disparando a coordenadas del tablero contrario. Gana quien hunde toda la flota enemiga primero. Las reglas se enseñan en dos minutos, pero unos pocos hábitos pequeños separan al jugador casual del almirante que hunde primero. Esta guía cubre las reglas oficiales, la flota estándar y las estrategias de colocación y búsqueda que realmente ganan partidas — todo orientado a jugar Batalla Naval en línea.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Preparación: la cuadrícula 10×10 y la flota estándar',
      id: 'setup',
    },
    {
      type: 'paragraph',
      text: 'Cada jugador tiene dos cuadrículas de 10×10: una Cuadrícula Océano donde coloca su flota, y una Cuadrícula Objetivo donde marca aciertos y fallos del rival. Las columnas son A–J y las filas 1–10, así cualquier celda se nombra como B7 o J3. La flota canónica son cinco barcos: un Portaaviones (5 celdas), un Acorazado (4), un Crucero (3), un Submarino (3) y un Destructor (2) — 17 celdas en total sobre 100 disponibles.',
    },
    {
      type: 'paragraph',
      text: 'Los barcos se colocan ortogonalmente — en línea recta, horizontal o vertical — sin solaparse. Si pueden o no tocarse en los bordes es la variante doméstica más habitual: en torneos no se permite, en partidas casuales sí. Acuerda la convención con el rival antes del primer disparo. En la implementación de Arcadeum hay un selector para escoger la regla.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cómo funciona un turno',
      id: 'turn',
    },
    {
      type: 'paragraph',
      text: 'En tu turno cantas una coordenada (por ejemplo F6). El rival mira su cuadrícula, declara "tocado" o "agua", y marca la celda. Tú marcas la misma coordenada en tu Cuadrícula Objetivo — rojo para tocado, blanco para agua — y vas construyendo un mapa de dónde debe estar la flota enemiga. Cuando todas las celdas de un barco están tocadas, el propietario anuncia el hundimiento ("Has hundido mi Crucero"), información clave porque confirma que las celdas vecinas son seguras y puedes ignorarlas.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Colocación: tres hábitos para empezar',
      id: 'placement',
    },
    {
      type: 'list',
      items: [
        'Reparte, no agrupes. Pon cada barco en su propio cuadrante cuando puedas. Las flotas agrupadas se desploman — un solo acierto con suerte entrega dos o tres hundimientos seguidos.',
        'Evita los bordes. Pegar la flota al borde parece seguro, pero los rivales experimentados barren el perímetro primero porque los barcos pegados al borde tienen menos direcciones de escape. Despégalos uno o dos celdas.',
        'Mezcla orientaciones. Si los cinco barcos van horizontales, una búsqueda vertical los recorre todos. Rota al menos dos para que ningún patrón único de búsqueda cubra toda la flota.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Búsqueda: ajedrez primero, luego hunt-and-target',
      id: 'search',
    },
    {
      type: 'paragraph',
      text: 'Hasta lograr el primer tocado, estás buscando. El patrón más eficiente es un tablero de ajedrez — dispara a celdas alternas. El barco más corto mide dos celdas, así que el patrón en ajedrez garantiza que tarde o temprano tocarás cualquier barco sin barrer todas las celdas. Reduce a la mitad las celdas que necesitas probar antes del primer acierto.',
    },
    {
      type: 'paragraph',
      text: 'Tras el primer tocado, pasa a hunt-and-target. Dispara a las cuatro celdas adyacentes hasta encontrar otro tocado y, una vez identificada la línea, continúa hasta el hundimiento. En cuanto se hunde el barco, vuelve al patrón de ajedrez — ahora sabes que las celdas alrededor del barco hundido también están a salvo.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Sigue los fallos, no solo los tocados',
      id: 'misses',
    },
    {
      type: 'paragraph',
      text: 'Los fallos son información. Cada fallo te dice que esa celda no tiene barco y reduce el espacio de búsqueda restante. A mitad de partida, los huecos de fallos suelen perfilar las zonas donde tienen que estar los barcos restantes. Las implementaciones online muestran los fallos permanentemente, pero el principio es el mismo: cada disparo produce información accionable para el siguiente.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Variantes comunes en línea',
      id: 'variants',
    },
    {
      type: 'list',
      items: [
        'Salva. Disparas tantos tiros por turno como barcos te queden, todos a la vez. Acelera mucho el final de partida.',
        'Modo equipo. 2v2 o más, con cuadrículas compartidas y chat de equipo. La coordinación pasa a ser la habilidad dominante.',
        'Barcos ocultos. Los hundimientos no se anuncian — solo sabes que has ganado al tocar la última celda. Muy duro pero gratificante.',
        'Tableros temáticos. Reskins visuales (mapas antiguos, neón cyberpunk, espacio profundo). Las reglas no cambian.',
      ],
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Juega a Batalla Naval en línea — gratis, desde el navegador',
      description:
        'Abre una sala, comparte el enlace con amigos o llena los asientos con bots de IA. Todas las variantes están disponibles.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Resumen — los cuatro hábitos que ganan partidas',
      id: 'tldr',
    },
    {
      type: 'list',
      items: [
        'Coloca los barcos lejos de los bordes y en cuadrantes distintos.',
        'Busca en patrón de ajedrez hasta el primer tocado.',
        'Tras un tocado, hunt-and-target en la línea hasta el hundimiento; vuelve al ajedrez después.',
        'Sigue los fallos con la misma atención que los tocados — te dicen dónde no están los barcos.',
      ],
    },
    {
      type: 'paragraph',
      text: 'Batalla Naval es un juego donde los hábitos pequeños y constantes se acumulan en una ventaja real. Las reglas son lo bastante antiguas para que no haya estrategia secreta — pero los cuatro hábitos de arriba son robustos: un jugador que los aplique todos superará a uno que no aplique ninguno, una y otra vez. Juega unas rondas, mide tus mejoras y ajusta.',
    },
  ],
};
