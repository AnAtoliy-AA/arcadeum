'use client';

import dynamic from 'next/dynamic';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuthLabels } from '../hooks/useAuthLabels';
import { AuthFormPanel } from './AuthFormPanel';
import { AuthPageBackground } from './AuthPageBackground';
import './auth.scss';

const AuthBrandPanel = dynamic(
  () => import('./AuthBrandPanel').then((m) => m.AuthBrandPanel),
  { ssr: false },
);

const InstallAppCta = dynamic(
  () =>
    import('@/widgets/install-app').then((m) => m.InstallAppCta),
  { ssr: false },
);

export default function AuthPageContent() {
  const auth = useAuthForm();
  const labels = useAuthLabels(auth.isRegisterMode);

  return (
    <div
      className="flex flex-row items-stretch w-full relative overflow-hidden"
      style={{ minHeight: '100dvh' }}
      data-testid="auth-page-root"
    >
      <AuthPageBackground />
      <AuthBrandPanel brand={labels.brand} />
      <div className="flex flex-col flex-1 items-center justify-center px-8 py-8 gap-5 max-[1150px]:px-4 max-[1150px]:py-5 max-[1150px]:w-full">
        <AuthFormPanel labels={labels} auth={auth} />
        <InstallAppCta />
      </div>
    </div>
  );
}
