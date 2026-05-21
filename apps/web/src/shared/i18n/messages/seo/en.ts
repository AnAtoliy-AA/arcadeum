import { appConfig } from '../../../config/app-config';

const APP = appConfig.appName;

export const en = {
  home: {
    title: `${APP} — Play Free Online Board Games with Friends`,
    description: `Play free online board games with friends on ${APP}. Battleship, strategy, and card games — create a room, share the link, and play in your browser. No download, no signup.`,
  },
  games: {
    title: `Free Online Board Games · ${APP}`,
    description: `Browse ${APP}'s catalog of free online board games. Find open rooms, create a private match for friends, or play against AI — all in your browser, no download required.`,
  },
  gameCreate: {
    title: `Create a Game Room · ${APP}`,
    description: `Set up a new private or public room on ${APP}. Pick a game, choose a variant, and invite friends to play together in seconds.`,
  },
  gameRoom: {
    title: `Game Room · ${APP}`,
    description: `Join a live game room on ${APP}, take a seat, and start playing — or spectate matches in progress.`,
  },
  seaBattleLanding: {
    title: `Sea Battle Online · Play Battleship Free · ${APP}`,
    description: `Play Sea Battle (Battleship) online for free on ${APP}. Quickplay against a bot, find a human opponent, or invite friends to a private match.`,
  },
  settings: {
    title: `Settings · ${APP}`,
    description: `Customize your ${APP} experience — manage appearance, theme, language, and download preferences.`,
  },
  history: {
    title: `Game History · ${APP}`,
    description: `Review your past matches on ${APP}, replay sessions, and revisit results with friends.`,
  },
  stats: {
    title: `Player Statistics · ${APP}`,
    description: `Track your ${APP} stats — games played, wins, losses, and progression across every supported title.`,
  },
  referrals: {
    title: `Invite Friends · Referral Rewards · ${APP}`,
    description: `Invite friends to ${APP} and earn referral rewards. Share your link, watch your network grow, and unlock cosmetic perks.`,
  },
  leaderboards: {
    title: `Leaderboards · ${APP}`,
    description: `See who's on top across every ${APP} game mode. Climb the rankings, compare with friends, and chase the mythic spotlight.`,
  },
  tournaments: {
    title: `Tournaments · ${APP}`,
    description: `Compete in scheduled ${APP} tournaments, follow live brackets, and track upcoming events across our supported games.`,
  },
  rewards: {
    title: `Daily Rewards · ${APP}`,
    description: `Claim daily rewards on ${APP} — earn coins, stamps, and cosmetics just by stopping by every day.`,
  },
  wallet: {
    title: `Wallet & Balance · ${APP}`,
    description: `Manage your ${APP} wallet — view your coin balance, transaction history, and current cosmetic inventory.`,
  },
  shop: {
    title: `Shop · Cosmetics & Boosts · ${APP}`,
    description: `Browse the ${APP} shop — unlock avatars, badges, color tags, and packs to personalize your profile.`,
  },
  payment: {
    title: `Payment · ${APP}`,
    description: `Securely top up your ${APP} balance or purchase a subscription. Powered by trusted payment processors.`,
  },
  paymentSuccess: {
    title: `Payment Successful · ${APP}`,
    description: `Your ${APP} payment was successful. Your balance has been updated and you can return to play.`,
  },
  paymentCancel: {
    title: `Payment Cancelled · ${APP}`,
    description: `Your ${APP} payment was cancelled. No charges were made; you can try again any time.`,
  },
  notes: {
    title: `Supporter Notes · ${APP}`,
    description: `Read messages of support from the ${APP} community — and add your own if you've helped fund the project.`,
  },
  chats: {
    title: `Chats · ${APP}`,
    description: `Pick up your ${APP} conversations — message friends, plan matches, and keep the chatter going between games.`,
  },
  chat: {
    title: `Chat · ${APP}`,
    description: `Direct messaging on ${APP} — talk to friends, coordinate matches, and share quick notes.`,
  },
  auth: {
    title: `Sign in · ${APP}`,
    description: `Sign in to ${APP} or create an account to join games, track progress, and chat with friends.`,
  },
  support: {
    title: `Support · ${APP}`,
    description: `Need help with ${APP}? Find FAQs, contact our team, or chip in to keep the lights on.`,
  },
  contact: {
    title: `Contact Us · ${APP}`,
    description: `Have feedback, a bug report, or a partnership idea? Reach the ${APP} team — we read every message.`,
  },
  help: {
    title: `Help Center · ${APP}`,
    description: `Browse the ${APP} help center for guides on accounts, games, and troubleshooting.`,
  },
  terms: {
    title: `Terms of Service · ${APP}`,
    description: `Read the ${APP} terms of service governing your use of the platform.`,
  },
  privacy: {
    title: `Privacy Policy · ${APP}`,
    description: `Learn how ${APP} collects, uses, and protects your personal data, in plain language.`,
  },
  cookies: {
    title: `Cookie Policy · ${APP}`,
    description: `How ${APP} uses cookies and similar technologies, and how you can control them.`,
  },
  blog: {
    title: `Blog · ${APP}`,
    description: `Updates, behind-the-scenes notes, and feature deep-dives from the ${APP} team.`,
  },
  community: {
    title: `Community · ${APP}`,
    description: `Join the ${APP} community — Discord, Telegram, and our channels for players and supporters.`,
  },
  developers: {
    title: `Developers · ${APP}`,
    description: `Meet the team building ${APP} and learn how to get involved.`,
  },
  admin: {
    title: `Admin · ${APP}`,
    description: `Administrative controls for ${APP}.`,
  },
  playerProfile: {
    title: `Player profile · ${APP}`,
    description: `View this player's ${APP} rank, stats, and recent matches.`,
  },
  notFound: {
    title: `Page not found · ${APP}`,
    description: `The page you're looking for doesn't exist on ${APP}. Browse our games or head back home.`,
  },
};

export type SeoMessages = typeof en;
