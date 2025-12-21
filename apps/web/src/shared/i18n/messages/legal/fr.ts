import type { LegalMessages } from "./types";

export const legalMessagesFr: LegalMessages = {
  nav: {
    terms: "Conditions",
    privacy: "Confidentialité",
    contact: "Contact",
  },
  terms: {
    title: "Conditions Générales",
    lastUpdated: "Dernière mise à jour : 21 décembre 2024",
    sections: {
      agreement: {
        title: "1. Acceptation des Conditions",
        content: "En accédant ou en utilisant {appName}, vous acceptez d'être lié par ces Conditions Générales. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.",
      },
      companyInfo: {
        title: "2. Informations sur l'Entreprise",
        companyName: "Nom de l'Entreprise :",
        legalName: "Raison Sociale :",
        idCode: "Code d'Identification :",
        contactEmail: "Email de Contact :",
        workingHours: "Heures d'Ouverture :",
      },
      services: {
        title: "3. Description des Services",
        intro: "{appName} fournit une plateforme de jeux multijoueurs en ligne proposant des jeux de cartes de divertissement. Nos services comprennent :",
        items: [
          "Accès aux jeux de cartes multijoueurs via applications web et mobiles",
          "Monnaie virtuelle et fonctionnalités premium en jeu",
          "Création et gestion de salles de jeu",
          "Expérience de jeu multijoueur en temps réel",
        ],
      },
      accounts: {
        title: "4. Comptes Utilisateurs",
        intro: "Pour utiliser certaines fonctionnalités de {appName}, vous devez créer un compte. Vous acceptez de :",
        items: [
          "Fournir des informations d'inscription exactes et complètes",
          "Maintenir la sécurité de vos identifiants de compte",
          "Être responsable de toutes les activités sous votre compte",
          "Nous notifier immédiatement de tout accès non autorisé",
        ],
      },
      delivery: {
        title: "5. Produits Numériques et Livraison",
        content: "Tous les produits proposés sur {appName} sont des services numériques livrés électroniquement. Après paiement réussi, l'accès au contenu acheté est accordé immédiatement. Les produits numériques incluent la monnaie virtuelle, les abonnements premium et les fonctionnalités intégrées.",
      },
      payment: {
        title: "6. Conditions de Paiement",
        content: "Les paiements sont traités de manière sécurisée par nos prestataires de paiement agréés. Tous les prix sont affichés dans la devise applicable lors du paiement. En effectuant un achat, vous nous autorisez à débiter votre mode de paiement sélectionné.",
      },
      refund: {
        title: "7. Politique de Remboursement",
        intro: "En raison de la nature numérique de nos produits, les remboursements sont traités comme suit :",
        items: {
          virtualCurrency: "Monnaie virtuelle non utilisée : Éligible au remboursement dans les 14 jours suivant l'achat",
          subscriptions: "Abonnements : Remboursables dans les 48 heures si aucune fonctionnalité premium n'a été utilisée",
          technicalIssues: "Problèmes techniques : Remboursement intégral si nous ne pouvons pas résoudre le problème",
          processingTime: "Délai de traitement : Les remboursements sont traités sous 5 à 10 jours ouvrables",
        },
        contact: "Pour demander un remboursement, veuillez nous contacter via notre page de support.",
      },
      acceptableUse: {
        title: "8. Utilisation Acceptable",
        intro: "Vous acceptez de ne pas :",
        items: [
          "Utiliser le service à des fins illégales",
          "Harceler, abuser ou nuire à d'autres utilisateurs",
          "Tenter d'exploiter, pirater ou perturber le service",
          "Créer plusieurs comptes pour abuser des promotions",
          "Utiliser des outils automatisés ou des bots",
        ],
      },
      intellectualProperty: {
        title: "9. Propriété Intellectuelle",
        content: "Tout le contenu, les marques et la propriété intellectuelle sur {appName} nous appartiennent ou appartiennent à nos concédants de licence. Vous ne pouvez pas copier, modifier ou distribuer notre contenu sans consentement écrit préalable.",
      },
      liability: {
        title: "10. Limitation de Responsabilité",
        content: "{appName} est fourni \"tel quel\" sans garantie d'aucune sorte. Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs résultant de votre utilisation du service.",
      },
      governingLaw: {
        title: "11. Droit Applicable",
        content: "Ces Conditions sont régies par les lois de la Géorgie. Tout litige sera résolu devant les tribunaux de Géorgie, conformément à la Loi géorgienne sur le Commerce Électronique.",
      },
      contact: {
        title: "12. Nous Contacter",
        content: "Si vous avez des questions concernant ces Conditions, veuillez nous contacter via notre page de support ou nous envoyer un email à {email}.",
      },
    },
  },
  privacy: {
    title: "Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour : 21 décembre 2024",
    sections: {
      introduction: {
        title: "1. Introduction",
        content: "{appName} (\"nous\", \"notre\") s'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre site web et nos applications mobiles.",
      },
      dataCollection: {
        title: "2. Informations que Nous Collectons",
        intro: "Nous pouvons collecter les types d'informations suivants :",
        items: {
          account: "Informations de Compte : Nom, adresse email, nom d'utilisateur et photo de profil lors de l'inscription",
          payment: "Informations de Paiement : Détails du mode de paiement traités de manière sécurisée par nos prestataires de paiement",
          usage: "Données d'Utilisation : Historique de jeu, préférences et modèles d'interaction",
          device: "Informations sur l'Appareil : Type d'appareil, système d'exploitation et identifiants uniques",
          communications: "Communications : Messages envoyés via nos fonctionnalités de chat en jeu",
        },
      },
      dataUsage: {
        title: "3. Comment Nous Utilisons Vos Informations",
        intro: "Nous utilisons les informations collectées aux fins suivantes :",
        items: [
          "Fournir, maintenir et améliorer nos services de jeux",
          "Traiter les transactions et envoyer les notifications associées",
          "Personnaliser votre expérience de jeu",
          "Communiquer avec vous concernant les mises à jour, promotions et support",
          "Détecter et prévenir la fraude, les abus et les problèmes de sécurité",
          "Respecter les obligations légales",
        ],
      },
      dataSharing: {
        title: "4. Partage et Divulgation des Données",
        intro: "Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos données avec :",
        items: {
          serviceProviders: "Prestataires de Services : Tiers qui aident à exploiter notre plateforme (processeurs de paiement, hébergeurs)",
          legal: "Exigences Légales : Lorsque la loi l'exige ou pour protéger nos droits",
          businessTransfers: "Transferts Commerciaux : Dans le cadre d'une fusion, acquisition ou vente d'actifs",
        },
      },
      dataSecurity: {
        title: "5. Sécurité des Données",
        content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles, notamment le chiffrement, les serveurs sécurisés et les contrôles d'accès. Cependant, aucune méthode de transmission sur Internet n'est sécurisée à 100%.",
      },
      dataRetention: {
        title: "6. Conservation des Données",
        content: "Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services et atteindre les objectifs décrits dans cette politique. Vous pouvez demander la suppression de votre compte et des données associées à tout moment.",
      },
      userRights: {
        title: "7. Vos Droits",
        intro: "Vous disposez des droits suivants concernant vos données personnelles :",
        items: {
          access: "Accès : Demander une copie de vos données personnelles",
          correction: "Correction : Demander la correction de données inexactes",
          deletion: "Suppression : Demander la suppression de vos données",
          portability: "Portabilité : Demander le transfert de vos données vers un autre service",
          objection: "Opposition : S'opposer à certaines activités de traitement",
        },
        contact: "Pour exercer ces droits, veuillez nous contacter via notre page de support.",
      },
      cookies: {
        title: "8. Cookies et Suivi",
        content: "Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience, analyser les modèles d'utilisation et mémoriser vos préférences. Vous pouvez contrôler les paramètres des cookies via votre navigateur.",
      },
      children: {
        title: "9. Confidentialité des Enfants",
        content: "Nos services sont destinés aux utilisateurs de 18 ans et plus. Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants de moins de 18 ans. Si nous apprenons que nous avons collecté de telles données, nous les supprimerons rapidement.",
      },
      internationalTransfers: {
        title: "10. Transferts Internationaux de Données",
        content: "Vos informations peuvent être transférées et traitées dans des pays en dehors de votre résidence. Nous nous assurons que des garanties appropriées sont en place pour ces transferts.",
      },
      policyChanges: {
        title: "11. Modifications de Cette Politique",
        content: "Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Nous vous informerons des changements importants en publiant la nouvelle politique sur cette page et en mettant à jour la date de \"Dernière mise à jour\".",
      },
      contact: {
        title: "12. Nous Contacter",
        content: "Si vous avez des questions ou des préoccupations concernant cette Politique de Confidentialité, veuillez nous contacter via notre page de support ou nous envoyer un email à {email}.",
      },
    },
  },
  contact: {
    title: "Nous Contacter",
    tagline: "Des questions, des commentaires ou besoin d'aide ? Nous sommes là pour vous aider.",
    sections: {
      getInTouch: {
        title: "Nous Joindre",
        email: "Email",
        workingHours: "Heures d'Ouverture",
        responseTime: "Délai de Réponse",
        responseValue: "Sous 24-48 heures",
      },
      form: {
        title: "Envoyer un Message",
        nameLabel: "Votre Nom",
        namePlaceholder: "Entrez votre nom",
        emailLabel: "Adresse Email",
        emailPlaceholder: "Entrez votre email",
        subjectLabel: "Sujet",
        subjectPlaceholder: "De quoi s'agit-il ?",
        messageLabel: "Message",
        messagePlaceholder: "Dites-nous comment nous pouvons vous aider...",
        submit: "Envoyer le Message →",
        success: "✓ Merci ! Votre message a été envoyé. Nous vous répondrons bientôt.",
      },
      faq: {
        title: "Questions Fréquentes",
        refund: {
          question: "Comment demander un remboursement ?",
          answer: "Veuillez envoyer un email à {email} avec l'email de votre compte et les détails de la commande. Les demandes de remboursement sont traitées sous 5-10 jours ouvrables.",
        },
        password: {
          question: "J'ai oublié mon mot de passe. Que faire ?",
          answer: "Utilisez le lien \"Mot de passe oublié\" sur la page de connexion pour réinitialiser votre mot de passe par email.",
        },
        deleteAccount: {
          question: "Comment supprimer mon compte ?",
          answer: "Contactez-nous via ce formulaire ou envoyez un email à {email} avec votre demande. La suppression du compte est traitée sous 48 heures.",
        },
      },
    },
  },
};
