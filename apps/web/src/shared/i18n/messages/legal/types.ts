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

export type FaqEntry = { question?: string; answer?: string };

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
    hero?: {
      eyebrow?: string;
      title?: string;
      tagline?: string;
      statusOk?: string;
      medianReply?: string;
      humansOnline?: string;
      languages?: string;
    };
    stats?: {
      ticketsResolved?: string;
      avgRating?: string;
      languagesSupported?: string;
      slaHit?: string;
      ticketsResolvedValue?: string;
      avgRatingValue?: string;
      languagesSupportedValue?: string;
      slaHitValue?: string;
    };
    channels?: {
      discord?: { title?: string; sub?: string; memberCount?: string };
      x?: { title?: string; sub?: string };
      twitter?: { title?: string; sub?: string };
      instagram?: { title?: string; sub?: string };
      telegram?: { title?: string; sub?: string };
      github?: { title?: string; sub?: string };
    };
    form?: {
      title?: string;
      subtitle?: string;
      repliesNote?: string;
      nameLabel?: string;
      namePlaceholder?: string;
      emailLabel?: string;
      emailPlaceholder?: string;
      subjectLabel?: string;
      subjectPlaceholder?: string;
      messageLabel?: string;
      messagePlaceholder?: string;
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      privacy?: string;
      submit?: string;
      submitting?: string;
      successTitle?: string;
      successBody?: string;
      sendAnother?: string;
      openMail?: string;
      errorTitle?: string;
      errorBody?: string;
      tryAgain?: string;
      success?: string;
    };
    side?: {
      onCall?: string;
      onCallTeam?: string;
      onCallRegion?: string;
      medianFirstReply?: string;
      medianFirstReplyValue?: string;
      workingHours?: string;
      coverage?: string;
      coverageValue?: string;
      devsTitle?: string;
      devsBody?: string;
      devsLabel?: string;
      openIssue?: string;
      press?: string;
      pressEmail?: string;
      pressBody?: string;
      statusLabel?: string;
      statusTitle?: string;
      statusBody?: string;
      statusLinkLabel?: string;
    };
    common?: {
      questionsLabel?: string;
    };
    tips?: {
      label?: string;
      title?: string;
      orderId?: string;
      bugs?: string;
      screenshots?: string;
      account?: string;
      urgent?: string;
      language?: string;
      footer?: string;
    };
    ticker?: {
      label?: string;
    };
    faq?: {
      title?: string;
      browse?: string;
      refund?: FaqEntry;
      password?: FaqEntry;
      deleteAccount?: FaqEntry;
      multiplayerLag?: FaqEntry;
      reportPlayer?: FaqEntry;
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
