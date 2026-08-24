'use client';

import { useState } from 'react';
import { Modal, Button } from '@arcadeum/ui';
import { clansApi } from '../api';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  clanId: string;
}

export function InviteModal({ open, onClose, clanId }: InviteModalProps) {
  const { snapshot } = useSessionTokens();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    if (!snapshot.accessToken) return;
    try {
      const { inviteCode } = await clansApi.regenerateInviteCode(clanId, {
        token: snapshot.accessToken,
      });
      const link = `${window.location.origin}/invite/${inviteCode}`;
      setInviteLink(link);
    } catch {
      // ignore
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-bold">Invite Players</h2>

        {!inviteLink ? (
          <Button variant="primary" onClick={generateLink}>
            Generate Invite Link
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-[var(--borderColor)] bg-[var(--glassBg)] p-3">
              <span className="flex-1 truncate text-sm">{inviteLink}</span>
              <button
                onClick={copyToClipboard}
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-[var(--foreground)]/50">
              Share this link with players you want to invite.
            </p>
          </>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
