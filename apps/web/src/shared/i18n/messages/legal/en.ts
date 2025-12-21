import type { LegalMessages } from "./types";

export const legalMessagesEn: LegalMessages = {
  nav: {
    terms: "Terms",
    privacy: "Privacy",
    contact: "Contact",
  },
  terms: {
    title: "Terms and Conditions",
    lastUpdated: "Last updated: December 21, 2024",
    sections: {
      agreement: {
        title: "1. Agreement to Terms",
        content: "By accessing or using {appName}, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.",
      },
      companyInfo: {
        title: "2. Company Information",
        companyName: "Company Name:",
        legalName: "Legal Name:",
        idCode: "Identification Code:",
        contactEmail: "Contact Email:",
        workingHours: "Working Hours:",
      },
      services: {
        title: "3. Description of Services",
        intro: "{appName} provides an online multiplayer gaming platform offering card-based entertainment games. Our services include:",
        items: [
          "Access to multiplayer card games via web and mobile applications",
          "In-game virtual currency and premium features",
          "Game room creation and management",
          "Real-time multiplayer gaming experience",
        ],
      },
      accounts: {
        title: "4. User Accounts",
        intro: "To use certain features of {appName}, you must register for an account. You agree to:",
        items: [
          "Provide accurate and complete registration information",
          "Maintain the security of your account credentials",
          "Be responsible for all activities under your account",
          "Notify us immediately of any unauthorized access",
        ],
      },
      delivery: {
        title: "5. Digital Products and Delivery",
        content: "All products offered on {appName} are digital services delivered electronically. Upon successful payment, access to purchased content is granted immediately. Digital products include virtual currency, premium subscriptions, and in-app features.",
      },
      payment: {
        title: "6. Payment Terms",
        content: "Payments are processed securely through our authorized payment providers. All prices are displayed in the applicable currency at checkout. By making a purchase, you authorize us to charge your selected payment method.",
      },
      refund: {
        title: "7. Refund Policy",
        intro: "Due to the digital nature of our products, refunds are handled as follows:",
        items: {
          virtualCurrency: "Unused virtual currency: Eligible for refund within 14 days of purchase",
          subscriptions: "Subscriptions: Refundable within 48 hours if no premium features were used",
          technicalIssues: "Technical issues: Full refund if we cannot resolve the issue",
          processingTime: "Processing time: Refunds are processed within 5-10 business days",
        },
        contact: "To request a refund, please contact us at our support page.",
      },
      acceptableUse: {
        title: "8. Acceptable Use",
        intro: "You agree not to:",
        items: [
          "Use the service for any illegal purpose",
          "Harass, abuse, or harm other users",
          "Attempt to exploit, hack, or disrupt the service",
          "Create multiple accounts to abuse promotions",
          "Use automated tools or bots",
        ],
      },
      intellectualProperty: {
        title: "9. Intellectual Property",
        content: "All content, trademarks, and intellectual property on {appName} are owned by us or our licensors. You may not copy, modify, or distribute our content without prior written consent.",
      },
      liability: {
        title: "10. Limitation of Liability",
        content: "{appName} is provided \"as is\" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.",
      },
      governingLaw: {
        title: "11. Governing Law",
        content: "These Terms are governed by the laws of Georgia. Any disputes shall be resolved in the courts of Georgia, in accordance with the Georgian Law on Electronic Commerce.",
      },
      contact: {
        title: "12. Contact Us",
        content: "If you have questions about these Terms, please contact us through our support page or email us at {email}.",
      },
    },
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: December 21, 2024",
    sections: {
      introduction: {
        title: "1. Introduction",
        content: "{appName} (\"we\", \"us\", or \"our\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile applications.",
      },
      dataCollection: {
        title: "2. Information We Collect",
        intro: "We may collect the following types of information:",
        items: {
          account: "Account Information: Name, email address, username, and profile picture when you register",
          payment: "Payment Information: Payment method details processed securely by our payment providers",
          usage: "Usage Data: Game history, preferences, and interaction patterns",
          device: "Device Information: Device type, operating system, and unique identifiers",
          communications: "Communications: Messages sent through our in-game chat features",
        },
      },
      dataUsage: {
        title: "3. How We Use Your Information",
        intro: "We use the collected information for the following purposes:",
        items: [
          "Provide, maintain, and improve our gaming services",
          "Process transactions and send related notifications",
          "Personalize your gaming experience",
          "Communicate with you about updates, promotions, and support",
          "Detect and prevent fraud, abuse, and security issues",
          "Comply with legal obligations",
        ],
      },
      dataSharing: {
        title: "4. Data Sharing and Disclosure",
        intro: "We do not sell your personal information. We may share your data with:",
        items: {
          serviceProviders: "Service Providers: Third parties who assist in operating our platform (payment processors, hosting providers)",
          legal: "Legal Requirements: When required by law or to protect our rights",
          businessTransfers: "Business Transfers: In connection with a merger, acquisition, or sale of assets",
        },
      },
      dataSecurity: {
        title: "5. Data Security",
        content: "We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.",
      },
      dataRetention: {
        title: "6. Data Retention",
        content: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. You may request deletion of your account and associated data at any time.",
      },
      userRights: {
        title: "7. Your Rights",
        intro: "You have the following rights regarding your personal data:",
        items: {
          access: "Access: Request a copy of your personal data",
          correction: "Correction: Request correction of inaccurate data",
          deletion: "Deletion: Request deletion of your data",
          portability: "Portability: Request transfer of your data to another service",
          objection: "Objection: Object to certain processing activities",
        },
        contact: "To exercise these rights, please contact us through our support page.",
      },
      cookies: {
        title: "8. Cookies and Tracking",
        content: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings through your browser.",
      },
      children: {
        title: "9. Children's Privacy",
        content: "Our services are intended for users aged 18 and older. We do not knowingly collect personal information from children under 18. If we learn that we have collected such data, we will delete it promptly.",
      },
      internationalTransfers: {
        title: "10. International Data Transfers",
        content: "Your information may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place for such transfers.",
      },
      policyChanges: {
        title: "11. Changes to This Policy",
        content: "We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the \"Last updated\" date.",
      },
      contact: {
        title: "12. Contact Us",
        content: "If you have questions or concerns about this Privacy Policy, please contact us through our support page or email us at {email}.",
      },
    },
  },
  contact: {
    title: "Contact Us",
    tagline: "Have questions, feedback, or need support? We're here to help.",
    sections: {
      getInTouch: {
        title: "Get in Touch",
        email: "Email",
        workingHours: "Working Hours",
        responseTime: "Response Time",
        responseValue: "Within 24-48 hours",
      },
      form: {
        title: "Send a Message",
        nameLabel: "Your Name",
        namePlaceholder: "Enter your name",
        emailLabel: "Email Address",
        emailPlaceholder: "Enter your email",
        subjectLabel: "Subject",
        subjectPlaceholder: "What is this about?",
        messageLabel: "Message",
        messagePlaceholder: "Tell us how we can help...",
        submit: "Send Message →",
        success: "✓ Thank you! Your message has been sent. We'll get back to you soon.",
      },
      faq: {
        title: "Frequently Asked Questions",
        refund: {
          question: "How do I request a refund?",
          answer: "Please email {email} with your account email and order details. Refund requests are processed within 5-10 business days.",
        },
        password: {
          question: "I forgot my password. What should I do?",
          answer: "Use the \"Forgot Password\" link on the login page to reset your password via email.",
        },
        deleteAccount: {
          question: "How do I delete my account?",
          answer: "Contact us through this form or email {email} with your request. Account deletion is processed within 48 hours.",
        },
      },
    },
  },
};
