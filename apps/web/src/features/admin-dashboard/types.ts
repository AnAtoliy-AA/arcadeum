export interface AdminCollDetail {
  count: number;
  sizeMB: number;
  avgObjBytes: number;
  indexes: number;
}

export interface AdminDbHealth {
  database: string;
  totalDocs: number;
  dataSizeMB: number;
  storageSizeMB: number;
  indexSizeMB: number;
  collections: number;
  details: Record<string, AdminCollDetail>;
}

export interface AdminServerMetrics {
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
    perCore: number[];
  };
  ram: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    usagePercent: number;
  };
  process: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
  };
  system: {
    uptimeSeconds: number;
    loadAvg: [number, number, number];
    nodeVersion: string;
    platform: string;
  };
}

export interface AdminDashboardData {
  healthy: boolean;
  pingOk: boolean;
  dbHealth: AdminDbHealth | null;
  serverMetrics: AdminServerMetrics | null;
}

export interface AdminModuleConfig {
  id: string;
  href: string;
  category: 'core' | 'economy' | 'games' | 'security';
  badge?: string;
}
