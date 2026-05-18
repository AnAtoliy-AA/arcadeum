import type { Metadata } from 'next';
import TournamentsClient from './TournamentsClient';

export const metadata: Metadata = {
  title: 'Tournaments',
  description: 'Join competitive tournaments and win prizes.',
};

/**
 * Tournaments Page (public). Translations are read on the client via
 * useLanguage to support the locale + nested list shape.
 */
export default function TournamentsPage() {
  return <TournamentsClient />;
}
