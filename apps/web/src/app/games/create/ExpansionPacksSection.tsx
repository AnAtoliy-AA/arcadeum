'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { CollapsibleSection } from '@/shared/ui';

import { ExpansionId, EXPANSION_PACK_DETAILS } from './constants';

import {
  ExpansionGrid,
  ExpansionLabel,
  ExpansionBadge,
  ExpandablePackContainer,
  ExpandablePackHeader,
  ExpandToggle,
  PackCardList,
  PackCardRow,
  PackCardName,
  QuantityControl,
  QuantityButton,
  QuantityValue,
  SelectAllRow,
} from './styles';

interface ExpansionPacksSectionProps {
  expansions: ExpansionId[];
  customCards: Record<string, number>;
  onExpansionsChange: (expansions: ExpansionId[]) => void;
  onCustomCardsChange: (customCards: Record<string, number>) => void;
}

export function ExpansionPacksSection({
  expansions,
  customCards,
  onExpansionsChange,
  onCustomCardsChange,
}: ExpansionPacksSectionProps) {
  const { t } = useTranslation();
  const [expandedPacks, setExpandedPacks] = useState<ExpansionId[]>([]);

  const toggleExpansion = useCallback(
    (id: ExpansionId) => {
      const pack = EXPANSION_PACK_DETAILS.find((p) => p.id === id);
      if (expansions.includes(id)) {
        // Remove pack and clear its cards from customCards
        if (pack) {
          const updated = { ...customCards };
          pack.cards.forEach((card) => delete updated[card.id]);
          onCustomCardsChange(updated);
        }
        onExpansionsChange(expansions.filter((e) => e !== id));
      } else {
        // Add pack with default card quantities
        if (pack) {
          const updated = { ...customCards };
          pack.cards.forEach((card) => {
            updated[card.id] = card.defaultCount;
          });
          onCustomCardsChange(updated);
        }
        onExpansionsChange([...expansions, id]);
      }
    },
    [expansions, customCards, onExpansionsChange, onCustomCardsChange],
  );

  const togglePackExpanded = useCallback((id: ExpansionId) => {
    setExpandedPacks((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }, []);

  const toggleCard = useCallback(
    (cardId: string, packId: ExpansionId, defaultCount: number) => {
      let updated: Record<string, number>;
      if (cardId in customCards) {
        updated = { ...customCards };
        delete updated[cardId];
      } else {
        updated = { ...customCards, [cardId]: defaultCount };
      }
      onCustomCardsChange(updated);

      // Ensure pack is selected if at least one card is selected
      if (!expansions.includes(packId)) {
        onExpansionsChange([...expansions, packId]);
      }
    },
    [customCards, expansions, onCustomCardsChange, onExpansionsChange],
  );

  const adjustCardQuantity = useCallback(
    (cardId: string, delta: number, maxCount: number) => {
      const current = customCards[cardId] ?? 0;
      const newVal = Math.max(0, Math.min(maxCount, current + delta));
      if (newVal === 0) {
        const updated = { ...customCards };
        delete updated[cardId];
        onCustomCardsChange(updated);
      } else {
        onCustomCardsChange({ ...customCards, [cardId]: newVal });
      }
    },
    [customCards, onCustomCardsChange],
  );

  // Calculate available packs and whether all are selected
  const allAvailablePacks = useMemo(
    () => EXPANSION_PACK_DETAILS.filter((pack) => pack.available),
    [],
  );

  const allSelected = useMemo(
    () =>
      allAvailablePacks.length > 0 &&
      allAvailablePacks.every((pack) => expansions.includes(pack.id)),
    [allAvailablePacks, expansions],
  );

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all packs and clear their cards
      const updated = { ...customCards };
      allAvailablePacks.forEach((pack) => {
        pack.cards.forEach((card) => delete updated[card.id]);
      });
      onCustomCardsChange(updated);
      onExpansionsChange([]);
    } else {
      // Select all available packs with default card quantities
      const updated = { ...customCards };
      allAvailablePacks.forEach((pack) => {
        pack.cards.forEach((card) => {
          updated[card.id] = card.defaultCount;
        });
      });
      onCustomCardsChange(updated);
      onExpansionsChange(allAvailablePacks.map((pack) => pack.id));
    }
  }, [
    allSelected,
    allAvailablePacks,
    customCards,
    onCustomCardsChange,
    onExpansionsChange,
  ]);

  return (
    <CollapsibleSection
      title={t('games.create.sectionExpansions') || 'Expansion Packs'}
      defaultExpanded={false}
      showLabel={t('games.create.showPacks') || 'Show'}
      hideLabel={t('games.create.hidePacks') || 'Hide'}
      headerContent={
        <SelectAllRow>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
          />
          <span>{t('games.create.selectAllPacks') || 'Select All Packs'}</span>
        </SelectAllRow>
      }
    >
      <ExpansionGrid>
        {EXPANSION_PACK_DETAILS.map((pack) => (
          <ExpandablePackContainer key={pack.id}>
            <ExpandablePackHeader
              $disabled={!pack.available}
              $expanded={expandedPacks.includes(pack.id)}
              data-disabled={!pack.available}
              onClick={(e) => {
                // Don't toggle expand if clicking on checkbox
                if ((e.target as HTMLElement).tagName === 'INPUT') return;
                if (pack.available && pack.cards.length > 0) {
                  togglePackExpanded(pack.id);
                }
              }}
            >
              <input
                type="checkbox"
                checked={expansions.includes(pack.id)}
                onChange={() => pack.available && toggleExpansion(pack.id)}
                disabled={!pack.available}
                onClick={(e) => e.stopPropagation()}
              />
              <ExpansionLabel>{pack.name}</ExpansionLabel>
              <ExpansionBadge>
                {pack.available
                  ? `+${pack.cards.reduce((sum, c) => sum + (customCards[c.id] ?? 0), 0)}`
                  : t('games.create.comingSoon') || 'Soon'}
              </ExpansionBadge>
              {pack.available && pack.cards.length > 0 && (
                <ExpandToggle $expanded={expandedPacks.includes(pack.id)}>
                  ▼
                </ExpandToggle>
              )}
            </ExpandablePackHeader>

            <PackCardList $expanded={expandedPacks.includes(pack.id)}>
              {pack.cards.map((card) => (
                <PackCardRow key={card.id}>
                  <input
                    type="checkbox"
                    checked={card.id in customCards}
                    onChange={() =>
                      toggleCard(card.id, pack.id, card.defaultCount)
                    }
                  />
                  <PackCardName>{card.name}</PackCardName>
                  <QuantityControl>
                    <QuantityButton
                      type="button"
                      disabled={
                        !(card.id in customCards) || customCards[card.id] <= 1
                      }
                      onClick={() =>
                        adjustCardQuantity(card.id, -1, card.maxCount)
                      }
                    >
                      −
                    </QuantityButton>
                    <QuantityValue>{customCards[card.id] ?? 0}</QuantityValue>
                    <QuantityButton
                      type="button"
                      disabled={
                        !(card.id in customCards) ||
                        customCards[card.id] >= card.maxCount
                      }
                      onClick={() =>
                        adjustCardQuantity(card.id, 1, card.maxCount)
                      }
                    >
                      +
                    </QuantityButton>
                  </QuantityControl>
                </PackCardRow>
              ))}
            </PackCardList>
          </ExpandablePackContainer>
        ))}
      </ExpansionGrid>
    </CollapsibleSection>
  );
}
