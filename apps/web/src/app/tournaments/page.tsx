import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';
import TournamentsClient from './TournamentsClient';

export const metadata: Metadata = {
  title: 'Tournaments',
  description: 'Join competitive tournaments and win prizes.',
  alternates: {
    canonical: routes.tournaments,
  },
};

/**
 * Tournaments Page (public). Translations are read on the client via
 * useLanguage to support the locale + nested list shape.
 */
export default function TournamentsPage() {
  return <TournamentsClient />;
}
