import type { Metadata } from "next";

import { appConfig } from "@/lib/app-config";

import SupportContent from "./SupportContent";
import type { SupportAction, SupportTeamMember } from "./types";

function trim(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const SUPPORT_TITLE = "Support the developers";
const SUPPORT_TAGLINE = `Keep ${appConfig.appName} iterating quickly and accessible to the tabletop community.`;
const SUPPORT_DESCRIPTION =
  "Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes.";
const SUPPORT_THANKS = `Every contribution keeps ${appConfig.appName} evolving. Thank you for helping us build the future of remote tabletop play!`;

const TEAM_MEMBERS: SupportTeamMember[] = [
  {
    key: "producer",
    icon: "👥",
    name: "Anatoliy Aliaksandrau",
    role: "Product & realtime systems",
    bio: "Keeps prototypes organized, roadmaps realistic, and the realtime engine humming for every playtest night.",
  },
  {
    key: "designer",
    icon: "🎨",
    name: "Anatoliy Aliaksandrau",
    role: "Game designer & UX",
    bio: "Turns raw playtest feedback into balanced mechanics, polished flows, and welcoming onboarding experiences.",
  },
  {
    key: "engineer",
    icon: "🛠️",
    name: "Anatoliy Aliaksandrau",
    role: "Full-stack engineer",
    bio: "Builds cross-platform features, maintains the component toolkit, and keeps performance snappy across devices.",
  },
];

export const metadata: Metadata = {
  title: `${SUPPORT_TITLE} · ${appConfig.appName}`,
  description: SUPPORT_DESCRIPTION,
};

function buildActions(appName: string): SupportAction[] {
  const actions: SupportAction[] = [
    {
      key: "payment",
      icon: "💳",
      type: "route",
      href: "/payment",
      title: "Card payment",
      description: "Enter an amount and we'll open UniPAY's secure checkout in your browser.",
      cta: "Enter amount",
    },
  ];

  const sponsorUrl = trim(process.env.NEXT_PUBLIC_SUPPORT_URL);
  const coffeeUrl = trim(process.env.NEXT_PUBLIC_SUPPORT_COFFEE_URL);
  const iban = trim(process.env.NEXT_PUBLIC_SUPPORT_IBAN);

  if (sponsorUrl) {
    actions.push({
      key: "sponsor",
      icon: "⭐️",
      type: "external",
      href: sponsorUrl,
      title: "Recurring sponsorship",
      description:
        "Set up a monthly or annual contribution to underwrite hosting, QA sessions, and new game prototypes.",
      cta: "Sponsor development",
    });
  }

  if (coffeeUrl) {
    actions.push({
      key: "coffee",
      icon: "☕️",
      type: "external",
      href: coffeeUrl,
      title: "One-time boost",
      description:
        "Prefer a quick thank-you? Send the crew coffee and snacks so late-night playtests stay energized.",
      cta: "Buy the team a coffee",
    });
  }

  if (iban) {
    actions.push({
      key: "iban",
      icon: "🏦",
      type: "copy",
      value: iban,
      title: "Bank transfer",
      description: `Need to pay by card through your bank? Enter the IBAN ${iban} to send funds directly to ${appName}.`,
      cta: "Copy IBAN details",
      successMessage: `IBAN copied to clipboard: ${iban}`,
    });
  }

  return actions;
}

export default function SupportPage() {
  const actions = buildActions(appConfig.appName);

  return (
    <SupportContent
      title={SUPPORT_TITLE}
      tagline={SUPPORT_TAGLINE}
      description={SUPPORT_DESCRIPTION}
      thanks={SUPPORT_THANKS}
      teamMembers={TEAM_MEMBERS}
      actions={actions}
    />
  );
}
