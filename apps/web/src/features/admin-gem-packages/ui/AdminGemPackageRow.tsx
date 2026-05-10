'use client';

import { useState, useTransition } from 'react';
import type { GemPackageAdmin } from '../server/admin-gems.types';
import { AdminGemPackageForm } from './AdminGemPackageForm';
import {
  updatePackageAction,
  deletePackageAction,
  type AdminGemActionResult,
} from '../server/admin-gems.actions';
import type { CreateGemPackageInput } from '../server/admin-gems.types';

interface AdminGemPackageRowProps {
  pkg: GemPackageAdmin;
  onUpdated: (pkg: GemPackageAdmin) => void;
  onDeleted: (id: string) => void;
}

export function AdminGemPackageRow({
  pkg,
  onUpdated,
  onDeleted,
}: AdminGemPackageRowProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const priceDisplay = `$${(pkg.priceUsdCents / 100).toFixed(2)}`;

  const handleDeleteConfirm = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deletePackageAction({ id: pkg.id });
      if (result.ok) {
        onDeleted(pkg.id);
      } else if (result.error === 'conflict') {
        setDeleteError('Cannot delete: package has pending purchases.');
        setConfirmDelete(false);
      } else if (result.error === 'not_found') {
        onDeleted(pkg.id); // Already gone
      } else {
        setDeleteError('Delete failed. Please try again.');
        setConfirmDelete(false);
      }
    });
  };

  const submitUpdate = async (
    input: CreateGemPackageInput,
  ): Promise<AdminGemActionResult<GemPackageAdmin>> => {
    return updatePackageAction({ id: pkg.id, ...input });
  };

  if (editing) {
    return (
      <tr data-testid={`pkg-row-${pkg.id}`}>
        <td colSpan={7} style={{ padding: '12px' }}>
          <AdminGemPackageForm
            initial={pkg}
            onSuccess={(updated) => {
              onUpdated(updated);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
            submitAction={submitUpdate}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr
      data-testid={`pkg-row-${pkg.id}`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{pkg.name}</td>
      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{pkg['gems']}</td>
      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
        {pkg['bonusGems'] > 0 ? `+${pkg['bonusGems']}` : '—'}
      </td>
      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{priceDisplay}</td>
      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
        {pkg.displayOrder}
      </td>
      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            background: pkg.active
              ? 'rgba(34,197,94,0.1)'
              : 'rgba(113,113,122,0.1)',
            color: pkg.active ? '#22c55e' : '#71717a',
          }}
        >
          {pkg.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setEditing(true)}
            data-testid={`edit-${pkg.id}`}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Edit
          </button>

          {confirmDelete ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#ef4444' }}>
                Confirm?
              </span>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                data-testid={`delete-confirm-${pkg.id}`}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {isDeleting ? '…' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                data-testid={`delete-cancel-${pkg.id}`}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'transparent',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              data-testid={`delete-${pkg.id}`}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Delete
            </button>
          )}
        </div>
        {deleteError && (
          <div
            data-testid={`delete-error-${pkg.id}`}
            style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}
          >
            {deleteError}
          </div>
        )}
      </td>
    </tr>
  );
}
