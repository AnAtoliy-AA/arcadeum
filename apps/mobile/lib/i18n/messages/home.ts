import type { TranslationMap } from '../types';

export const homeMessages = {
  en: {
    welcomeTitle: 'Welcome!',
    step1Title: 'Step 1: Try it',
    step1Body:
      'Edit {{file}} to see changes. Press {{shortcut}} to open developer tools.',
    step2Title: 'Step 2: Personalize',
    step2Body: 'Open Settings to manage your preferences and account access.',
    step3Title: 'Step 3: Get a fresh start',
    step3Body:
      "When you're ready, run {{command}} to get a fresh {{appName}} directory. This will move the current {{appName}} to {{exampleName}}.",
  },
  es: {
    welcomeTitle: '¡Bienvenido!',
    step1Title: 'Paso 1: Pruébalo',
    step1Body:
      'Edita {{file}} para ver los cambios. Pulsa {{shortcut}} para abrir las herramientas de desarrollador.',
    step2Title: 'Paso 2: Personaliza',
    step2Body:
      'Abre Ajustes para administrar tus preferencias y el acceso a tu cuenta.',
    step3Title: 'Paso 3: Empieza de nuevo',
    step3Body:
      'Cuando estés listo, ejecuta {{command}} para obtener un nuevo directorio {{appName}}. Esto moverá el {{appName}} actual a {{exampleName}}.',
  },
  fr: {
    welcomeTitle: 'Bienvenue !',
    step1Title: 'Étape 1 : Essayez',
    step1Body:
      'Modifiez {{file}} pour voir les changements. Appuyez sur {{shortcut}} pour ouvrir les outils de développement.',
    step2Title: 'Étape 2 : Personnalisez',
    step2Body:
      'Ouvrez les réglages pour gérer vos préférences et l’accès à votre compte.',
    step3Title: 'Étape 3 : Repartez de zéro',
    step3Body:
      'Quand vous êtes prêt, exécutez {{command}} pour recréer le dossier {{appName}}. Le dossier {{appName}} actuel sera déplacé vers {{exampleName}}.',
  },
} as const satisfies TranslationMap;
