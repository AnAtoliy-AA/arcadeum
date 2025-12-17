import type { CommonMessages, Locale } from "../types";

export const commonMessages: Record<Locale, CommonMessages> = {
  en: {
    languageNames: {
      en: "English",
      es: "Spanish",
      fr: "French",
    },
    labels: {
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      username: "Username",
    },
    actions: {
      login: "Sign in",
      register: "Create account",
      logout: "Sign out",
      openApp: "Open app",
    },
    prompts: {
      haveAccount: "Already have an account?",
      needAccount: "Need an account?",
    },
    statuses: {
      authenticated: "You are signed in.",
    },
  },
  es: {
    languageNames: {
      en: "Inglés",
      es: "Español",
      fr: "Francés",
    },
    labels: {
      email: "Correo electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar contraseña",
      username: "Nombre de usuario",
    },
    actions: {
      login: "Iniciar sesión",
      register: "Crear cuenta",
      logout: "Cerrar sesión",
      openApp: "Abrir app",
    },
    prompts: {
      haveAccount: "¿Ya tienes una cuenta?",
      needAccount: "¿Necesitas una cuenta?",
    },
    statuses: {
      authenticated: "Has iniciado sesión.",
    },
  },
  fr: {
    languageNames: {
      en: "Anglais",
      es: "Espagnol",
      fr: "Français",
    },
    labels: {
      email: "E-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      username: "Nom d'utilisateur",
    },
    actions: {
      login: "Se connecter",
      register: "S'inscrire",
      logout: "Se déconnecter",
      openApp: "Ouvrir l'application",
    },
    prompts: {
      haveAccount: "Vous avez déjà un compte ?",
      needAccount: "Besoin d'un compte ?",
    },
    statuses: {
      authenticated: "Vous êtes connecté.",
    },
  },
};
