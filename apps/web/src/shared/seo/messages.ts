import { appConfig } from '@/shared/config/app-config';
import { DEFAULT_LOCALE, type Locale } from '@/shared/i18n/types';

/**
 * Per-locale SEO copy. Kept in a single typed file so translations stay
 * in sync across locales and the schema is enforced at compile time.
 *
 * Title rules: omit the brand suffix — Next.js's metadata `template`
 * appends ` | <AppName>` automatically.
 * Description rules: 50–160 characters, plain text, no quotation marks.
 */

const APP = appConfig.appName;

type SeoEntry = { title: string; description: string };

export type SeoPageKey =
  | 'home'
  | 'games'
  | 'blog'
  | 'community'
  | 'developers'
  | 'help'
  | 'tournaments'
  | 'leaderboards'
  | 'rewards'
  | 'notes'
  | 'support'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'cookies';

type SeoMessages = Record<SeoPageKey, SeoEntry>;

const en: SeoMessages = {
  home: {
    title: `${APP} — Play Board Games Online`,
    description: `Play the best board games online with friends on ${APP}. Create private rooms, automate rules, and enjoy a premium tabletop experience in your browser. No registration required.`,
  },
  games: {
    title: 'Games',
    description: `Browse the full library of board games on ${APP}. Join an open room, create a private game, or queue with friends — no install required.`,
  },
  blog: {
    title: 'Blog',
    description: `Latest news, deep-dives, and design notes from the ${APP} team — what we're building and why.`,
  },
  community: {
    title: 'Community',
    description: `Join the ${APP} community — find groups, threads, and tournaments, and connect with other players.`,
  },
  developers: {
    title: 'Developers',
    description: `API documentation, SDKs, and integration guides for building on the ${APP} platform.`,
  },
  help: {
    title: 'Help Center',
    description: `Answers to common questions, troubleshooting steps, and platform guides for ${APP}.`,
  },
  tournaments: {
    title: 'Tournaments',
    description: `Join competitive board game tournaments on ${APP} — compete for rewards, climb the bracket, and play with friends.`,
  },
  leaderboards: {
    title: 'Leaderboards',
    description: `See the top-ranked players on ${APP} — global, weekly, and per-game leaderboards updated in real time.`,
  },
  rewards: {
    title: 'Rewards',
    description: `Earn cosmetic badges, early access decks, and exclusive perks on ${APP} by playing and inviting friends.`,
  },
  notes: {
    title: 'Patch Notes',
    description: `Release notes and platform changes for ${APP} — new games, balance updates, fixes, and improvements.`,
  },
  support: {
    title: 'Support the developers',
    description: `Keep ${APP} iterating quickly and accessible to the tabletop community. Sponsor, contribute, or star the repo.`,
  },
  contact: {
    title: 'Contact us',
    description: `Get in touch with the ${APP} team — support, partnerships, press, and feedback.`,
  },
  privacy: {
    title: 'Privacy Policy',
    description: `Read the ${APP} privacy policy: what data we collect, why we collect it, and how we keep it safe.`,
  },
  terms: {
    title: 'Terms of Service',
    description: `The terms and conditions for using ${APP}: account rules, acceptable use, payments, and legal notices.`,
  },
  cookies: {
    title: 'Cookie Policy',
    description: `How ${APP} uses cookies and similar technologies to keep you signed in, remember preferences, and improve the experience.`,
  },
};

