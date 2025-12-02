import type { TranslationMap } from '../types';

export const welcomeMessages = {
  en: {
    seoTitle: '{{appName}} · Remote-friendly arcade for tabletop playtests',
    seoDescription: 'Spin up real-time rooms, rally your playtest crew, and let {{appName}} automate rules, scoring, and moderation so you can focus on the fun.',
    tagline: '{{appName}} is your remote-friendly arcade for fast tabletop playtests.',
    description: 'Spin up real-time rooms, rally your playtest crew, and let {{appName}} automate rules, scoring, and moderation so you can focus on the fun.',
    supportCta: 'Support the developers',
    downloadTitle: 'Install the mobile builds',
    downloadDescription: 'Grab the latest Expo builds for iOS and Android directly from the web app.'
  },
  es: {
    seoTitle: '{{appName}} · Arcade remoto para playtests de mesa',
    seoDescription: 'Lanza salas en tiempo real, reúne a tu equipo de pruebas y deja que {{appName}} automatice reglas, puntuaciones y moderación para que te concentres en la diversión.',
    tagline: '{{appName}} es tu arcade remoto para playtests de mesa rápidos.',
    description: 'Lanza salas en tiempo real, reúne a tu equipo de pruebas y deja que {{appName}} automatice reglas, puntuaciones y moderación para que te concentres en la diversión.',
    supportCta: 'Apoyar al equipo',
    downloadTitle: 'Instala las versiones móviles',
    downloadDescription: 'Descarga las últimas compilaciones de Expo para iOS y Android directamente desde la app web.'
  },
  fr: {
    seoTitle: "{{appName}} · Arcade à distance pour playtests de jeux de société",
    seoDescription: 'Crée des salles en temps réel, rassemble ton équipe de test et laisse {{appName}} automatiser règles, score et modération pour te concentrer sur le fun.',
    tagline: '{{appName}} est ton arcade connecté pour des playtests de plateau express.',
    description: 'Crée des salles en temps réel, rassemble ton équipe de test et laisse {{appName}} automatiser règles, score et modération pour te concentrer sur le fun.',
    supportCta: "Soutenir l'équipe",
    downloadTitle: 'Installez les versions mobiles',
    downloadDescription: "Téléchargez les dernières compilations Expo pour iOS et Android directement depuis l'application web."
  }
} as const satisfies TranslationMap;