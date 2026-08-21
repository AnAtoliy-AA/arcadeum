import { beforeEach, describe, expect, it } from 'vitest';
import { useGlimwormStore } from './glimwormStore';
import type { GlimwormDiscreteEvent, GlimwormSnapshot } from '../types';

const makeSnapshot = (tickNum: number): GlimwormSnapshot => ({
  roomId: 'r1',
  tickNum,
  serverTime: 1000 + tickNum,
  status: 'playing',
  variant: 'battle_royale',
  powerupsEnabled: false,
  arena: { width: 2000, height: 2000 },
  worms: [],
  food: [],
  powerups: [],
  endsAt: null,
  winner: null,
});

describe('useGlimwormStore', () => {
  beforeEach(() => {
    useGlimwormStore.getState().reset();
  });

  it('starts with null snapshots and idle status', () => {
    const s = useGlimwormStore.getState();
    expect(s.latestSnapshot).toBeNull();
    expect(s.previousSnapshot).toBeNull();
    expect(s.connectionStatus).toBe('idle');
    expect(s.discreteEvents).toEqual([]);
  });

  it('ingestSnapshot rotates: previous = old latest, latest = new', () => {
    const store = useGlimwormStore.getState();
    const snap1 = makeSnapshot(1);
    const snap2 = makeSnapshot(2);
    store.ingestSnapshot(snap1);
    expect(useGlimwormStore.getState().latestSnapshot).toBe(snap1);
    expect(useGlimwormStore.getState().previousSnapshot).toBeNull();
    store.ingestSnapshot(snap2);
    expect(useGlimwormStore.getState().latestSnapshot).toBe(snap2);
    expect(useGlimwormStore.getState().previousSnapshot).toBe(snap1);
  });

  it('setInput overwrites localInput', () => {
    const store = useGlimwormStore.getState();
    store.setInput({ angle: 1.5, usePowerup: true });
    expect(useGlimwormStore.getState().localInput).toEqual({
      angle: 1.5,
      usePowerup: true,
    });
  });

  it('setColor sets and clears the selected colour', () => {
    const store = useGlimwormStore.getState();
    store.setColor('#ff5e5e');
    expect(useGlimwormStore.getState().selectedColor).toBe('#ff5e5e');
    store.setColor(null);
    expect(useGlimwormStore.getState().selectedColor).toBeNull();
  });

  it('pushEvent appends and popEvents drains and clears', () => {
    const store = useGlimwormStore.getState();
    const ev1: GlimwormDiscreteEvent = {
      type: 'worm_died',
      wormId: 'a',
      killerId: null,
      tickNum: 1,
    };
    const ev2: GlimwormDiscreteEvent = {
      type: 'powerup_picked',
      wormId: 'b',
      kind: 'speed',
      tickNum: 2,
    };
    store.pushEvent(ev1);
    store.pushEvent(ev2);
    const drained = useGlimwormStore.getState().popEvents();
    expect(drained).toEqual([ev1, ev2]);
    expect(useGlimwormStore.getState().discreteEvents).toEqual([]);
  });

  it('popEvents returns an empty array and is a no-op when nothing is queued', () => {
    const store = useGlimwormStore.getState();
    expect(store.popEvents()).toEqual([]);
  });
});
