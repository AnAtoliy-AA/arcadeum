import type { LegalMessages } from './types';

export const legalMessagesEs: LegalMessages = {
  nav: {
    terms: 'Términos',
    privacy: 'Privacidad',
    contact: 'Contacto',
  },
  terms: {
    title: 'Términos y Condiciones',
    lastUpdated: 'Última actualización: 21 de diciembre de 2024',
    sections: {
      agreement: {
        title: '1. Aceptación de los Términos',
        content:
          'Al acceder o utilizar {{appName}}, acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con estos términos, por favor no utilice nuestros servicios.',
      },
      companyInfo: {
        title: '2. Información de la Empresa',
        companyName: 'Nombre de la Empresa:',
        legalName: 'Razón Social:',
        idCode: 'Código de Identificación:',
        contactEmail: 'Correo de Contacto:',
        workingHours: 'Horario de Atención:',
      },
      services: {
        title: '3. Descripción de los Servicios',
        intro:
          '{{appName}} proporciona una plataforma de juegos multijugador en línea que ofrece juegos de cartas de entretenimiento. Nuestros servicios incluyen:',
        items: [
          'Acceso a juegos de cartas multijugador a través de aplicaciones web y móviles',
          'Moneda virtual y funciones premium en el juego',
          'Creación y gestión de salas de juego',
          'Experiencia de juego multijugador en tiempo real',
        ],
      },
      accounts: {
        title: '4. Cuentas de Usuario',
        intro:
          'Para usar ciertas funciones de {{appName}}, debe registrarse para obtener una cuenta. Usted acepta:',
        items: [
          'Proporcionar información de registro precisa y completa',
          'Mantener la seguridad de las credenciales de su cuenta',
          'Ser responsable de todas las actividades bajo su cuenta',
          'Notificarnos inmediatamente de cualquier acceso no autorizado',
        ],
      },
      delivery: {
        title: '5. Productos Digitales y Entrega',
        content:
          'Todos los productos ofrecidos en {{appName}} son servicios digitales entregados electrónicamente. Tras el pago exitoso, el acceso al contenido comprado se otorga inmediatamente. Los productos digitales incluyen moneda virtual, suscripciones premium y funciones en la aplicación.',
      },
      payment: {
        title: '6. Términos de Pago',
        content:
          'Los pagos se procesan de forma segura a través de nuestros proveedores de pago autorizados. Todos los precios se muestran en la moneda aplicable al momento del pago. Al realizar una compra, nos autoriza a cobrar a su método de pago seleccionado.',
      },
      refund: {
        title: '7. Política de Reembolso',
        intro:
          'Debido a la naturaleza digital de nuestros productos, los reembolsos se manejan de la siguiente manera:',
        items: {
          virtualCurrency:
            'Moneda virtual no utilizada: Elegible para reembolso dentro de los 14 días posteriores a la compra',
          subscriptions:
            'Suscripciones: Reembolsables dentro de las 48 horas si no se utilizaron funciones premium',
          technicalIssues:
            'Problemas técnicos: Reembolso completo si no podemos resolver el problema',
          processingTime:
            'Tiempo de procesamiento: Los reembolsos se procesan en 5-10 días hábiles',
        },
        contact:
          'Para solicitar un reembolso, contáctenos a través de nuestra página de soporte.',
      },
      acceptableUse: {
        title: '8. Uso Aceptable',
        intro: 'Usted acepta no:',
        items: [
          'Usar el servicio para cualquier propósito ilegal',
          'Acosar, abusar o dañar a otros usuarios',
          'Intentar explotar, hackear o interrumpir el servicio',
          'Crear múltiples cuentas para abusar de promociones',
          'Usar herramientas automatizadas o bots',
        ],
      },
      intellectualProperty: {
        title: '9. Propiedad Intelectual',
        content:
          'Todo el contenido, marcas registradas y propiedad intelectual en {{appName}} son propiedad nuestra o de nuestros licenciantes. No puede copiar, modificar o distribuir nuestro contenido sin consentimiento previo por escrito.',
      },
      liability: {
        title: '10. Limitación de Responsabilidad',
        content:
          '{{appName}} se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables de ningún daño indirecto, incidental o consecuente que surja del uso del servicio.',
      },
      governingLaw: {
        title: '11. Ley Aplicable',
        content:
          'Estos Términos se rigen por las leyes de Georgia. Cualquier disputa se resolverá en los tribunales de Georgia, de acuerdo con la Ley de Comercio Electrónico de Georgia.',
      },
      contact: {
        title: '12. Contáctenos',
        content:
          'Si tiene preguntas sobre estos Términos, contáctenos a través de nuestra página de soporte o envíenos un correo a {{email}}.',
      },
    },
  },
  privacy: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: 21 de diciembre de 2024',
    sections: {
      introduction: {
        title: '1. Introducción',
        content:
          '{{appName}} ("nosotros", "nos" o "nuestro") está comprometido a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestro sitio web y aplicaciones móviles.',
      },
      dataCollection: {
        title: '2. Información que Recopilamos',
        intro: 'Podemos recopilar los siguientes tipos de información:',
        items: {
          account:
            'Información de la Cuenta: Nombre, dirección de correo electrónico, nombre de usuario y foto de perfil al registrarse',
          payment:
            'Información de Pago: Detalles del método de pago procesados de forma segura por nuestros proveedores de pago',
          usage:
            'Datos de Uso: Historial de juegos, preferencias y patrones de interacción',
          device:
            'Información del Dispositivo: Tipo de dispositivo, sistema operativo e identificadores únicos',
          communications:
            'Comunicaciones: Mensajes enviados a través de nuestras funciones de chat en el juego',
        },
      },
      dataUsage: {
        title: '3. Cómo Usamos Su Información',
        intro:
          'Usamos la información recopilada para los siguientes propósitos:',
        items: [
          'Proporcionar, mantener y mejorar nuestros servicios de juegos',
          'Procesar transacciones y enviar notificaciones relacionadas',
          'Personalizar su experiencia de juego',
          'Comunicarnos con usted sobre actualizaciones, promociones y soporte',
          'Detectar y prevenir fraudes, abusos y problemas de seguridad',
          'Cumplir con obligaciones legales',
        ],
      },
      dataSharing: {
        title: '4. Compartir y Divulgación de Datos',
        intro:
          'No vendemos su información personal. Podemos compartir sus datos con:',
        items: {
          serviceProviders:
            'Proveedores de Servicios: Terceros que ayudan a operar nuestra plataforma (procesadores de pago, proveedores de alojamiento)',
          legal:
            'Requisitos Legales: Cuando lo exija la ley o para proteger nuestros derechos',
          businessTransfers:
            'Transferencias Comerciales: En conexión con una fusión, adquisición o venta de activos',
        },
      },
      dataSecurity: {
        title: '5. Seguridad de los Datos',
        content:
          'Implementamos medidas técnicas y organizativas apropiadas para proteger su información personal, incluyendo cifrado, servidores seguros y controles de acceso. Sin embargo, ningún método de transmisión por Internet es 100% seguro.',
      },
      dataRetention: {
        title: '6. Retención de Datos',
        content:
          'Retenemos su información personal durante el tiempo necesario para proporcionar nuestros servicios y cumplir los propósitos descritos en esta política. Puede solicitar la eliminación de su cuenta y datos asociados en cualquier momento.',
      },
      userRights: {
        title: '7. Sus Derechos',
        intro: 'Tiene los siguientes derechos respecto a sus datos personales:',
        items: {
          access: 'Acceso: Solicitar una copia de sus datos personales',
          correction: 'Corrección: Solicitar la corrección de datos inexactos',
          deletion: 'Eliminación: Solicitar la eliminación de sus datos',
          portability:
            'Portabilidad: Solicitar la transferencia de sus datos a otro servicio',
          objection:
            'Objeción: Oponerse a ciertas actividades de procesamiento',
        },
        contact:
          'Para ejercer estos derechos, contáctenos a través de nuestra página de soporte.',
      },
      cookies: {
        title: '8. Cookies y Rastreo',
        content:
          'Usamos cookies y tecnologías similares para mejorar su experiencia, analizar patrones de uso y recordar sus preferencias. Puede controlar la configuración de cookies a través de su navegador.',
      },
      children: {
        title: '9. Privacidad de los Niños',
        content:
          'Nuestros servicios están destinados a usuarios de 18 años o más. No recopilamos intencionalmente información personal de niños menores de 18 años. Si descubrimos que hemos recopilado dichos datos, los eliminaremos de inmediato.',
      },
      internationalTransfers: {
        title: '10. Transferencias Internacionales de Datos',
        content:
          'Su información puede ser transferida y procesada en países fuera de su residencia. Nos aseguramos de que existan salvaguardas apropiadas para dichas transferencias.',
      },
      policyChanges: {
        title: '11. Cambios a Esta Política',
        content:
          'Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos de cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización".',
      },
      contact: {
        title: '12. Contáctenos',
        content:
          'Si tiene preguntas o inquietudes sobre esta Política de Privacidad, contáctenos a través de nuestra página de soporte o envíenos un correo a {{email}}.',
      },
    },
  },
  contact: {
    title: 'Contáctenos',
    tagline:
      '¿Tiene preguntas, comentarios o necesita soporte? Estamos aquí para ayudar.',
    sections: {
      getInTouch: {
        title: 'Póngase en Contacto',
        email: 'Correo Electrónico',
        workingHours: 'Horario de Atención',
        responseTime: 'Tiempo de Respuesta',
        responseValue: 'Dentro de 24-48 horas',
      },
      form: {
        title: 'Enviar un Mensaje',
        nameLabel: 'Su Nombre',
        namePlaceholder: 'Ingrese su nombre',
        emailLabel: 'Dirección de Correo',
        emailPlaceholder: 'Ingrese su correo',
        subjectLabel: 'Asunto',
        subjectPlaceholder: '¿De qué se trata?',
        messageLabel: 'Mensaje',
        messagePlaceholder: 'Cuéntenos cómo podemos ayudar...',
        submit: 'Enviar Mensaje →',
        success:
          '✓ ¡Gracias! Su mensaje ha sido enviado. Nos pondremos en contacto pronto.',
      },
      faq: {
        title: 'Preguntas Frecuentes',
        refund: {
          question: '¿Cómo solicito un reembolso?',
          answer:
            'Por favor envíe un correo a {{email}} con el correo de su cuenta y los detalles del pedido. Las solicitudes de reembolso se procesan en 5-10 días hábiles.',
        },
        password: {
          question: 'Olvidé mi contraseña. ¿Qué debo hacer?',
          answer:
            'Use el enlace "Olvidé mi contraseña" en la página de inicio de sesión para restablecer su contraseña por correo electrónico.',
        },
        deleteAccount: {
          question: '¿Cómo elimino mi cuenta?',
          answer:
            'Contáctenos a través de este formulario o envíe un correo a {{email}} con su solicitud. La eliminación de cuenta se procesa en 48 horas.',
        },
      },
    },
  },
};
