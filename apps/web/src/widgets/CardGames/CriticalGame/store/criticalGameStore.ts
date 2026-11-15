import { create } from 'zustand';
import type {
  CriticalCard,
  EventComboModalState,
  SeeTheFutureModalState,
  AlterTheFutureModalState,
  OmniscienceModalState,
} from '../types';
import { FIVER_COMBO_SIZE } from '../types';

interface CriticalGameState {
  // Modals
  eventComboModal: EventComboModalState | null;
  favorModal: boolean;
  targetedAttackModal: boolean;
  seeTheFutureModal: SeeTheFutureModalState | null;
  alterTheFutureModal: AlterTheFutureModalState | null;
  stashModal: boolean;
  markModal: boolean;
  stealDrawModal: boolean;
  smiteModal: boolean;
  omniscienceModal: OmniscienceModalState | null;

  // Selection
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: CriticalCard | null;
  selectedIndex: number | null;
  selectedDiscardCard: CriticalCard | null;
  selectedFiverCards: CriticalCard[];

  // Actions
  setEventComboModal: (state: EventComboModalState | null) => void;
  setFavorModal: (isOpen: boolean) => void;
  setTargetedAttackModal: (isOpen: boolean) => void;
  setSeeTheFutureModal: (state: SeeTheFutureModalState | null) => void;
  setAlterTheFutureModal: (state: AlterTheFutureModalState | null) => void;
  setStashModal: (isOpen: boolean) => void;
  setMarkModal: (isOpen: boolean) => void;
  setStealDrawModal: (isOpen: boolean) => void;
  setSmiteModal: (isOpen: boolean) => void;
  setOmniscienceModal: (state: OmniscienceModalState | null) => void;

  setSelectedMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
  setSelectedTarget: (target: string | null) => void;
  setSelectedCard: (card: CriticalCard | null) => void;
  setSelectedIndex: (index: number | null) => void;
  setSelectedDiscardCard: (card: CriticalCard | null) => void;
  setSelectedFiverCards: (
    cards: CriticalCard[] | ((prev: CriticalCard[]) => CriticalCard[]),
  ) => void;

  // Complex Logic Actions
  toggleFiverCard: (card: CriticalCard) => void;
  openEventCombo: (
    cards: CriticalCard[],
    handCards: CriticalCard[],
    initialMode?: 'pair' | 'trio' | 'fiver' | null,
    initialTarget?: string | null,
    initialFiverCards?: CriticalCard[],
  ) => void;
  closeEventComboModal: () => void;
  selectComboCard: (card: CriticalCard) => void;
  reset: () => void;
}

