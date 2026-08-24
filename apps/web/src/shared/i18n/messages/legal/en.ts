import type { LegalMessages } from './types';

export const en: LegalMessages = {
  nav: {
    terms: 'Terms',
    privacy: 'Privacy',
    contact: 'Contact',
  },
  terms: {
    title: 'Terms and Conditions',
    lastUpdated: 'Last updated: August 16, 2026',
    sections: {
      agreement: {
        title: '1. Agreement to Terms',
        content:
          'By accessing or using {{appName}}, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.',
      },
      companyInfo: {
        title: '2. Company Information',
        companyName: 'Company Name:',
        legalName: 'Legal Name:',
        idCode: 'Identification Code:',
        contactEmail: 'Contact Email:',
        workingHours: 'Working Hours:',
      },
      services: {
        title: '3. Description of Services',
        intro:
          '{{appName}} provides an online multiplayer gaming platform offering card-based entertainment games. Our services include:',
        items: [
          'Access to multiplayer card games via web and mobile applications',
          'In-game virtual currency and premium features',
          'Game room creation and management',
          'Real-time multiplayer gaming experience',
        ],
      },
      accounts: {
        title: '4. User Accounts & Eligibility',
        intro:
          'To use certain features of {{appName}}, you must register for an account. By registering, you confirm that you are at least 18 years of age (or the legal age of majority in your jurisdiction) and agree to:',
        items: [
          'Confirm that you are at least 18 years of age or older',
          'Provide accurate and complete registration information',
          'Maintain the security of your account credentials',
          'Be responsible for all activities under your account',
          'Notify us immediately of any unauthorized access',
        ],
      },
      delivery: {
        title: '5. Digital Products and Delivery',
        content:
          'All products offered on {{appName}} are digital services delivered electronically. Upon successful payment, access to purchased content is granted immediately. Digital products include virtual currency, premium subscriptions, and in-app features.',
      },
      payment: {
        title: '6. Payment Terms',
        content:
          'Payments are processed securely through our authorized payment providers. All prices are displayed in the applicable currency at checkout. By making a purchase, you authorize us to charge your selected payment method.',
      },
      refund: {
        title: '7. Refund Policy',
        intro:
          'Due to the digital nature of our products, refunds are handled as follows:',
        items: {
          virtualCurrency:
            'Unused virtual currency: Eligible for refund within 14 days of purchase',
          subscriptions:
            'Subscriptions: Refundable within 48 hours if no premium features were used',
          technicalIssues:
            'Technical issues: Full refund if we cannot resolve the issue',
          processingTime:
            'Processing time: Refunds are processed within 5-10 business days',
        },
        contact: 'To request a refund, please contact us at our support page.',
      },
      acceptableUse: {
        title: '8. Acceptable Use',
        intro: 'You agree not to:',
        items: [
          'Use the service for any illegal purpose',
          'Harass, abuse, or harm other users',
          'Attempt to exploit, hack, or disrupt the service',
          'Create multiple accounts to abuse promotions',
          'Use automated tools or bots',
        ],
      },
      intellectualProperty: {
        title: '9. Intellectual Property',
        content:
          'All content, trademarks, and intellectual property on {{appName}} are owned by us or our licensors. You may not copy, modify, or distribute our content without prior written consent.',
      },
      liability: {
        title: '10. Limitation of Liability',
        content:
          '{{appName}} is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
      },
      crypto: {
        title: '11. Cryptocurrency & Digital Assets',
        content:
          'ARCADEUM tokens and virtual points are utility assets meant exclusively for entertainment within our skill-based gaming platform. They have no inherent monetary value outside the platform. Users are solely responsible for their local cryptocurrency tax compliance and regulatory obligations. Arcadeum does not guarantee the value of any digital assets and users should not treat them as investments.',
      },
      arcPayments: {
        title: '12. ARC Token Payments',
        content:
          'Arcadeum Games accepts ARCADEUM (ARC) tokens on the Solana blockchain as payment for virtual goods and services. By using ARC payments, you acknowledge and agree to the following:',
        items: [
          'ARC token prices are dynamically calculated based on the current USD exchange rate and may fluctuate with market conditions.',
          'A discount percentage applied to ARC payments is set by Arcadeum Games and may be changed at any time without prior notice.',
          'All ARC transactions are irreversible once confirmed on the Solana blockchain. Arcadeum Games cannot reverse, refund, or cancel confirmed ARC payments.',
          'You are solely responsible for verifying the correctness of the recipient wallet address and transaction amount before sending ARC tokens.',
          'Arcadeum Games is not responsible for funds sent to incorrect addresses or lost due to wallet errors.',
          'The treasury wallet address for ARC payments is displayed at checkout. Always verify this address matches what is shown on the official Arcadeum Games website.',
          'ARC tokens used for payments are converted to in-platform virtual currency (gems) at the current exchange rate. The converted gems have no cash value and cannot be converted back to ARC or any fiat currency.',
          'Users are responsible for all network fees (gas) associated with ARC transactions.',
          'Arcadeum Games reserves the right to suspend or disable ARC payments at any time for maintenance, security, or regulatory reasons.',
        ],
      },
      noCashout: {
        title: '13. No Cash-Out',
        content:
          'ARC tokens, gems, coins, and all other virtual currencies and items within Arcadeum Games have no real-world monetary value and cannot be exchanged, converted, or redeemed for fiat currency (USD, EUR, etc.), cryptocurrency, or any goods or services outside the platform. Arcadeum Games does not offer, facilitate, or support any cash-out, withdrawal, or conversion of in-platform assets to external value. Any attempt to sell, trade, or transfer virtual assets outside Arcadeum Games is strictly prohibited and may result in account termination.',
      },
      notSecurity: {
        title: '14. Not a Security',
        content:
          'ARC tokens and all virtual currencies within Arcadeum Games are utility tokens designed solely for use within the platform. They are not securities, stocks, bonds, investment contracts, or financial instruments of any kind. Nothing in the Arcadeum Games platform constitutes an offer to sell or a solicitation of an offer to buy any security. Arcadeum Games does not provide investment advice, and the purchase of ARC tokens should not be considered an investment. Past token prices do not guarantee future performance.',
      },
      taxes: {
        title: '15. Tax Obligations',
        content:
          'Users are solely responsible for understanding and complying with all applicable tax obligations in their jurisdiction. Arcadeum Games does not provide tax, legal, or accounting advice. The following is general information only and may not reflect your specific situation:',
        items: [
          'Virtual currency transactions may be subject to income tax, capital gains tax, or other taxes in your jurisdiction.',
          'Users must report any taxable events related to their use of Arcadeum Games to the appropriate tax authorities.',
          'Arcadeum Games may be required to provide tax reports or withhold taxes in certain jurisdictions.',
          'Tax laws vary by country and change frequently. Consult a qualified tax professional for advice specific to your situation.',
          'Arcadeum Games is not responsible for any tax liabilities arising from your use of the platform.',
        ],
        important:
          'IMPORTANT: Tax obligations vary by jurisdiction. Some countries tax virtual currency transactions, others do not. You are solely responsible for understanding and complying with your local tax laws.',
      },
      governingLaw: {
        title: '16. Governing Law',
        content:
          'These Terms are governed by the laws of Georgia. Any disputes shall be resolved in the courts of Georgia, in accordance with the Georgian Law on Electronic Commerce.',
      },
      contact: {
        title: '17. Contact Us',
        content:
          'If you have questions about these Terms, please contact us through our support page or email us at {{email}}.',
      },
    },
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: August 16, 2026',
    sections: {
      introduction: {
        title: '1. Introduction',
        content:
          '{{appName}} ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile applications.',
      },
      dataCollection: {
        title: '2. Information We Collect',
        intro: 'We may collect the following types of information:',
        items: {
          account:
            'Account Information: Name, email address, username, and profile picture when you register',
          payment:
            'Payment Information: Payment method details processed securely by our payment providers',
          usage:
            'Usage Data: Game history, preferences, and interaction patterns',
          device:
            'Device Information: Device type, operating system, and unique identifiers',
          communications:
            'Communications: Messages sent through our in-game chat features',
        },
      },
      dataUsage: {
        title: '3. How We Use Your Information',
        intro: 'We use the collected information for the following purposes:',
        items: [
          'Provide, maintain, and improve our gaming services',
          'Process transactions and send related notifications',
          'Personalize your gaming experience',
          'Communicate with you about updates, promotions, and support',
          'Detect and prevent fraud, abuse, and security issues',
          'Comply with legal obligations',
        ],
      },
      dataSharing: {
        title: '4. Data Sharing and Disclosure',
        intro:
          'We do not sell your personal information. We may share your data with:',
        items: {
          serviceProviders:
            'Service Providers: Third parties who assist in operating our platform (payment processors, hosting providers)',
          legal:
            'Legal Requirements: When required by law or to protect our rights',
          businessTransfers:
            'Business Transfers: In connection with a merger, acquisition, or sale of assets',
        },
      },
      dataSecurity: {
        title: '5. Data Security',
        content:
          'We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.',
      },
      dataRetention: {
        title: '6. Data Retention',
        content:
          'We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. You may request deletion of your account and associated data at any time.',
      },
      userRights: {
        title: '7. Your Rights',
        intro: 'You have the following rights regarding your personal data:',
        items: {
          access: 'Access: Request a copy of your personal data',
          correction: 'Correction: Request correction of inaccurate data',
          deletion: 'Deletion: Request deletion of your data',
          portability:
            'Portability: Request transfer of your data to another service',
          objection: 'Objection: Object to certain processing activities',
        },
        contact:
          'To exercise these rights, please contact us through our support page.',
      },
      cookies: {
        title: '8. Cookies and Tracking',
        content:
          'We use cookies and similar technologies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings through your browser.',
      },
      children: {
        title: "9. Children's Privacy",
        content:
          'Our services are intended for users aged 18 and older. We do not knowingly collect personal information from children under 18. If we learn that we have collected such data, we will delete it promptly.',
      },
      internationalTransfers: {
        title: '10. International Data Transfers',
        content:
          'Your information may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place for such transfers.',
      },
      policyChanges: {
        title: '11. Changes to This Policy',
        content:
          'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.',
      },
      contact: {
        title: '12. Contact Us',
        content:
          'If you have questions or concerns about this Privacy Policy, please contact us through our support page or email us at {{email}}.',
      },
    },
  },
  contact: {
    title: 'Contact Us',
    tagline: "Have questions, feedback, or need support? We're here to help.",
    sections: {
      getInTouch: {
        title: 'Get in Touch',
        email: 'Email',
        workingHours: 'Working Hours',
        responseTime: 'Response Time',
        responseValue: 'Within 24-48 hours',
      },
      hero: {
        eyebrow: 'Player support',
        title: "We're on the same team.",
        tagline:
          'Drop a question, report a bug, hand us a feature idea — we read every message and the whole team plays the games we ship.',
        statusOk: 'All systems operational',
        medianReply: '~ {{hours}} hr median reply',
        humansOnline: '{{count}} humans online',
        languages: '{{count}} languages',
      },
      stats: {
        ticketsResolved: 'Tickets resolved this month',
        avgRating: 'Avg. support rating',
        languagesSupported: 'Languages supported',
        slaHit: 'SLA hit rate',
        ticketsResolvedValue: '2,840',
        avgRatingValue: '4.9 ★',
        languagesSupportedValue: '5',
        slaHitValue: '98%',
      },
      channels: {
        discord: {
          title: 'Discord',
          sub: 'Live chat · {{count}} members',
          memberCount: '12.4k',
        },
        x: { title: '@_arcadeum_', sub: 'DMs are open' },
        twitter: { title: '@_arcadeum_', sub: 'DMs are open' },
        instagram: { title: 'Instagram', sub: 'Daily updates & screenshots' },
        telegram: { title: 'Telegram', sub: 't.me/arcadeum' },
        github: { title: 'GitHub Issues', sub: 'Bugs & feature requests' },
      },
      form: {
        title: 'Send the team a message',
        subtitle: 'Direct message',
        repliesNote: 'Replies hit your email',
        nameLabel: 'Your Name',
        namePlaceholder: 'Enter your name',
        emailLabel: 'Email Address',
        emailPlaceholder: 'Enter your email',
        subjectLabel: 'Subject',
        subjectPlaceholder: 'What is this about?',
        messageLabel: 'Message',
        messagePlaceholder: 'Tell us how we can help...',
        name: 'Your name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        privacy: 'Private — we never share your email.',
        submit: 'Launch message',
        submitting: 'Sending…',
        successTitle: 'Message away.',
        successBody:
          'Expect a reply within 4 hours. We sent a copy to your email.',
        sendAnother: 'Send another',
        openMail: 'Open in your mail app',
        errorTitle: "We couldn't send your message",
        errorBody:
          'Something went wrong on our end. You can try again, or open your mail app to send directly.',
        tryAgain: 'Try again',
        success:
          "✓ Thank you! Your message has been sent. We'll get back to you soon.",
      },
      side: {
        onCall: 'On call right now',
        onCallTeam: 'Maria, Anatoliy +{{extra}}',
        onCallRegion: 'Support · EU + LATAM',
        medianFirstReply: 'Median first reply',
        medianFirstReplyValue: '4 hr',
        workingHours: 'Working hours',
        coverage: 'Coverage',
        coverageValue: 'GMT-5 → GMT+8',
        devsLabel: 'For developers',
        devsTitle: 'Bugs & integration',
        devsBody:
          'Reproducible bugs, API issues, and SDK questions are tracked in GitHub. We triage within 24 hours.',
        openIssue: 'Open an issue',
        press: 'Press & partnerships',
        pressEmail: 'hello@arcadeum.games',
        pressBody: 'For media, creators, and partner studios.',
        statusLabel: 'System status',
        statusTitle: 'All systems operational',
        statusBody: '99.98% uptime over the last 30 days.',
        statusLinkLabel: 'View status page',
      },
      common: {
        questionsLabel: 'Common questions',
      },
      tips: {
        label: 'Faster replies',
        title: 'Help us help you faster',
        orderId:
          'Include your order ID for refund or payment questions — we can pull the receipt instantly.',
        bugs: 'For bugs: steps to reproduce, your browser, and your device. The more specific, the faster we triage.',
        screenshots:
          'Screenshots are welcome — paste them straight into the message field, no need to attach.',
        account:
          'For login or account issues, include the email you registered with so we can match the account.',
        urgent:
          "Time-sensitive? Add 'urgent' to the subject and we'll route it to the on-call team.",
        language:
          'Write in whichever language you think in — we answer in EN, RU, ES, FR, BY.',
        footer:
          'Every message is read by a human on our team — no chatbots, no autoresponders.',
      },
      ticker: {
        label: 'HQ live feed',
      },
      faq: {
        title: 'Maybe we already answered this',
        browse: 'Browse help center',
        refund: {
          question: 'Can I get a refund on a purchase?',
          answer:
            "Refund eligibility depends on the item and the time since purchase. Reach out to {{email}} with your order ID and we'll get back to you within one business day.",
        },
        password: {
          question: 'How do I reset my password?',
          answer:
            "Use the 'Forgot password' link on the sign-in screen. The reset email arrives in about a minute — check spam if it doesn't show up. If your email changed, contact support.",
        },
        deleteAccount: {
          question: 'How can I delete my account?',
          answer:
            'Account deletion is permanent and removes your stats, friends list, and game history. Email {{email}} from the address tied to your account to begin the process.',
        },
        multiplayerLag: {
          question: 'Why is my game laggy in multiplayer?',
          answer:
            'Most lag is region routing. Switch your matchmaking region in Settings → Network, or check status.arcadeum.games to see if any servers are degraded.',
        },
        reportPlayer: {
          question: 'How do I report another player?',
          answer:
            "Use the in-game ⋯ menu next to the player's name → Report. Our moderation team reviews reports within 24 hours and takes action when our community guidelines are broken.",
        },
      },
    },
  },
};

export const legalMessagesEn = en;
