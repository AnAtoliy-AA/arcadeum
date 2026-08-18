'use client';

import type { TermsMessages, ContactMessages } from '@/shared/i18n/types';
import { appConfig } from '@/shared/config/app-config';
import { formatMessage } from '@/shared/i18n';
import Link from 'next/link';
import { useRoutes } from '@/shared/config/useRoutes';
import { GlassCard, Typography } from '@arcadeum/ui';
import {
  ShieldIcon,
  FileTextIcon,
  SupportIcon,
} from '@arcadeum/ui/components/Icons/index';

interface SectionProps {
  id: string;
  t?: TermsMessages;
  contactT?: ContactMessages;
  LEGAL_NAME: string;
  ID_CODE: string;
  SUPPORT_EMAIL: string;
  WORKING_HOURS: string;
}

const APP_NAME = appConfig.appName;

export function TermsSectionGroup1({
  t,
  LEGAL_NAME,
  ID_CODE,
  SUPPORT_EMAIL,
  WORKING_HOURS,
}: SectionProps) {
  const s = t?.sections;
  return (
    <>
      {/* Section 1: Agreement */}
      <GlassCard
        id="section-agreement"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <FileTextIcon size={20} />
          </div>
          <Typography variant="heading" uiSize="md" className="font-bold">
            {s?.agreement?.title ?? '1. Agreement to Terms'}
          </Typography>
        </div>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {formatMessage(s?.agreement?.content, { appName: APP_NAME })}
        </Typography>
      </GlassCard>

      {/* Section 2: Company Info */}
      <GlassCard
        id="section-companyInfo"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldIcon size={20} />
          </div>
          <Typography variant="heading" uiSize="md" className="font-bold">
            {s?.companyInfo?.title ?? '2. Company Information'}
          </Typography>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
          <div>
            <Typography
              variant="caption"
              alpha="medium"
              className="text-xs uppercase"
            >
              {s?.companyInfo?.companyName ?? 'Platform'}
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              className="font-bold text-white"
            >
              {APP_NAME}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              alpha="medium"
              className="text-xs uppercase"
            >
              {s?.companyInfo?.legalName ?? 'Legal Entity'}
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              className="font-bold text-white"
            >
              {LEGAL_NAME}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              alpha="medium"
              className="text-xs uppercase"
            >
              {s?.companyInfo?.idCode ?? 'ID Code'}
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              className="font-bold text-white font-mono text-sm"
            >
              {ID_CODE}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              alpha="medium"
              className="text-xs uppercase"
            >
              {s?.companyInfo?.contactEmail ?? 'Support Email'}
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              className="font-bold text-indigo-300"
            >
              {SUPPORT_EMAIL}
            </Typography>
          </div>
          <div className="sm:col-span-2">
            <Typography
              variant="caption"
              alpha="medium"
              className="text-xs uppercase"
            >
              {s?.companyInfo?.workingHours ?? 'Working Hours'}
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              className="font-semibold text-slate-300"
            >
              {WORKING_HOURS}
            </Typography>
          </div>
        </div>
      </GlassCard>

      {/* Section 3: Services */}
      <GlassCard
        id="section-services"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.services?.title ?? '3. Platform Services'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {formatMessage(s?.services?.intro, { appName: APP_NAME })}
        </Typography>
        {s?.services?.items && (
          <ul className="flex flex-col gap-2 pl-4 list-disc text-slate-300 text-sm">
            {s.services.items.map((item, index) => (
              <li key={index} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {/* Section 4: Accounts */}
      <GlassCard
        id="section-accounts"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.accounts?.title ?? '4. User Accounts'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {formatMessage(s?.accounts?.intro, { appName: APP_NAME })}
        </Typography>
        {s?.accounts?.items && (
          <ul className="flex flex-col gap-2 pl-4 list-disc text-slate-300 text-sm">
            {s.accounts.items.map((item, index) => (
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

export function TermsSectionGroup2({ t, contactT }: SectionProps) {
  const s = t?.sections;
  const routes = useRoutes();

  return (
    <>
      {/* Section 5: Delivery */}
      <GlassCard
        id="section-delivery"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.delivery?.title ?? '5. Digital Delivery'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {formatMessage(s?.delivery?.content, { appName: APP_NAME })}
        </Typography>
      </GlassCard>

      {/* Section 6: Payment */}
      <GlassCard
        id="section-payment"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.payment?.title ?? '6. Payments & Currency'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {s?.payment?.content}
        </Typography>
      </GlassCard>

      {/* Section 7: Refund Policy */}
      <GlassCard
        id="section-refund"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-amber-300"
        >
          {s?.refund?.title ?? '7. Refund Policy'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {s?.refund?.intro}
        </Typography>
        <ul className="flex flex-col gap-3 pl-4 list-disc text-slate-300 text-sm">
          {s?.refund?.items?.virtualCurrency && (
            <li>
              <strong className="text-white">Virtual Items & Coins:</strong>{' '}
              {s.refund.items.virtualCurrency}
            </li>
          )}
          {s?.refund?.items?.subscriptions && (
            <li>
              <strong className="text-white">Subscriptions:</strong>{' '}
              {s.refund.items.subscriptions}
            </li>
          )}
          {s?.refund?.items?.technicalIssues && (
            <li>
              <strong className="text-white">Technical Issues:</strong>{' '}
              {s.refund.items.technicalIssues}
            </li>
          )}
          {s?.refund?.items?.processingTime && (
            <li>
              <strong className="text-white">Processing Window:</strong>{' '}
              {s.refund.items.processingTime}
            </li>
          )}
        </ul>
        <div className="mt-2 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-slate-300">
          <SupportIcon size={16} />
          <span>
            {s?.refund?.contact}{' '}
            <Link
              href={routes.contact}
              className="text-indigo-400 font-bold underline hover:text-indigo-300"
            >
              {contactT?.title ?? 'Contact Support'}
            </Link>
          </span>
        </div>
      </GlassCard>

      {/* Section 8: Acceptable Use */}
      <GlassCard
        id="section-acceptableUse"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.acceptableUse?.title ?? '8. Acceptable Use Policy'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {s?.acceptableUse?.intro}
        </Typography>
        {s?.acceptableUse?.items && (
          <ul className="flex flex-col gap-2 pl-4 list-disc text-slate-300 text-sm">
            {s.acceptableUse.items.map((item, index) => (
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

export function TermsSectionGroup3({ t, SUPPORT_EMAIL }: SectionProps) {
  const s = t?.sections;
  return (
    <>
      {/* Section 9: Intellectual Property */}
      <GlassCard
        id="section-intellectualProperty"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.intellectualProperty?.title ?? '9. Intellectual Property'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {formatMessage(s?.intellectualProperty?.content, {
            appName: APP_NAME,
          })}
        </Typography>
      </GlassCard>

      {/* Section 10: Liability */}
      <GlassCard
        id="section-liability"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.liability?.title ?? '10. Limitation of Liability'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {formatMessage(s?.liability?.content, { appName: APP_NAME })}
        </Typography>
      </GlassCard>

      {/* Section 11: Crypto Disclaimers */}
      {s?.crypto && (
        <GlassCard
          id="section-crypto"
          className="p-7 bg-slate-900/60 border-indigo-500/30 rounded-2xl flex flex-col gap-4"
        >
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-indigo-300"
          >
            {s.crypto.title}
          </Typography>
          <Typography
            variant="body"
            uiSize="md"
            alpha="high"
            className="text-slate-300 leading-relaxed"
          >
            {s.crypto.content}
          </Typography>
        </GlassCard>
      )}

      {s?.taxes && (
        <GlassCard
          id="section-taxes"
          className="p-7 bg-slate-900/60 border-amber-500/30 rounded-2xl flex flex-col gap-4"
        >
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-amber-300"
          >
            {s.taxes.title}
          </Typography>
          <Typography
            variant="body"
            uiSize="md"
            alpha="high"
            className="text-slate-300 leading-relaxed"
          >
            {s.taxes.content}
          </Typography>
          {s.taxes.items && (
            <ul className="flex flex-col gap-2 pl-4 list-disc text-slate-300 text-sm">
              {s.taxes.items.map((item, index) => (
                <li key={index} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )}
          {s.taxes.important && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 mt-2">
              <SupportIcon size={18} />
              <Typography
                variant="body"
                uiSize="sm"
                className="font-semibold leading-relaxed"
              >
                {s.taxes.important}
              </Typography>
            </div>
          )}
        </GlassCard>
      )}

      {/* Governing Law */}
      <GlassCard
        id="section-governingLaw"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.governingLaw?.title ?? 'Governing Law'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {s?.governingLaw?.content}
        </Typography>
      </GlassCard>

      {/* Contact Section */}
      <GlassCard
        id="section-contact"
        className="p-7 bg-slate-900/60 border-white/10 rounded-2xl flex flex-col gap-4"
      >
        <Typography variant="heading" uiSize="md" className="font-bold">
          {s?.contact?.title ?? 'Contact Us'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-slate-300 leading-relaxed"
        >
          {formatMessage(s?.contact?.content, { email: SUPPORT_EMAIL })}
        </Typography>
      </GlassCard>
    </>
  );
}
