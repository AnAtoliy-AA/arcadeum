'use client';

import React, { useState } from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import { useShallow } from 'zustand/react/shallow';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Notice,
  TabBar,
} from '@arcadeum/ui';
import { useArcadePetStore } from '../store/useArcadePetStore';
import { SPECIES_PALETTE } from '../lib/arcade-pet-palette';
import { ArcadePetPresentsList } from './ArcadePetPresentsList';
import type { ArcadePetSyncStatus } from '../hooks/useArcadePetSync';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

interface ArcadePetGiftsModalProps {
  open: boolean;
  onClose: () => void;
  /** Collection sync status; presents arrive through sync, so it drives loading and error. */
  syncStatus?: ArcadePetSyncStatus;
  onRetrySync?: () => void;
}

const noop = () => {};

type GiftTab = 'received' | 'send';

const GIFT_SPECIES: readonly {
  id: PetSpecies;
  emoji: string;
}[] = [
  { id: 'cyber_cat', emoji: '🐱' },
  { id: 'dragon', emoji: '🐲' },
  { id: 'dino', emoji: '🦖' },
  { id: 'blob', emoji: '🐡' },
  { id: 'slime', emoji: '👾' },
];

export function ArcadePetGiftsModal({
  open,
  onClose,
  syncStatus = 'idle',
  onRetrySync = noop,
}: ArcadePetGiftsModalProps) {
  const { t } = useTranslation();
  const { presents, gemBalance, claimPresent, sendGiftPet } = useArcadePetStore(
    useShallow((s) => ({
      presents: s.presents,
      gemBalance: s.gemBalance,
      claimPresent: s.claimPresent,
      sendGiftPet: s.sendGiftPet,
    })),
  );
  const { snapshot } = useSessionTokens();
  const isAdmin = snapshot.role === 'admin';

  const [activeTab, setActiveTab] = useState<GiftTab>('received');
  const [recipient, setRecipient] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('dragon');
  const [theme, setTheme] = useState<string>('fantasy');
  const [petName, setPetName] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const unopenedCount = presents.filter((p) => !p.isOpened).length;

  const handleClaim = (presentId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const result = claimPresent(presentId);
    if (result.success && result.present) {
      setSuccessMsg(
        t('arcadePetCompanion.gifts.okOpened', {
          name: result.present.petName,
        }),
      );
    }
  };

  const handleSendGift = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!recipient.trim()) {
      setErrorMsg(t('arcadePetCompanion.gifts.errName'));
      return;
    }

    const result = await sendGiftPet(
      recipient.trim(),
      recipient.trim(),
      {
        species,
        theme,
        petName:
          petName.trim() || `${SPECIES_PALETTE[theme]?.title ?? ''} ${species}`,
        message:
          message.trim() ||
          (isAdmin
            ? t('arcadePetCompanion.gifts.defaultAdminMsg')
            : t('arcadePetCompanion.gifts.defaultMsg')),
      },
      isAdmin,
    );

    if (!result.success) {
      if (result.error === 'INSUFFICIENT_GEMS') {
        setErrorMsg(
          t('arcadePetCompanion.gifts.errGems', { gems: gemBalance }),
        );
      } else if (result.error === 'RECIPIENT_NOT_FOUND') {
        setErrorMsg(t('arcadePetCompanion.gifts.errRecipient'));
      } else if (result.error === 'INBOX_FULL') {
        setErrorMsg(t('arcadePetCompanion.gifts.errInbox'));
      } else if (result.error === 'OFFLINE') {
        setErrorMsg(t('arcadePetCompanion.gifts.errOffline'));
      } else {
        setErrorMsg(t('arcadePetCompanion.gifts.errSend'));
      }
      return;
    }

    setSuccessMsg(
      t('arcadePetCompanion.gifts.okSent', { name: recipient.trim() }),
    );
    setRecipient('');
    setPetName('');
    setMessage('');
  };

  const tabs = [
    {
      id: 'received',
      testId: 'tab-received-presents',
      label: t('arcadePetCompanion.gifts.takePresents'),
      badge: unopenedCount,
    },
    {
      id: 'send',
      testId: 'tab-send-gift',
      label: isAdmin
        ? t('arcadePetCompanion.gifts.adminTab')
        : t('arcadePetCompanion.gifts.sendTab'),
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabelledBy="arcade-pet-gifts-title"
    >
      <ModalContent data-testid="arcade-pet-gifts-modal" maxWidth={512}>
        <ModalHeader
          onClose={onClose}
          closeLabel={t('arcadePetCompanion.close')}
        >
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-2xl">
              🎁
            </span>
            <div className="flex flex-col">
              <span
                id="arcade-pet-gifts-title"
                className="text-base font-bold text-[var(--color)]"
              >
                {t('arcadePetCompanion.gifts.title')}
              </span>
              <span className="text-xs text-[var(--textSecondary)]">
                {t('arcadePetCompanion.gifts.subtitle')}
              </span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--primary)] px-3 py-1 text-xs font-bold text-[var(--color)]">
            <span aria-hidden="true">💎</span>
            <span>{gemBalance}</span>
          </div>
        </ModalHeader>

        <TabBar
          aria-label={t('arcadePetCompanion.a11y.giftTabs')}
          items={tabs}
          value={activeTab}
          onChange={(id) => setActiveTab(id as GiftTab)}
        />

        <ModalBody className="space-y-4">
          {errorMsg && (
            <Notice tone="danger" role="alert">
              {errorMsg}
            </Notice>
          )}
          {successMsg && <Notice tone="success">{successMsg}</Notice>}

          {activeTab === 'received' && (
            <div className="space-y-3">
              <span className="block text-xs text-[var(--textSecondary)]">
                {t('arcadePetCompanion.gifts.waiting')}
              </span>
              <ArcadePetPresentsList
                presents={presents}
                syncStatus={syncStatus}
                onRetry={onRetrySync}
                onClaim={handleClaim}
              />
            </div>
          )}

          {activeTab === 'send' && (
            <div className="space-y-4">
              {isAdmin ? (
                <Notice
                  tone="warning"
                  icon="👑"
                  data-testid="admin-gift-callout"
                >
                  {t('arcadePetCompanion.gifts.adminAuthority')}
                </Notice>
              ) : (
                <Notice tone="accent">
                  {t('arcadePetCompanion.gifts.giftCost')}
                </Notice>
              )}

              <div className="space-y-1">
                <label
                  htmlFor="arcade-pet-gift-recipient"
                  className="block text-xs font-bold text-[var(--color)]"
                >
                  {t('arcadePetCompanion.gifts.nameLabel')}
                </label>
                <Input
                  id="arcade-pet-gift-recipient"
                  size="sm"
                  fullWidth
                  data-testid="gift-recipient-input"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={t('arcadePetCompanion.gifts.namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold text-[var(--color)]">
                  {t('arcadePetCompanion.gifts.speciesLabel')}
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {GIFT_SPECIES.map((spec) => (
                    <Button
                      key={spec.id}
                      variant="chip"
                      size="auto"
                      padding="p-2"
                      active={species === spec.id}
                      aria-pressed={species === spec.id}
                      data-testid={`gift-species-${spec.id}`}
                      onClick={() => setSpecies(spec.id)}
                      className="flex-col gap-1"
                    >
                      <span aria-hidden="true" className="text-xl">
                        {spec.emoji}
                      </span>
                      <span className="text-xs">
                        {t(`arcadePetCompanion.gifts.species.${spec.id}`)}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-bold text-[var(--color)]">
                  {t('arcadePetCompanion.gifts.themeLabel')}
                </span>
                <div className="grid max-h-32 grid-cols-4 gap-2 overflow-y-auto p-1">
                  {Object.values(SPECIES_PALETTE).map((pal) => (
                    <Button
                      key={pal.id}
                      variant="chip"
                      size="auto"
                      padding="p-2"
                      active={theme === pal.id}
                      aria-pressed={theme === pal.id}
                      data-testid={`gift-theme-${pal.id}`}
                      onClick={() => setTheme(pal.id)}
                      className="justify-start gap-1.5"
                    >
                      <span aria-hidden="true" className="text-base">
                        {pal.emoji}
                      </span>
                      <span className="truncate text-xs">{pal.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="arcade-pet-gift-message"
                  className="block text-xs font-bold text-[var(--color)]"
                >
                  {t('arcadePetCompanion.gifts.messageLabel')}
                </label>
                <Input
                  id="arcade-pet-gift-message"
                  size="sm"
                  fullWidth
                  data-testid="gift-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('arcadePetCompanion.gifts.messagePlaceholder')}
                />
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                data-testid="send-pet-gift-btn"
                onClick={handleSendGift}
              >
                {isAdmin
                  ? t('arcadePetCompanion.gifts.grantBtn')
                  : t('arcadePetCompanion.gifts.sendBtn')}
              </Button>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
