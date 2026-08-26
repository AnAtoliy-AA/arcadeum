import { forwardRef, useState } from 'react';
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
import { cx } from '@arcadeum/ui/utils/cx';
import type { CriticalCard } from '@/widgets/CardGames/CriticalGame/types';
import { getCardTranslationKey } from '@/widgets/CardGames/CriticalGame/lib/cardUtils';
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

interface SortableCardWrapperProps {
  isDragging?: boolean;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  tabIndex?: number;
  'aria-disabled'?: boolean;
  'aria-pressed'?: boolean;
  'aria-roledescription'?: string;
  'aria-describedby'?: string;
  onPointerDown?: (event: React.SyntheticEvent) => void;
  onKeyDown?: (event: React.SyntheticEvent) => void;
  children?: React.ReactNode;
}

const SortableCardWrapper = forwardRef<
  HTMLDivElement,
  SortableCardWrapperProps
>(function SortableCardWrapper(
  {
    isDragging,
    className,
    style,
    role,
    tabIndex,
    'aria-disabled': ariaDisabled,
    'aria-pressed': ariaPressed,
    'aria-roledescription': ariaRoledescription,
    'aria-describedby': ariaDescribedby,
    onPointerDown,
    onKeyDown,
    children,
  },
  ref,
) {
  return (
    <div
      className={cx(
        'flex min-w-[100px] cursor-grab flex-col items-center gap-2 rounded-2xl border-2 border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] p-4',
        isDragging && 'opacity-[0.5]',
        className,
      )}
      style={
        isDragging
          ? { boxShadow: '0 0 10px rgba(255,255,255,0.5)', ...style }
          : style
      }
      ref={ref}
      role={role}
      tabIndex={tabIndex}
      aria-disabled={ariaDisabled}
      aria-pressed={ariaPressed}
      aria-roledescription={ariaRoledescription}
      aria-describedby={ariaDescribedby}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
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

  return (
    <SortableCardWrapper
      ref={(node: HTMLDivElement | null) => setNodeRef(node)}
      style={{ ...style, touchAction: 'none' }}
      isDragging={isDragging}
      role={attributes.role}
      tabIndex={attributes.tabIndex}
      aria-disabled={attributes['aria-disabled']}
      aria-pressed={attributes['aria-pressed']}
      aria-roledescription={attributes['aria-roledescription']}
      aria-describedby={attributes['aria-describedby']}
      onPointerDown={
        listeners?.onPointerDown as
          ((event: React.SyntheticEvent) => void) | undefined
      }
      onKeyDown={
        listeners?.onKeyDown as
          ((event: React.SyntheticEvent) => void) | undefined
      }
    >
      <div className="mb-1 text-[14px] text-[rgba(255,255,255,0.6)]">
        #{index + 1}
      </div>
      <Card
        cardType={card}
        variant={cardVariant as GameVariant}
        className="w-full mb-2"
      >
        <CardCorner position="tl" variant={cardVariant} />
        <CardCorner position="tr" variant={cardVariant} />
        <CardCorner position="bl" variant={cardVariant} />
        <CardCorner position="br" variant={cardVariant} />
        <CardFrame variant={cardVariant} />
        <CardImage variant={cardVariant ?? ''} cardType={card} />
        <GradientScrim />
      </Card>
      <div className="text-center text-[16px] text-[#fff]">
        {t(getCardTranslationKey(card, cardVariant) as string)}
      </div>
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

export default function AlterTheFutureModal({
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
      <ModalContainer variant={cardVariant as GameVariant}>
        <ModalHeader variant={cardVariant as GameVariant}>
          <ModalTitle variant={cardVariant as GameVariant}>
            {isShare
              ? t('games.table.modals.shareTheFuture.title')
              : t('games.table.modals.alterTheFuture.title')}
          </ModalTitle>
        </ModalHeader>

        <div className="mb-6 text-center text-[#ccc]">
          {t('games.table.modals.alterTheFuture.description')}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={horizontalListSortingStrategy}
          >
            <div className="mb-8 flex flex-row flex-wrap justify-center gap-4">
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
            </div>
          </SortableContext>
        </DndContext>

        <ModalFooter>
          <ModalButton variant="primary" onClick={handleConfirm}>
            {t('games.table.modals.alterTheFuture.confirm')}
          </ModalButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}
