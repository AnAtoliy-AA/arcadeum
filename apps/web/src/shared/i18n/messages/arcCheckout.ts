import type { DeepPartial } from '../base-types';

export interface ArcCheckoutMessages {
  creating: string;
  title: string;
  amount: string;
  statusPending: string;
  statusConfirmed: string;
  statusFailed: string;
  statusExpired: string;
  statusLate: string;
  success: string;
  verifying: string;
  retry: string;
  close: string;
  cancel: string;
  priceUnavailable: string;
  errorCreate: string;
  errorGeneric: string;
  recipient: string;
  copyAddress: string;
  copyLink: string;
  copied: string;
  openPhantom: string;
  scanHint: string;
  qrAlt: string;
  successItem: string;
  successGems: string;
  errors: {
    rpcUnavailable: string;
    transactionNotConfirmed: string;
    paymentTooLow: string;
    invalidTransaction: string;
    arcPaymentDisabled: string;
    arcPriceUnavailable: string;
    signatureAlreadyUsed: string;
    notConfigured: string;
  };
}

export const en: ArcCheckoutMessages = {
  creating: 'Creating payment request...',
  title: 'Send ARC to pay',
  amount: 'Amount',
  statusPending: 'Waiting for your payment on the Solana network...',
  statusConfirmed: 'Payment received. Verifying...',
  statusFailed:
    'The payment could not be verified. Nothing was charged to your account.',
  statusExpired:
    'The payment request expired. If you already paid, it will be applied automatically.',
  statusLate: 'Your payment arrived after the window and was applied.',
  success: 'Payment confirmed!',
  verifying: 'Verifying payment...',
  retry: 'Try again',
  close: 'Close',
  cancel: 'Cancel',
  priceUnavailable:
    'ARC prices are temporarily unavailable. Please try again later.',
  errorCreate: 'Failed to create the payment request.',
  errorGeneric: 'Failed to verify payment.',
  recipient: 'Recipient',
  copyAddress: 'Copy Address',
  copyLink: 'Copy Payment Link',
  copied: 'Copied!',
  openPhantom: 'Open in Phantom',
  scanHint: 'Scan the QR code or copy the address to send {amount} ARC',
  qrAlt: 'QR code for the Solana Pay payment',
  successItem: 'Item purchased! Check your inventory.',
  successGems: 'Payment confirmed! Gems added to your account.',
  errors: {
    rpcUnavailable: 'The Solana network is busy. Please retry in a moment.',
    transactionNotConfirmed:
      'The transaction is not confirmed yet. Please retry in a moment.',
    paymentTooLow: 'The amount paid is lower than the current price.',
    invalidTransaction: 'This transaction is not a valid ARC payment.',
    arcPaymentDisabled: 'ARC payments are currently disabled.',
    arcPriceUnavailable: 'ARC price is unavailable right now.',
    signatureAlreadyUsed: 'This transaction was already used.',
    notConfigured: 'ARC payments are not available right now.',
  },
};

export const ru: DeepPartial<ArcCheckoutMessages> = {
  creating: 'Создаем запрос на оплату...',
  title: 'Отправьте ARC для оплаты',
  amount: 'Сумма',
  statusPending: 'Ожидаем ваш платеж в сети Solana...',
  statusConfirmed: 'Платеж получен. Проверяем...',
  statusFailed:
    'Платеж не удалось проверить. С вашего аккаунта ничего не списано.',
  statusExpired:
    'Срок запроса истек. Если вы уже оплатили, платеж будет учтен автоматически.',
  statusLate: 'Ваш платеж пришел после окончания окна и был учтен.',
  success: 'Оплата подтверждена!',
  verifying: 'Проверяем оплату...',
  retry: 'Повторить',
  close: 'Закрыть',
  cancel: 'Отмена',
  priceUnavailable: 'Цены ARC временно недоступны. Попробуйте позже.',
  errorCreate: 'Не удалось создать запрос на оплату.',
  errorGeneric: 'Не удалось проверить оплату.',
  recipient: 'Получатель',
  copyAddress: 'Копировать адрес',
  copyLink: 'Копировать ссылку на оплату',
  copied: 'Скопировано!',
  openPhantom: 'Открыть в Phantom',
  scanHint:
    'Отсканируйте QR-код или скопируйте адрес, чтобы отправить {amount} ARC',
  qrAlt: 'QR-код для оплаты через Solana Pay',
  successItem: 'Предмет куплен! Загляните в инвентарь.',
  successGems: 'Оплата подтверждена! Гемы добавлены на ваш аккаунт.',
  errors: {
    rpcUnavailable: 'Сеть Solana перегружена. Повторите через минуту.',
    transactionNotConfirmed:
      'Транзакция еще не подтверждена. Повторите через минуту.',
    paymentTooLow: 'Оплаченная сумма меньше текущей цены.',
    invalidTransaction: 'Эта транзакция не является корректной оплатой ARC.',
    arcPaymentDisabled: 'Оплата в ARC сейчас отключена.',
    arcPriceUnavailable: 'Цена ARC сейчас недоступна.',
    signatureAlreadyUsed: 'Эта транзакция уже использована.',
    notConfigured: 'Оплата в ARC сейчас недоступна.',
  },
};

