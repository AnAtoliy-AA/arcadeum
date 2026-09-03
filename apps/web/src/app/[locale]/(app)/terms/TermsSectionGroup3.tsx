'use client';

import { appConfig } from '@/shared/config/app-config';
import { formatMessage } from '@/shared/i18n';
import { GlassCard, Typography } from '@arcadeum/ui';
import { SupportIcon } from '@arcadeum/ui/components/Icons/index';
import type { SectionProps } from './TermsSections';

const APP_NAME = appConfig.appName;

export function TermsSectionGroup3({ t, SUPPORT_EMAIL }: SectionProps) {
  const s = t?.sections;
  return (
    <>
      {/* Section 9: Intellectual Property */}
      <GlassCard
        id="section-intellectualProperty"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.intellectualProperty?.title ?? '9. Intellectual Property'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {formatMessage(s?.intellectualProperty?.content, {
            appName: APP_NAME,
          })}
        </Typography>
      </GlassCard>

      {/* Section 10: Liability */}
      <GlassCard
        id="section-liability"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.liability?.title ?? '10. Limitation of Liability'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {formatMessage(s?.liability?.content, { appName: APP_NAME })}
        </Typography>
      </GlassCard>

      {/* Section 11: Crypto Disclaimers */}
      {s?.crypto && (
        <GlassCard
          id="section-crypto"
          className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
        >
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-indigo-600 dark:text-indigo-300"
          >
            {s.crypto.title}
          </Typography>
          <Typography
            variant="body"
            uiSize="md"
            alpha="high"
            className="text-[var(--textSecondary)] leading-relaxed"
          >
            {s.crypto.content}
          </Typography>
        </GlassCard>
      )}

      {s?.taxes && (
        <GlassCard
          id="section-taxes"
          className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
        >
          <Typography
            variant="heading"
            uiSize="md"
            className="font-bold text-amber-600 dark:text-amber-300"
          >
            {s.taxes.title}
          </Typography>
          <Typography
            variant="body"
            uiSize="md"
            alpha="high"
            className="text-[var(--textSecondary)] leading-relaxed"
          >
            {s.taxes.content}
          </Typography>
          {s.taxes.items && (
            <ul className="flex flex-col gap-2 pl-4 list-disc text-[var(--textSecondary)] text-sm">
              {s.taxes.items.map((item, index) => (
                <li key={index} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )}
          {s.taxes.important && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-200 mt-2">
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
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.governingLaw?.title ?? 'Governing Law'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {s?.governingLaw?.content}
        </Typography>
      </GlassCard>

      {/* Contact Section */}
      <GlassCard
        id="section-contact"
        className="p-7 bg-[var(--glassBg)] border-[var(--glassBorder)] rounded-2xl flex flex-col gap-4"
      >
        <Typography
          variant="heading"
          uiSize="md"
          className="font-bold text-[var(--color)]"
        >
          {s?.contact?.title ?? 'Contact Us'}
        </Typography>
        <Typography
          variant="body"
          uiSize="md"
          alpha="high"
          className="text-[var(--textSecondary)] leading-relaxed"
        >
          {formatMessage(s?.contact?.content, { email: SUPPORT_EMAIL })}
        </Typography>
      </GlassCard>
    </>
  );
}
