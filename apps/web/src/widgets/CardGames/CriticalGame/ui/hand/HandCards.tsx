'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { HandCard } from './HandCard';
import { HandCardStack } from './HandCardStack';
import type { HandCardInstance } from '../../lib/combo';

interface CardGroup {
  cardId: string;
  primaryInstance: HandCardInstance;
  instances: HandCardInstance[];
  selectedUids: string[];
}

interface HandCardsProps {
  cards: HandCardInstance[];
  selectedUids: string[];
  onToggleSelect: (uid: string) => void;
  onSelectUids?: (uids: string[]) => void;
  cardVariant?: string;
  disabled?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  isFanned?: boolean;
  onDoubleClick?: (uid: string) => void;
  groupDuplicates?: boolean;
}

export function HandCards({
  cards,
  selectedUids,
  onToggleSelect,
  onSelectUids,
  cardVariant,
  disabled = false,
  showName = true,
  showDescription = true,
  isFanned = true,
  onDoubleClick,
  groupDuplicates = false,
}: HandCardsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => new Set(selectedUids), [selectedUids]);
  const countsById = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    return counts;
  }, [cards]);

  const groups = useMemo(() => {
    if (!groupDuplicates) return null;
    const map = new Map<string, HandCardInstance[]>();
    for (const card of cards) {
      const existing = map.get(card.id);
      if (existing) {
        existing.push(card);
      } else {
        map.set(card.id, [card]);
      }
    }
    const result: CardGroup[] = [];
    map.forEach((instances, cardId) => {
      const groupSelectedUids = instances
        .filter((inst) => selected.has(inst.uid))
        .map((inst) => inst.uid);
      result.push({
        cardId,
        primaryInstance: instances[0],
        instances,
        selectedUids: groupSelectedUids,
      });
    });
    return result;
  }, [cards, selected, groupDuplicates]);

  const handleSelectGroupCount = useCallback(
    (group: CardGroup, targetCount: number) => {
      const currentSelected = group.selectedUids;
      const desiredInstances = group.instances.slice(0, targetCount);
      const desiredUids = desiredInstances.map((i) => i.uid);

      if (onSelectUids) {
        const otherSelected = selectedUids.filter(
          (uid) => !group.instances.some((inst) => inst.uid === uid),
        );
        onSelectUids([...otherSelected, ...desiredUids]);
        return;
      }

      const toDeselect = currentSelected.filter(
        (uid) => !desiredUids.includes(uid),
      );
      const toSelect = desiredUids.filter(
        (uid) => !currentSelected.includes(uid),
      );
      for (const uid of toDeselect) onToggleSelect(uid);
      for (const uid of toSelect) onToggleSelect(uid);
    },
    [selectedUids, onSelectUids, onToggleSelect],
  );

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, cards.length]);

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startScrollLeft: number;
    active: boolean;
  }>({ startX: 0, startScrollLeft: 0, active: false });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button === 0 && trackRef.current) {
        dragRef.current = {
          startX: e.clientX,
          startScrollLeft: trackRef.current.scrollLeft,
          active: true,
        };
        setIsDragging(true);
      }
    },
    [],
  );

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !trackRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      trackRef.current.scrollLeft = dragRef.current.startScrollLeft - dx;
    };

    const handlePointerUp = () => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  const scrollBy = useCallback((delta: number) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (trackRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      trackRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  const paddingClass = isFanned ? 'pt-4' : 'pt-1.5';
  const cursorClass = isDragging ? 'cursor-grabbing' : 'cursor-grab';

  return (
    <div className="relative flex flex-1 w-full min-w-0 items-center">
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-220)}
          aria-label="Scroll left"
          data-testid="hand-scroll-left"
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-900/90 border border-slate-600 text-white flex items-center justify-center hover:bg-slate-800 shadow-lg cursor-pointer"
        >
          ‹
        </button>
      )}
      <div
        ref={trackRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        className={`flex flex-row flex-1 flex-nowrap items-end justify-start gap-2.5 pb-6 px-3 w-full overflow-x-auto overflow-y-visible overscroll-x-contain no-scrollbar select-none max-[800px]:flex-[0] max-[800px]:basis-[auto] max-[800px]:w-full max-[800px]:min-h-[130px] max-[800px]:pb-2 max-[800px]:pt-1 ${paddingClass} ${cursorClass}`}
        data-testid="hand-cards"
      >
        {groups
          ? groups.map((group, i) => {
              const isSelected = group.selectedUids.length > 0;
              const wrapperStyle = {
                '--hand-index': i,
                '--hand-count': groups.length,
                zIndex: isSelected ? 35 : i + 1,
              } as CSSProperties &
                Record<'--hand-index' | '--hand-count', number>;
              return (
                <div
                  className="crit-hand-card-wrapper transition-transform duration-150 hover:z-40"
                  style={wrapperStyle}
                  key={group.cardId}
                  data-fan={isFanned ? 'true' : 'false'}
                >
                  <HandCardStack
                    card={group.primaryInstance}
                    instances={group.instances}
                    selectedCount={group.selectedUids.length}
                    disabled={disabled}
                    cardVariant={cardVariant}
                    showName={showName}
                    showDescription={showDescription}
                    onSelectCount={(count) =>
                      handleSelectGroupCount(group, count)
                    }
                    onDoubleClick={
                      onDoubleClick
                        ? () => onDoubleClick(group.primaryInstance.uid)
                        : undefined
                    }
                  />
                </div>
              );
            })
          : cards.map((card, i) => {
              const isSelected = selected.has(card.uid);
              const wrapperStyle = {
                '--hand-index': i,
                '--hand-count': cards.length,
                zIndex: isSelected ? 35 : i + 1,
              } as CSSProperties &
                Record<'--hand-index' | '--hand-count', number>;
              return (
                <div
                  className="crit-hand-card-wrapper transition-transform duration-150 hover:z-40"
                  style={wrapperStyle}
                  key={card.uid}
                  data-fan={isFanned ? 'true' : 'false'}
                >
                  <HandCard
                    card={card}
                    isSelected={isSelected}
                    disabled={disabled}
                    cardVariant={cardVariant}
                    count={countsById.get(card.id)}
                    showName={showName}
                    showDescription={showDescription}
                    onToggle={() => onToggleSelect(card.uid)}
                    onDoubleClick={
                      onDoubleClick ? () => onDoubleClick(card.uid) : undefined
                    }
                  />
                </div>
              );
            })}
      </div>
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(220)}
          aria-label="Scroll right"
          data-testid="hand-scroll-right"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-slate-900/90 border border-slate-600 text-white flex items-center justify-center hover:bg-slate-800 shadow-lg cursor-pointer"
        >
          ›
        </button>
      )}
    </div>
  );
}
