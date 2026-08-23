/**
 * Color-vision accessibility strings (ARC-896). Kept as a separate module so
 * `messages/settings.ts` stays under the 500-line limit; spread into each
 * locale object there.
 */

export const visionSettingsEn = {
  accessibilityTitle: 'Accessibility',
  accessibilityDescription: 'Adjust game colors for your color vision.',
  visionOptions: {
    none: {
      label: 'Default',
      description: 'Original theme colors.',
    },
    deuteranopia: {
      label: 'Deuteranopia',
      description: 'Rebalances red-green hues for red-green color blindness.',
    },
    protanopia: {
      label: 'Protanopia',
      description: 'Recolors boards for reduced red sensitivity.',
    },
    tritanopia: {
      label: 'Tritanopia',
      description: 'Separates blue-yellow hues for rare color blindness.',
    },
    highContrast: {
      label: 'High Contrast',
      description: 'Stronger outlines on game board cells.',
    },
  },
};

export const visionSettingsEs = {
  accessibilityTitle: 'Accesibilidad',
  accessibilityDescription:
    'Ajusta los colores del juego para tu visión cromática.',
  visionOptions: {
    none: {
      label: 'Predeterminado',
      description: 'Colores originales del tema.',
    },
    deuteranopia: {
      label: 'Deuteranopía',
      description:
        'Reequilibra los tonos rojo-verde para el daltonismo rojo-verde.',
    },
    protanopia: {
      label: 'Protanopía',
      description:
        'Recolorea los tableros para la sensibilidad reducida al rojo.',
    },
    tritanopia: {
      label: 'Tritanopía',
      description:
        'Separa los tonos azul-amarillo para el daltonismo poco común.',
    },
    highContrast: {
      label: 'Alto contraste',
      description: 'Contornos más marcados en las casillas del tablero.',
    },
  },
};

export const visionSettingsFr = {
  accessibilityTitle: 'Accessibilité',
  accessibilityDescription:
    'Adaptez les couleurs du jeu à votre vision des couleurs.',
  visionOptions: {
    none: {
      label: 'Par défaut',
      description: 'Couleurs du thème d\u2019origine.',
    },
    deuteranopia: {
      label: 'Deutéranopie',
      description:
        'Rééquilibre les teintes rouge-vert pour le daltonisme rouge-vert.',
    },
    protanopia: {
      label: 'Protanopie',
      description:
        'Recolore les plateaux pour une sensibilité réduite au rouge.',
    },
    tritanopia: {
      label: 'Tritanopie',
      description:
        'Sépare les teintes bleu-jaune pour ce daltonisme plus rare.',
    },
    highContrast: {
      label: 'Contraste élevé',
      description: 'Contours renforcés sur les cases du plateau.',
    },
  },
};

export const visionSettingsRu = {
  accessibilityTitle: 'Специальные возможности',
  accessibilityDescription: 'Настройте цвета игр под ваше цветовосприятие.',
  visionOptions: {
    none: {
      label: 'По умолчанию',
      description: 'Оригинальные цвета темы.',
    },
    deuteranopia: {
      label: 'Дейтеранопия',
      description:
        'Перебалансирует красно-зеленые оттенки при красно-зеленом дальтонизме.',
    },
    protanopia: {
      label: 'Протанопия',
      description:
        'Перекрашивает доски при сниженной чувствительности к красному.',
    },
    tritanopia: {
      label: 'Тританопия',
      description:
        'Разделяет сине-желтые оттенки при редкой форме дальтонизма.',
    },
    highContrast: {
      label: 'Высокий контраст',
      description: 'Усиленные контуры клеток игровых досок.',
    },
  },
};

export const visionSettingsBy = {
  accessibilityTitle: 'Спецыяльныя магчымасці',
  accessibilityDescription:
    'Наладзьце колеры гульняў для вашага каляровага ўспрымання.',
  visionOptions: {
    none: {
      label: 'Па змаўчанні',
      description: 'Арыгінальныя колеры тэмы.',
    },
    deuteranopia: {
      label: 'Дэйтэранопія',
      description:
        'Збалансоўвае чырвона-зялёныя адценні пры чырвона-зялёным дальтанізме.',
    },
    protanopia: {
      label: 'Пратанопія',
      description:
        'Перафарбоўвае дошкі пры зніжанай адчувальнасці да чырвонага.',
    },
    tritanopia: {
      label: 'Трытанопія',
      description:
        'Раздзяляе сіне-жоўтыя адценні пры рэдкай форме дальтанізме.',
    },
    highContrast: {
      label: 'Высокі кантраст',
      description: 'Пасіленыя контуры клетак гульнявых дошак.',
    },
  },
};
