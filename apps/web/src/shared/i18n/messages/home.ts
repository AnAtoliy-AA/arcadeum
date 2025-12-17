import { appConfig } from "../../config/app-config";
import type { HomeMessages, Locale } from "../types";

function withAppNamePlaceholder(value: string): string {
  const name = appConfig.appName;
  if (!value || !name || !value.includes(name)) {
    return value;
  }
  return value.split(name).join("{appName}");
}

export const homeMessages: Record<Locale, HomeMessages> = {
  en: {
    kicker: appConfig.kicker,
    tagline: withAppNamePlaceholder(appConfig.tagline),
    description: withAppNamePlaceholder(appConfig.description),
    primaryCtaLabel: appConfig.primaryCta.label,
    supportCtaLabel: appConfig.supportCta.label,
    downloadsTitle: appConfig.downloads.title,
    downloadsDescription: withAppNamePlaceholder(appConfig.downloads.description),
    downloadsIosLabel: appConfig.downloads.iosLabel,
    downloadsAndroidLabel: appConfig.downloads.androidLabel,
  },
  es: {
    kicker: "Arcade remoto para juegos de mesa",
    tagline: "{appName} es tu arcade remoto para pruebas rápidas de juegos de mesa.",
    description:
      "Crea salas en tiempo real, reúne a tu equipo de pruebas y deja que {appName} automatice reglas, puntuaciones y moderación para que te concentres en la diversión.",
    primaryCtaLabel: "Comenzar",
    supportCtaLabel: "Apoyar a los desarrolladores",
    downloadsTitle: "Instala las apps móviles",
    downloadsDescription:
      "Descarga las últimas compilaciones de Expo para iOS y Android directamente desde la web.",
    downloadsIosLabel: "Descargar para iOS",
    downloadsAndroidLabel: "Descargar para Android",
  },
  fr: {
    kicker: "Arcade à distance pour les jeux de société",
    tagline: "{appName} est votre arcade à distance pour des playtests rapides de jeux de société.",
    description:
      "Créez des salons en temps réel, rassemblez votre équipe de test et laissez {appName} automatiser règles, scores et modération pour que vous puissiez vous concentrer sur le plaisir.",
    primaryCtaLabel: "Commencer",
    supportCtaLabel: "Soutenir les développeurs",
    downloadsTitle: "Installer les applications mobiles",
    downloadsDescription:
      "Téléchargez les dernières versions Expo pour iOS et Android directement depuis le web.",
    downloadsIosLabel: "Télécharger pour iOS",
    downloadsAndroidLabel: "Télécharger pour Android",
  },
};
