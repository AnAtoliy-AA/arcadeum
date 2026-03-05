import { CenterTable, CardSlot } from './styles';
import { LastPlayedCardDisplay } from './LastPlayedCardDisplay';
import { DeckDisplay } from './DeckDisplay';
import type { CriticalCard } from '../types';

interface CenterTableSectionProps {
  discardPile: CriticalCard[];
  deck: CriticalCard[];
  cardVariant?: string;
  t: (key: string) => string;
}

export function CenterTableSection({
  discardPile,
  deck,
  cardVariant,
  t,
}: CenterTableSectionProps) {
  return (
    <CenterTable $variant={cardVariant}>
      <CardSlot>
        <LastPlayedCardDisplay
          discardPile={discardPile}
          t={t}
          cardVariant={cardVariant}
        />
      </CardSlot>
      <CardSlot>
        <DeckDisplay deck={deck} t={t} cardVariant={cardVariant} />
      </CardSlot>
    </CenterTable>
  );
}
