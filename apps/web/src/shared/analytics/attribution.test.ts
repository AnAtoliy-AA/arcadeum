import { describe, it, expect, beforeEach } from 'vitest';
import {
  captureAttribution,
  getAttribution,
  attributionEventProps,
  ATTRIBUTION_STORAGE_KEY,
} from './attribution';

describe('attribution', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  describe('captureAttribution', () => {
    it('returns false and stores nothing when there are no attribution params', () => {
      expect(captureAttribution('?foo=bar')).toBe(false);
      expect(getAttribution()).toBeNull();
      expect(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)).toBeNull();
    });

    it('captures utm params as both first and last touch on first visit', () => {
      const changed = captureAttribution(
        '?utm_source=reddit&utm_medium=social&utm_campaign=launch',
      );
      expect(changed).toBe(true);

      const data = getAttribution();
      expect(data).not.toBeNull();
      expect(data?.firstTouch.utmSource).toBe('reddit');
      expect(data?.firstTouch.utmMedium).toBe('social');
      expect(data?.firstTouch.utmCampaign).toBe('launch');
      expect(data?.lastTouch.utmSource).toBe('reddit');
      expect(data?.firstTouch.landingPage).toBe('/');
    });

    it('captures ?ref= codes', () => {
      captureAttribution('?ref=FRIEND42');
      const data = getAttribution();
      expect(data?.firstTouch.ref).toBe('FRIEND42');
      expect(data?.lastTouch.ref).toBe('FRIEND42');
    });

    it('keeps the first touch immutable and updates the last touch', () => {
      captureAttribution('?utm_source=reddit');
      captureAttribution('?utm_source=twitter&utm_content=banner');

      const data = getAttribution();
      expect(data?.firstTouch.utmSource).toBe('reddit');
      expect(data?.lastTouch.utmSource).toBe('twitter');
      expect(data?.lastTouch.utmContent).toBe('banner');
    });

    it('is idempotent for identical params (no duplicate writes)', () => {
      captureAttribution('?utm_source=reddit');
      const before = getAttribution();
      expect(captureAttribution('?utm_source=reddit')).toBe(false);
      expect(getAttribution()).toEqual(before);
    });

    it('ignores empty or whitespace-only param values', () => {
      expect(captureAttribution('?utm_source=&utm_medium=  ')).toBe(false);
      expect(getAttribution()).toBeNull();
    });

    it('truncates overly long values defensively', () => {
      const longValue = 'x'.repeat(1000);
      captureAttribution(`?utm_source=${longValue}`);
      const data = getAttribution();
      expect(data?.firstTouch.utmSource).toHaveLength(256);
    });

    it('handles a leading question mark in the search string', () => {
      expect(captureAttribution('?ref=abc')).toBe(true);
      // '?ref' without value is not an attribution hit
      expect(getAttribution()?.firstTouch.ref).toBe('abc');
    });

    it('survives corrupted stored JSON by resetting state', () => {
      captureAttribution('?utm_source=reddit');
      window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, '{not json');
      expect(getAttribution()).toBeNull();
    });

    it('rejects malformed stored payloads missing timestamps', () => {
      window.localStorage.setItem(
        ATTRIBUTION_STORAGE_KEY,
        JSON.stringify({ firstTouch: { utmSource: 'x' }, lastTouch: {} }),
      );
      expect(getAttribution()).toBeNull();
    });
  });

  describe('attributionEventProps', () => {
    it('reports direct when nothing was captured', () => {
      expect(attributionEventProps()).toEqual({
        attributionSource: 'direct',
        attributionCampaign: null,
        attributionFirstSource: 'direct',
      });
    });

    it('prefers last-touch utm_source and exposes campaign + first touch', () => {
      captureAttribution('?utm_source=newsletter&utm_campaign=winter');
      captureAttribution('?ref=BUDDY');

      const props = attributionEventProps();
      expect(props.attributionSource).toBe('BUDDY');
      expect(props.attributionCampaign).toBeNull();
      expect(props.attributionFirstSource).toBe('newsletter');
    });
  });
});
