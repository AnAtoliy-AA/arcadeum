'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ErrorState, Notice, Spinner } from '@arcadeum/ui';
import {
  loadStreamAuditAction,
  loadStreamSettingsAction,
  loadStreamStatusAction,
  saveStreamSettingsAction,
  sendStreamCommandAction,
} from '../server/stream.actions';
import type {
  StreamAuditView,
  StreamCommandType,
  StreamSettings,
  StreamSettingsView,
  StreamStatusView,
} from '../server/stream.types';
import {
  isSameSettings,
  serverErrorKey,
  validateSettings,
} from '../lib/streamSettings';
import { StreamAuditList } from './StreamAuditList';
import { StreamControls, type CommandOutcome } from './StreamControls';
import { StreamGamesTable } from './StreamGamesTable';
import { StreamSettingsFields } from './StreamSettingsFields';
import { StreamStatusCard, statusPhase } from './StreamStatusCard';
import { useStreamT } from './useStreamT';
import { useUnsavedGuard } from './useUnsavedGuard';

const STATUS_POLL_MS = 10_000;

interface Props {
  initialSettings: StreamSettingsView | null;
  initialStatus: StreamStatusView | null;
  initialAudit: StreamAuditView[] | null;
}

type SaveFeedback =
  | { kind: 'saved'; version: number }
  | { kind: 'error'; message: string; conflict?: boolean };

