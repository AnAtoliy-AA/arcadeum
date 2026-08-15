'use client';

import { InstallAppCta } from '@/widgets/install-app';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuthLabels } from '../hooks/useAuthLabels';
import { AuthBrandPanel } from './AuthBrandPanel';
import { AuthFormPanel } from './AuthFormPanel';
import { AuthPageBackground } from './AuthPageBackground';
import './auth.scss';

export default function AuthPageContent() {
  const auth = useAuthForm();
  const labels = useAuthLabels(auth.isRegisterMode);

  return (
    <div
      className="box-border flex flex-row items-stretch w-full relative overflow-hidden"
      style={{ minHeight: '100vh' }}
      data-testid="auth-page-root"
    >
      <AuthPageBackground />
      <AuthBrandPanel brand={labels.brand} />
      <div className="box-border flex flex-col flex-1 items-center justify-center px-8 py-8 gap-5 max-[1150px]:px-4 max-[1150px]:py-5 max-[1150px]:w-full">
        <AuthFormPanel labels={labels} auth={auth} />
        <InstallAppCta />
      </div>
    </div>
  );
}
