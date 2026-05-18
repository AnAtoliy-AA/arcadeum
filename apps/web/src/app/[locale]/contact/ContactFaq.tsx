'use client';

import { useState, type ReactNode } from 'react';
import { GlassCard } from '@arcadeum/ui/components/GlassCard/GlassCard';
import { Typography } from '@arcadeum/ui/components/Typography/Typography';
import { YStack } from 'tamagui';
import { ChevronIcon } from './ContactView.icons';
import { useContactStyles } from './useContactStyles';
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

function renderAnswer(
  template: string,
  email: string,
  accent: string,
): ReactNode {
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
          style={{ color: accent, textDecoration: 'underline' }}
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

export function ContactFaq({
  items,
  supportEmail,
  title,
  browseLabel,
  questionsLabel,
}: ContactFaqProps) {
  const s = useContactStyles();
  const [openKey, setOpenKey] = useState<string | null>(items[0]?.key ?? null);
  if (items.length === 0) return null;
  return (
    <GlassCard>
      <div style={s.faqHeaderRowStyle}>
        <YStack gap={2}>
          <span style={s.labelChipStyle}>
            {questionsLabel ?? 'Common questions'}
          </span>
          <Typography variant="heading" uiSize="xl">
            {title ?? 'Maybe we already answered this'}
          </Typography>
        </YStack>
        <a
          href="https://help.arcadeum.games"
          target="_blank"
          rel="noopener noreferrer"
          style={s.helpLinkStyle}
        >
          {browseLabel ?? 'Browse help center'}
        </a>
      </div>
      <YStack>
        {items.map((it) => {
          const open = openKey === it.key;
          return (
            <div key={it.key} style={s.faqItemStyle(open)}>
              <button
                type="button"
                style={s.faqButtonStyle}
                aria-expanded={open}
                onClick={() => setOpenKey(open ? null : it.key)}
              >
                <span>{it.question}</span>
                <span style={s.chevronStyle(open)}>
                  <ChevronIcon />
                </span>
              </button>
              {open ? (
                <div style={s.faqAnswerStyle}>
                  {renderAnswer(
                    it.answerTemplate,
                    supportEmail,
                    s.tokens.accent,
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </YStack>
    </GlassCard>
  );
}