const es: SeoMessages = {
  home: {
    title: `${APP} — Juega a juegos de mesa online`,
    description: `Juega a los mejores juegos de mesa online con amigos en ${APP}. Crea salas privadas, automatiza las reglas y disfruta de una experiencia premium en tu navegador. Sin registro.`,
  },
  games: {
    title: 'Juegos',
    description: `Explora toda la biblioteca de juegos de mesa de ${APP}. Únete a una sala abierta, crea una partida privada o juega con amigos — sin instalación.`,
  },
  blog: {
    title: 'Blog',
    description: `Últimas noticias, análisis y notas de diseño del equipo de ${APP} — qué construimos y por qué.`,
  },
  community: {
    title: 'Comunidad',
    description: `Únete a la comunidad de ${APP} — encuentra grupos, hilos y torneos, y conecta con otros jugadores.`,
  },
  developers: {
    title: 'Desarrolladores',
    description: `Documentación de API, SDKs y guías de integración para construir sobre la plataforma ${APP}.`,
  },
  help: {
    title: 'Centro de ayuda',
    description: `Respuestas a preguntas frecuentes, pasos de resolución de problemas y guías de la plataforma ${APP}.`,
  },
  tournaments: {
    title: 'Torneos',
    description: `Participa en torneos competitivos de juegos de mesa en ${APP} — compite por premios, sube en el ranking y juega con amigos.`,
  },
  leaderboards: {
    title: 'Clasificaciones',
    description: `Consulta a los mejores jugadores de ${APP} — clasificaciones globales, semanales y por juego, actualizadas en tiempo real.`,
  },
  rewards: {
    title: 'Recompensas',
    description: `Gana insignias cosméticas, acceso anticipado a mazos y ventajas exclusivas en ${APP} jugando e invitando amigos.`,
  },
  notes: {
    title: 'Notas de versión',
    description: `Notas de lanzamiento y cambios en ${APP} — nuevos juegos, ajustes de equilibrio, correcciones y mejoras.`,
  },
  support: {
    title: 'Apoya a los desarrolladores',
    description: `Mantén ${APP} en evolución y accesible para la comunidad. Patrocina, contribuye o destaca el repositorio.`,
  },
  contact: {
    title: 'Contacto',
    description: `Ponte en contacto con el equipo de ${APP} — soporte, colaboraciones, prensa y feedback.`,
  },
  privacy: {
    title: 'Política de privacidad',
    description: `Lee la política de privacidad de ${APP}: qué datos recopilamos, por qué y cómo los protegemos.`,
  },
  terms: {
    title: 'Términos de servicio',
    description: `Condiciones de uso de ${APP}: reglas de cuenta, uso aceptable, pagos y avisos legales.`,
  },
  cookies: {
    title: 'Política de cookies',
    description: `Cómo ${APP} usa cookies y tecnologías similares para mantenerte conectado, recordar preferencias y mejorar la experiencia.`,
  },
};

const fr: SeoMessages = {
  home: {
    title: `${APP} — Jouez aux jeux de société en ligne`,
    description: `Jouez aux meilleurs jeux de société en ligne avec vos amis sur ${APP}. Créez des salons privés, automatisez les règles, profitez d'une expérience premium dans votre navigateur. Sans inscription.`,
  },
  games: {
    title: 'Jeux',
    description: `Parcourez toute la bibliothèque de jeux de société de ${APP}. Rejoignez un salon ouvert, créez une partie privée ou jouez avec des amis — sans installation.`,
  },
  blog: {
    title: 'Blog',
    description: `Dernières actualités, analyses et notes de conception de l'équipe ${APP} — ce que nous construisons et pourquoi.`,
  },
  community: {
    title: 'Communauté',
    description: `Rejoignez la communauté ${APP} — trouvez des groupes, des discussions et des tournois, et rencontrez d'autres joueurs.`,
  },
  developers: {
    title: 'Développeurs',
    description: `Documentation API, SDK et guides d'intégration pour construire sur la plateforme ${APP}.`,
  },
  help: {
    title: 'Centre d’aide',
    description: `Réponses aux questions fréquentes, dépannage et guides de la plateforme ${APP}.`,
  },
  tournaments: {
    title: 'Tournois',
    description: `Participez à des tournois de jeux de société sur ${APP} — gagnez des récompenses, montez dans le classement et jouez avec des amis.`,
  },
  leaderboards: {
    title: 'Classements',
    description: `Découvrez les meilleurs joueurs de ${APP} — classements mondiaux, hebdomadaires et par jeu, mis à jour en temps réel.`,
  },
  rewards: {
    title: 'Récompenses',
    description: `Gagnez des badges cosmétiques, un accès anticipé aux nouveaux jeux et des avantages exclusifs sur ${APP} en jouant et en invitant des amis.`,
  },
  notes: {
    title: 'Notes de version',
    description: `Notes de version et changements de la plateforme ${APP} — nouveaux jeux, équilibrages, corrections et améliorations.`,
  },
  support: {
    title: 'Soutenez les développeurs',
    description: `Aidez ${APP} à évoluer rapidement et à rester accessible à la communauté. Parrainez, contribuez ou marquez le dépôt.`,
  },
  contact: {
    title: 'Contact',
    description: `Contactez l'équipe ${APP} — support, partenariats, presse et retours.`,
  },
  privacy: {
    title: 'Politique de confidentialité',
    description: `Lisez la politique de confidentialité de ${APP} : quelles données nous collectons, pourquoi, et comment nous les protégeons.`,
  },
  terms: {
    title: 'Conditions d’utilisation',
    description: `Conditions d'utilisation de ${APP} : règles de compte, usage acceptable, paiements et mentions légales.`,
  },
  cookies: {
    title: 'Politique de cookies',
    description: `Comment ${APP} utilise les cookies et technologies similaires pour vous garder connecté, mémoriser vos préférences et améliorer l'expérience.`,
  },
};

