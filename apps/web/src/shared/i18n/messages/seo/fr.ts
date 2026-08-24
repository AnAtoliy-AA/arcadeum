import { appConfig } from '../../../config/app-config';
import type { DeepPartial } from '../../base-types';
import type { SeoMessages } from './en';

const APP = appConfig.appName;

export const fr: DeepPartial<SeoMessages> = {
  home: {
    title: `${APP} — Jouez gratuitement à des jeux de société en ligne entre amis`,
    description: `Jouez gratuitement à des jeux de société en ligne entre amis sur ${APP}. Bataille navale, stratégie, cartes — créez un salon, partagez le lien et jouez dans votre navigateur. Sans téléchargement, sans inscription.`,
    badge: "Jouez avec des amis ou contre l'IA",
  },
  games: {
    title: `Catalogue de Jeux de Société et Cartes Gratuits · ${APP}`,
    description: `Découvrez tous les jeux en ligne multijoueurs gratuits sur ${APP}. Jouez aux échecs, bataille navale, dames, cascade et plus encore sans téléchargement.`,
  },
  rooms: {
    title: `Salons de Jeu en Direct · ${APP}`,
    description: `Parcourez les salons de jeu multijoueurs actifs sur ${APP}. Rejoignez des parties ouvertes ou créez votre propre salon privé pour vos amis.`,
  },
  gameCreate: {
    title: `Créer un salon · ${APP}`,
    description: `Configurez un nouveau salon public ou privé sur ${APP}. Choisissez un jeu, sélectionnez une variante et invitez vos amis en quelques secondes.`,
  },
  gameRoom: {
    title: `Salon de jeu · ${APP}`,
    description: `Rejoignez un salon en direct sur ${APP}, prenez place et commencez à jouer — ou regardez les parties en cours.`,
  },
  criticalLanding: {
    title: `Critical · Jeu de cartes explosif gratuit en ligne · ${APP}`,
    description: `Jouez gratuitement à Critical en ligne sur ${APP} — un jeu de cartes stratégique où vous piochez, désamorcez et survivez à l'explosion. 2 à 5 joueurs, IA, decks thématiques. Sans téléchargement, sans inscription.`,
  },
  glimwormLanding: {
    title: `Glimworm · Jeu de serpents en arène gratuit en ligne · ${APP}`,
    description: `Jouez gratuitement à Glimworm en ligne sur ${APP} — un jeu d'arène de vers lumineux en temps réel pour jusqu'à 10 joueurs. Glissez, survivez, mangez les lumières. Dans le navigateur, sans téléchargement.`,
  },
  ticTacToeLanding: {
    title: `Morpion · Multijoueur · Plateaux 3×3 – 9×9 · ${APP}`,
    description: `Jouez au morpion multijoueur sur ${APP} — six variantes thématiques, 2–4 joueurs, mode équipes optionnel, bots dès le premier jour. Gratuit, salons instantanés, sans téléchargement.`,
  },
  cascadeLanding: {
    title: `Cascade · Jeu de cartes multijoueur de défausse · ${APP}`,
    description: `Jouez à Cascade sur ${APP} — un jeu de cartes de défausse avec chaînes Pioche-Deux et Joker +4 et quatre thèmes visuels. 2–10 joueurs, salons gratuits instantanés, sans téléchargement.`,
  },
  chessLanding: {
    title: `Échecs · Multijoueur · Standard & Chess960 · ${APP}`,
    description: `Jouez aux échecs sur ${APP} — variantes standard et Chess960, contrôles de temps, bots IA. Gratuit, salles instantanées, sans téléchargement.`,
  },
  checkersLanding: {
    title: `Dames · Multijoueur · ${APP}`,
    description: `Jouez aux dames sur ${APP} — plateau 8×8 avec prises obligatoires, sauts multiples et promotion en dame. Gratuit, salles instantanées.`,
  },
  catDashLanding: {
    title: `Cat Dash · Course de chats multijoueur · ${APP}`,
    description: `Jouez à Cat Dash sur ${APP} — courses de chats avec dés, capacités uniques et pistes thématiques. 2–6 joueurs, gratuit.`,
  },
  pachisiLanding: {
    title: `Pachisi (Ludo) · Jeu de plateau de course gratuit · ${APP}`,
    description: `Jouez au Pachisi en ligne sur ${APP} — faites un six pour lancer vos pions, capturez vos rivaux et rentrez les quatre à la maison. 2–4 joueurs, bots IA, salons gratuits.`,
  },
  backgammonLanding: {
    title: `Backgammon · Jeu de plateau multijoueur gratuit · ${APP}`,
    description: `Jouez au Backgammon en ligne sur ${APP} — plateau classique à 24 flèches, dés, sorties de pions et bots IA. Gratuit, sans téléchargement.`,
  },
  heartsLanding: {
    title: `Coeurs · Jeu de cartes multijoueur gratuit · ${APP}`,
    description: `Jouez aux Coeurs en ligne sur ${APP} — classique jeu de cartes à 4 joueurs avec passage, Coeurs, Reine de Pique et adversaires IA. Gratuit.`,
  },
  spadesLanding: {
    title: `Pique · Jeu de cartes multijoueur gratuit · ${APP}`,
    description: `Jouez au Pique en ligne sur ${APP} — classique jeu de cartes en partenariat à 4 joueurs avec annonces, Nil, sacs et adversaires IA. Gratuit.`,
  },
  seaBattleLanding: {
    title: `Bataille navale en ligne · Jouez gratuitement · ${APP}`,
    description: `Jouez à la Bataille Navale en ligne gratuitement sur ${APP}. Partie rapide contre un bot, recherche d'adversaire humain ou partie privée entre amis.`,
  },
  goLanding: {
    title: `Go · Jeu de Plateau Multijoueur en Ligne Gratuit · ${APP}`,
    description: `Jouez au Go en ligne sur ${APP} — Baduk/Weiqi classique sur plateaux 9×9, 13×13 et 19×19 avec captures, règle du ko, comptage par aire et IA. Salons instantanés gratuits.`,
  },

  solitaireLanding: {
    title: `Solitaire · Jeu de Cartes Klondike Gratuit en Ligne · ${APP}`,
    description: `Jouez au Solitaire (Klondike) en ligne sur ${APP} — le casse-tête de cartes classique solo avec score, chronomètre et progression sauvegardée. Gratuit, instantané, sans téléchargement.`,
  },
  minesweeperLanding: {
    title: `Démineur · Jeu de Réflexion Classique Gratuit en Ligne · ${APP}`,
    description: `Jouez au Démineur en ligne sur ${APP} — grilles de débutant à expert avec drapeaux, chrono et progression sauvegardée. Gratuit, instantané, sans téléchargement.`,
  },
  sudokuLanding: {
    title: `Sudoku · Jeu de Puzzle de Chiffres Gratuit en Ligne · ${APP}`,
    description: `Jouez au Sudoku en ligne sur ${APP} — niveaux facile, moyen et difficile à solution unique, crayon et progression sauvegardée. Gratuit, instantané, sans téléchargement.`,
  },
  game2048Landing: {
    title: `2048 · Jeu de Puzzle à Fusion de Tuiles Gratuit en Ligne · ${APP}`,
    description: `Jouez à 2048 en ligne sur ${APP} — glissez et fusionnez des tuiles sur une grille 4×4, battez votre record et continuez après 2048. Gratuit, instantané, sans téléchargement.`,
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
    description: `Voyez qui est en tête dans chaque mode de jeu de ${APP}. Montez dans le classement et affrontez vos amis.`,
  },
  friends: {
    title: `Amis · ${APP}`,
    description: `Gérez votre liste d'amis sur ${APP}, envoyez des demandes et voyez qui est en ligne.`,
  },
  clans: {
    title: `Clans · ${APP}`,
    description: `Rejoignez ou créez des clans sur ${APP}, formez une équipe avec d'autres joueurs, montez dans les classements de clans et dominez ensemble.`,
  },
  events: {
    title: `Soirées de jeux communautaires et événements · ${APP}`,
    description: `Rejoignez des soirées de jeux communautaires programmées sur ${APP}. Participez aux jeux mis en avant, grimpez dans le classement en direct et gagnez des récompenses exclusives.`,
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
  token: {
    title: `Token · ${APP}`,
    description: `Découvrez le token ${APP} sur Solana: gagnez en jouant ou en prix de tournois, dépensez en boutique.`,
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
