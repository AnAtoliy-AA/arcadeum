import { describe, it, expect } from 'vitest';
import { USER_ROLES } from '@/entities/session/model/types';
import { ROLE_COLORS } from './roleColors';

describe('ROLE_COLORS', () => {
  it.each(USER_ROLES)('has an entry for %s', (role) => {
    const color = ROLE_COLORS[role];
    expect(color).toBeDefined();
    expect(color.fg).toMatch(/^\$/);
    expect(color.bg).toMatch(/^\$/);
  });
});