const ru: SeoMessages = {
  home: {
    title: `${APP} — Играйте в настольные игры онлайн`,
    description: `Играйте в лучшие настольные игры онлайн с друзьями на ${APP}. Создавайте приватные комнаты, автоматизируйте правила и наслаждайтесь премиум-опытом в браузере. Без регистрации.`,
  },
  games: {
    title: 'Игры',
    description: `Изучите полную библиотеку настольных игр на ${APP}. Присоединяйтесь к открытой комнате, создайте приватную игру или играйте с друзьями — без установки.`,
  },
  blog: {
    title: 'Блог',
    description: `Свежие новости, разборы и заметки о дизайне от команды ${APP} — что мы создаём и почему.`,
  },
  community: {
    title: 'Сообщество',
    description: `Присоединяйтесь к сообществу ${APP} — находите группы, обсуждения и турниры, общайтесь с другими игроками.`,
  },
  developers: {
    title: 'Разработчикам',
    description: `Документация API, SDK и руководства по интеграции для разработки на платформе ${APP}.`,
  },
  help: {
    title: 'Центр помощи',
    description: `Ответы на частые вопросы, инструкции по устранению неполадок и руководства по платформе ${APP}.`,
  },
  tournaments: {
    title: 'Турниры',
    description: `Участвуйте в соревновательных турнирах по настольным играм на ${APP} — боритесь за награды, поднимайтесь по сетке и играйте с друзьями.`,
  },
  leaderboards: {
    title: 'Таблицы лидеров',
    description: `Смотрите лучших игроков ${APP} — глобальные, еженедельные и пожанровые таблицы лидеров, обновляются в реальном времени.`,
  },
  rewards: {
    title: 'Награды',
    description: `Получайте косметические значки, ранний доступ к колодам и эксклюзивные бонусы на ${APP}, играя и приглашая друзей.`,
  },
  notes: {
    title: 'История обновлений',
    description: `Заметки о релизах и изменениях ${APP} — новые игры, балансовые правки, исправления и улучшения.`,
  },
  support: {
    title: 'Поддержите разработчиков',
    description: `Помогите ${APP} быстро развиваться и оставаться доступным для сообщества. Спонсируйте, делайте взносы или поставьте звезду репозиторию.`,
  },
  contact: {
    title: 'Контакты',
    description: `Свяжитесь с командой ${APP} — поддержка, партнёрства, пресса и обратная связь.`,
  },
  privacy: {
    title: 'Политика конфиденциальности',
    description: `Политика конфиденциальности ${APP}: какие данные мы собираем, зачем и как мы их защищаем.`,
  },
  terms: {
    title: 'Условия использования',
    description: `Условия использования ${APP}: правила аккаунта, допустимое использование, оплата и юридические уведомления.`,
  },
  cookies: {
    title: 'Политика cookie',
    description: `Как ${APP} использует cookie и аналогичные технологии, чтобы вы оставались в системе, помнить настройки и улучшать опыт.`,
  },
};

