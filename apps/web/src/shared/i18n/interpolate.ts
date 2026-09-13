import { interpolate as _interpolate } from '@arcadeum/games-core';

export function formatMessage(
  template: string | undefined,
  params: Record<string, string | number | undefined>,
): string | undefined {
  if (!template) {
    return template;
  }

  return _interpolate(template, params);
}
