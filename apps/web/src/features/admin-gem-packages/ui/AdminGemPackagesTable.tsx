'use client';

import { useState } from 'react';
import type { GemPackageAdmin } from '../server/admin-gems.types';
import { createPackageAction } from '../server/admin-gems.actions';
import { AdminGemPackageForm } from './AdminGemPackageForm';
import { AdminGemPackageRow } from './AdminGemPackageRow';

interface AdminGemPackagesTableProps {
  initialPackages: GemPackageAdmin[];
}

export function AdminGemPackagesTable({
  initialPackages,
}: AdminGemPackagesTableProps) {
  const [packages, setPackages] = useState<GemPackageAdmin[]>(initialPackages);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreated = (pkg: GemPackageAdmin) => {
    setPackages((prev) => [...prev, pkg]);
    setShowCreateForm(false);
  };

  const handleUpdated = (updated: GemPackageAdmin) => {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleted = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          data-testid="create-package-btn"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#7c3aed',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {showCreateForm ? 'Cancel' : '+ New Package'}
        </button>
      </div>

      {showCreateForm && (
        <AdminGemPackageForm
          onSuccess={handleCreated}
          onCancel={() => setShowCreateForm(false)}
          submitAction={createPackageAction}
        />
      )}

      {packages.length === 0 ? (
        <div
          data-testid="packages-empty"
          style={{
            textAlign: 'center',
            padding: '48px 16px',
            color: '#71717a',
          }}
        >
          No gem packages yet. Click + New Package to create one.
        </div>
      ) : (
        <div
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <table
            data-testid="packages-table"
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {(
                  [
                    'Name',
                    'Gems',
                    'Bonus',
                    'Price (USD)',
                    'Order',
                    'Active',
                    'Actions',
                  ] as const
                ).map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#71717a',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <AdminGemPackageRow
                  key={pkg.id}
                  pkg={pkg}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
