'use client';

import type { PrivacyMessages, ContactMessages } from '@/shared/i18n/types';
import { appConfig } from '@/shared/config/app-config';
import { formatMessage } from '@/shared/i18n';
import Link from 'next/link';
import { useRoutes } from '@/shared/config/useRoutes';
import { GlassCard, Typography } from '@arcadeum/ui';
import { ShieldIcon, LockIcon } from '@arcadeum/ui/components/Icons/index';

interface PrivacySectionProps {
  t?: PrivacyMessages;
  contactT?: ContactMessages;
  PRIVACY_EMAIL: string;
}

const APP_NAME = appConfig.appName;

export function PrivacySectionGroup1({
  t,
  PRIVACY_EMAIL: _PRIVACY_EMAIL,
}: PrivacySectionProps) {
  const s = t?.sections;
  return (
    <>
      {/* Section 1: Introduction */}
      <GlassCard
        id="section-introduction"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
            <ShieldIcon size={20} />
          </div>
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-[var(--color)]"
          >
            {s?.introduction?.title ?? '1. Introduction'}
          </Typography>
        </div>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {formatMessage(s?.introduction?.content, { appName: APP_NAME })}
        </Typography>
      </GlassCard>

      {/* Section 2: Data We Collect */}
      <GlassCard
        id="section-dataCollection"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
            <ShieldIcon size={20} />
          </div>
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-[var(--color)]"
          >
            {s?.dataCollection?.title ?? '2. Information We Collect'}
          </Typography>
        </div>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.dataCollection?.intro}
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {s?.dataCollection?.items?.account && (
            <div className="p-4 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] flex flex-col gap-1">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wider">
                Account Data
              </span>
              <Typography
                variant="body"
                uiSize="sm"
                className="text-[var(--textSecondary)]"
              >
                {s.dataCollection.items.account}
              </Typography>
            </div>
          )}
          {s?.dataCollection?.items?.payment && (
            <div className="p-4 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] flex flex-col gap-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">
                Payment Details
              </span>
              <Typography
                variant="body"
                uiSize="sm"
                className="text-[var(--textSecondary)]"
              >
                {s.dataCollection.items.payment}
              </Typography>
            </div>
          )}
          {s?.dataCollection?.items?.usage && (
            <div className="p-4 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] flex flex-col gap-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                Gameplay & Usage
              </span>
              <Typography
                variant="body"
                uiSize="sm"
                className="text-[var(--textSecondary)]"
              >
                {s.dataCollection.items.usage}
              </Typography>
            </div>
          )}
          {s?.dataCollection?.items?.device && (
            <div className="p-4 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] flex flex-col gap-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider">
                Device & Network
              </span>
              <Typography
                variant="body"
                uiSize="sm"
                className="text-[var(--textSecondary)]"
              >
                {s.dataCollection.items.device}
              </Typography>
            </div>
          )}
          {s?.dataCollection?.items?.communications && (
            <div className="p-4 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] md:col-span-2 flex flex-col gap-1">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                Communications
              </span>
              <Typography
                variant="body"
                uiSize="sm"
                className="text-[var(--textSecondary)]"
              >
                {s.dataCollection.items.communications}
              </Typography>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Section 3: Data Usage */}
      <GlassCard
        id="section-dataUsage"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.dataUsage?.title ?? '3. How We Use Your Data'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.dataUsage?.intro}
        </Typography>
        {s?.dataUsage?.items && (
          <ul className="flex flex-col gap-2 pl-4 list-disc text-[var(--textSecondary)] text-sm">
            {s.dataUsage.items.map((item, index) => (
              <li key={index} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </>
  );
}

export function PrivacySectionGroup2({
  t,
  contactT,
  PRIVACY_EMAIL,
}: PrivacySectionProps) {
  const s = t?.sections;
  const routes = useRoutes();

  return (
    <>
      {/* Section 4: Data Sharing */}
      <GlassCard
        id="section-dataSharing"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.dataSharing?.title ?? '4. Data Sharing & Third Parties'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.dataSharing?.intro}
        </Typography>
        <div className="flex flex-col gap-3 pl-4 list-disc text-[var(--textSecondary)] text-sm">
          {s?.dataSharing?.items?.serviceProviders && (
            <div>
              <strong className="text-[var(--color)]">
                Service Providers:
              </strong>{' '}
              {s.dataSharing.items.serviceProviders}
            </div>
          )}
          {s?.dataSharing?.items?.legal && (
            <div>
              <strong className="text-[var(--color)]">
                Legal Obligations:
              </strong>{' '}
              {s.dataSharing.items.legal}
            </div>
          )}
          {s?.dataSharing?.items?.businessTransfers && (
            <div>
              <strong className="text-[var(--color)]">
                Business Transfers:
              </strong>{' '}
              {s.dataSharing.items.businessTransfers}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Section 5: Data Security */}
      <GlassCard
        id="section-dataSecurity"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
            <LockIcon size={20} />
          </div>
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-[var(--color)]"
          >
            {s?.dataSecurity?.title ?? '5. Data Security'}
          </Typography>
        </div>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.dataSecurity?.content}
        </Typography>
      </GlassCard>

      {/* Section 6: Data Retention */}
      <GlassCard
        id="section-dataRetention"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.dataRetention?.title ?? '6. Data Retention'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.dataRetention?.content}
        </Typography>
      </GlassCard>

      {/* Section 7: User Rights */}
      <GlassCard
        id="section-userRights"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
            <ShieldIcon size={20} />
          </div>
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-sky-600 dark:text-sky-300"
          >
            {s?.userRights?.title ?? '7. Your Rights & Choices'}
          </Typography>
        </div>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.userRights?.intro}
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {s?.userRights?.items?.access && (
            <div className="p-3.5 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-xs text-[var(--textSecondary)]">
              <strong className="text-[var(--color)] block mb-1">
                Right to Access
              </strong>
              {s.userRights.items.access}
            </div>
          )}
          {s?.userRights?.items?.correction && (
            <div className="p-3.5 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-xs text-[var(--textSecondary)]">
              <strong className="text-[var(--color)] block mb-1">
                Right to Rectification
              </strong>
              {s.userRights.items.correction}
            </div>
          )}
          {s?.userRights?.items?.deletion && (
            <div className="p-3.5 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-xs text-[var(--textSecondary)]">
              <strong className="text-[var(--color)] block mb-1">
                Right to Erasure (Forget Me)
              </strong>
              {s.userRights.items.deletion}
            </div>
          )}
          {s?.userRights?.items?.portability && (
            <div className="p-3.5 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-xs text-[var(--textSecondary)]">
              <strong className="text-[var(--color)] block mb-1">
                Data Portability
              </strong>
              {s.userRights.items.portability}
            </div>
          )}
          {s?.userRights?.items?.objection && (
            <div className="p-3.5 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] sm:col-span-2 text-xs text-[var(--textSecondary)]">
              <strong className="text-[var(--color)] block mb-1">
                Right to Object / Withdraw Consent
              </strong>
              {s.userRights.items.objection}
            </div>
          )}
        </div>
        <div className="mt-2 pt-4 border-t border-[var(--glassBorder)] text-sm text-[var(--textSecondary)]">
          {s?.userRights?.contact}{' '}
          <Link
            href={routes.contact}
            className="text-sky-600 dark:text-sky-400 font-bold underline hover:opacity-80"
          >
            {contactT?.title ?? 'Contact Privacy Officer'}
          </Link>
        </div>
      </GlassCard>

      {/* Section 8: Cookies */}
      <GlassCard
        id="section-cookies"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.cookies?.title ?? '8. Cookies & Tracking'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.cookies?.content}
        </Typography>
      </GlassCard>

      {/* Section 9: Children */}
      <GlassCard
        id="section-children"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.children?.title ?? '9. Children Privacy'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.children?.content}
        </Typography>
      </GlassCard>

      {/* Section 10: International Transfers */}
      <GlassCard
        id="section-internationalTransfers"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.internationalTransfers?.title ??
            '10. International Data Transfers'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.internationalTransfers?.content}
        </Typography>
      </GlassCard>

      {/* Section 11: Policy Changes */}
      <GlassCard
        id="section-policyChanges"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.policyChanges?.title ?? '11. Policy Changes'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.policyChanges?.content}
        </Typography>
      </GlassCard>

      {/* Section 12: Contact */}
      <GlassCard
        id="section-contact"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.contact?.title ?? '12. Contact Privacy Officer'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {formatMessage(s?.contact?.content, { email: PRIVACY_EMAIL })}
        </Typography>
      </GlassCard>
    </>
  );
}
