import {
  HeroCard,
  Badge,
  Title,
  Description,
  Status,
  StatusHeadline,
  StatusDescription,
  Actions,
  PrimaryAction,
  SecondaryAction,
  HomeLink,
  HomeLinkIcon,
  ShortcutsList,
  ShortcutLink,
  ShortcutIcon,
} from './styles';

export interface HeroSectionLabels {
  badgeLabel: string;
  heroTitle: string;
  heroDescription: string;
  heroStatusHeadline: string;
  heroStatusDescription: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  homeLinkLabel: string;
  browseGamesLabel: string;
}

export interface HeroSectionConfig {
  primaryActionHref: string;
  secondaryActionHref: string;
}

interface HeroSectionProps {
  labels: HeroSectionLabels;
  config: HeroSectionConfig;
}

export function HeroSection({ labels, config }: HeroSectionProps) {
  const {
    badgeLabel,
    heroTitle,
    heroDescription,
    heroStatusHeadline,
    heroStatusDescription,
    primaryActionLabel,
    secondaryActionLabel,
    homeLinkLabel,
    browseGamesLabel,
  } = labels;

  const { primaryActionHref, secondaryActionHref } = config;

  return (
    <HeroCard>
      <Badge>{badgeLabel}</Badge>
      <Title>{heroTitle}</Title>
      <Description>{heroDescription}</Description>
      <Status>
        <StatusHeadline>{heroStatusHeadline}</StatusHeadline>
        <StatusDescription>{heroStatusDescription}</StatusDescription>
        <Actions>
          <PrimaryAction href={primaryActionHref}>
            {primaryActionLabel}
          </PrimaryAction>
          <SecondaryAction href={secondaryActionHref}>
            {secondaryActionLabel}
          </SecondaryAction>
        </Actions>
      </Status>
      <HomeLink href="/">
        <HomeLinkIcon aria-hidden="true">←</HomeLinkIcon>
        <span>{homeLinkLabel}</span>
      </HomeLink>
      <ShortcutsList>
        <ShortcutLink href="/games">
          <ShortcutIcon aria-hidden="true">→</ShortcutIcon>
          <span>{browseGamesLabel}</span>
        </ShortcutLink>
      </ShortcutsList>
    </HeroCard>
  );
}
