import { AdminClusterService } from './admin-cluster.service';

describe('AdminClusterService', () => {
  let service: AdminClusterService;

  beforeEach(() => {
    service = new AdminClusterService();
  });

  it('should return cluster status even in non-PM2 environment', async () => {
    const status = await service.getClusterStatus();
    expect(status).toBeDefined();
    expect(status.targetApp).toBe('arcadeum-be');
    expect(Array.isArray(status.instances)).toBe(true);
    expect(status.instances.length).toBeGreaterThan(0);
    expect(status.instances[0].status).toBeDefined();
  });

  it('should handle reloadCluster gracefully', async () => {
    const res = await service.reloadCluster();
    expect(res).toBeDefined();
    expect(typeof res.ok).toBe('boolean');
    expect(typeof res.message).toBe('string');
  });
});
