import { create } from 'zustand';
import type { ReplayDetail, ReplayAction, PlaybackSpeed } from '../lib/types';
import { BASE_STEP_INTERVAL_MS } from '../lib/types';

interface ReplayState {
  replay: ReplayDetail | null;
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  loading: boolean;
  error: string | null;

  loadReplay: (replay: ReplayDetail) => void;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (step: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  reset: () => void;
}

let playbackTimer: ReturnType<typeof setInterval> | null = null;

function clearPlayback(): void {
  if (playbackTimer !== null) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  replay: null,
  currentStep: 0,
  isPlaying: false,
  playbackSpeed: 1,
  loading: false,
  error: null,

  loadReplay: (replay: ReplayDetail) => {
    clearPlayback();
    set({
      replay,
      currentStep: 0,
      isPlaying: false,
      loading: false,
      error: null,
    });
  },

  play: () => {
    const { replay, currentStep } = get();
    if (!replay) return;

    if (currentStep >= replay.actions.length) {
      set({ currentStep: 0 });
    }

    set({ isPlaying: true });

    clearPlayback();
    playbackTimer = setInterval(() => {
      const state = get();
      if (!state.replay || !state.isPlaying) {
        clearPlayback();
        return;
      }

      const nextStep = state.currentStep + 1;
      if (nextStep > state.replay.actions.length) {
        clearPlayback();
        set({ isPlaying: false });
        return;
      }

      set({ currentStep: nextStep });
    }, BASE_STEP_INTERVAL_MS / get().playbackSpeed);
  },

  pause: () => {
    clearPlayback();
    set({ isPlaying: false });
  },

  stepForward: () => {
    const { replay, currentStep } = get();
    if (!replay) return;
    if (currentStep < replay.actions.length) {
      clearPlayback();
      set({ currentStep: currentStep + 1, isPlaying: false });
    }
  },

  stepBackward: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      clearPlayback();
      set({ currentStep: currentStep - 1, isPlaying: false });
    }
  },

  goToStep: (step: number) => {
    const { replay } = get();
    if (!replay) return;
    const clamped = Math.max(0, Math.min(step, replay.actions.length));
    clearPlayback();
    set({ currentStep: clamped, isPlaying: false });
  },

  setSpeed: (speed: PlaybackSpeed) => {
    const { isPlaying } = get();
    set({ playbackSpeed: speed });

    if (isPlaying) {
      clearPlayback();
      playbackTimer = setInterval(() => {
        const state = get();
        if (!state.replay || !state.isPlaying) {
          clearPlayback();
          return;
        }

        const nextStep = state.currentStep + 1;
        if (nextStep > state.replay.actions.length) {
          clearPlayback();
          set({ isPlaying: false });
          return;
        }

        set({ currentStep: nextStep });
      }, BASE_STEP_INTERVAL_MS / speed);
    }
  },

  reset: () => {
    clearPlayback();
    set({
      replay: null,
      currentStep: 0,
      isPlaying: false,
      playbackSpeed: 1,
      loading: false,
      error: null,
    });
  },
}));

export function getActionAtStep(
  replay: ReplayDetail,
  step: number,
): ReplayAction | null {
  if (step <= 0 || step > replay.actions.length) return null;
  return replay.actions[step - 1];
}
