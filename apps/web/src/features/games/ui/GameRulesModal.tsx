'use client';

import { memo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

export interface RuleSection {
  title: string;
  body: string;
  badge?: string;
}

export interface GameRulesModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  rules: RuleSection[];
}

export const GameRulesModal = memo(function GameRulesModal({
  open,
  onClose,
  title,
  subtitle,
  icon = '📖',
  rules,
}: GameRulesModalProps) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent maxWidth={540} data-testid="game-rules-modal">
        <ModalHeader onClose={onClose}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg shadow-inner">
              {icon}
            </div>
            <div className="flex flex-col">
              <ModalTitle>{title}</ModalTitle>
              {subtitle ? (
                <span className="text-xs text-[var(--textSecondary)]">
                  {subtitle}
                </span>
              ) : null}
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2.5">
            {rules.map((rule, idx) => (
              <div
                key={rule.title}
                className="group relative flex gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/15 text-xs font-bold text-[var(--primary)]">
                  {rule.badge || idx + 1}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h4 className="text-sm font-bold text-[var(--color)] transition-colors group-hover:text-[var(--primary)]">
                    {rule.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-[var(--textSecondary)]">
                    {rule.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            data-testid="rules-modal-got-it-button"
            className="px-5 text-xs font-semibold"
          >
            {t('common.close' as TranslationKey) || 'Got it'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});