export function AdminStreamView({
  initialSettings,
  initialStatus,
  initialAudit,
}: Props) {
  const t = useStreamT();
  const [saved, setSaved] = useState(initialSettings);
  const [form, setForm] = useState<StreamSettings | null>(
    initialSettings?.settings ?? null,
  );
  const [status, setStatus] = useState(initialStatus);
  const [audit, setAudit] = useState(initialAudit);
  const [auditFailed, setAuditFailed] = useState(initialAudit === null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback | null>(null);
  const [outcome, setOutcome] = useState<CommandOutcome | null>(null);
  const [commandBusy, setCommandBusy] = useState(false);
  const [loadFailed, setLoadFailed] = useState(initialSettings === null);

  const errors = useMemo(() => (form ? validateSettings(form) : {}), [form]);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = Boolean(form && saved && !isSameSettings(form, saved.settings));
  useUnsavedGuard(dirty, t('form.leaveWarning'));

  const refreshStatus = useCallback(async () => {
    setRefreshing(true);
    const res = await loadStreamStatusAction();
    if (res.ok) setStatus(res.data);
    setRefreshing(false);
  }, []);

  const refreshAudit = useCallback(async () => {
    setAuditLoading(true);
    const res = await loadStreamAuditAction();
    if (res.ok) {
      setAudit(res.data);
      setAuditFailed(false);
    } else {
      setAuditFailed(true);
    }
    setAuditLoading(false);
  }, []);

  const loadAll = useCallback(async () => {
    const res = await loadStreamSettingsAction();
    if (!res.ok) {
      setLoadFailed(true);
      return false;
    }
    setSaved(res.data);
    setForm(res.data.settings);
    setLoadFailed(false);
    void refreshStatus();
    void refreshAudit();
    return true;
  }, [refreshAudit, refreshStatus]);

  useEffect(() => {
    if (!saved) return;
    const id = setInterval(() => {
      if (!document.hidden) void refreshStatus();
    }, STATUS_POLL_MS);
    return () => clearInterval(id);
  }, [saved, refreshStatus]);

  const save = async () => {
    if (!form || !saved || hasErrors) return;
    setSaving(true);
    setFeedback(null);
    const res = await saveStreamSettingsAction({
      settings: form,
      expectedVersion: saved.version,
    });
    setSaving(false);
    if (res.ok) {
      setSaved(res.data);
      setForm(res.data.settings);
      setFeedback({ kind: 'saved', version: res.data.version });
      void refreshStatus();
      void refreshAudit();
      return;
    }
    if (res.error === 'conflict') {
      setFeedback({
        kind: 'error',
        message: t('form.conflict'),
        conflict: true,
      });
    } else if (res.error === 'forbidden') {
      setFeedback({ kind: 'error', message: t('form.forbidden') });
    } else if (res.error === 'validation') {
      const key = serverErrorKey(res.code);
      setFeedback({
        kind: 'error',
        message: key
          ? t(`errors.${key}`, { min: 2, max: 80 })
          : t('form.saveFailed'),
      });
    } else {
      setFeedback({ kind: 'error', message: t('form.saveFailed') });
    }
  };

  const sendCommand = async (type: StreamCommandType, graceful?: boolean) => {
    setCommandBusy(true);
    setOutcome(null);
    const res = await sendStreamCommandAction({ type, graceful });
    setCommandBusy(false);
    if (!res.ok) {
      setOutcome(res.error === 'forbidden' ? 'forbidden' : 'failed');
      return;
    }
    setOutcome('sent');
    void refreshStatus();
    void refreshAudit();
    if (type === 'start' || type === 'stop') {
      // start/stop flip "enabled" server side: pick it up without losing edits.
      const fresh = await loadStreamSettingsAction();
      if (fresh.ok) {
        setSaved(fresh.data);
        // Keep in-progress edits; otherwise show the new enabled state.
        if (!dirty) setForm(fresh.data.settings);
      }
    }
  };

  if (loadFailed || !saved || !form) {
    return (
      <ErrorState
        message={t('loadError')}
        retryLabel={t('retry')}
        onRetry={() => void loadAll()}
        data-testid="stream-load-error"
      />
    );
  }

  const lastSaved = saved.updatedAt
    ? t('form.lastSaved', {
        time: new Date(saved.updatedAt).toLocaleString(),
        who: saved.updatedByLabel ?? '-',
      })
    : t('form.neverSaved');

  return (
    <div className="flex flex-col gap-4" data-testid="admin-stream">
      <Notice tone="info" icon="i" data-testid="stream-key-notice">
        {t('keyNotice')}
      </Notice>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <StreamStatusCard
            status={status}
            refreshing={refreshing}
            onRefresh={() => void refreshStatus()}
            t={t}
          />
          <StreamControls
            phase={statusPhase(status)}
            busy={commandBusy}
            outcome={outcome}
            onCommand={(ty, g) => void sendCommand(ty, g)}
            t={t}
          />
        </div>
        <StreamAuditList
          items={audit}
          loading={auditLoading}
          failed={auditFailed}
          t={t}
        />
      </div>

      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        data-testid="stream-settings-form"
      >
        <StreamSettingsFields
          value={form}
          errors={errors}
          disabled={saving}
          onChange={setForm}
          t={t}
        />
        <StreamGamesTable
          settings={form}
          errors={errors}
          disabled={saving}
          onChange={setForm}
          t={t}
        />

        <div
          className="sticky bottom-0 z-10 flex flex-col gap-2 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] p-3"
          data-testid="stream-save-bar"
        >
          <div aria-live="polite" className="flex flex-col gap-2">
            {feedback?.kind === 'saved' ? (
              <Notice
                tone="success"
                role="status"
                data-testid="stream-save-success"
              >
                {t('form.saved', { version: feedback.version })}
              </Notice>
            ) : null}
            {feedback?.kind === 'error' ? (
              <Notice
                tone="danger"
                role="alert"
                data-testid="stream-save-error"
              >
                <span className="flex flex-wrap items-center gap-3">
                  {feedback.message}
                  {feedback.conflict ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setFeedback(null);
                        void loadAll();
                      }}
                      data-testid="stream-reload"
                    >
                      {t('form.reload')}
                    </Button>
                  ) : null}
                </span>
              </Notice>
            ) : null}
            {hasErrors ? (
              <span
                role="alert"
                className="text-sm font-semibold text-[var(--danger)]"
                data-testid="stream-has-errors"
              >
                {t('form.hasErrors')}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className="text-xs text-[var(--neutral)]"
              data-testid="stream-last-saved"
            >
              {dirty ? (
                <strong
                  className="text-[var(--warning)]"
                  data-testid="stream-unsaved"
                >
                  {t('form.unsaved')}
                </strong>
              ) : (
                lastSaved
              )}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={!dirty || saving}
                onClick={() => {
                  setForm(saved.settings);
                  setFeedback(null);
                }}
                data-testid="stream-discard"
              >
                {t('form.discard')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!dirty || hasErrors || saving}
                data-testid="stream-save"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" /> {t('form.saving')}
                  </span>
                ) : (
                  t('form.save')
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
