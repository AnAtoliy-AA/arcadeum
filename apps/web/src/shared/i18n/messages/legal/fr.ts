import type { LegalMessages } from './types';

export const fr: LegalMessages = {
  nav: {
    terms: 'Conditions',
    privacy: 'Confidentialité',
    contact: 'Contact',
  },
  terms: {
    title: 'Conditions Générales',
    lastUpdated: 'Dernière mise à jour : 16 août 2026',
    sections: {
      agreement: {
        title: '1. Acceptation des Conditions',
        content:
          "En accédant ou en utilisant {{appName}}, vous acceptez d'être lié par ces Conditions Générales. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.",
      },
      companyInfo: {
        title: "2. Informations sur l'Entreprise",
        companyName: "Nom de l'Entreprise :",
        legalName: 'Raison Sociale :',
        idCode: "Code d'Identification :",
        contactEmail: 'Email de Contact :',
        workingHours: "Heures d'Ouverture :",
      },
      services: {
        title: '3. Description des Services',
        intro:
          '{{appName}} fournit une plateforme de jeux multijoueurs en ligne proposant des jeux de cartes de divertissement. Nos services comprennent :',
        items: [
          'Accès aux jeux de cartes multijoueurs via applications web et mobiles',
          'Monnaie virtuelle et fonctionnalités premium en jeu',
          'Création et gestion de salles de jeu',
          'Expérience de jeu multijoueur en temps réel',
        ],
      },
      accounts: {
        title: '4. Comptes Utilisateurs et Éligibilité',
        intro:
          'Pour utiliser certaines fonctionnalités de {{appName}}, vous devez créer un compte. En vous inscrivant, vous confirmez avoir au moins 18 ans (ou l’âge légal de la majorité dans votre juridiction) et acceptez de :',
        items: [
          'Confirmer que vous avez au moins 18 ans ou plus',
          "Fournir des informations d'inscription exactes et complètes",
          'Maintenir la sécurité de vos identifiants de compte',
          'Être responsable de toutes les activités sous votre compte',
          'Nous notifier immédiatement de tout accès non autorisé',
        ],
      },
      delivery: {
        title: '5. Produits Numériques et Livraison',
        content:
          "Tous les produits proposés sur {{appName}} sont des services numériques livrés électroniquement. Après paiement réussi, l'accès au contenu acheté est accordé immédiatement. Les produits numériques incluent la monnaie virtuelle, les abonnements premium et les fonctionnalités intégrées.",
      },
      payment: {
        title: '6. Conditions de Paiement',
        content:
          'Les paiements sont traités de manière sécurisée par nos prestataires de paiement agréés. Tous les prix sont affichés dans la devise applicable lors du paiement. En effectuant un achat, vous nous autorisez à débiter votre mode de paiement sélectionné.',
      },
      refund: {
        title: '7. Politique de Remboursement',
        intro:
          'En raison de la nature numérique de nos produits, les remboursements sont traités comme suit :',
        items: {
          virtualCurrency:
            "Monnaie virtuelle non utilisée : Éligible au remboursement dans les 14 jours suivant l'achat",
          subscriptions:
            "Abonnements : Remboursables dans les 48 heures si aucune fonctionnalité premium n'a été utilisée",
          technicalIssues:
            'Problèmes techniques : Remboursement intégral si nous ne pouvons pas résoudre le problème',
          processingTime:
            'Délai de traitement : Les remboursements sont traités sous 5 à 10 jours ouvrables',
        },
        contact:
          'Pour demander un remboursement, veuillez nous contacter via notre page de support.',
      },
      acceptableUse: {
        title: '8. Utilisation Acceptable et Jeu Équitable',
        intro: 'Vous acceptez de ne pas :',
        items: [
          'Utiliser le service à des fins illégales',
          "Harceler, abuser ou nuire à d'autres utilisateurs",
          "Tenter d'exploiter, pirater ou perturber le service",
          'Créer plusieurs comptes pour abuser des promotions ou accumuler des pièces',
          'Utiliser des outils automatisés, des scripts ou des bots',
          'Vous livrer au transfert intentionnel de jetons (chip dumping), au trucage de parties ou aux défaites volontaires pour transférer des pièces ou du classement',
          'Vous entendre avec d’autres joueurs pour manipuler les parties, les cagnottes, les tournois ou les classements',
        ],
      },
      intellectualProperty: {
        title: '9. Propriété Intellectuelle',
        content:
          'Tout le contenu, les marques et la propriété intellectuelle sur {{appName}} nous appartiennent ou appartiennent à nos concédants de licence. Vous ne pouvez pas copier, modifier ou distribuer notre contenu sans consentement écrit préalable.',
      },
      liability: {
        title: '10. Limitation de Responsabilité',
        content:
          '{{appName}} est fourni "tel quel" sans garantie d\'aucune sorte. Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs résultant de votre utilisation du service.',
      },
      crypto: {
        title: '11. Cryptomonnaies et Actifs Numériques',
        content:
          "Les jetons ARCADEUM et les points virtuels sont des actifs utilitaires destinés exclusivement au divertissement au sein de notre plateforme de jeux basés sur les compétences. Ils n'ont aucune valeur monétaire intrinsèque en dehors de la plateforme. Les utilisateurs sont seuls responsables de leurs obligations fiscales et réglementaires en matière de cryptomonnaies. Arcadeum Games ne garantit la valeur d'aucun actif numérique et les utilisateurs ne doivent pas les considérer comme des investissements.",
      },
      arcPayments: {
        title: '12. Paiements par Jetons ARC',
        content:
          'Arcadeum Games accepte les jetons ARCADEUM (ARC) sur la blockchain Solana comme mode de paiement pour les biens et services virtuels. En utilisant les paiements ARC, vous reconnaissez et acceptez ce qui suit:',
        items: [
          'Les prix des jetons ARC sont calculés dynamiquement en fonction du taux de change USD actuel et peuvent fluctuer selon les conditions du marché.',
          'Le pourcentage de réduction appliqué aux paiements ARC est défini par Arcadeum Games et peut être modifié à tout moment sans préavis.',
          'Toutes les transactions ARC sont irréversibles une fois confirmées sur la blockchain Solana. Arcadeum Games ne peut pas annuler, rembourser ou annuler les paiements ARC confirmés.',
          "Vous êtes seul responsable de la vérification de l'exactitude de l'adresse du portefeuille du destinataire et du montant de la transaction avant d'envoyer des jetons ARC.",
          "Arcadeum Games n'est pas responsable des fonds envoyés à des adresses incorrectes ou perdus en raison d'erreurs de portefeuille.",
          "L'adresse du portefeuille du trésor pour les paiements ARC est affichée lors du paiement. Vérifiez toujours que cette adresse correspond à celle affichée sur le site officiel d'Arcadeum Games.",
          "Les jetons ARC utilisés pour les paiements sont convertis en monnaie virtuelle de la plateforme (gems) au taux de change actuel. Les gems converties n'ont aucune valeur monétaire et ne peuvent pas être reconverties en ARC ou en toute monnaie fiduciaire.",
          'Les utilisateurs sont responsables de tous les frais de réseau (gas) associés aux transactions ARC.',
          'Arcadeum Games se réserve le droit de suspendre ou de désactiver les paiements ARC à tout moment pour maintenance, sécurité ou raisons réglementaires.',
        ],
      },
      noCashout: {
        title: '13. Pas de Retrait en Argent',
        content:
          "Les jetons ARC, gems, pièces et toutes les autres monnaies virtuels et objets de la plateforme Arcadeum Games n'ont aucune valeur monétaire réelle et ne peuvent pas être échangés, convertis ou échangés contre des monnaies fiduciaires (USD, EUR, etc.), des cryptomonnaies ou des biens ou services en dehors de la plateforme. Arcadeum Games n'offre, ne facilite et ne soutient aucun retrait, retrait ou conversion d'actifs internes en valeur externe. Toute tentative de vente, d'échange ou de transfert d'actifs virtuels en dehors d'Arcadeum Games est strictement interdite et peut entraîner la résiliation du compte.",
      },
      notSecurity: {
        title: '14. Pas une Valeur Mobilière',
        content:
          "Les jetons ARC et toutes les monnaies virtuelles de la plateforme Arcadeum Games sont des jetons utilitaires conçus uniquement pour une utilisation sur la plateforme. Ils ne sont pas des valeurs mobilières, des actions, des obligations, des contrats d'investissement ou des instruments financiers de quelque nature que ce soit. Rien dans la plateforme Arcadeum Games ne constitue une offre de vente ou une sollicitation d'offre d'achat de valeurs mobilières. Arcadeum Games ne fournit pas de conseils en investissement et l'achat de jetons ARC ne doit pas être considéré comme un investissement. Les prix passés des jetons ne garantissent pas les performances futures.",
      },
      taxes: {
        title: '15. Obligations Fiscales',
        content:
          'Les utilisateurs sont seuls responsables de la compréhension et du respect de toutes les obligations fiscales applicables dans leur juridiction. Arcadeum Games ne fournit pas de conseils fiscaux, juridiques ou comptables. Les informations suivantes ne sont que génériques et peuvent ne pas refléter votre situation spécifique:',
        items: [
          "Les transactions en monnaie virtuelle peuvent être soumises à l'impôt sur le revenu, à l'impôt sur les plus-values ou à d'autres impôts dans votre juridiction.",
          "Les utilisateurs doivent déclarer tous les événements imposables liés à leur utilisation d'Arcadeum Games aux autorités fiscales compétentes.",
          'Arcadeum Games peut être tenu de fournir des rapports fiscaux ou de retenir des impôts dans certaines juridictions.',
          "Les lois fiscales varient d'un pays à l'autre et changent fréquemment. Consultez un professionnel qualifié en fiscalité pour des conseils spécifiques à votre situation.",
          "Arcadeum Games n'est pas responsable de quelconques obligations fiscales découlant de votre utilisation de la plateforme.",
        ],
        important:
          "IMPORTANT: Les obligations fiscales varient selon la juridiction. Certains pays imposent les transactions en monnaie virtuelle, d'autres non. Vous êtes seul responsable de la compréhension et du respect des lois fiscales locales.",
      },
      governingLaw: {
        title: '16. Droit Applicable',
        content:
          'Ces Conditions sont régies par les lois de la Géorgie. Tout litige sera résolu devant les tribunaux de Géorgie, conformément à la Loi géorgienne sur le Commerce Électronique.',
      },
      contact: {
        title: '17. Nous Contacter',
        content:
          'Si vous avez des questions concernant ces Conditions, veuillez nous contacter via notre page de support ou nous envoyer un email à {{email}}.',
      },
    },
  },
  privacy: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour : 16 août 2026',
    sections: {
      introduction: {
        title: '1. Introduction',
        content:
          '{{appName}} ("nous", "notre") s\'engage à protéger votre vie privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre site web et nos applications mobiles.',
      },
      dataCollection: {
        title: '2. Informations que Nous Collectons',
        intro: "Nous pouvons collecter les types d'informations suivants :",
        items: {
          account:
            "Informations de Compte : Nom, adresse email, nom d'utilisateur et photo de profil lors de l'inscription",
          payment:
            'Informations de Paiement : Détails du mode de paiement traités de manière sécurisée par nos prestataires de paiement',
          usage:
            "Données d'Utilisation : Historique de jeu, préférences et modèles d'interaction",
          device:
            "Informations sur l'Appareil : Type d'appareil, système d'exploitation et identifiants uniques",
          communications:
            'Communications : Messages envoyés via nos fonctionnalités de chat en jeu',
        },
      },
      dataUsage: {
        title: '3. Comment Nous Utilisons Vos Informations',
        intro:
          'Nous utilisons les informations collectées aux fins suivantes :',
        items: [
          'Fournir, maintenir et améliorer nos services de jeux',
          'Traiter les transactions et envoyer les notifications associées',
          'Personnaliser votre expérience de jeu',
          'Communiquer avec vous concernant les mises à jour, promotions et support',
          'Détecter et prévenir la fraude, les abus et les problèmes de sécurité',
          'Respecter les obligations légales',
        ],
      },
      dataSharing: {
        title: '4. Partage et Divulgation des Données',
        intro:
          'Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos données avec :',
        items: {
          serviceProviders:
            'Prestataires de Services : Tiers qui aident à exploiter notre plateforme (processeurs de paiement, hébergeurs)',
          legal:
            "Exigences Légales : Lorsque la loi l'exige ou pour protéger nos droits",
          businessTransfers:
            "Transferts Commerciaux : Dans le cadre d'une fusion, acquisition ou vente d'actifs",
        },
      },
      dataSecurity: {
        title: '5. Sécurité des Données',
        content:
          "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles, notamment le chiffrement, les serveurs sécurisés et les contrôles d'accès. Cependant, aucune méthode de transmission sur Internet n'est sécurisée à 100%.",
      },
      dataRetention: {
        title: '6. Conservation des Données',
        content:
          'Nous conservons vos informations personnelles aussi longtemps que nécessaire pour fournir nos services et atteindre les objectifs décrits dans cette politique. Vous pouvez demander la suppression de votre compte et des données associées à tout moment.',
      },
      userRights: {
        title: '7. Vos Droits',
        intro:
          'Vous disposez des droits suivants concernant vos données personnelles :',
        items: {
          access: 'Accès : Demander une copie de vos données personnelles',
          correction:
            'Correction : Demander la correction de données inexactes',
          deletion: 'Suppression : Demander la suppression de vos données',
          portability:
            'Portability : Demander le transfert de vos données vers un autre service',
          objection:
            "Opposition : S'opposer à certaines activités de traitement",
        },
        contact:
          'Pour exercer ces droits, veuillez nous contacter via notre page de support.',
      },
      cookies: {
        title: '8. Cookies et Suivi',
        content:
          "Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience, analyser les modèles d'utilisation et mémoriser vos préférences. Vous pouvez contrôler les paramètres des cookies via votre navigateur.",
      },
      children: {
        title: '9. Confidentialité des Enfants',
        content:
          "Nos services sont destinés aux utilisateurs de 18 ans et plus. Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants de moins de 18 ans. Si nous apprenons que nous avons collecté de telles données, nous les supprimerons rapidement.",
      },
      internationalTransfers: {
        title: '10. Transferts Internationaux de Données',
        content:
          'Vos informations peuvent être transférées et traitées dans des pays en dehors de votre résidence. Nous nous assurons que des garanties appropriées sont en place pour ces transferts.',
      },
      policyChanges: {
        title: '11. Modifications de Cette Politique',
        content:
          'Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Nous vous informerons des changements importants en publiant la nouvelle politique sur cette page et en mettant à jour la date de "Dernière mise à jour".',
      },
      contact: {
        title: '12. Nous Contacter',
        content:
          'Si vous avez des questions ou des préoccupations concernant cette Politique de Confidentialité, veuillez nous contacter via notre page de support ou nous envoyer un email à {{email}}.',
      },
    },
  },
  contact: {
    title: 'Nous Contacter',
    tagline:
      "Des questions, des commentaires ou besoin d'aide ? Nous sommes là pour vous aider.",
    sections: {
      getInTouch: {
        title: 'Nous Joindre',
        email: 'Email',
        workingHours: "Heures d'Ouverture",
        responseTime: 'Délai de Réponse',
        responseValue: 'Sous 24-48 heures',
      },
      hero: {
        eyebrow: 'Support joueurs',
        title: 'Nous sommes dans la même équipe.',
        tagline:
          "Posez une question, signalez un bug, partagez une idée — nous lisons chaque message et toute l'équipe joue aux jeux que nous publions.",
        statusOk: 'Tous les systèmes opérationnels',
        medianReply: '~ {{hours}} h de réponse médiane',
        humansOnline: '{{count}} personnes en ligne',
        languages: '{{count}} langues',
      },
      stats: {
        ticketsResolved: 'Tickets résolus ce mois-ci',
        avgRating: 'Note moyenne du support',
        languagesSupported: 'Langues prises en charge',
        slaHit: 'Taux de SLA respecté',
        ticketsResolvedValue: '2 840',
        avgRatingValue: '4,9 ★',
        languagesSupportedValue: '5',
        slaHitValue: '98 %',
      },
      channels: {
        discord: {
          title: 'Discord',
          sub: 'Chat en direct · {{count}} membres',
          memberCount: '12,4k',
        },
        x: { title: '@_arcadeum_', sub: 'Les DMs sont ouverts' },
        twitter: { title: '@_arcadeum_', sub: 'Les DMs sont ouverts' },
        instagram: { title: 'Instagram', sub: 'Actus et captures' },
        telegram: { title: 'Telegram', sub: 't.me/arcadeum' },
        github: {
          title: 'GitHub Issues',
          sub: 'Bugs et demandes de fonctionnalités',
        },
      },
      form: {
        title: "Écrivez à l'équipe",
        subtitle: 'Message direct',
        repliesNote: 'Les réponses arrivent sur votre email',
        nameLabel: 'Votre Nom',
        namePlaceholder: 'Entrez votre nom',
        emailLabel: 'Adresse Email',
        emailPlaceholder: 'Entrez votre email',
        subjectLabel: 'Sujet',
        subjectPlaceholder: "De quoi s'agit-il ?",
        messageLabel: 'Message',
        messagePlaceholder: 'Dites-nous comment nous pouvons vous aider...',
        name: 'Votre nom',
        email: 'Email',
        subject: 'Sujet',
        message: 'Message',
        privacy: 'Confidentiel — nous ne partageons jamais votre email.',
        submit: 'Lancer le message',
        submitting: 'Envoi…',
        successTitle: 'Message parti.',
        successBody:
          'Réponse attendue sous 4 heures. Une copie a été envoyée sur votre email.',
        sendAnother: 'Envoyer un autre',
        openMail: 'Ouvrir dans votre messagerie',
        errorTitle: "Impossible d'envoyer votre message",
        errorBody:
          'Quelque chose a mal tourné de notre côté. Réessayez ou ouvrez votre messagerie pour envoyer directement.',
        tryAgain: 'Réessayer',
        success:
          '✓ Merci ! Votre message a été envoyé. Nous vous répondrons bientôt.',
      },
      side: {
        onCall: 'En service maintenant',
        onCallTeam: 'Maria, Anatoliy +{{extra}}',
        onCallRegion: 'Support · EU + LATAM',
        medianFirstReply: 'Médiane première réponse',
        medianFirstReplyValue: '4 h',
        workingHours: 'Heures de travail',
        coverage: 'Couverture',
        coverageValue: 'GMT-5 → GMT+8',
        devsLabel: 'Pour les développeurs',
        devsTitle: 'Bugs et intégration',
        devsBody:
          'Les bugs reproductibles, problèmes API et questions SDK sont suivis sur GitHub. Triage sous 24 heures.',
        openIssue: 'Ouvrir un ticket',
        press: 'Presse et partenariats',
        pressEmail: 'hello@arcadeum.games',
        pressBody: 'Pour les médias, créateurs et studios partenaires.',
        statusLabel: 'État des systèmes',
        statusTitle: 'Tous les systèmes opérationnels',
        statusBody: '99,98 % de disponibilité sur les 30 derniers jours.',
        statusLinkLabel: 'Voir la page de statut',
      },
      common: {
        questionsLabel: 'Questions fréquentes',
      },
      tips: {
        label: 'Réponses plus rapides',
        title: 'Aidez-nous à vous répondre plus vite',
        orderId:
          'Indiquez votre numéro de commande pour les remboursements ou paiements — on retrouve le reçu instantanément.',
        bugs: 'Pour les bugs : étapes de reproduction, navigateur et appareil. Plus c’est précis, plus on triage vite.',
        screenshots:
          'Les captures d’écran sont les bienvenues — collez-les directement dans le message, pas besoin de pièces jointes.',
        account:
          "Pour les soucis de connexion ou de compte — indiquez l'email d'inscription pour qu'on retrouve votre compte.",
        urgent:
          "Urgent ? Ajoutez « urgent » à l'objet et on l'envoie à l'équipe de garde.",
        language:
          'Écrivez dans la langue de votre choix — on répond en EN, RU, ES, FR, BY.',
        footer:
          'Chaque message est lu par un humain de notre équipe — pas de chatbot, pas de réponse auto.',
      },
      ticker: {
        label: 'Flux QG en direct',
      },
      faq: {
        title: 'Nous y avons peut-être déjà répondu',
        browse: "Centre d'aide",
        refund: {
          question: 'Puis-je obtenir un remboursement ?',
          answer:
            "L'éligibilité au remboursement dépend de l'article et du temps écoulé. Contactez {{email}} avec votre numéro de commande et nous reviendrons vers vous sous un jour ouvré.",
        },
        password: {
          question: 'Comment réinitialiser mon mot de passe ?',
          answer:
            "Utilisez le lien « Mot de passe oublié » sur l'écran de connexion. L'email arrive en environ une minute — vérifiez les spams. Si votre email a changé, contactez le support.",
        },
        deleteAccount: {
          question: 'Comment supprimer mon compte ?',
          answer:
            "La suppression de compte est définitive et efface vos statistiques, votre liste d'amis et votre historique. Écrivez à {{email}} depuis l'adresse liée au compte pour démarrer le processus.",
        },
        multiplayerLag: {
          question: 'Pourquoi mon jeu lague en multijoueur ?',
          answer:
            'La plupart des lags viennent du routage régional. Changez votre région de matchmaking dans Paramètres → Réseau, ou consultez status.arcadeum.games.',
        },
        reportPlayer: {
          question: 'Comment signaler un autre joueur ?',
          answer:
            "En jeu, utilisez le menu ⋯ à côté du pseudo → Signaler. L'équipe de modération examine les signalements sous 24 heures.",
        },
      },
    },
  },
};

export const legalMessagesFr = fr;
