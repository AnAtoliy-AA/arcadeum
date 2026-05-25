import { appConfig } from '../../../config/app-config';
import type { DeepPartial } from '../../base-types';
import type { SeoMessages } from './en';

const APP = appConfig.appName;

export const es: DeepPartial<SeoMessages> = {
  home: {
    title: `${APP} — Juega gratis a juegos de mesa en línea con amigos`,
    description: `Juega gratis a juegos de mesa en línea con amigos en ${APP}. Battleship, estrategia y cartas — crea una sala, comparte el enlace y juega en tu navegador. Sin descarga, sin registro.`,
  },
  games: {
    title: `Juegos de mesa gratis en línea · ${APP}`,
    description: `Explora el catálogo de ${APP} con juegos de mesa gratis en línea. Encuentra salas abiertas, crea una partida privada con amigos o juega contra la IA — todo en tu navegador, sin descarga.`,
  },
  gameCreate: {
    title: `Crear una sala · ${APP}`,
    description: `Configura una nueva sala pública o privada en ${APP}. Elige un juego, selecciona una variante e invita a tus amigos a jugar en segundos.`,
  },
  gameRoom: {
    title: `Sala de juego · ${APP}`,
    description: `Únete a una sala en vivo en ${APP}, toma asiento y empieza a jugar — o conviértete en espectador.`,
  },
  criticalLanding: {
    title: `Critical · Juego de cartas explosivo gratis en línea · ${APP}`,
    description: `Juega gratis a Critical en línea en ${APP} — un juego de cartas estratégico donde robas, desactivas y sobrevives a la explosión. 2–5 jugadores, IA, mazos temáticos. Sin descarga, sin registro.`,
  },
  glimwormLanding: {
    title: `Glimworm · Juego de serpientes en arena gratis · ${APP}`,
    description: `Juega gratis a Glimworm en línea en ${APP} — un juego de arena de gusanos luminosos en tiempo real para hasta 10 jugadores. Desliza, sobrevive, come las luces. Desde el navegador, sin descarga.`,
  },
  seaBattleLanding: {
    title: `Batalla naval en línea · Juega Battleship gratis · ${APP}`,
    description: `Juega Batalla Naval (Battleship) en línea gratis en ${APP}. Partida rápida contra un bot, busca un oponente humano o invita amigos a una partida privada.`,
  },
  settings: {
    title: `Ajustes · ${APP}`,
    description: `Personaliza tu experiencia en ${APP}: apariencia, tema, idioma y preferencias de descarga.`,
  },
  history: {
    title: `Historial de partidas · ${APP}`,
    description: `Revisa tus partidas anteriores en ${APP}, repite sesiones y vuelve a vivir los resultados con amigos.`,
  },
  stats: {
    title: `Estadísticas del jugador · ${APP}`,
    description: `Sigue tus estadísticas en ${APP}: partidas jugadas, victorias, derrotas y progresión en cada juego.`,
  },
  referrals: {
    title: `Invita a amigos · Recompensas por referidos · ${APP}`,
    description: `Invita a tus amigos a ${APP} y gana recompensas por referidos. Comparte tu enlace y desbloquea ventajas cosméticas.`,
  },
  leaderboards: {
    title: `Clasificaciones · ${APP}`,
    description: `Descubre quién lidera cada modo de juego en ${APP}. Escala el ranking y compite con tus amigos.`,
  },
  tournaments: {
    title: `Torneos · ${APP}`,
    description: `Compite en torneos programados en ${APP}, sigue los brackets en vivo y descubre los próximos eventos.`,
  },
  rewards: {
    title: `Recompensas diarias · ${APP}`,
    description: `Reclama recompensas diarias en ${APP}: gana monedas, sellos y cosméticos simplemente por pasar cada día.`,
  },
  wallet: {
    title: `Cartera y saldo · ${APP}`,
    description: `Gestiona tu cartera de ${APP}: consulta tu saldo de monedas, el historial de transacciones y tu inventario cosmético.`,
  },
  shop: {
    title: `Tienda · Cosméticos y mejoras · ${APP}`,
    description: `Explora la tienda de ${APP}: desbloquea avatares, insignias, colores de nombre y packs para personalizar tu perfil.`,
  },
  payment: {
    title: `Pago · ${APP}`,
    description: `Recarga tu saldo en ${APP} de forma segura o compra una suscripción. Procesado por proveedores de pago de confianza.`,
  },
  paymentSuccess: {
    title: `Pago exitoso · ${APP}`,
    description: `Tu pago en ${APP} se ha completado correctamente. Tu saldo se ha actualizado y puedes volver a jugar.`,
  },
  paymentCancel: {
    title: `Pago cancelado · ${APP}`,
    description: `Tu pago en ${APP} fue cancelado. No se realizaron cargos; puedes intentarlo de nuevo cuando quieras.`,
  },
  notes: {
    title: `Mensajes de la comunidad · ${APP}`,
    description: `Lee los mensajes de apoyo de la comunidad de ${APP} — y añade el tuyo si has contribuido al proyecto.`,
  },
  chats: {
    title: `Chats · ${APP}`,
    description: `Continúa tus conversaciones en ${APP}: envía mensajes a amigos, organiza partidas y mantén la charla entre juegos.`,
  },
  chat: {
    title: `Chat · ${APP}`,
    description: `Mensajería directa en ${APP}: habla con amigos, coordina partidas y comparte notas rápidas.`,
  },
  auth: {
    title: `Iniciar sesión · ${APP}`,
    description: `Inicia sesión en ${APP} o crea una cuenta para unirte a partidas, seguir tu progreso y chatear con amigos.`,
  },
  support: {
    title: `Soporte · ${APP}`,
    description: `¿Necesitas ayuda con ${APP}? Consulta las preguntas frecuentes, contacta a nuestro equipo o apoya el proyecto.`,
  },
  contact: {
    title: `Contáctanos · ${APP}`,
    description: `¿Tienes comentarios, un reporte de error o una idea de colaboración? Contacta al equipo de ${APP}: leemos cada mensaje.`,
  },
  help: {
    title: `Centro de ayuda · ${APP}`,
    description: `Explora el centro de ayuda de ${APP} con guías sobre cuentas, juegos y solución de problemas.`,
  },
  terms: {
    title: `Términos del servicio · ${APP}`,
    description: `Consulta los términos del servicio que rigen el uso de la plataforma ${APP}.`,
  },
  privacy: {
    title: `Política de privacidad · ${APP}`,
    description: `Descubre cómo ${APP} recopila, utiliza y protege tus datos personales, explicado en lenguaje claro.`,
  },
  cookies: {
    title: `Política de cookies · ${APP}`,
    description: `Cómo usa ${APP} las cookies y tecnologías similares, y cómo puedes controlarlas.`,
  },
  blog: {
    title: `Blog · ${APP}`,
    description: `Novedades, notas internas y análisis de funciones del equipo de ${APP}.`,
  },
  community: {
    title: `Comunidad · ${APP}`,
    description: `Únete a la comunidad de ${APP}: Discord, Telegram y nuestros canales para jugadores y patrocinadores.`,
  },
  developers: {
    title: `Desarrolladores · ${APP}`,
    description: `Conoce al equipo que está construyendo ${APP} y descubre cómo participar.`,
  },
  admin: {
    title: `Admin · ${APP}`,
    description: `Controles administrativos de ${APP}.`,
  },
  playerProfile: {
    title: `Perfil del jugador · ${APP}`,
    description: `Consulta el rango, las estadísticas y las partidas recientes de este jugador en ${APP}.`,
  },
  notFound: {
    title: `Página no encontrada · ${APP}`,
    description: `La página que buscas no existe en ${APP}. Explora nuestros juegos o vuelve al inicio.`,
  },
};
