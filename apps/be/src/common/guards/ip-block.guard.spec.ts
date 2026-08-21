import { MemoryRateStateStore } from '../../common/rate-state/rate-state.store';
import { IpBlockService } from './ip-block.guard';

describe('IpBlockService', () => {
  let store: MemoryRateStateStore;
  let service: IpBlockService;

  beforeEach(() => {
    store = new MemoryRateStateStore();
    service = new IpBlockService(store);
  });

  it('should not block an IP initially', async () => {
    expect(await service.isBlocked('1.2.3.4')).toBe(false);
  });

  it('should block an IP with given duration', async () => {
    await service.block('1.2.3.4', 60_000, 'test');
    expect(await service.isBlocked('1.2.3.4')).toBe(true);
  });

  it('should unblock an IP', async () => {
    await service.block('1.2.3.4', 60_000, 'test');
    await service.unblock('1.2.3.4');
    expect(await service.isBlocked('1.2.3.4')).toBe(false);
  });

  it('should list blocked IPs', async () => {
    await service.block('1.2.3.4', 60_000, 'test');
    await service.block('5.6.7.8', 60_000, 'test2');
    const blocked = await service.getBlocked();
    expect(blocked).toHaveLength(2);
    expect(blocked.map((b) => b.ip)).toContain('1.2.3.4');
    expect(blocked.map((b) => b.ip)).toContain('5.6.7.8');
  });

  it('should clear all blocked IPs', async () => {
    await service.block('1.2.3.4', 60_000, 'test');
    await service.block('5.6.7.8', 60_000, 'test2');
    await service.clearAll();
    expect(await service.getBlocked()).toHaveLength(0);
  });

  it('should block after reaching FAILURE_THRESHOLD via record429', async () => {
    for (let i = 0; i < 100; i++) {
      await service.record429('1.2.3.4');
    }
    expect(await service.isBlocked('1.2.3.4')).toBe(true);
  });

  it('should not block before reaching FAILURE_THRESHOLD', async () => {
    for (let i = 0; i < 99; i++) {
      await service.record429('1.2.3.4');
    }
    expect(await service.isBlocked('1.2.3.4')).toBe(false);
  });

  it('should block immediately on recordSevereAbuse', async () => {
    await service.recordSevereAbuse('1.2.3.4', 'cheating');
    expect(await service.isBlocked('1.2.3.4')).toBe(true);
  });

  it('should share state across service instances using the same store', async () => {
    const service2 = new IpBlockService(store);

    await service.block('1.2.3.4', 60_000, 'test');

    expect(await service2.isBlocked('1.2.3.4')).toBe(true);

    await service2.unblock('1.2.3.4');

    expect(await service.isBlocked('1.2.3.4')).toBe(false);
  });

  it('should handle concurrent record429 calls atomically', async () => {
    const promises = Array.from({ length: 100 }, () =>
      service.record429('1.2.3.4'),
    );
    await Promise.all(promises);

    expect(await service.isBlocked('1.2.3.4')).toBe(true);
  });

  it('should track different IPs independently', async () => {
    await service.block('1.2.3.4', 60_000, 'test');
    expect(await service.isBlocked('1.2.3.4')).toBe(true);
    expect(await service.isBlocked('5.6.7.8')).toBe(false);
  });
});
