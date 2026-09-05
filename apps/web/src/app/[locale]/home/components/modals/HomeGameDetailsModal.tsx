'use client';

import React, { useState, useMemo, startTransition } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  Button,
  LinkButton,
} from '@arcadeum/ui';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useLanguage } from '@/shared/i18n/context';
import { FALLBACK_ACCENT, GameSymbol } from '../featured-games/gameMeta';
import { featuredGames } from '../../data/games';

interface HomeGameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  initialTab?: 'rules' | 'info';
}

export function HomeGameDetailsModal({
  isOpen,
  onClose,
  gameId,
  initialTab = 'rules',
}: HomeGameDetailsModalProps) {
  const { t } = useTranslation();
  const { messages, locale } = useLanguage();
  const routes = useRoutes();
  const [activeTab, setActiveTab] = useState<'rules' | 'info'>(initialTab);

  const game = useMemo(
    () => featuredGames.find((g) => g.id === gameId),
    [gameId],
  );

  const homeCopy = messages.home ?? {};

  const rulesData = useMemo(() => {
    if (!game) return [];

    // Resolve variables from config
    const variables: Record<string, string | number> = {};
    if (game.variableKeys) {
      Object.entries(game.variableKeys).forEach(([key, translationKey]) => {
        variables[key] = t(translationKey);
      });
    }

    return game.rulesKeys.map((key, index) => {
      const translationKey = `${game.rulesPrefix}.${key}` as TranslationKey;
      const translationString = t(translationKey);

      // Only pass variables if the translation string actually has placeholders
      const hasPlaceholders = translationString.includes('{{');
      const filteredVariables = hasPlaceholders ? variables : {};

      return {
        id: key,
        index: index + 1,
        name:
          t(`games.shared.rules.${key}` as TranslationKey) ||
          key.charAt(0).toUpperCase() + key.slice(1),
        description: t(translationKey, filteredVariables),
      };
    });
  }, [game, t]);

  const renderRules = () => (
    <div className="relative z-[1] flex flex-col gap-4">
      {rulesData.map((rule) => (
        <div
          key={rule.id}
          className="flex items-start gap-5 rounded-[20px] border border-border-color bg-[rgba(21,23,24,0.5)] p-5"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            style={{ background: game?.accentColor ?? FALLBACK_ACCENT }}
          >
            <span className="text-[16px] font-black text-white">
              {rule.index}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <h4 className="m-0 text-[20px] font-bold leading-6 text-color">
              {rule.name}
            </h4>
            <p className="m-0 text-[16px] leading-5 text-color opacity-70">
              {rule.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGameInfo = () => {
    if (!game) return null;

    return (
      <div className="relative z-[1] flex flex-col gap-5">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {game.variants.map((v) => {
            const active = !v.disabled;
            return (
              <div
                key={v.id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 transition-[transform,background-color] duration-200 ${
                  active
                    ? 'border-border-color hover:scale-[1.05] hover:bg-[var(--backgroundHover)]'
                    : 'border-transparent opacity-60'
                }`}
              >
                <span className="text-[18px] font-bold text-color">
                  {t(v.nameKey) || v.id}
                </span>
                <span
                  className={`w-fit rounded-[6px] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[1px] ${
                    active
                      ? 'bg-[rgba(122,215,255,0.12)] text-[#7ad7ff]'
                      : 'bg-[rgba(236,239,238,0.12)] text-[rgba(236,239,238,0.45)]'
                  }`}
                >
                  {active
                    ? (homeCopy.gameAvailableNow ?? 'Playable')
                    : (homeCopy.gameComingSoon ?? 'Coming Soon')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen || !game) return null;

  return (
    <Modal key={gameId} open={isOpen} onClose={onClose}>
      <ModalContent maxWidth="800px">
        <div className="relative overflow-hidden rounded-3xl border border-border-color bg-[rgba(21,23,24,0.8)] backdrop-blur-[20px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-5 -top-5 z-0 opacity-10"
          >
            <GameSymbol
              gameId={game.id}
              width={160}
              height={160}
              style={{
                color: game.accentColor ?? FALLBACK_ACCENT,
                filter: 'blur(2px)',
              }}
            />
          </div>
          <ModalHeader onClose={onClose}>
            <ModalTitle>
              <span
                style={{
                  color: game.accentColor ?? FALLBACK_ACCENT,
                  fontSize: '2.25rem',
                  fontWeight: '900',
                  letterSpacing: '-0.02em',
                }}
              >
                {t(game.nameKey)}
              </span>
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div
              className="mb-10 flex w-fit rounded-full border border-[rgba(50,53,61,0.31)] bg-[rgba(50,53,61,0.25)] p-[0.35rem]"
              role="tablist"
            >
              <Button
                className={
                  'px-8 text-[0.9rem] font-bold uppercase tracking-[0.05em]'
                }
                variant="chip"
                active={activeTab === 'rules'}
                shape="round"
                role="tab"
                aria-selected={activeTab === 'rules'}
                onClick={() => startTransition(() => setActiveTab('rules'))}
              >
                {homeCopy.rulesTab ?? 'Rules'}
              </Button>
              <Button
                className={
                  'px-8 text-[0.9rem] font-bold uppercase tracking-[0.05em]'
                }
                variant="chip"
                active={activeTab === 'info'}
                shape="round"
                role="tab"
                aria-selected={activeTab === 'info'}
                onClick={() => startTransition(() => setActiveTab('info'))}
              >
                {homeCopy.infoTab ?? 'Game Themes'}
              </Button>
            </div>

            {activeTab === 'rules' ? renderRules() : renderGameInfo()}

            <div className="mt-7 flex items-center justify-between border-t border-border-color pt-6">
              <span className="text-[16px] text-[rgba(236,239,238,0.7)]">
                {locale.toUpperCase()} •{' '}
                {t(`games.shared.category.${game.type}Game` as TranslationKey)}
              </span>
              <LinkButton
                href={`${routes.gameCreate}?gameId=${game.id}`}
                aria-label={`${homeCopy.gamePlayButton ?? 'Play Now!'} ${t(game.nameKey)}`}
              >
                {homeCopy.gamePlayButton ?? 'Play Now!'}
              </LinkButton>
            </div>
          </ModalBody>
        </div>
      </ModalContent>
    </Modal>
  );
}
