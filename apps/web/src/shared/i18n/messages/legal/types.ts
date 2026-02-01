export type TermsMessages = {
  title?: string;
  lastUpdated?: string;
  sections?: {
    agreement?: {
      title?: string;
      content?: string;
    };
    companyInfo?: {
      title?: string;
      companyName?: string;
      legalName?: string;
      idCode?: string;
      contactEmail?: string;
      workingHours?: string;
    };
    services?: {
      title?: string;
      intro?: string;
      items?: string[];
    };
    accounts?: {
      title?: string;
      intro?: string;
      items?: string[];
    };
    delivery?: {
      title?: string;
      content?: string;
    };
    payment?: {
      title?: string;
      content?: string;
    };
    refund?: {
      title?: string;
      intro?: string;
      items?: {
        virtualCurrency?: string;
        subscriptions?: string;
        technicalIssues?: string;
        processingTime?: string;
      };
      contact?: string;
    };
    acceptableUse?: {
      title?: string;
      intro?: string;
      items?: string[];
    };
    intellectualProperty?: {
      title?: string;
      content?: string;
    };
    liability?: {
      title?: string;
      content?: string;
    };
    governingLaw?: {
      title?: string;
      content?: string;
    };
    contact?: {
      title?: string;
      content?: string;
    };
  };
};

export type PrivacyMessages = {
  title?: string;
  lastUpdated?: string;
  sections?: {
    introduction?: {
      title?: string;
      content?: string;
    };
    dataCollection?: {
      title?: string;
      intro?: string;
      items?: {
        account?: string;
        payment?: string;
        usage?: string;
        device?: string;
        communications?: string;
      };
    };
    dataUsage?: {
      title?: string;
      intro?: string;
      items?: string[];
    };
    dataSharing?: {
      title?: string;
      intro?: string;
      items?: {
        serviceProviders?: string;
        legal?: string;
        businessTransfers?: string;
      };
    };
    dataSecurity?: {
      title?: string;
      content?: string;
    };
    dataRetention?: {
      title?: string;
      content?: string;
    };
    userRights?: {
      title?: string;
      intro?: string;
      items?: {
        access?: string;
        correction?: string;
        deletion?: string;
        portability?: string;
        objection?: string;
      };
      contact?: string;
    };
    cookies?: {
      title?: string;
      content?: string;
    };
    children?: {
      title?: string;
      content?: string;
    };
    internationalTransfers?: {
      title?: string;
      content?: string;
    };
    policyChanges?: {
      title?: string;
      content?: string;
    };
    contact?: {
      title?: string;
      content?: string;
    };
  };
};

export type ContactMessages = {
  title?: string;
  tagline?: string;
  sections?: {
    getInTouch?: {
      title?: string;
      email?: string;
      workingHours?: string;
      responseTime?: string;
      responseValue?: string;
    };
    form?: {
      title?: string;
      nameLabel?: string;
      namePlaceholder?: string;
      emailLabel?: string;
      emailPlaceholder?: string;
      subjectLabel?: string;
      subjectPlaceholder?: string;
      messageLabel?: string;
      messagePlaceholder?: string;
      submit?: string;
      success?: string;
    };
    faq?: {
      title?: string;
      refund?: {
        question?: string;
        answer?: string;
      };
      password?: {
        question?: string;
        answer?: string;
      };
      deleteAccount?: {
        question?: string;
        answer?: string;
      };
    };
  };
};

export type LegalMessages = {
  nav?: {
    terms?: string;
    privacy?: string;
    contact?: string;
  };
  terms?: TermsMessages;
  privacy?: PrivacyMessages;
  contact?: ContactMessages;
};
