import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CriticalCard } from '@/widgets/CriticalGame/types';
import {
  getCardTranslationKey,
  getCardEmoji,
} from '@/widgets/CriticalGame/lib/cardUtils';
import {
  Modal as Overlay,
  ModalContent as ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalActions as ModalFooter,
  ModalButton as Button,
} from '../styles';
import { useTranslation } from '@/shared/lib/useTranslation';
import styled from 'styled-components';

const CardList = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const SortableCardWrapper = styled.div<{ $isDragging?: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
  cursor: grab;
  touch-action: none; // Prevent scroll while dragging
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  // Highlighting when dragging
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$isDragging ? '0 0 10px rgba(255,255,255,0.5)' : 'none'};

  &:active {
    cursor: grabbing;
  }
`;

const CardEmoji = styled.div`
  font-size: 2.5rem;
`;

const CardName = styled.div`
  font-size: 0.9rem;
  text-align: center;
  color: #fff;
`;

const CardIndex = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
`;

interface SortableCardProps {
  id: string;
  card: CriticalCard;
  index: number;
  t: (key: string) => string;
  cardVariant?: string;
}

function SortableCard({ id, card, index, t, cardVariant }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableCardWrapper
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <CardIndex>#{index + 1}</CardIndex>
      <CardEmoji>{getCardEmoji(card)}</CardEmoji>
      <CardName>
        {t(getCardTranslationKey(card, cardVariant) as string)}
      </CardName>
    </SortableCardWrapper>
  );
}

interface AlterTheFutureModalProps {
  isOpen: boolean;
  cards: CriticalCard[];
  isShare?: boolean; // If true, "Share the Future" mode (cards are revealed)
  onConfirm: (newOrder: CriticalCard[]) => void;
  cardVariant?: string;
  onClose: () => void; // Added back to match usage in GameModals (though we ignore it/ pass empty fn)
}

export function AlterTheFutureModal({
  isOpen,
  cards,
  isShare = false,
  onConfirm,
  cardVariant,
}: AlterTheFutureModalProps) {
  const { t } = useTranslation();

  const [items, setItems] = useState<{ id: string; card: CriticalCard }[]>(() =>
    cards.map((card, index) => ({
      id: `${card}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      card,
    })),
  );

  // Sync items if cards prop changes (e.g. if we want to support updates while open)
  // But to avoid "setState in effect" warning causing loop, we can verify equality or rely on parent remounting.
  // Ideally parent should conditionally render this modal.
  // We rely on parent conditional rendering to initialize state.
  // Removing useEffect to prevent resetting state when parent re-renders (e.g. due to timer ticks).

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleConfirm = () => {
    onConfirm(items.map((item) => item.card));
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer $variant={cardVariant}>
        <ModalHeader $variant={cardVariant}>
          <ModalTitle $variant={cardVariant}>
            {isShare
              ? t('games.table.modals.shareTheFuture.title')
              : t('games.table.modals.alterTheFuture.title')}
          </ModalTitle>
        </ModalHeader>

        <p
          style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ccc' }}
        >
          {t('games.table.modals.alterTheFuture.description')}
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={horizontalListSortingStrategy}
          >
            <CardList>
              {items.map((item, index) => (
                <SortableCard
                  key={item.id}
                  id={item.id}
                  card={item.card}
                  index={index}
                  t={t as (key: string) => string}
                  cardVariant={cardVariant}
                />
              ))}
            </CardList>
          </SortableContext>
        </DndContext>

        <ModalFooter>
          <Button variant="primary" onClick={handleConfirm}>
            {t('games.table.modals.alterTheFuture.confirm')}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