export const es: DeepPartial<ArcCheckoutMessages> = {
  creating: 'Creando solicitud de pago...',
  title: 'Envía ARC para pagar',
  amount: 'Importe',
  statusPending: 'Esperando tu pago en la red Solana...',
  statusConfirmed: 'Pago recibido. Verificando...',
  statusFailed: 'No se pudo verificar el pago. No se cargó nada a tu cuenta.',
  statusExpired:
    'La solicitud de pago expiró. Si ya pagaste, se aplicará automáticamente.',
  statusLate: 'Tu pago llegó fuera de plazo y se aplicó.',
  success: '¡Pago confirmado!',
  verifying: 'Verificando el pago...',
  retry: 'Reintentar',
  close: 'Cerrar',
  cancel: 'Cancelar',
  priceUnavailable:
    'Los precios de ARC no están disponibles temporalmente. Inténtalo más tarde.',
  errorCreate: 'No se pudo crear la solicitud de pago.',
  errorGeneric: 'No se pudo verificar el pago.',
  recipient: 'Destinatario',
  copyAddress: 'Copiar dirección',
  copyLink: 'Copiar enlace de pago',
  copied: '¡Copiado!',
  openPhantom: 'Abrir en Phantom',
  scanHint:
    'Escanea el código QR o copia la dirección para enviar {amount} ARC',
  qrAlt: 'Código QR del pago con Solana Pay',
  successItem: '¡Artículo comprado! Revisa tu inventario.',
  successGems: '¡Pago confirmado! Las gemas se añadieron a tu cuenta.',
  errors: {
    rpcUnavailable: 'La red Solana está saturada. Reintenta en un momento.',
    transactionNotConfirmed:
      'La transacción aún no está confirmada. Reintenta en un momento.',
    paymentTooLow: 'El importe pagado es menor que el precio actual.',
    invalidTransaction: 'Esta transacción no es un pago ARC válido.',
    arcPaymentDisabled: 'Los pagos con ARC están desactivados ahora.',
    arcPriceUnavailable: 'El precio de ARC no está disponible ahora.',
    signatureAlreadyUsed: 'Esta transacción ya fue utilizada.',
    notConfigured: 'Los pagos con ARC no están disponibles ahora.',
  },
};

