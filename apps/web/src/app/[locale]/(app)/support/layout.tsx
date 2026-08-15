import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';

export const metadata: Metadata = {
  title: 'Support the developers',
  description: `Keep ${appConfig.appName} iterating quickly and accessible to the tabletop community. Arcade labs, infrastructure, and community events are self-funded today. Your backing keeps the realtime servers online, unlocks more playtest nights, and helps us ship the next wave of prototypes. Every contribution keeps ${appConfig.appName} evolving. Thank you for helping us build the future of remote tabletop play!`,
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
