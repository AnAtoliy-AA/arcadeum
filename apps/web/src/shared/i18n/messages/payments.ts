import type { Locale } from '../types';

const paymentsMessagesDefinition = {
  en: {
    title: 'Payment',
    subtitle: 'Secure and fast payments powered by PayPal',
    description:
      'Your contribution directly supports the development of new games, UI improvements, bug fixes, and performance optimizations. Thank you for making this possible!',
    secureInfo: 'Payments are 256-bit encrypted and secure.',
    amountLabel: 'Amount',
    amountPlaceholder: '0.00',
    amountAria: 'Payment amount',
    currencyLabel: 'Currency',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Currency code',
    noteLabel: 'Note (optional)',
    notePlaceholder: 'Add a note...',
    noteAria: 'Payment note or description',
    submit: 'Create Payment',
    submitting: 'Processing...',
    status: {
      success: 'Payment session created successfully!',
    },
    errors: {
      invalidAmount: 'Please enter a valid amount',
      amountTooLarge: 'Amount is too large. Maximum is 1,000,000',
      invalidUrl: 'Invalid payment URL received',
      noUrl: 'No payment URL received',
      failed: 'Payment failed',
    },
    presets: {
      coffee: '☕️ Coffee',
      lunch: '🍕 Lunch',
      gift: '🎁 Gift',
      boost: '🚀 Boost',
    },
    successPage: {
      title: 'Payment Successful!',
      message:
        'Thank you for your generous support! Your contribution helps us keep the servers running, the coffee brewing, and the updates coming.',
      referenceLabel: 'Transaction Reference',
      returnHome: 'Return Home',
      supportAgain: 'Support Again',
    },
    cancelPage: {
      title: 'Payment Cancelled',
      message:
        "No worries! No charges were made to your account. You can always try again when you're ready—we'll be here.",
      tryAgain: 'Try Again',
      returnHome: 'Return Home',
    },
    modes: {
      oneTime: 'One-time',
      recurring: 'Recurring',
    },
    intervals: {
      monthly: 'Monthly',
      yearly: 'Yearly',
    },
    notes: {
      title: 'Supporter Notes',
      subtitle:
        'Messages of support from our amazing community. Thank you for keeping us going!',
      emptyMessage: 'No notes yet. Be the first to leave a supportive message!',
      anonymous: 'Anonymous Supporter',
      loading: 'Loading...',
      loadMore: 'Load More',
    },
    showNameLabel: 'Show my name with this note',
  },
  es: {
    title: 'Pago',
    subtitle: 'Pagos seguros y rápidos impulsados por PayPal',
    description:
      'Tu contribución apoya directamente el desarrollo de nuevos juegos, mejoras de interfaz, corrección de errores y optimizaciones de rendimiento. ¡Gracias por hacerlo posible!',
    secureInfo: 'Los pagos están cifrados con 256 bits y son seguros.',
    amountLabel: 'Cantidad',
    amountPlaceholder: '0.00',
    amountAria: 'Monto del pago',
    currencyLabel: 'Moneda',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Código de moneda',
    noteLabel: 'Nota (opcional)',
    notePlaceholder: 'Agregar una nota...',
    noteAria: 'Nota o descripción del pago',
    submit: 'Crear Pago',
    submitting: 'Procesando...',
    status: {
      success: '¡Sesión de pago creada exitosamente!',
    },
    errors: {
      invalidAmount: 'Por favor ingresa una cantidad válida',
      amountTooLarge: 'La cantidad es demasiado grande. El máximo es 1,000,000',
      invalidUrl: 'URL de pago inválida recibida',
      noUrl: 'No se recibió URL de pago',
      failed: 'El pago falló',
    },
    presets: {
      coffee: '☕️ Café',
      lunch: '🍕 Almuerzo',
      gift: '🎁 Regalo',
      boost: '🚀 Impulso',
    },
    successPage: {
      title: '¡Pago Exitoso!',
      message:
        '¡Gracias por tu generoso apoyo! Tu contribución nos ayuda a mantener los servidores funcionando y las actualizaciones llegando.',
      referenceLabel: 'Referencia de Transacción',
      returnHome: 'Volver al Inicio',
      supportAgain: 'Apoyar de Nuevo',
    },
    cancelPage: {
      title: 'Pago Cancelado',
      message:
        '¡No te preocupes! No se realizaron cargos a tu cuenta. Siempre puedes intentarlo de nuevo cuando estés listo.',
      tryAgain: 'Intentar de Nuevo',
      returnHome: 'Volver al Inicio',
    },
    modes: {
      oneTime: 'Pago único',
      recurring: 'Recurrente',
    },
    intervals: {
      monthly: 'Mensual',
      yearly: 'Anual',
    },
    notes: {
      title: 'Notas de Apoyo',
      subtitle:
        'Mensajes de apoyo de nuestra increíble comunidad. ¡Gracias por mantenernos adelante!',
      emptyMessage:
        'Aún no hay notas. ¡Sé el primero en dejar un mensaje de apoyo!',
      anonymous: 'Apoyo Anónimo',
      loading: 'Cargando...',
      loadMore: 'Cargar Más',
    },
    showNameLabel: 'Mostrar mi nombre con esta nota',
  },
  fr: {
    title: 'Paiement',
    subtitle: 'Paiements sécurisés et rapides propulsés par PayPal',
    description:
      "Votre contribution soutient directement le développement de nouveaux jeux, les améliorations de l'interface, les corrections de bugs et les optimisations de performances. Merci de rendre cela possible !",
    secureInfo: 'Les paiements sont cryptés en 256 bits et sécurisés.',
    amountLabel: 'Montant',
    amountPlaceholder: '0.00',
    amountAria: 'Montant du paiement',
    currencyLabel: 'Devise',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Code de devise',
    noteLabel: 'Note (optionnel)',
    notePlaceholder: 'Ajouter une note...',
    noteAria: 'Note ou description du paiement',
    submit: 'Créer un Paiement',
    submitting: 'Traitement...',
    status: {
      success: 'Session de paiement créée avec succès !',
    },
    errors: {
      invalidAmount: 'Veuillez saisir un montant valide',
      amountTooLarge: 'Le montant est trop élevé. Le maximum est de 1 000 000',
      invalidUrl: 'URL de paiement invalide reçue',
      noUrl: 'Aucune URL de paiement reçue',
      failed: 'Le paiement a échoué',
    },
    presets: {
      coffee: '☕️ Café',
      lunch: '🍕 Déjeuner',
      gift: '🎁 Cadeau',
      boost: '🚀 Boost',
    },
    successPage: {
      title: 'Paiement Réussi !',
      message:
        'Merci pour votre généreux soutien ! Votre contribution nous aide à maintenir les serveurs en marche et les mises à jour à venir.',
      referenceLabel: 'Référence de Transaction',
      returnHome: "Retour à l'Accueil",
      supportAgain: 'Soutenir à Nouveau',
    },
    cancelPage: {
      title: 'Paiement Annulé',
      message:
        "Pas de soucis ! Aucun frais n'a été débité de votre compte. Vous pouvez toujours réessayer quand vous serez prêt.",
      tryAgain: 'Réessayer',
      returnHome: "Retour à l'Accueil",
    },
    modes: {
      oneTime: 'Ponctuel',
      recurring: 'Récurrent',
    },
    intervals: {
      monthly: 'Mensuel',
      yearly: 'Annuel',
    },
    notes: {
      title: 'Notes de Soutien',
      subtitle:
        'Messages de soutien de notre incroyable communauté. Merci de nous faire avancer!',
      emptyMessage:
        'Pas encore de notes. Soyez le premier à laisser un message de soutien!',
      anonymous: 'Supporter Anonyme',
      loading: 'Chargement...',
      loadMore: 'Charger Plus',
    },
    showNameLabel: 'Afficher mon nom avec cette note',
  },
  ru: {
    title: 'Оплата',
    subtitle: 'Безопасные и быстрые платежи через PayPal',
    description:
      'Ваш вклад напрямую поддерживает разработку новых игр, улучшение интерфейса, исправление ошибок и оптимизацию производительности. Спасибо, что делаете это возможным!',
    secureInfo: 'Платежи защищены 256-битным шифрованием.',
    amountLabel: 'Сумма',
    amountPlaceholder: '0.00',
    amountAria: 'Сумма платежа',
    currencyLabel: 'Валюта',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Код валюты',
    noteLabel: 'Заметка (необязательно)',
    notePlaceholder: 'Добавьте заметку...',
    noteAria: 'Заметка или описание платежа',
    submit: 'Создать платеж',
    submitting: 'Обработка...',
    status: {
      success: 'Платежная сессия успешно создана!',
    },
    errors: {
      invalidAmount: 'Пожалуйста, введите корректную сумму',
      amountTooLarge: 'Слишком большая сумма. Максимум 1,000,000',
      invalidUrl: 'Получен неверный URL оплаты',
      noUrl: 'URL оплаты не получен',
      failed: 'Оплата не удалась',
    },
    presets: {
      coffee: '☕️ Кофе',
      lunch: '🍕 Обед',
      gift: '🎁 Подарок',
      boost: '🚀 Буст',
    },
    successPage: {
      title: 'Оплата прошла успешно!',
      message:
        'Спасибо за вашу щедрую поддержку! Ваш вклад помогает нам поддерживать работу серверов и выпускать обновления.',
      referenceLabel: 'Номер транзакции',
      returnHome: 'На главную',
      supportAgain: 'Поддержать еще раз',
    },
    cancelPage: {
      title: 'Оплата отменена',
      message:
        'Не беспокойтесь! С вашего счета не было списано никаких средств. Вы всегда можете попробовать еще раз, когда будете готовы.',
      tryAgain: 'Попробовать еще раз',
      returnHome: 'На главную',
    },
    modes: {
      oneTime: 'Разовый',
      recurring: 'Регулярный',
    },
    intervals: {
      monthly: 'Ежемесячно',
      yearly: 'Ежегодно',
    },
    notes: {
      title: 'Записки поддержки',
      subtitle:
        'Сообщения поддержки от нашего удивительного сообщества. Спасибо, что поддерживаете нас!',
      emptyMessage:
        'Пока нет записок. Будь первым, кто оставит поддерживающее сообщение!',
      anonymous: 'Анонимный Поддержатель',
      loading: 'Загрузка...',
      loadMore: 'Загрузить Ещё',
    },
    showNameLabel: 'Показать моё имя в этой записке',
  },
  by: {
    title: 'Аплата',
    subtitle: 'Бяспечныя і хуткія плацяжы праз PayPal',
    description:
      'Ваш унёсак напрамую падтрымлівае распрацоўку новых гульняў, паляпшэнне інтэрфейсу, выпраўленне памылак і аптымізацыю прадукцыйнасці. Дзякуй, што робіце гэта магчымым!',
    secureInfo: 'Плацяжы абаронены 256-бітным шыфраваннем.',
    amountLabel: 'Сума',
    amountPlaceholder: '0.00',
    amountAria: 'Сума плацяжу',
    currencyLabel: 'Валюта',
    currencyPlaceholder: 'GEL',
    currencyAria: 'Код валюты',
    noteLabel: 'Заўвага (неабавязкова)',
    notePlaceholder: 'Дадайце заўвагу...',
    noteAria: 'Заўвага або апісанне плацяжу',
    submit: 'Стварыць плацеж',
    submitting: 'Апрацоўка...',
    status: {
      success: 'Плацежная сесія паспяхова створана!',
    },
    errors: {
      invalidAmount: 'Калі ласка, увядзіце карэктную суму',
      amountTooLarge: 'Занадта вялікая сума. Максімум 1,000,000',
      invalidUrl: 'Атрыманы няправільны URL аплаты',
      noUrl: 'URL аплаты не атрыманы',
      failed: 'Аплата не ўдалася',
    },
    presets: {
      coffee: '☕️ Кава',
      lunch: '🍕 Обед',
      gift: '🎁 Падарунак',
      boost: '🚀 Паскарэнне',
    },
    successPage: {
      title: 'Аплата прайшла паспяхова!',
      message:
        'Дзякуй за вашу шчодрую падтрымку! Ваш унёсак дапамагае нам падтрымліваць працу сервераў і выпускаць абнаўленні.',
      referenceLabel: 'Нумар транзакцыі',
      returnHome: 'На галоўную',
      supportAgain: 'Падтрымаць яшчэ раз',
    },
    cancelPage: {
      title: 'Аплата адменена',
      message:
        'Не хвалюйцеся! З вашага рахунку не было спісана ніякіх сродкаў. Вы заўсёды можаце паспрабаваць яшчэ раз, калі будзеце гатовыя.',
      tryAgain: 'Паспрабаваць яшчэ раз',
      returnHome: 'На галоўную',
    },
    modes: {
      oneTime: 'Разавы',
      recurring: 'Рэгулярны',
    },
    intervals: {
      monthly: 'Штомесяц',
      yearly: 'Штогод',
    },
    notes: {
      title: 'Нататкі падтрымкі',
      subtitle:
        'Паведамленні падтрымкі ад нашай дзіўнай супольнасці. Дзякуй, што падтрымліваеце нас!',
      emptyMessage:
        'Пакуль няма нататак. Будзьце першым, хто пакіне паведамленне падтрымкі!',
      anonymous: 'Ананімны Падтрымальнік',
      loading: 'Загрузка...',
      loadMore: 'Загрузіць Яшчэ',
    },
    showNameLabel: 'Паказаць маё імя ў гэтай нататцы',
  },
} satisfies Record<Locale, Record<string, unknown>>;

export const paymentsMessages = paymentsMessagesDefinition;

/** Derived type from the paymentsMessages object - English locale structure */
export type PaymentsMessages = (typeof paymentsMessagesDefinition)['en'];
