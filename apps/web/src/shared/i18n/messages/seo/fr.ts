import { appConfig } from '../../../config/app-config';
import type { DeepPartial } from '../../base-types';
import type { SeoMessages } from './en';

const APP = appConfig.appName;

export const fr: DeepPartial<SeoMessages> = {
  home: {
    title: `${APP} — Jouez à des jeux de société en ligne entre amis`,
    description: `Jouez aux grands classiques des jeux de société en ligne sur ${APP}. Créez des salons, invitez vos amis et profitez d'une expérience temps réel soignée, directement dans votre navigateur.`,
  },
  games: {
    title: `Parcourir les jeux · ${APP}`,
    description: `Explorez tout le catalogue de jeux de société en ligne de ${APP}. Filtrez par statut et participation, trouvez des salons ouverts ou créez une partie privée.`,
  },
  gameCreate: {
    title: `Créer un salon · ${APP}`,
    description: `Configurez un nouveau salon public ou privé sur ${APP}. Choisissez un jeu, sélectionnez une variante et invitez vos amis en quelques secondes.`,
  },
  gameRoom: {
    title: `Salon de jeu · ${APP}`,
    description: `Rejoignez un salon en direct sur ${APP}, prenez place et commencez à jouer — ou regardez les parties en cours.`,
  },
  seaBattleLanding: {
    title: `Bataille navale en ligne · Jouez gratuitement · ${APP}`,
    description: `Jouez à la Bataille Navale en ligne gratuitement sur ${APP}. Partie rapide contre un bot, recherche d'adversaire humain ou partie privée entre amis.`,
  },
  settings: {
    title: `Paramètres · ${APP}`,
    description: `Personnalisez votre expérience ${APP} — apparence, thème, langue et préférences de téléchargement.`,
  },
  history: {
    title: `Historique des parties · ${APP}`,
    description: `Retrouvez vos parties passées sur ${APP}, revivez les sessions et comparez les résultats avec vos amis.`,
  },
  stats: {
    title: `Statistiques du joueur · ${APP}`,
    description: `Suivez vos statistiques ${APP}: parties jouées, victoires, défaites et progression sur chaque jeu.`,
  },
  referrals: {
    title: `Invitez vos amis · Récompenses de parrainage · ${APP}`,
    description: `Invitez vos amis sur ${APP} et gagnez des récompenses de parrainage. Partagez votre lien et débloquez des bonus cosmétiques.`,
  },
  leaderboards: {
    title: `Classements · ${APP}`,
    description: `Découvrez qui domine chaque mode de jeu sur ${APP}. Grimpez le classement et défiez vos amis.`,
  },
  tournaments: {
    title: `Tournois · ${APP}`,
    description: `Participez aux tournois programmés sur ${APP}, suivez les brackets en direct et consultez les prochains événements.`,
  },
  rewards: {
    title: `Récompenses quotidiennes · ${APP}`,
    description: `Récupérez des récompenses quotidiennes sur ${APP}: pièces, tampons et cosmétiques simplement en revenant chaque jour.`,
  },
  wallet: {
    title: `Portefeuille et solde · ${APP}`,
    description: `Gérez votre portefeuille ${APP}: consultez votre solde, l'historique des transactions et votre inventaire cosmétique.`,
  },
  shop: {
    title: `Boutique · Cosmétiques et boosts · ${APP}`,
    description: `Parcourez la boutique ${APP}: débloquez avatars, badges, couleurs de pseudo et packs pour personnaliser votre profil.`,
  },
  payment: {
    title: `Paiement · ${APP}`,
    description: `Rechargez votre solde ${APP} en toute sécurité ou souscrivez à un abonnement. Traité par des prestataires de paiement de confiance.`,
  },
  paymentSuccess: {
    title: `Paiement réussi · ${APP}`,
    description: `Votre paiement ${APP} a été effectué avec succès. Votre solde est à jour et vous pouvez retourner jouer.`,
  },
  paymentCancel: {
    title: `Paiement annulé · ${APP}`,
    description: `Votre paiement ${APP} a été annulé. Aucun débit n'a été effectué; vous pouvez réessayer quand vous le souhaitez.`,
  },
  notes: {
    title: `Messages de la communauté · ${APP}`,
    description: `Lisez les messages de soutien de la communauté ${APP} — et laissez le vôtre si vous avez contribué au projet.`,
  },
  chats: {
    title: `Discussions · ${APP}`,
    description: `Reprenez vos conversations sur ${APP}: envoyez des messages, organisez des parties et gardez le contact entre les jeux.`,
  },
  chat: {
    title: `Discussion · ${APP}`,
    description: `Messagerie directe sur ${APP}: discutez avec vos amis, coordonnez vos parties et partagez des notes rapides.`,
  },
  auth: {
    title: `Connexion · ${APP}`,
    description: `Connectez-vous à ${APP} ou créez un compte pour rejoindre des parties, suivre votre progression et discuter avec vos amis.`,
  },
  support: {
    title: `Support · ${APP}`,
    description: `Besoin d'aide avec ${APP}? Consultez la FAQ, contactez notre équipe ou soutenez le projet.`,
  },
  contact: {
    title: `Nous contacter · ${APP}`,
    description: `Un retour, un bug ou une idée de partenariat? Écrivez à l'équipe ${APP} — nous lisons chaque message.`,
  },
  help: {
    title: `Centre d'aide · ${APP}`,
    description: `Parcourez le centre d'aide ${APP}: guides sur les comptes, les jeux et le dépannage.`,
  },
  terms: {
    title: `Conditions d'utilisation · ${APP}`,
    description: `Consultez les conditions d'utilisation qui régissent l'usage de la plateforme ${APP}.`,
  },
  privacy: {
    title: `Politique de confidentialité · ${APP}`,
    description: `Découvrez comment ${APP} collecte, utilise et protège vos données personnelles, en termes clairs.`,
  },
  cookies: {
    title: `Politique de cookies · ${APP}`,
    description: `Comment ${APP} utilise les cookies et technologies similaires, et comment vous pouvez les contrôler.`,
  },
  blog: {
    title: `Blog · ${APP}`,
    description: `Actualités, coulisses et analyses des fonctionnalités par l'équipe ${APP}.`,
  },
  community: {
    title: `Communauté · ${APP}`,
    description: `Rejoignez la communauté ${APP}: Discord, Telegram et nos canaux pour les joueurs et les soutiens.`,
  },
  developers: {
    title: `Développeurs · ${APP}`,
    description: `Découvrez l'équipe qui construit ${APP} et comment vous impliquer.`,
  },
  admin: {
    title: `Admin · ${APP}`,
    description: `Contrôles administratifs de ${APP}.`,
  },
  playerProfile: {
    title: `Profil du joueur · ${APP}`,
    description: `Consultez le rang, les statistiques et les parties récentes de ce joueur sur ${APP}.`,
  },
  notFound: {
    title: `Page introuvable · ${APP}`,
    description: `La page recherchée n'existe pas sur ${APP}. Parcourez nos jeux ou retournez à l'accueil.`,
  },
};
