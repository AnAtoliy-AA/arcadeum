'use client';

import { memo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { PIECE_SYMBOLS } from '../types';
import { ModalOverlay, ModalContent, ModalTitle, ModalButton } from './styles';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

function RulesModalImpl({ open, onClose }: RulesModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <ModalOverlay>
      <ModalContent maxWidth={480} width="90%" maxHeight="80vh">
        <ModalTitle fontSize={20}>{t('games.chess_v1.rules.title')}</ModalTitle>

        <div className="box-border flex flex-col items-stretch gap-null w-full">
          <div className="box-border flex flex-col items-stretch gap-2">
            <span className="box-border text-[15px] font-semibold text-[#f8fafc]">
              {t('games.chess_v1.rules.objective')}
            </span>
            <span className="box-border text-[13px] text-[rgba(148,_163,_184,_0.8)] leading-[1.5]">
              {t('games.chess_v1.rules.objectiveText')}
            </span>
          </div>

          <div className="box-border flex flex-col items-stretch gap-2">
            <span className="box-border text-[15px] font-semibold text-[#f8fafc] -mb-8">
              {t('games.chess_v1.rules.pieces')}
            </span>
            <div className="box-border flex flex-row items-stretch flex-wrap gap-8">
              {(
                ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const
              ).map((type) => (
                <div
                  className="box-border flex flex-row gap-6 items-center p-6 px-10 rounded-[8px] bg-[rgba(255,_255,_255,_0.04)] border border-[rgba(255,_255,_255,_0.06)]"
                  key={type}
                >
                  <span className="box-border text-[18px]">
                    {PIECE_SYMBOLS[type].white}
                  </span>
                  <span className="box-border text-[12px] capitalize text-[rgba(148,_163,_184,_0.8)]">
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="box-border flex flex-col items-stretch gap-2">
            <span className="box-border text-[15px] font-semibold text-[#f8fafc]">
              {t('games.chess_v1.rules.special')}
            </span>
            <div className="box-border flex flex-col items-stretch gap-1">
              <span className="box-border text-[13px] leading-[20px] text-[rgba(148,_163,_184,_0.8)]">
                •{' '}
                <span className="box-border font-semibold text-[#e2e8f0]">
                  Castling:
                </span>{' '}
                {t('games.chess_v1.rules.castling')}
              </span>
              <span className="box-border text-[13px] leading-[20px] text-[rgba(148,_163,_184,_0.8)]">
                •{' '}
                <span className="box-border font-semibold text-[#e2e8f0]">
                  En passant:
                </span>{' '}
                {t('games.chess_v1.rules.enPassant')}
              </span>
              <span className="box-border text-[13px] leading-[20px] text-[rgba(148,_163,_184,_0.8)]">
                •{' '}
                <span className="box-border font-semibold text-[#e2e8f0]">
                  Promotion:
                </span>{' '}
                {t('games.chess_v1.rules.promotion')}
              </span>
            </div>
          </div>

          <div className="box-border flex flex-col items-stretch gap-2">
            <span className="box-border text-[15px] font-semibold text-[#f8fafc]">
              {t('games.chess_v1.rules.drawConditions')}
            </span>
            <div className="box-border flex flex-col items-stretch gap-1">
              <span className="box-border text-[13px] leading-[20px] text-[rgba(148,_163,_184,_0.8)]">
                • {t('games.chess_v1.rules.drawStalemate')}
              </span>
              <span className="box-border text-[13px] leading-[20px] text-[rgba(148,_163,_184,_0.8)]">
                • {t('games.chess_v1.rules.drawFiftyMove')}
              </span>
              <span className="box-border text-[13px] leading-[20px] text-[rgba(148,_163,_184,_0.8)]">
                • {t('games.chess_v1.rules.drawRepetition')}
              </span>
              <span className="box-border text-[13px] leading-[20px] text-[rgba(148,_163,_184,_0.8)]">
                • {t('games.chess_v1.rules.drawMaterial')}
              </span>
            </div>
          </div>
        </div>

        <ModalButton onPress={onClose} marginTop={4}>
          {t('games.chess_v1.rules.gotIt')}
        </ModalButton>
      </ModalContent>
    </ModalOverlay>
  );
}

export const RulesModal = memo(RulesModalImpl);
