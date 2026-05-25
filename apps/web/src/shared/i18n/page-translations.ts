export interface PageFeature {
  title?: string;
  description?: string;
  [key: string]: string | undefined;
}

export type PageSection = {
  title?: string;
  description?: string;
  content?: string;
  intro?: string;
  email?: string;
  items?: string[];
  [key: string]: string | string[] | undefined;
};

export interface PageFaqItem {
  question?: string;
  answer?: string;
}

export interface PageFaq {
  heading?: string;
  items?: (PageFaqItem | null)[];
}

export interface PageTranslations {
  title?: string;
  subtitle?: string;
  description?: string;
  comingSoon?: string;
  features?: (PageFeature | null)[];
  sections?: Record<string, PageSection>;
  faq?: PageFaq;
  [key: string]:
    | string
    | string[]
    | undefined
    | Record<string, string | PageSection | undefined>
    | (PageFeature | null)[]
    | PageFaq; // Safe types for React node rendering
}
