'use client';

import { useId, useState } from 'react';
import {
  Button,
  GlassCard,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Notice,
  Typography,
} from '@arcadeum/ui';
import type { StreamCommandType } from '../server/stream.types';
import type { StreamT } from './useStreamT';

export type CommandOutcome = 'sent' | 'failed' | 'forbidden';

interface Props {
  phase: 'live' | 'stopping' | 'stopped' | 'killed' | 'offline' | 'starting';
  busy: boolean;
  outcome: CommandOutcome | null;
  onCommand: (type: StreamCommandType, graceful?: boolean) => void;
  t: StreamT;
}

/** Big Start/Stop and Skip buttons. Stop asks for confirmation first. */
export function StreamControls({ phase, busy, outcome, onCommand, t }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [graceful, setGraceful] = useState(true);
  const titleId = useId();
  const gracefulId = useId();
  const running =
    phase === 'live' || phase === 'starting' || phase === 'stopping';

  return (
    <GlassCard
      className="flex flex-col gap-4 p-4"
      data-testid="stream-controls"
    >
      <Typography variant="heading" level={2} uiSize="lg">
        {t('controls.title')}
      </Typography>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {running ? (
          <Button
            variant="danger"
            size="lg"
            fullWidth
            disabled={busy || phase === 'stopping'}
            onClick={() => setConfirmOpen(true)}
            data-testid="stream-stop"
          >
            {t('controls.stop')}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={busy}
            onClick={() => onCommand('start')}
            data-testid="stream-start"
          >
            {t('controls.start')}
          </Button>
        )}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={busy || phase !== 'live'}
          onClick={() => onCommand('skip')}
          data-testid="stream-skip"
        >
          {t('controls.skip')}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={busy || !running}
          onClick={() => onCommand('restart_browser')}
          data-testid="stream-restart-browser"
        >
          {t('controls.restartBrowser')}
        </Button>
      </div>

      <div aria-live="polite" data-testid="stream-command-outcome">
        {outcome ? (
          <Notice
            tone={outcome === 'sent' ? 'success' : 'danger'}
            role={outcome === 'sent' ? 'status' : 'alert'}
          >
            {outcome === 'sent'
              ? t('controls.sent')
              : outcome === 'forbidden'
                ? t('controls.forbidden')
                : t('controls.failed')}
          </Notice>
        ) : null}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        ariaLabelledBy={titleId}
      >
        <ModalContent maxWidth={440} data-testid="stream-stop-dialog">
          <ModalHeader onClose={() => setConfirmOpen(false)}>
            <ModalTitle id={titleId}>{t('controls.confirmTitle')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="m-0 mb-4 text-sm">{t('controls.confirmBody')}</p>
            <div className="flex items-start gap-3">
              <input
                id={gracefulId}
                type="checkbox"
                checked={graceful}
                onChange={(e) => setGraceful(e.target.checked)}
                className="mt-1 size-5 shrink-0 accent-[var(--primary)]"
                data-testid="stream-graceful"
              />
              <label
                htmlFor={gracefulId}
                className="flex flex-col gap-0.5 text-sm"
              >
                <span className="font-semibold">
                  {t('controls.gracefulLabel')}
                </span>
                <span className="text-xs text-[var(--neutral)]">
                  {t('controls.gracefulHint')}
                </span>
              </label>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              data-testid="stream-stop-cancel"
            >
              {t('controls.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(false);
                onCommand('stop', graceful);
              }}
              data-testid="stream-stop-confirm"
            >
              {t('controls.confirmStop')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </GlassCard>
  );
}
