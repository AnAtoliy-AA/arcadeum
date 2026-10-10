import { appConfig } from '@/shared/config/app-config';
import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'sea-battle-best-strategies-and-placements',
  locale: 'es',
  title:
    'Mejores estrategias y colocación de barcos en Batalla Naval (Hundir la Flota)',
  excerpt:
    'Descubre las mejores tácticas de colocación en cuadrícula 10×10, la regla de zonas muertas y el patrón de disparo en ajedrez para ganar online.',
  publishedAt: '2026-08-29',
  author: `Equipo ${appConfig.appName}`,
  tags: [
    'Batalla Naval',
    'Hundir la Flota',
    'Estrategia',
    'Colocación de barcos',
    'Juegos de mesa',
    'Battleship',
  ],
  readingTimeMinutes: 7,
  body: [
    {
      type: 'paragraph',
      text: 'Batalla Naval (Hundir la Flota) no es un simple juego de azar, sino un reto de deducción matemática y cálculo de probabilidades. Más del 80% de las partidas se deciden durante la colocación inicial de los barcos. En esta guía te enseñamos las configuraciones más sólidas y los algoritmos de disparo que marcan la diferencia.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Cuadrícula 10×10 y composición de la flota',
      id: 'cuadricula-y-flota',
    },
    {
      type: 'paragraph',
      text: 'El tablero estándar consta de una cuadrícula de 10×10 casillas (100 en total). Los barcos no pueden tocarse entre sí horizontal, vertical ni diagonalmente. Al hundir un barco, todas las casillas adyacentes quedan descartadas automáticamente.',
    },
    {
      type: 'list',
      items: [
        '1 Acorazado (4 casillas)',
        '2 Cruceros (3 casillas cada uno)',
        '3 Destructores (2 casillas cada uno)',
        '4 Submarinos / Lanchas (1 casilla cada uno)',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Las 4 mejores estrategias de colocación',
      id: 'estrategias-colocacion',
    },
    {
      type: 'list',
      items: [
        '1. La táctica del perímetro: ubicar los barcos grandes (3 y 4 casillas) pegados a los bordes exteriores ahorra espacio vital en el centro del tablero.',
        '2. Dispersión en diagonal: colocar los barcos en ejes diagonales paralelos dificulta que los barridos rectos del rival descubran varios objetivos.',
        '3. Distribución en 4 cuadrantes: dividir el tablero en cuatro zonas 5×5 y repartir la flota equilibradamente evita pérdidas en cadena.',
        '4. Sigilo con submarinos: concentrar las naves grandes en una zona y repartir los submarinos de 1 casilla en huecos aleatorios del centro para un final impredecible.',
      ],
    },
    {
      type: 'board-diagram',
      id: 'schema-shoreline-es',
      gameId: 'sea-battle',
      title: 'Esquema 1: Táctica del perímetro (Borde costero)',
      caption:
        'Pegar los barcos grandes a las orillas expulsa el 50% de las zonas muertas fuera del tablero y resguarda el centro.',
      grid: [
        'SSSS.SSS..',
        '..........',
        'S........S',
        'S..S.....S',
        'S.........',
        '.....S...S',
        '.........S',
        '..S.......',
        '......S..S',
        '.........S',
      ],
      legend: [
        { variant: 'ship', label: 'Barcos de la flota' },
        { variant: 'deadzone', label: 'Zonas de amortiguación' },
      ],
    },
    {
      type: 'board-diagram',
      id: 'schema-diagonal-es',
      gameId: 'sea-battle',
      title: 'Esquema 2: Dispersión en diagonal escalonada',
      caption:
        'La alineación diagonal evita que los barridos rectos del oponente conecten impactos en múltiples embarcaciones.',
      grid: [
        'SSSS......',
        '........SS',
        '..SSS.....',
        '..........',
        'S...SSS...',
        '..........',
        '..S...SS..',
        '..........',
        '....S...SS',
        '......S...',
      ],
      legend: [
        { variant: 'ship', label: 'Barcos de la flota' },
        { variant: 'deadzone', label: 'Zonas de amortiguación' },
      ],
    },
    {
      type: 'board-diagram',
      id: 'schema-quadrants-es',
      gameId: 'sea-battle',
      title: 'Esquema 3: Distribución balanceada en 4 cuadrantes',
      caption:
        'Dividir la flota en cuadrantes de 5×5 con unidades aisladas erradica las derrotas por agrupamiento masivo.',
      grid: [
        '......SSS.',
        'SSSS......',
        '......SS..',
        '...S......',
        '.........S',
        '..........',
        'SSS.S..SS.',
        '..........',
        '.SS.......',
        '......S...',
      ],
      legend: [
        { variant: 'ship', label: 'Barcos de la flota' },
        { variant: 'deadzone', label: 'Zonas de amortiguación' },
      ],
    },
    {
      type: 'board-diagram',
      id: 'schema-perelman-es',
      gameId: 'sea-battle',
      title: 'Esquema 4: Estrategia de Perelman y sigilo submarino',
      caption:
        'Agrupar naves pesadas en un margen deja los submarinos de una casilla diseminados por el centro sin pistas vecinas.',
      grid: [
        'S.........',
        'S.........',
        'S...S.....',
        'S......S..',
        '..........',
        'S...S.....',
        'S.....S..S',
        'S........S',
        '..........',
        'SSS.SS.SS.',
      ],
      legend: [
        { variant: 'ship', label: 'Barcos de la flota' },
        { variant: 'deadzone', label: 'Zonas de amortiguación' },
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Tácticas de disparo: búsqueda en ajedrez y caza de objetivos',
      id: 'tacticas-disparo',
    },
    {
      type: 'list',
      items: [
        'Búsqueda en ajedrez (Parity Search): disparar alternando casillas como en un tablero de ajedrez garantiza encontrar todos los barcos de 2 o más casillas ahorrando el 50% de los tiros.',
        'Fase de caza (Hunt-and-Target): al acertar un impacto, prueba las 4 casillas ortogonales y sigue la línea confirmada hasta hundir la nave.',
        'Zonas muertas: descarta inmediatamente las 8 casillas alrededor de un barco hundido.',
      ],
    },
    {
      type: 'board-diagram',
      id: 'schema-parity-search-es',
      gameId: 'sea-battle',
      title: 'Patrón de disparo: Red de ajedrez con 50% de ahorro',
      caption:
        'Disparar únicamente en casillas alternas garantiza detectar barcos multicasilla descartando 50 casillas enteras.',
      grid: [
        'M.M.M.M.M.',
        '.M.M.M.M.M',
        'M.M.M.H.M.',
        '.M.M.M.H.M',
        'M.M.M.H.M.',
        '.M.M.B.B.M',
        'M.M.M.M.M.',
        '.M.M.M.M.M',
        'M.M.M.M.M.',
        '.M.M.M.M.M',
      ],
      legend: [
        { variant: 'hit', label: 'Impacto directo' },
        { variant: 'miss', label: 'Disparo de prueba' },
        { variant: 'deadzone', label: 'Zona descartada' },
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'Juega online gratis con amigos o contra la IA',
      id: 'jugar-online',
    },
    {
      type: 'paragraph',
      text: `En ${appConfig.appName} puedes jugar gratis a Batalla Naval desde el navegador sin descargas ni registros. Crea una sala privada con enlace para retar a tus amigos o perfecciona tu técnica frente a bots con inteligencia artificial.`,
    },
    {
      type: 'cta',
      href: '/games/sea-battle',
      text: 'Jugar a Batalla Naval Online: Crear Sala',
      description:
        'Pon a prueba tus mejores colocaciones ahora: ¡juega gratis con amigos o contra el ordenador!',
    },
  ],
  faq: [
    {
      question: '¿Cuál es la mejor colocación en Batalla Naval?',
      answer:
        'La combinación de barcos grandes en el perímetro exterior con submarinos pequeños dispersos en el centro ofrece la mayor tasa de victoria.',
    },
    {
      question: '¿Cómo funciona la táctica de disparo en ajedrez?',
      answer:
        'Disparar a casillas alternas asegura impactar cualquier barco de 2 o más casillas en solo 50 disparos en lugar de 100.',
    },
    {
      question: '¿Se puede jugar con amigos gratis sin descargar nada?',
      answer: `Sí, en ${appConfig.appName} puedes crear una sala al instante y compartir el enlace con tus amigos para jugar directamente desde el navegador.`,
    },
  ],
};
