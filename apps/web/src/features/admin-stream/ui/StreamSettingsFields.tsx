'use client';

import { useId, type ReactNode } from 'react';
import { GlassCard, Select, TextArea, Toggle, Typography } from '@arcadeum/ui';
import {
  BOT_DIFFICULTIES,
  FPS_VALUES,
  OVERLAY_PARTS,
  RESOLUTIONS,
  X264_PRESETS,
  type StreamSettings,
} from '../server/stream.types';
import {
  LIMITS,
  parseTrackLines,
  type FieldErrors,
} from '../lib/streamSettings';
import { FieldShell, NumberField, errorText } from './FormField';
import type { StreamT } from './useStreamT';

type Timing = 'live' | 'nextGame' | 'restart';

function Section({
  title,
  timing,
  testId,
  t,
  children,
}: {
  title: string;
  timing: Timing;
  testId: string;
  t: StreamT;
  children: ReactNode;
}) {
  return (
    <GlassCard className="flex flex-col gap-4 p-4" data-testid={testId}>
      <div className="flex flex-col gap-1">
        <Typography variant="heading" level={3} uiSize="md">
          {title}
        </Typography>
        <span className="text-xs text-[var(--neutral)]">
          {t(
            timing === 'live'
              ? 'form.liveNote'
              : timing === 'nextGame'
                ? 'form.nextGameNote'
                : 'form.restartNote',
          )}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </GlassCard>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  disabled,
  testId,
  onChange,
  t,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled: boolean;
  testId: string;
  onChange: (v: boolean) => void;
  t: StreamT;
}) {
  return (
    <div className="flex items-center justify-between gap-3 sm:col-span-2">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-semibold">{label}</span>
        {hint ? (
          <span className="text-xs text-[var(--neutral)]">{hint}</span>
        ) : null}
      </div>
      <Toggle
        checked={checked}
        disabled={disabled}
        ariaLabel={label}
        onLabel={t('games.enabled')}
        offLabel="-"
        testId={testId}
        onCheckedChange={onChange}
      />
    </div>
  );
}

interface Props {
  value: StreamSettings;
  errors: FieldErrors;
  disabled: boolean;
  onChange: (next: StreamSettings) => void;
  t: StreamT;
}

const range = (t: StreamT, r: { min: number; max: number }): string =>
  t('form.range', r);