const by: SeoMessages = {
  home: {
    title: `${APP} — Гуляйце ў настольныя гульні анлайн`,
    description: `Гуляйце ў лепшыя настольныя гульні анлайн з сябрамі на ${APP}. Стварайце прыватныя пакоі, аўтаматызуйце правілы і атрымлівайце прэміяльны досвед у браўзеры. Без рэгістрацыі.`,
  },
  games: {
    title: 'Гульні',
    description: `Прагляньце ўсю бібліятэку настольных гульняў ${APP}. Далучайцеся да адкрытага пакоя, стварыце прыватную гульню або гуляйце з сябрамі — без устаноўкі.`,
  },
  blog: {
    title: 'Блог',
    description: `Апошнія навіны, разборы і нататкі ад каманды ${APP} — што мы будуем і чаму.`,
  },
  community: {
    title: 'Супольнасць',
    description: `Далучайцеся да супольнасці ${APP} — знайдзіце групы, тэмы і турніры, знаёмцеся з іншымі гульцамі.`,
  },
  developers: {
    title: 'Распрацоўшчыкам',
    description: `Дакументацыя API, SDK і кіраўніцтвы па інтэграцыі для распрацоўкі на платформе ${APP}.`,
  },
  help: {
    title: 'Цэнтр дапамогі',
    description: `Адказы на частыя пытанні, парады па выпраўленні непаладак і кіраўніцтвы па платформе ${APP}.`,
  },
  tournaments: {
    title: 'Турніры',
    description: `Удзельнічайце ў спаборніцкіх турнірах па настольных гульнях на ${APP} — бярыце ўзнагароды, падымайцеся ў сетцы і гуляйце з сябрамі.`,
  },
  leaderboards: {
    title: 'Табліцы лідараў',
    description: `Глядзіце лепшых гульцоў ${APP} — глабальныя, штотыднёвыя і пагульнявыя табліцы лідараў, абнаўляюцца ў рэальным часе.`,
  },
  rewards: {
    title: 'Узнагароды',
    description: `Атрымлівайце касметычныя значкі, ранні доступ да калод і эксклюзіўныя бонусы на ${APP}, гуляючы і запрашаючы сяброў.`,
  },
  notes: {
    title: 'Гісторыя абнаўленняў',
    description: `Нататкі пра рэлізы і змены ${APP} — новыя гульні, баланс, выпраўленні і паляпшэнні.`,
  },
  support: {
    title: 'Падтрымайце распрацоўшчыкаў',
    description: `Дапамажыце ${APP} хутка развівацца і заставацца даступным супольнасці. Падтрымайце, унясіце ўклад або пастаўце зорку рэпазіторыю.`,
  },
  contact: {
    title: 'Кантакты',
    description: `Звяжыцеся з камандай ${APP} — падтрымка, партнёрствы, прэса і водгукі.`,
  },
  privacy: {
    title: 'Палітыка прыватнасці',
    description: `Палітыка прыватнасці ${APP}: якія дадзеныя мы збіраем, навошта і як абараняем іх.`,
  },
  terms: {
    title: 'Умовы выкарыстання',
    description: `Умовы выкарыстання ${APP}: правілы акаўнта, дапушчальнае выкарыстанне, аплата і юрыдычныя паведамленні.`,
  },
  cookies: {
    title: 'Палітыка cookie',
    description: `Як ${APP} выкарыстоўвае cookie і аналагічныя тэхналогіі, каб вы заставаліся ў сістэме, памятаць налады і паляпшаць досвед.`,
  },
};

const SEO_MESSAGES: Record<Locale, SeoMessages> = { en, es, fr, ru, by };

/**
 * Returns SEO copy for a given page in the active locale, with English
 * fallback if a translation is missing for any reason.
 */
export function getSeoMessages(locale: Locale, key: SeoPageKey): SeoEntry {
  return SEO_MESSAGES[locale]?.[key] ?? SEO_MESSAGES[DEFAULT_LOCALE][key];
}
