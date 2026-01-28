import type { DeepPartial, Locale } from '../types';

const commonMessagesDefinition = {
  en: {
    languageNames: {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      ru: 'Russian',
      be: 'Belarusian',
    },
    labels: {
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      username: 'Username',
    },
    actions: {
      login: 'Sign in',
      register: 'Create account',
      logout: 'Sign out',
      openApp: 'Open app',
      supportTeam: 'Support Team',
    },
    prompts: {
      haveAccount: 'Already have an account?',
      needAccount: 'Need an account?',
    },
    statuses: {
      authenticated: 'You are signed in.',
    },
    roles: {
      free: 'Free',
      premium: 'Premium',
      vip: 'VIP',
      supporter: 'Supporter',
      moderator: 'Mod',
      tester: 'Tester',
      developer: 'Dev',
      admin: 'Admin',
    },
  },
  es: {
    languageNames: {
      en: 'Inglés',
      es: 'Español',
      fr: 'Francés',
      ru: 'Ruso',
      be: 'Bielorruso',
    },
    labels: {
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      username: 'Nombre de usuario',
    },
    actions: {
      login: 'Iniciar sesión',
      register: 'Crear cuenta',
      logout: 'Cerrar sesión',
      openApp: 'Abrir app',
      supportTeam: 'Equipo de soporte',
    },
    prompts: {
      haveAccount: '¿Ya tienes una cuenta?',
      needAccount: '¿Necesitas una cuenta?',
    },
    statuses: {
      authenticated: 'Has iniciado sesión.',
    },
    roles: {
      free: 'Gratis',
      premium: 'Premium',
      vip: 'VIP',
      supporter: 'Colaborador',
      moderator: 'Mod',
      tester: 'Tester',
      developer: 'Dev',
      admin: 'Admin',
    },
  },
  fr: {
    languageNames: {
      en: 'Anglais',
      es: 'Espagnol',
      fr: 'Français',
      ru: 'Russe',
      be: 'Biélorusse',
    },
    labels: {
      email: 'E-mail',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      username: "Nom d'utilisateur",
    },
    actions: {
      login: 'Se connecter',
      register: "S'inscrire",
      logout: 'Se déconnecter',
      openApp: "Ouvrir l'application",
      supportTeam: 'Équipe de support',
    },
    prompts: {
      haveAccount: 'Vous avez déjà un compte ?',
      needAccount: "Besoin d'un compte ?",
    },
    statuses: {
      authenticated: 'Vous êtes connecté.',
    },
    roles: {
      free: 'Gratuit',
      premium: 'Premium',
      vip: 'VIP',
      supporter: 'Supporteur',
      moderator: 'Mod',
      tester: 'Testeur',
      developer: 'Dev',
      admin: 'Admin',
    },
  },
  ru: {
    languageNames: {
      en: 'Английский',
      es: 'Испанский',
      fr: 'Французский',
      ru: 'Русский',
      be: 'Белорусский',
    },
    labels: {
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      username: 'Имя пользователя',
    },
    actions: {
      login: 'Войти',
      register: 'Создать аккаунт',
      logout: 'Выйти',
      openApp: 'Открыть приложение',
      supportTeam: 'Служба поддержки',
    },
    prompts: {
      haveAccount: 'Уже есть аккаунт?',
      needAccount: 'Нужен аккаунт?',
    },
    statuses: {
      authenticated: 'Вы вошли в систему.',
    },
    roles: {
      free: 'Бесплатный',
      premium: 'Премиум',
      vip: 'VIP',
      supporter: 'Поддержка',
      moderator: 'Мод',
      tester: 'Тестер',
      developer: 'Разработчик',
      admin: 'Админ',
    },
  },
  be: {
    languageNames: {
      en: 'Англійская',
      es: 'Іспанская',
      fr: 'Французская',
      ru: 'Руская',
      be: 'Беларуская',
    },
    labels: {
      email: 'Email',
      password: 'Пароль',
      confirmPassword: 'Пацвердзіце пароль',
      username: 'Імя карыстальніка',
    },
    actions: {
      login: 'Увайсці',
      register: 'Стварыць акаўнт',
      logout: 'Выйсці',
      openApp: 'Адкрыць прыкладанне',
      supportTeam: 'Служба падтрымкі',
    },
    prompts: {
      haveAccount: 'Ужо ёсць акаўнт?',
      needAccount: 'Патрэбен акаўнт?',
    },
    statuses: {
      authenticated: 'Вы ўвайшлі ў сістэму.',
    },
    roles: {
      free: 'Бясплатны',
      premium: 'Прэміум',
      vip: 'VIP',
      supporter: 'Падтрымка',
      moderator: 'Мод',
      tester: 'Тэстар',
      developer: 'Распрацоўшчык',
      admin: 'Адмін',
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const commonMessages = commonMessagesDefinition;

/** Derived type with Partial wrapper for backward compatibility */
export type CommonMessages = DeepPartial<
  (typeof commonMessagesDefinition)['en']
>;