export function StreamSettingsFields({
  value: s,
  errors,
  disabled,
  onChange,
  t,
}: Props) {
  const ids = {
    diff: useId(),
    res: useId(),
    fps: useId(),
    preset: useId(),
    lang: useId(),
    url: useId(),
    banner: useId(),
    tracks: useId(),
  };
  const err = (k: string): string | undefined =>
    errors[k] ? errorText(t, errors[k]) : undefined;
  const units = (u: string): string => t(`form.units.${u}`);

  return (
    <div className="flex flex-col gap-4">
      <Section
        title={t('form.sections.general')}
        timing="live"
        testId="stream-section-general"
        t={t}
      >
        <ToggleRow
          label={t('form.enabled')}
          hint={t('form.enabledHint')}
          checked={s.enabled}
          disabled={disabled}
          testId="stream-enabled"
          onChange={(v) => onChange({ ...s, enabled: v })}
          t={t}
        />
        <ToggleRow
          label={t('controls.gracefulLabel')}
          hint={t('controls.gracefulHint')}
          checked={s.stopGracefully}
          disabled={disabled}
          testId="stream-stop-gracefully"
          onChange={(v) => onChange({ ...s, stopGracefully: v })}
          t={t}
        />
      </Section>

      <Section
        title={t('form.sections.bot')}
        timing="nextGame"
        testId="stream-section-bot"
        t={t}
      >
        <FieldShell
          label={t('form.difficulty')}
          hint={t('form.difficultyHint')}
          htmlFor={ids.diff}
        >
          <Select
            id={ids.diff}
            size="sm"
            fullWidth
            disabled={disabled}
            aria-label={t('form.difficulty')}
            data-testid="stream-difficulty"
            value={s.bot.difficulty}
            options={BOT_DIFFICULTIES.map((d) => ({
              value: d,
              label: t(`form.options.difficulty.${d}`),
            }))}
            onValueChange={(v) =>
              onChange({
                ...s,
                bot: {
                  ...s.bot,
                  difficulty: v as StreamSettings['bot']['difficulty'],
                },
              })
            }
          />
        </FieldShell>
        <NumberField
          label={t('form.moveDelay')}
          unit={units('ms')}
          value={s.bot.moveDelayMs}
          min={LIMITS.moveDelayMs.min}
          max={LIMITS.moveDelayMs.max}
          step={100}
          hint={range(t, LIMITS.moveDelayMs)}
          error={err('bot.moveDelayMs')}
          disabled={disabled}
          testId="stream-move-delay"
          onChange={(v) =>
            onChange({ ...s, bot: { ...s.bot, moveDelayMs: v } })
          }
        />
        <NumberField
          label={t('form.secondsBetween')}
          unit={units('s')}
          value={s.secondsBetweenGames}
          min={LIMITS.secondsBetweenGames.min}
          max={LIMITS.secondsBetweenGames.max}
          hint={range(t, LIMITS.secondsBetweenGames)}
          error={err('secondsBetweenGames')}
          disabled={disabled}
          testId="stream-seconds-between"
          onChange={(v) => onChange({ ...s, secondsBetweenGames: v })}
        />
      </Section>

      <Section
        title={t('form.sections.overlay')}
        timing="nextGame"
        testId="stream-section-overlay"
        t={t}
      >
        <FieldShell
          label={t('form.joinUrl')}
          hint={t('form.joinUrlHint')}
          error={err('overlay.joinUrl')}
          htmlFor={ids.url}
        >
          <input
            id={ids.url}
            type="url"
            inputMode="url"
            maxLength={LIMITS.joinUrlLength}
            value={s.overlay.joinUrl}
            disabled={disabled}
            placeholder="https://"
            aria-invalid={errors['overlay.joinUrl'] ? true : undefined}
            aria-describedby={`${ids.url}-desc`}
            data-testid="stream-join-url"
            onChange={(e) =>
              onChange({
                ...s,
                overlay: { ...s.overlay, joinUrl: e.target.value },
              })
            }
            className="h-9 w-full rounded-xl border border-[var(--borderColor)] bg-[var(--background)] px-3 text-[var(--color)]"
          />
        </FieldShell>
        <FieldShell
          label={t('form.bannerText')}
          hint={`${t('form.bannerHint')} (${s.overlay.bannerText.length}/${LIMITS.bannerLength})`}
          error={err('overlay.bannerText')}
          htmlFor={ids.banner}
        >
          <input
            id={ids.banner}
            type="text"
            value={s.overlay.bannerText}
            disabled={disabled}
            aria-invalid={errors['overlay.bannerText'] ? true : undefined}
            aria-describedby={`${ids.banner}-desc`}
            data-testid="stream-banner"
            onChange={(e) =>
              onChange({
                ...s,
                overlay: { ...s.overlay, bannerText: e.target.value },
              })
            }
            className="h-9 w-full rounded-xl border border-[var(--borderColor)] bg-[var(--background)] px-3 text-[var(--color)]"
          />
        </FieldShell>
        <ToggleRow
          label={t('form.showQr')}
          checked={s.overlay.showQr}
          disabled={disabled}
          testId="stream-show-qr"
          onChange={(v) =>
            onChange({ ...s, overlay: { ...s.overlay, showQr: v } })
          }
          t={t}
        />
        <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0 sm:col-span-2">
          <legend className="mb-1 text-sm font-semibold">
            {t('form.parts')}
          </legend>
          {OVERLAY_PARTS.map((part) => (
            <label key={part} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={s.overlay.parts[part]}
                disabled={disabled}
                data-testid={`stream-part-${part}`}
                onChange={(e) =>
                  onChange({
                    ...s,
                    overlay: {
                      ...s.overlay,
                      parts: { ...s.overlay.parts, [part]: e.target.checked },
                    },
                  })
                }
                className="size-5 shrink-0 accent-[var(--primary)]"
              />
              {t(`form.options.parts.${part}`)}
            </label>
          ))}
        </fieldset>
      </Section>

      <Section
        title={t('form.sections.audio')}
        timing="restart"
        testId="stream-section-audio"
        t={t}
      >
        <NumberField
          label={t('form.musicVolume')}
          unit={units('pct')}
          value={s.music.volume}
          min={LIMITS.musicVolume.min}
          max={LIMITS.musicVolume.max}
          hint={range(t, LIMITS.musicVolume)}
          error={err('music.volume')}
          disabled={disabled}
          testId="stream-music-volume"
          onChange={(v) => onChange({ ...s, music: { ...s.music, volume: v } })}
        />
        <div className="sm:col-span-2">
          <FieldShell
            label={t('form.tracks')}
            hint={t('form.tracksHint')}
            error={err('music.tracks')}
            htmlFor={ids.tracks}
          >
            <TextArea
              id={ids.tracks}
              fullWidth
              rows={4}
              error={Boolean(errors['music.tracks'])}
              aria-describedby={`${ids.tracks}-desc`}
              data-testid="stream-tracks"
              value={s.music.tracks.join('\n')}
              onChange={(e) =>
                onChange({
                  ...s,
                  music: {
                    ...s.music,
                    tracks: parseTrackLines(e.target.value),
                  },
                })
              }
            />
          </FieldShell>
        </div>
      </Section>

      <Section
        title={t('form.sections.video')}
        timing="restart"
        testId="stream-section-video"
        t={t}
      >
        <FieldShell label={t('form.resolution')} htmlFor={ids.res}>
          <Select
            id={ids.res}
            size="sm"
            fullWidth
            disabled={disabled}
            aria-label={t('form.resolution')}
            data-testid="stream-resolution"
            value={s.video.resolution}
            options={RESOLUTIONS.map((r) => ({
              value: r,
              label: t(`form.options.resolution.${r}`),
            }))}
            onValueChange={(v) =>
              onChange({
                ...s,
                video: {
                  ...s.video,
                  resolution: v as StreamSettings['video']['resolution'],
                },
              })
            }
          />
        </FieldShell>
        <FieldShell label={t('form.fps')} htmlFor={ids.fps}>
          <Select
            id={ids.fps}
            size="sm"
            fullWidth
            disabled={disabled}
            aria-label={t('form.fps')}
            data-testid="stream-fps-select"
            value={String(s.video.fps)}
            options={FPS_VALUES.map((f) => ({
              value: String(f),
              label: `${f} ${units('fps')}`,
            }))}
            onValueChange={(v) =>
              onChange({
                ...s,
                video: {
                  ...s.video,
                  fps: Number(v) as StreamSettings['video']['fps'],
                },
              })
            }
          />
        </FieldShell>
        <NumberField
          label={t('form.bitrate')}
          unit={units('kbps')}
          value={s.video.bitrateKbps}
          min={LIMITS.bitrateKbps.min}
          max={LIMITS.bitrateKbps.max}
          step={100}
          hint={range(t, LIMITS.bitrateKbps)}
          error={err('video.bitrateKbps')}
          disabled={disabled}
          testId="stream-bitrate"
          onChange={(v) =>
            onChange({ ...s, video: { ...s.video, bitrateKbps: v } })
          }
        />
        <FieldShell
          label={t('form.preset')}
          hint={t('form.presetHint')}
          htmlFor={ids.preset}
        >
          <Select
            id={ids.preset}
            size="sm"
            fullWidth
            disabled={disabled}
            aria-label={t('form.preset')}
            data-testid="stream-preset"
            value={s.video.preset}
            options={X264_PRESETS.map((p) => ({ value: p, label: p }))}
            onValueChange={(v) =>
              onChange({
                ...s,
                video: {
                  ...s.video,
                  preset: v as StreamSettings['video']['preset'],
                },
              })
            }
          />
        </FieldShell>
        <FieldShell
          label={t('form.sceneLanguage')}
          hint={t('form.sceneLanguageHint')}
          htmlFor={ids.lang}
        >
          <Select
            id={ids.lang}
            size="sm"
            fullWidth
            disabled
            aria-label={t('form.sceneLanguage')}
            data-testid="stream-scene-language"
            value={s.sceneLanguage}
            options={[{ value: 'en', label: t('form.options.language.en') }]}
          />
        </FieldShell>
      </Section>
    </div>
  );
}
