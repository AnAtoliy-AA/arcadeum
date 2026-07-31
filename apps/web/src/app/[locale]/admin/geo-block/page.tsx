import { Metadata } from 'next';
import GeoBlockClient from './GeoBlockClient';

export const metadata: Metadata = {
  title: 'Geo Block Management',
};

export default function GeoBlockPage() {
  return <GeoBlockClient />;
}
