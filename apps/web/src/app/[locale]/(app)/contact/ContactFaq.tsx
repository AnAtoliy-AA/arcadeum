'use client';

import { useState, type ReactNode } from 'react';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { ChevronIcon } from './ContactView.icons';
import type { ContactMessages } from '@/shared/i18n/messages/legal/types';

export type FaqItem = { key: string; question: string; answerTemplate: string };

export function getFaqItems(t?: ContactMessages): FaqItem[] {
  const faq = t?.sections?.faq;
  if (!faq) return [];
  const items: FaqItem[] = [];
  const push = (key: string, e?: { question?: string; answer?: string }) => {
    if (!e?.question || !e?.answer) return;
    items.push({ key, question: e.question, answerTemplate: e.answer });
  };
  push('refund', faq.refund);
  push('password', faq.password);
  push('deleteAccount', faq.deleteAccount);
  push('multiplayerLag', faq.multiplayerLag);
  push('reportPlayer', faq.reportPlayer);
  return items;
}

function renderAnswer(template: string, email: string): ReactNode {
  if (!template.includes('{{email}}')) return template;
  const parts = template.split('{{email}}');
  const nodes: ReactNode[] = [];
  parts.forEach((part, i) => {
    nodes.push(part);
    if (i < parts.length - 1) {
      nodes.push(
        <a
          key={`m-${i}`}
          href={`mailto:${email}`}
          className="text-[var(--accent)] underline"
        >
          {email}
        </a>,
      );
    }
  });
  return nodes;
}

export type ContactFaqProps = {
  items: FaqItem[];
  supportEmail: string;
  title?: string;
  browseLabel?: string;
  questionsLabel?: string;
};

const LABEL_CHIP_CLASS =
  'text-[11px] font-semibold tracking-[1.4px] uppercase text-[var(--textSecondary)]';

const HELP_LINK_CLASS =
  'inline-flex items-center gap-2 px-[14px] py-2 rounded-[12px] border border-[var(--glassBorder)] bg-[var(--glassBg)] text-[var(--color)] no-underline text-[13.5px]';

export function ContactFaq({
  items,
  supportEmail,
  title,
  browseLabel,
  questionsLabel,
}: ContactFaqProps) {
  const [openKey, setOpenKey] = useState<string | null>(items[0]?.key ?? null);
  if (items.length === 0) return null;
  return (
    <GlassCard>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div className="flex flex-col items-stretch gap-2">
          <span className={LABEL_CHIP_CLASS}>
            {questionsLabel ?? 'Common questions'}
          </span>
          <Typography variant="heading" uiSize="xl">
            {title ?? 'Maybe we already answered this'}
          </Typography>
        </div>
        <a
          href="https://help.arcadeum.games"
          target="_blank"
          rel="noopener noreferrer"
          className={HELP_LINK_CLASS}
        >
          {browseLabel ?? 'Browse help center'}
        </a>
      </div>
      <div className="flex flex-col items-stretch">
        {items.map((it) => {
          const open = openKey === it.key;
          return (
            <div
              key={it.key}
              className={`border-b border-b-[var(--glassBorder)] ${open ? 'pb-4' : 'pb-0'}`}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 py-[14px] bg-transparent border-0 text-[var(--color)] text-[15px] font-semibold text-left cursor-pointer font-[inherit]"
                aria-expanded={open}
                onClick={() => setOpenKey(open ? null : it.key)}
              >
                <span>{it.question}</span>
                <span
                  className={`inline-block transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
                >
                  <ChevronIcon />
                </span>
              </button>
              {open ? (
                <div className="text-[14px] leading-[1.55] text-[var(--textSecondary)]">
                  {renderAnswer(it.answerTemplate, supportEmail)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