export const fr: DeepPartial<ArcCheckoutMessages> = {
  creating: 'Création de la demande de paiement...',
  title: 'Envoyez des ARC pour payer',
  amount: 'Montant',
  statusPending: 'En attente de votre paiement sur le réseau Solana...',
  statusConfirmed: 'Paiement reçu. Vérification...',
  statusFailed:
    "Le paiement n'a pas pu être vérifié. Rien n'a été débité de votre compte.",
  statusExpired:
    'La demande de paiement a expiré. Si vous avez déjà payé, il sera appliqué automatiquement.',
  statusLate: 'Votre paiement est arrivé après le délai et a été appliqué.',
  success: 'Paiement confirmé !',
  verifying: 'Vérification du paiement...',
  retry: 'Réessayer',
  close: 'Fermer',
  cancel: 'Annuler',
  priceUnavailable:
    'Les prix ARC sont temporairement indisponibles. Réessayez plus tard.',
  errorCreate: 'Impossible de créer la demande de paiement.',
  errorGeneric: 'Impossible de vérifier le paiement.',
  recipient: 'Destinataire',
  copyAddress: "Copier l'adresse",
  copyLink: 'Copier le lien de paiement',
  copied: 'Copié !',
  openPhantom: 'Ouvrir dans Phantom',
  scanHint: "Scannez le QR code ou copiez l'adresse pour envoyer {amount} ARC",
  qrAlt: 'QR code du paiement Solana Pay',
  successItem: 'Objet acheté ! Consultez votre inventaire.',
  successGems:
    'Paiement confirmé ! Les gemmes ont été ajoutées à votre compte.',
  errors: {
    rpcUnavailable: 'Le réseau Solana est saturé. Réessayez dans un instant.',
    transactionNotConfirmed:
      "La transaction n'est pas encore confirmée. Réessayez dans un instant.",
    paymentTooLow: 'Le montant payé est inférieur au prix actuel.',
    invalidTransaction: "Cette transaction n'est pas un paiement ARC valide.",
    arcPaymentDisabled: 'Les paiements en ARC sont actuellement désactivés.',
    arcPriceUnavailable: "Le prix de l'ARC est indisponible pour le moment.",
    signatureAlreadyUsed: 'Cette transaction a déjà été utilisée.',
    notConfigured:
      'Les paiements en ARC ne sont pas disponibles pour le moment.',
  },
};

export const by: DeepPartial<ArcCheckoutMessages> = {
  creating: 'Ствараем запыт на аплату...',
  title: 'Адправьце ARC для аплаты',
  amount: 'Сума',
  statusPending: 'Чакаем ваш плацеж у сетцы Solana...',
  statusConfirmed: 'Плацеж атрыманы. Правяраем...',
  statusFailed:
    'Плацеж не ўдалося праверыць. З вашага акаўнта нічога не спісана.',
  statusExpired:
    'Тэрмін запыту скончыўся. Калі вы ўжо аплацілі, плацеж будзе ўлічаны аўтаматычна.',
  statusLate: 'Ваш плацеж прыйшоў пасля заканчэння акна і быў улічаны.',
  success: 'Аплата пацверджана!',
  verifying: 'Правяраем аплату...',
  retry: 'Паўтарыць',
  close: 'Закрыць',
  cancel: 'Адмена',
  priceUnavailable: 'Цэны ARC часова недаступныя. Паспрабуйце пазней.',
  errorCreate: 'Не ўдалося стварыць запыт на аплату.',
  errorGeneric: 'Не ўдалося праверыць аплату.',
  recipient: 'Атрымальнік',
  copyAddress: 'Капіраваць адрас',
  copyLink: 'Капіраваць спасылку на аплату',
  copied: 'Скапіравана!',
  openPhantom: 'Адкрыць у Phantom',
  scanHint:
    'Адскануйце QR-код або скапіруйце адрас, каб адправіць {amount} ARC',
  qrAlt: 'QR-код для аплаты праз Solana Pay',
  successItem: 'Прадмет набыты! Зайдзіце ў інвентар.',
  successGems: 'Аплата пацверджана! Гемы дададзены на ваш акаўнт.',
  errors: {
    rpcUnavailable: 'Сетка Solana перагружана. Паўтарыце праз хвіліну.',
    transactionNotConfirmed:
      'Транзакцыя яшчэ не пацверджана. Паўтарыце праз хвіліну.',
    paymentTooLow: 'Аплачаная сума меншая за бягучую цану.',
    invalidTransaction: "Гэта транзакцыя не з'яўляецца карэктнай аплатай ARC.",
    arcPaymentDisabled: 'Аплата ў ARC зараз адключана.',
    arcPriceUnavailable: 'Цана ARC зараз недаступная.',
    signatureAlreadyUsed: 'Гэта транзакцыя ўжо выкарыстана.',
    notConfigured: 'Аплата ў ARC зараз недаступная.',
  },
};
