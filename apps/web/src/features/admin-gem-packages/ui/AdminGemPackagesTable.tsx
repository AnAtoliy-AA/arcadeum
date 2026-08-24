'use client';

import { useState } from 'react';
import { Button } from '@arcadeum/ui';
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

  const columns = [
    'Name',
    'Gems',
    'Bonus',
    'Price (USD)',
    'Order',
    'Active',
    'Actions',
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          onClick={() => setShowCreateForm((v) => !v)}
          data-testid="create-package-btn"
        >
          {showCreateForm ? 'Cancel' : '+ New Package'}
        </Button>
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
          className="text-center py-12 px-4 text-[var(--colorTextSecondary,#71717a)]"
        >
          No gem packages yet. Click + New Package to create one.
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-[var(--borderColor)]">
          <table
            data-testid="packages-table"
            className="w-full border-collapse"
          >
            <thead>
              <tr className="bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)]">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="py-2.5 px-4 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--colorTextSecondary,#71717a)]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--borderColor)]">
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
