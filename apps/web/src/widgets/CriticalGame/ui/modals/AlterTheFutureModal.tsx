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
import { YStack, XStack, Text, styled } from 'tamagui';
import type { CriticalCard } from '@/widgets/CriticalGame/types';
import { getCardTranslationKey } from '@/widgets/CriticalGame/lib/cardUtils';
import {
  Modal as Overlay,
  ModalContent as ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalActions as ModalFooter,
  ModalButton,
  Card,
  CardFrame,
  CardCorner,
  GradientScrim,
} from '../styles';
import { CardImage } from '../styles/card-image';
import { type GameVariant } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

const CardList = styled(XStack, {
  name: 'CardList',
  justifyContent: 'center',
  gap: '$4',
  marginBottom: '$8',
  flexWrap: 'wrap',
});

const SortableCardWrapper = styled(YStack, {
  name: 'SortableCardWrapper',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 2,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '$4',
  padding: '$4',
  alignItems: 'center',
  gap: '$2',
  minWidth: 100,
  cursor: 'grab',

  variants: {
    isDragging: {
      true: {
        opacity: 0.5,
        shadowColor: 'rgba(255, 255, 255, 0.5)',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
      },
    },
  } as const,

  pressStyle: {
    cursor: 'grabbing',
  },
});

// Removed CardEmoji styled component as it is replaced by CardImage

const CardName = styled(Text, {
  name: 'CardName',
  fontSize: '$3',
  textAlign: 'center',
  color: '#fff',
});

const CardIndex = styled(Text, {
  name: 'CardIndex',
  fontSize: '$2',
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: '$1',
});

const DescriptionText = styled(Text, {
  name: 'DescriptionText',
  textAlign: 'center',
  marginBottom: '$6',
  color: '#ccc',
});

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

  const { role, ...restAttributes } = attributes;

  return (
    <SortableCardWrapper
      ref={(node: unknown) => setNodeRef(node as HTMLElement | null)}
      style={{ ...style, touchAction: 'none' }}
      isDragging={isDragging}
      role={role as unknown as 'presentation'}
      {...restAttributes}
      {...listeners}
    >
      <CardIndex>#{index + 1}</CardIndex>
      <Card
        $cardType={card}
        $variant={cardVariant as GameVariant}
        width="100%"
        marginBottom="$2"
      >
        <CardCorner $position="tl" $variant={cardVariant} />
        <CardCorner $position="tr" $variant={cardVariant} />
        <CardCorner $position="bl" $variant={cardVariant} />
        <CardCorner $position="br" $variant={cardVariant} />
        <CardFrame $variant={cardVariant} />
        <CardImage variant={cardVariant ?? ''} cardType={card} />
        <GradientScrim />
      </Card>
      <CardName>
        {t(getCardTranslationKey(card, cardVariant) as string)}
      </CardName>
    </SortableCardWrapper>
  );
}

interface AlterTheFutureModalProps {
  isOpen: boolean;
  cards: CriticalCard[];
  isShare?: boolean;
  onConfirm: (newOrder: CriticalCard[]) => void;
  cardVariant?: string;
  onClose?: () => void;
}

export function AlterTheFutureModal({
  isOpen,
  cards,
  isShare = false,
  onConfirm,
  cardVariant,
  onClose,
}: AlterTheFutureModalProps) {
  const { t } = useTranslation();

  const [items, setItems] = useState<{ id: string; card: CriticalCard }[]>(() =>
    cards.map((card, index) => ({
      id: `${card}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      card,
    })),
  );

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
    <Overlay open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <ModalContainer $variant={cardVariant as GameVariant}>
        <ModalHeader $variant={cardVariant as GameVariant}>
          <ModalTitle $variant={cardVariant as GameVariant}>
            {isShare
              ? t('games.table.modals.shareTheFuture.title')
              : t('games.table.modals.alterTheFuture.title')}
          </ModalTitle>
        </ModalHeader>

        <DescriptionText>
          {t('games.table.modals.alterTheFuture.description')}
        </DescriptionText>

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
          <ModalButton variant="primary" onPress={handleConfirm}>
            {t('games.table.modals.alterTheFuture.confirm')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
