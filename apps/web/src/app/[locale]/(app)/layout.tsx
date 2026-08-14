import { setupTamagui } from '@/shared/config/tamagui.config';
import { resetTamaguiCSSInjection } from '@/shared/config/tamagui-css-injected';
import { TamaguiAppLayout } from './TamaguiAppLayout';

/**
 * Server layout for every route except the home page. Primes the Tamagui
 * config on the server, then delegates to the client layout that provides
 * the Tamagui context + SSR CSS. Home (fully Tailwind) lives outside this
 * group, so the Tamagui runtime never enters its bundle.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  setupTamagui();
  resetTamaguiCSSInjection();
  return <TamaguiAppLayout>{children}</TamaguiAppLayout>;
}
