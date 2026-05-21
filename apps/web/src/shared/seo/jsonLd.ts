import { appConfig } from '@/shared/config/app-config';

type JsonLdNode = Record<string, unknown>;

const absolute = (path: string): string =>
  path.startsWith('http')
    ? path
    : `${appConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbList(items: BreadcrumbItem[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

export function webPage(input: {
  name: string;
  description?: string;
  path: string;
}): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: absolute(input.path),
    isPartOf: {
      '@type': 'WebSite',
      name: appConfig.appName,
      url: appConfig.siteUrl,
    },
  };
}

export function collectionPage(input: {
  name: string;
  description?: string;
  path: string;
}): JsonLdNode {
  return {
    ...webPage(input),
    '@type': 'CollectionPage',
  };
}

export function faqPage(
  items: { question: string; answer: string }[],
): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}

export type GameSchemaInput = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  minPlayers?: number;
  maxPlayers?: number;
  playMode?: string;
};

export function gameSchema(input: GameSchemaInput): JsonLdNode {
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: input.name,
    url: absolute(`/games/${input.id}`),
  };
  if (input.description) node.description = input.description;
  if (input.image) node.image = absolute(input.image);
  if (input.minPlayers)
    node.numberOfPlayers = {
      '@type': 'QuantitativeValue',
      minValue: input.minPlayers,
      maxValue: input.maxPlayers ?? input.minPlayers,
    };
  if (input.playMode) node.playMode = input.playMode;
  return node;
}

export function itemList(input: {
  name: string;
  items: { name: string; path: string }[];
}): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absolute(item.path),
    })),
  };
}

export type ProfileSchemaInput = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

export function profilePage(input: ProfileSchemaInput): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: input.name,
      description: input.description,
      image: input.image ? absolute(input.image) : undefined,
      identifier: input.id,
      url: absolute(`/players/${input.id}`),
    },
  };
}

export function contactPage(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${appConfig.appName}`,
    url: absolute('/contact'),
  };
}

export type VideoObjectInput = {
  name: string;
  description: string;
  /** YouTube video ID (no URL — just the 11-char ID). */
  youtubeId: string;
  /** ISO date the video was uploaded. Optional but recommended by Google. */
  uploadDate?: string;
};

/**
 * Emit a `VideoObject` for an embedded YouTube clip. Helps Google index the
 * video and surface it in Video search results.
 */
export function youTubeVideoObject(input: VideoObjectInput): JsonLdNode {
  const watchUrl = `https://www.youtube.com/watch?v=${input.youtubeId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${input.youtubeId}`;
  const thumbnail = `https://i.ytimg.com/vi/${input.youtubeId}/maxresdefault.jpg`;
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.name,
    description: input.description,
    thumbnailUrl: [thumbnail],
    contentUrl: watchUrl,
    embedUrl,
  };
  if (input.uploadDate) node.uploadDate = input.uploadDate;
  return node;
}
