import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveWidgetMode, isWidgetModeEnabledFromEnv } from './widgetMode';

describe('resolveWidgetMode', () => {
  const originalEnv = process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = originalEnv;
  });

  it('URL param wins over storage and env', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'false';
    expect(resolveWidgetMode({ paramValue: '1', storageValue: '0' })).toBe(
      true,
    );
    expect(resolveWidgetMode({ paramValue: '0', storageValue: '1' })).toBe(
      false,
    );
  });

  it('storage wins over env when no URL param', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'false';
    expect(resolveWidgetMode({ storageValue: '1' })).toBe(true);
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'true';
    expect(resolveWidgetMode({ storageValue: '0' })).toBe(false);
  });

  it('falls back to env when neither URL nor storage is set', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'true';
    expect(resolveWidgetMode({})).toBe(true);
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'false';
    expect(resolveWidgetMode({})).toBe(false);
  });

  it('accepts both `1` and `true` as truthy', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = undefined;
    expect(resolveWidgetMode({ paramValue: '1' })).toBe(true);
    expect(resolveWidgetMode({ paramValue: 'true' })).toBe(true);
  });

  it('ignores garbage values and falls through to next layer', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'true';
    expect(resolveWidgetMode({ paramValue: 'banana' })).toBe(true);
    expect(resolveWidgetMode({ paramValue: 'banana', storageValue: '0' })).toBe(
      false,
    );
  });

  it('defaults to false when nothing is configured', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = undefined;
    expect(resolveWidgetMode({})).toBe(false);
  });
});

describe('isWidgetModeEnabledFromEnv', () => {
  const originalEnv = process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = originalEnv;
  });

  it('returns true when env is "true" or "1"', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'true';
    expect(isWidgetModeEnabledFromEnv()).toBe(true);
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = '1';
    expect(isWidgetModeEnabledFromEnv()).toBe(true);
  });

  it('returns false when env is unset or anything else', () => {
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = undefined;
    expect(isWidgetModeEnabledFromEnv()).toBe(false);
    process.env.NEXT_PUBLIC_CRITICAL_WIDGET_MODE = 'maybe';
    expect(isWidgetModeEnabledFromEnv()).toBe(false);
  });
});
