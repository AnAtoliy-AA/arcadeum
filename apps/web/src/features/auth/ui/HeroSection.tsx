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
} from "./styles";

interface HeroSectionProps {
  badgeLabel: string;
  title: string;
  description: string;
  statusHeadline: string;
  statusDescription: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionHref: string;
  homeLinkLabel: string;
  browseGamesLabel: string;
}

export function HeroSection({
  badgeLabel,
  title,
  description,
  statusHeadline,
  statusDescription,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  homeLinkLabel,
  browseGamesLabel,
}: HeroSectionProps) {
  return (
    <HeroCard>
      <Badge>{badgeLabel}</Badge>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <Status>
        <StatusHeadline>{statusHeadline}</StatusHeadline>
        <StatusDescription>{statusDescription}</StatusDescription>
        <Actions>
          <PrimaryAction href={primaryActionHref}>{primaryActionLabel}</PrimaryAction>
          <SecondaryAction href={secondaryActionHref}>{secondaryActionLabel}</SecondaryAction>
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
