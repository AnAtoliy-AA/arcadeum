import { create } from 'zustand';
import type {
  CriticalCard,
  CriticalCatCard,
  CatComboModalState,
  SeeTheFutureModalState,
  AlterTheFutureModalState,
  ChatScope,
} from '../types';
import { FIVER_COMBO_SIZE } from '../types';

interface CriticalGameState {
  // Modals
  catComboModal: CatComboModalState | null;
  favorModal: boolean;
  targetedAttackModal: boolean;
  seeTheFutureModal: SeeTheFutureModalState | null;
  alterTheFutureModal: AlterTheFutureModalState | null;

  // Selection
  selectedMode: 'pair' | 'trio' | 'fiver' | null;
  selectedTarget: string | null;
  selectedCard: CriticalCard | null;
  selectedIndex: number | null;
  selectedDiscardCard: CriticalCard | null;
  selectedFiverCards: CriticalCard[];

  // Chat (UI state mostly, message data in global chatStore)
  chatMessage: string;
  chatScope: ChatScope;
  showChat: boolean;

  // Actions
  setCatComboModal: (state: CatComboModalState | null) => void;
  setFavorModal: (isOpen: boolean) => void;
  setTargetedAttackModal: (isOpen: boolean) => void;
  setSeeTheFutureModal: (state: SeeTheFutureModalState | null) => void;
  setAlterTheFutureModal: (state: AlterTheFutureModalState | null) => void;

  setSelectedMode: (mode: 'pair' | 'trio' | 'fiver' | null) => void;
  setSelectedTarget: (target: string | null) => void;
  setSelectedCard: (card: CriticalCard | null) => void;
  setSelectedIndex: (index: number | null) => void;
  setSelectedDiscardCard: (card: CriticalCard | null) => void;
  setSelectedFiverCards: (
    cards: CriticalCard[] | ((prev: CriticalCard[]) => CriticalCard[]),
  ) => void;

  setChatMessage: (message: string) => void;
  setChatScope: (scope: ChatScope) => void;
  setShowChat: (show: boolean | ((prev: boolean) => boolean)) => void;

  // Complex Logic Actions
  toggleFiverCard: (card: CriticalCard) => void;
  openCatCombo: (cats: CriticalCatCard[], handCards: CriticalCard[]) => void;
  closeCatComboModal: () => void;
  selectCat: (cat: CriticalCatCard) => void;
  reset: () => void;
}

export const useCriticalGameStore = create<CriticalGameState>((set) => ({
  catComboModal: null,
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

  chatMessage: '',
  chatScope: 'all',
  showChat: true,

  setCatComboModal: (state) => set({ catComboModal: state }),
  setFavorModal: (isOpen) => set({ favorModal: isOpen }),
  setTargetedAttackModal: (isOpen) => set({ targetedAttackModal: isOpen }),
  setSeeTheFutureModal: (state) => set({ seeTheFutureModal: state }),
  setAlterTheFutureModal: (state) => set({ alterTheFutureModal: state }),

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

  setChatMessage: (message) => set({ chatMessage: message }),
  setChatScope: (scope) => set({ chatScope: scope }),
  setShowChat: (input) =>
    set((state) => ({
      showChat: typeof input === 'function' ? input(state.showChat) : input,
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

  openCatCombo: (cats, handCards) => {
    const availableCats = cats
      .map((cat) => {
        const count = handCards.filter((c) => c === cat).length;
        const availableModes: ('pair' | 'trio')[] = [];
        if (count >= 2) availableModes.push('pair');
        if (count >= 3) availableModes.push('trio');
        return { cat, availableModes };
      })
      .filter((item) => item.availableModes.length > 0);

    const fiverAvailable = cats.every((cat) =>
      handCards.some((c) => c === cat),
    );

    if (availableCats.length === 0 && !fiverAvailable) return;

    const selectedCat =
      availableCats.length === 1 ? availableCats[0].cat : null;
    const defaultMode = selectedCat ? availableCats[0].availableModes[0] : null;

    set({
      catComboModal: { availableCats, selectedCat, fiverAvailable },
      selectedMode: defaultMode,
      selectedTarget: null,
      selectedCard: null,
      selectedIndex: defaultMode === 'pair' ? 0 : null,
      selectedDiscardCard: null,
    });
  },

  closeCatComboModal: () =>
    set({
      catComboModal: null,
      selectedMode: null,
      selectedTarget: null,
      selectedCard: null,
      selectedIndex: null,
      selectedDiscardCard: null,
      selectedFiverCards: [],
    }),

  selectCat: (cat) =>
    set((state) => {
      if (!state.catComboModal) return state;
      const catData = state.catComboModal.availableCats.find(
        (c) => c.cat === cat,
      );
      const updates: Partial<CriticalGameState> = {
        catComboModal: { ...state.catComboModal, selectedCat: cat },
      };

      if (catData) {
        const defaultMode = catData.availableModes[0];
        updates.selectedMode = defaultMode;
        updates.selectedIndex = defaultMode === 'pair' ? 0 : null;
      }
      updates.selectedTarget = null;
      updates.selectedCard = null;
      return updates;
    }),

  reset: () =>
    set({
      catComboModal: null,
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
      chatMessage: '',
      // Don't reset chatScope or showChat perhaps? Or do we want to reset UI prefs?
      // Keeping scope and showChat might be annoying if reset on every game end if user prefers hidden.
      // Let's reset them for now for clean slate.
    }),
}));
