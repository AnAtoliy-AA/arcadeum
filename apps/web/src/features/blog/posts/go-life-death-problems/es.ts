import type { BlogPost } from '../../types';

export const post: BlogPost = {
  slug: 'go-life-death-problems',
  locale: 'es',
  title: 'Problemas de Vida y Muerte en Go — 10 Formas Esenciales',
  excerpt:
    'La vida y la muerte son la base del Go. Domina el grupo-L en esquina, cuatro rectos y curvos, L+1, cabeza de buey, nakade, seki y la regla del miai con ejemplos concretos.',
  publishedAt: '2026-09-10',
  author: 'Equipo Arcadeum',
  tags: ['Go', 'Problemas', 'Vida y Muerte', 'Táctica', 'Avanzado'],
  readingTimeMinutes: 12,
  body: [
    {
      type: 'paragraph',
      text: 'Si quieres mejorar rápidamente en Go, resuelve problemas de vida y muerte. La vida y la muerte son el nivel básico en el que se ganan y se pierden las partidas. Reconocer instantáneamente grupos vivos y muertos ahorra tiempo de pensamiento y te permite concentrarte en la planificación territorial y estratégica.',
    },
    {
      type: 'heading',
      level: 2,
      text: '1. Grupo-L en esquina — la forma muerta más famosa',
      id: 'l-group',
    },
    {
      type: 'paragraph',
      text: 'El grupo-L en esquina — cinco piedras en forma de L en la esquina del tablero — está MUERTO bajo ataque. Solo hay un espacio de ojo real dentro. El atacante juega en el "punto crítico" (sacrificio) que destruye ambos ojos potenciales. Importante: el grupo-L VIVE si se le permite capturar la piedra de la esquina, convirtiéndolo en "cuatro curvo".',
    },
    {
      type: 'heading',
      level: 2,
      text: '2. Nakade — matar desde dentro',
      id: 'nakade',
    },
    {
      type: 'paragraph',
      text: 'Nakade es un movimiento dentro del espacio vital que destruye la capacidad de un grupo de formar dos ojos. El punto clave: el "centro de vida" — la posición que priva al grupo de ambos ojos. Para un grupo 3×1 (tres recto): juega en el punto central. Para la "forma en T": juega en el centro de la T. Regla: una forma con puntos interiores impares sin nakade está viva; con puntos interiores iguales puede morir por nakade.',
    },
    {
      type: 'heading',
      level: 2,
      text: '3. Seki — vida mutua sin ojos',
      id: 'seki',
    },
    {
      type: 'paragraph',
      text: 'Seki es una posición en la que ambos bandos viven sin tener dos ojos propios. Ningún jugador quiere jugar dentro porque eso mataría su propio grupo. Ambos grupos viven — seki — y ningún jugador obtiene puntos por el espacio interior.',
    },
    {
      type: 'heading',
      level: 2,
      text: '4. Miai — correspondencia mutua de movimientos',
      id: 'miai',
    },
    {
      type: 'list',
      items: [
        'Si hay dos puntos, y ocupar cualquiera de ellos garantiza la vida, eso es miai.',
        'Un grupo con miai siempre vive: si el oponente ocupa un punto, tú ocupas el otro.',
        'Miai es también un concepto estratégico: dos movimientos de igual valor significan que solo necesitas uno.',
        'Usa miai al evaluar grupos: no necesitas calcular muchos movimientos si puedes identificar miai.',
      ],
    },
    {
      type: 'cta',
      href: '/games/go',
      text: 'Aplica el conocimiento de formas — juega Go en Arcadeum',
      description:
        'Go en diferentes tamaños de tablero — desde 9×9 para principiantes hasta 19×19.',
    },
  ],
  faq: [
    {
      question: '¿Cuándo verificar vida y muerte durante una partida?',
      answer:
        'Cada vez que un grupo sea atacado o cuando estés atacando un grupo. No juegues un movimiento de soporte en un grupo irremediablemente muerto — es una pérdida de tempo. Primero evalúa si el grupo vive o no.',
    },
    {
      question: '¿Qué es la "regla de los dos ojos"?',
      answer:
        'Un grupo vive incondicionalmente si tiene dos o más espacios separados (ojos), cada uno imposible de ocupar por el oponente. Un grupo con un solo ojo o ninguno puede ser capturado.',
    },
  ],
};
