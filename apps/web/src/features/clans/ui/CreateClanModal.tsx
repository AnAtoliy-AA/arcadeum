'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@arcadeum/ui';
import { useClansStore } from '../store/clansStore';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

interface CreateClanModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateClanModal({ open, onClose }: CreateClanModalProps) {
  const { snapshot } = useSessionTokens();
  const createClan = useClansStore((s) => s.createClan);
  const loading = useClansStore((s) => s.loading);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!snapshot.accessToken) return;
    setError(null);

    try {
      await createClan(
        {
          name: name.trim(),
          tag: tag.trim().toUpperCase(),
          description: description.trim(),
          visibility,
        },
        snapshot.accessToken,
      );
      onClose();
      setName('');
      setTag('');
      setDescription('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const canSubmit =
    name.trim().length > 0 && tag.trim().length > 0 && tag.trim().length <= 6;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-bold">Create Clan</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Clan Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter clan name"
            maxLength={30}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Clan Tag</label>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value.toUpperCase())}
            placeholder="ABC"
            maxLength={6}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your clan..."
            maxLength={500}
            className="rounded-lg border border-[var(--borderColor)] bg-[var(--glassBg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Visibility</label>
          <div className="flex gap-2">
            <Button
              variant={visibility === 'public' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setVisibility('public')}
            >
              Public
            </Button>
            <Button
              variant={visibility === 'private' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setVisibility('private')}
            >
              Private
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={!canSubmit || loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
