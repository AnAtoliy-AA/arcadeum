import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalSection,
  SectionLabel,
  OptionGrid,
  OptionButton,
  ModalActions,
  ModalButton,
} from "../styles";
import { getCardEmoji, getCardTranslationKey } from "../../lib/cardUtils";
import { CAT_CARDS } from "../../types";
import type { ExplodingCatsCard, ExplodingCatsCatCard } from "../../types";
import type { TranslationKey } from "@/shared/lib/useTranslation";

interface CatComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  catComboModal: {
    cat: ExplodingCatsCatCard;
    availableModes: ("pair" | "trio")[];
  } | null;
  selectedMode: "pair" | "trio" | null;
  selectedTarget: string | null;
  selectedCard: ExplodingCatsCard | null;
  aliveOpponents: Array<{
    playerId: string;
    hand: ExplodingCatsCard[];
  }>;
  onSelectMode: (mode: "pair" | "trio") => void;
  onSelectTarget: (target: string) => void;
  onSelectCard: (card: ExplodingCatsCard) => void;
  onConfirm: () => void;
  resolveDisplayName: (playerId?: string, fallback?: string) => string;
  t: (key: TranslationKey) => string;
}

export const CatComboModal: React.FC<CatComboModalProps> = ({
  isOpen,
  onClose,
  catComboModal,
  selectedMode,
  selectedTarget,
  selectedCard,
  aliveOpponents,
  onSelectMode,
  onSelectTarget,
  onSelectCard,
  onConfirm,
  resolveDisplayName,
  t,
}) => {
  if (!isOpen || !catComboModal) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{getCardEmoji(catComboModal.cat)} {t("games.table.modals.catCombo.title")}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        <ModalSection>
          <SectionLabel>{t("games.table.modals.catCombo.selectMode")}</SectionLabel>
          <OptionGrid>
            {catComboModal.availableModes.includes("pair") && (
              <OptionButton $selected={selectedMode === "pair"} onClick={() => onSelectMode("pair")}>
                <div style={{ fontSize: "1.5rem" }}>🎴🎴</div>
                <div>{t("games.table.modals.catCombo.pair")}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{t("games.table.modals.catCombo.pairDesc")}</div>
              </OptionButton>
            )}
            {catComboModal.availableModes.includes("trio") && (
              <OptionButton $selected={selectedMode === "trio"} onClick={() => onSelectMode("trio")}>
                <div style={{ fontSize: "1.5rem" }}>🎴🎴🎴</div>
                <div>{t("games.table.modals.catCombo.trio")}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{t("games.table.modals.catCombo.trioDesc")}</div>
              </OptionButton>
            )}
          </OptionGrid>
        </ModalSection>
        <ModalSection>
          <SectionLabel>{t("games.table.modals.catCombo.selectTarget")}</SectionLabel>
          <OptionGrid>
            {aliveOpponents.map((opponent) => (
              <OptionButton
                key={opponent.playerId}
                $selected={selectedTarget === opponent.playerId}
                onClick={() => onSelectTarget(opponent.playerId)}
              >
                <div style={{ fontSize: "1.5rem" }}>🎮</div>
                <div>{resolveDisplayName(opponent.playerId, `Player ${opponent.playerId.slice(0, 8)}`)}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                  {t("games.table.modals.catCombo.cardsCount").replace("{count}", opponent.hand.length.toString())}
                </div>
              </OptionButton>
            ))}
          </OptionGrid>
        </ModalSection>
        {selectedMode === "trio" && (
          <ModalSection>
            <SectionLabel>{t("games.table.modals.catCombo.selectCard")}</SectionLabel>
            <OptionGrid>
              {["defuse", "attack", "skip", "favor", "shuffle", "see_the_future", ...CAT_CARDS].map((card) => (
                <OptionButton
                  key={card}
                  $selected={selectedCard === card}
                  onClick={() => onSelectCard(card as ExplodingCatsCard)}
                >
                  <div style={{ fontSize: "1.5rem" }}>{getCardEmoji(card as ExplodingCatsCard)}</div>
                  <div style={{ fontSize: "0.75rem" }}>
                    {t(getCardTranslationKey(card as ExplodingCatsCard)) || card}
                  </div>
                </OptionButton>
              ))}
            </OptionGrid>
          </ModalSection>
        )}
        <ModalActions>
          <ModalButton variant="secondary" onClick={onClose}>
            {t("games.table.modals.common.cancel")}
          </ModalButton>
          <ModalButton
            onClick={onConfirm}
            disabled={!selectedTarget || (selectedMode === "trio" && !selectedCard)}
          >
            {t("games.table.modals.catCombo.confirm")}
          </ModalButton>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};
