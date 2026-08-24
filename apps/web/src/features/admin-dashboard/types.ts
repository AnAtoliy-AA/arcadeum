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

export interface AdminDashboardData {
  healthy: boolean;
  pingOk: boolean;
  dbHealth: AdminDbHealth | null;
}

export interface AdminModuleConfig {
  id: string;
  href: string;
  category: 'core' | 'economy' | 'games' | 'security';
  badge?: string;
}
