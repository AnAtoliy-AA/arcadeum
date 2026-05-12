import 'reflect-metadata';
import { plainToInstance, Type } from 'class-transformer';
import { IsDate, IsOptional, validate } from 'class-validator';
import { IsAfter } from './is-after.validator';

class Bag {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsAfter('startsAt')
  endsAt?: Date | null;
}

async function check(plain: Record<string, unknown>) {
  const inst = plainToInstance(Bag, plain);
  return validate(inst);
}

describe('IsAfter', () => {
  it('passes when both null', async () =>
    expect((await check({})).length).toBe(0));
  it('passes when only startsAt set', async () =>
    expect((await check({ startsAt: '2026-05-09T00:00:00Z' })).length).toBe(0));
  it('passes when only endsAt set', async () =>
    expect((await check({ endsAt: '2026-05-09T00:00:00Z' })).length).toBe(0));
  it('passes when endsAt > startsAt', async () =>
    expect(
      (
        await check({
          startsAt: '2026-05-09T00:00:00Z',
          endsAt: '2026-05-10T00:00:00Z',
        })
      ).length,
    ).toBe(0));
  it('fails when endsAt === startsAt', async () =>
    expect(
      (
        await check({
          startsAt: '2026-05-09T00:00:00Z',
          endsAt: '2026-05-09T00:00:00Z',
        })
      ).length,
    ).toBeGreaterThan(0));
  it('fails when endsAt < startsAt', async () =>
    expect(
      (
        await check({
          startsAt: '2026-05-10T00:00:00Z',
          endsAt: '2026-05-09T00:00:00Z',
        })
      ).length,
    ).toBeGreaterThan(0));
});