export const useCriticalGameStore = create<CriticalGameState>((set) => ({
  eventComboModal: null,
  favorModal: false,
  targetedAttackModal: false,
  seeTheFutureModal: null,
  alterTheFutureModal: null,
  stashModal: false,
  markModal: false,
  stealDrawModal: false,
  smiteModal: false,
  omniscienceModal: null,

  selectedMode: null,
  selectedTarget: null,
  selectedCard: null,
  selectedIndex: null,
  selectedDiscardCard: null,
  selectedFiverCards: [],

  setEventComboModal: (state) => set({ eventComboModal: state }),
  setFavorModal: (isOpen) => set({ favorModal: isOpen }),
  setTargetedAttackModal: (isOpen) => set({ targetedAttackModal: isOpen }),
  setSeeTheFutureModal: (state) => set({ seeTheFutureModal: state }),
  setAlterTheFutureModal: (state) => set({ alterTheFutureModal: state }),
  setStashModal: (isOpen) => set({ stashModal: isOpen }),
  setMarkModal: (isOpen) => set({ markModal: isOpen }),
  setStealDrawModal: (isOpen) => set({ stealDrawModal: isOpen }),
  setSmiteModal: (isOpen) => set({ smiteModal: isOpen }),
  setOmniscienceModal: (state) => set({ omniscienceModal: state }),

  setSelectedMode: (mode) => set({ selectedMode: mode }),
  setSelectedTarget: (target) => set({ selectedTarget: target }),
  setSelectedCard: (card) => set({ selectedCard: card }),
  setSelectedIndex: (index) => set({ selectedIndex: index }),
  setSelectedDiscardCard: (card) => set({ selectedDiscardCard: card }),
  // Handling functional updates for FiverCards is handled here or by separate action
  setSelectedFiverCards: (input) =>
    set((state) => ({
      selectedFiverCards:
        typeof input === 'function' ? input(state.selectedFiverCards) : input,
    })),

  toggleFiverCard: (card) =>
    set((state) => {
      const prev = state.selectedFiverCards;
      if (prev.includes(card)) {
        return { selectedFiverCards: prev.filter((c) => c !== card) };
      }
      if (prev.length >= FIVER_COMBO_SIZE) {
        return { selectedFiverCards: prev };
      }
      return { selectedFiverCards: [...prev, card] };
    }),

  openEventCombo: (
    comboCards,
    handCards,
    initialMode,
    initialTarget,
    initialFiverCards,
  ) => {
    const uniqueComboCards = Array.from(new Set(comboCards));
    const availableComboCards = uniqueComboCards
      .map((card) => {
        const count = handCards.filter((c) => c === card).length;
        const availableModes: ('pair' | 'trio')[] = [];
        if (count >= 2) availableModes.push('pair');
        if (count >= 3) availableModes.push('trio');
        return { card, availableModes };
      })
      .filter((item) => item.availableModes.length > 0);

    const fiverAvailable =
      initialMode === 'fiver' || new Set(handCards).size >= FIVER_COMBO_SIZE;

    if (availableComboCards.length === 0 && !fiverAvailable) return;

    const selectedComboCard =
      availableComboCards.length >= 1 ? availableComboCards[0].card : null;

    let defaultMode: 'pair' | 'trio' | 'fiver' | null = initialMode ?? null;
    if (!defaultMode) {
      if (
        comboCards.length >= 3 &&
        availableComboCards.some((c) => c.availableModes.includes('trio'))
      ) {
        defaultMode = 'trio';
      } else if (selectedComboCard) {
        const cardData = availableComboCards.find(
          (c) => c.card === selectedComboCard,
        );
        defaultMode = cardData?.availableModes[0] ?? null;
      } else if (fiverAvailable) {
        defaultMode = 'fiver';
      }
    }

    const uniqueHandCards = Array.from(new Set(handCards));
    let resolvedFiverCards: CriticalCard[] = [];
    if (initialFiverCards && initialFiverCards.length > 0) {
      resolvedFiverCards = initialFiverCards;
    } else if (defaultMode === 'fiver') {
      if (uniqueComboCards.length === FIVER_COMBO_SIZE) {
        resolvedFiverCards = uniqueComboCards;
      } else if (uniqueHandCards.length === FIVER_COMBO_SIZE) {
        resolvedFiverCards = uniqueHandCards;
      }
    }

    set({
      eventComboModal: {
        availableComboCards,
        selectedComboCard,
        fiverAvailable,
      },
      selectedMode: defaultMode,
      selectedTarget: initialTarget ?? null,
      selectedCard: null,
      selectedIndex: null,
      selectedDiscardCard: null,
      selectedFiverCards: resolvedFiverCards,
    });
  },

  closeEventComboModal: () =>
    set({
      eventComboModal: null,
      selectedMode: null,
      selectedTarget: null,
      selectedCard: null,
      selectedIndex: null,
      selectedDiscardCard: null,
      selectedFiverCards: [],
    }),

  selectComboCard: (card) =>
    set((state) => {
      if (!state.eventComboModal) return state;
      const cardData = state.eventComboModal.availableComboCards.find(
        (c) => c.card === card,
      );
      const updates: Partial<CriticalGameState> = {
        eventComboModal: { ...state.eventComboModal, selectedComboCard: card },
      };

      if (cardData) {
        const defaultMode = cardData.availableModes[0];
        updates.selectedMode = defaultMode;
        updates.selectedIndex = null;
      }
      updates.selectedTarget = null;
      updates.selectedCard = null;
      return updates;
    }),

  reset: () =>
    set({
      eventComboModal: null,
      favorModal: false,
      targetedAttackModal: false,
      seeTheFutureModal: null,
      alterTheFutureModal: null,
      selectedMode: null,
      selectedTarget: null,
      selectedCard: null,
      selectedIndex: null,
      selectedDiscardCard: null,
      selectedFiverCards: [],
      stashModal: false,
      markModal: false,
      stealDrawModal: false,
      smiteModal: false,
      omniscienceModal: null,
    }),
}));
