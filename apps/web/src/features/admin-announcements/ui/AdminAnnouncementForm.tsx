'use client';
import { useMemo, useState } from 'react';
import { Button } from '@arcadeum/ui';
import {
  ANNOUNCEMENT_AUDIENCES,
  ANNOUNCEMENT_LOCALES,
  ANNOUNCEMENT_SEVERITIES,
  type AdminAnnouncementItem,
  type AnnouncementAudience,
  type AnnouncementLocale,
  type AnnouncementSeverity,
  type CreateAnnouncementBody,
  type LocaleContent,
} from '../api';
import { isSafeCtaHref } from '@/widgets/AnnouncementBanner/lib/ctaHrefSafety';

export interface AdminAnnouncementFormLabels {
  sections: { settings: string; content: string };
  severity: string;
  severityLabels: Record<AnnouncementSeverity, string>;
  audience: string;
  audienceLabels: Record<AnnouncementAudience, string>;
  startsAt: string;
  endsAt: string;
  immediately: string;
  forever: string;
  tabs: Record<AnnouncementLocale, string>;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  errors: {
    titleRequired: string;
    endsBeforeStarts: string;
    invalidUrl: string;
  };
  cancel: string;
  save: string;
}

export interface AdminAnnouncementFormProps {
  initial?: AdminAnnouncementItem | null;
  isSubmitting?: boolean;
  onSubmit: (body: CreateAnnouncementBody) => void;
  onCancel: () => void;
  labels: AdminAnnouncementFormLabels;
}

interface FormState {
  severity: AnnouncementSeverity;
  audience: AnnouncementAudience;
  startsAt: string;
  endsAt: string;
  content: Record<AnnouncementLocale, LocaleContent>;
  activeLocale: AnnouncementLocale;
}

const emptyLocale = (): LocaleContent => ({
  title: '',
  body: '',
  ctaLabel: '',
  ctaHref: '',
});

function toFormState(initial: AdminAnnouncementItem | null): FormState {
  const content: Record<AnnouncementLocale, LocaleContent> = {
    en: emptyLocale(),
    ru: emptyLocale(),
    es: emptyLocale(),
    fr: emptyLocale(),
    by: emptyLocale(),
  };
  if (initial) {
    for (const loc of ANNOUNCEMENT_LOCALES) {
      const c = initial.content[loc];
      if (c) {
        content[loc] = {
          title: c.title,
          body: c.body ?? '',
          ctaLabel: c.ctaLabel ?? '',
          ctaHref: c.ctaHref ?? '',
        };
      }
    }
  }
  return {
    severity: initial?.severity ?? 'info',
    audience: initial?.audience ?? 'all',
    startsAt: initial?.startsAt ? initial.startsAt.slice(0, 16) : '',
    endsAt: initial?.endsAt ? initial.endsAt.slice(0, 16) : '',
    content,
    activeLocale: 'en',
  };
}

function toBody(s: FormState): CreateAnnouncementBody {
  const content = ANNOUNCEMENT_LOCALES.reduce(
    (acc, loc) => {
      const c = s.content[loc];
      if (c.title.trim()) {
        const out: LocaleContent = { title: c.title.trim() };
        if (c.body?.trim()) out.body = c.body.trim();
        if (c.ctaLabel?.trim()) out.ctaLabel = c.ctaLabel.trim();
        if (c.ctaHref?.trim()) out.ctaHref = c.ctaHref.trim();
        acc[loc] = out;
      }
      return acc;
    },
    {} as Record<string, LocaleContent>,
  );
  if (!('en' in content)) {
    // Defensive: callers should validate, but ensure shape
    content.en = { title: s.content.en.title.trim() };
  }
  return {
    severity: s.severity,
    audience: s.audience,
    startsAt: s.startsAt ? new Date(s.startsAt).toISOString() : null,
    endsAt: s.endsAt ? new Date(s.endsAt).toISOString() : null,
    content: content as CreateAnnouncementBody['content'],
  };
}

export function validateForm(
  s: FormState,
  labels: AdminAnnouncementFormLabels,
): string[] {
  const errors: string[] = [];
  if (!s.content.en.title.trim()) errors.push(labels.errors.titleRequired);
  if (s.startsAt && s.endsAt) {
    const start = new Date(s.startsAt).getTime();
    const end = new Date(s.endsAt).getTime();
    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      errors.push(labels.errors.endsBeforeStarts);
    }
  }
  for (const loc of ANNOUNCEMENT_LOCALES) {
    const href = s.content[loc].ctaHref?.trim();
    if (href && !isSafeCtaHref(href)) {
      errors.push(labels.errors.invalidUrl);
      break;
    }
  }
  return errors;
}

const INPUT_STYLE = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #555',
  background: 'transparent',
  color: 'inherit' as const,
  width: '100%',
};

export function AdminAnnouncementForm({
  initial,
  isSubmitting,
  onSubmit,
  onCancel,
  labels,
}: AdminAnnouncementFormProps) {
  const [state, setState] = useState<FormState>(() =>
    toFormState(initial ?? null),
  );
  const errors = useMemo(() => validateForm(state, labels), [state, labels]);
  const canSubmit = errors.length === 0 && !isSubmitting;

  const updateLocale = (
    loc: AnnouncementLocale,
    field: keyof LocaleContent,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [loc]: { ...prev.content[loc], [field]: value },
      },
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(toBody(state));
  };

  const active = state.content[state.activeLocale];

  return (
    <div
      className="flex flex-col items-stretch gap-3 p-3 rounded-2xl border border-[var(--borderColor)] bg-[var(--background)] max-w-[720px]"
      data-testid="announcement-form"
    >
      <span className="font-bold text-[20px]">{labels.sections.settings}</span>

      <div className="flex flex-row gap-3 items-center flex-wrap">
        <span className="">{labels.severity}</span>
        <select
          data-testid="form-severity"
          value={state.severity}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              severity: e.target.value as AnnouncementSeverity,
            }))
          }
          style={{ ...INPUT_STYLE, width: 'auto' }}
        >
          {ANNOUNCEMENT_SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {labels.severityLabels[s]}
            </option>
          ))}
        </select>

        <span className="">{labels.audience}</span>
        <select
          data-testid="form-audience"
          value={state.audience}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              audience: e.target.value as AnnouncementAudience,
            }))
          }
          style={{ ...INPUT_STYLE, width: 'auto' }}
        >
          {ANNOUNCEMENT_AUDIENCES.map((a) => (
            <option key={a} value={a}>
              {labels.audienceLabels[a]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-row gap-3 items-center flex-wrap">
        <div className="flex flex-col items-stretch">
          <span className="text-[12px] opacity-[0.7]">{labels.startsAt}</span>
          <input
            type="datetime-local"
            data-testid="form-startsAt"
            value={state.startsAt}
            onChange={(e) =>
              setState((s) => ({ ...s, startsAt: e.target.value }))
            }
            style={INPUT_STYLE}
          />
        </div>
        <div className="flex flex-col items-stretch">
          <span className="text-[12px] opacity-[0.7]">{labels.endsAt}</span>
          <input
            type="datetime-local"
            data-testid="form-endsAt"
            value={state.endsAt}
            onChange={(e) =>
              setState((s) => ({ ...s, endsAt: e.target.value }))
            }
            style={INPUT_STYLE}
          />
        </div>
      </div>

      <span className="font-bold text-[20px] -mt-2">
        {labels.sections.content}
      </span>

      <div className="flex flex-row items-stretch gap-2 flex-wrap">
        {ANNOUNCEMENT_LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            data-testid={`form-tab-${loc}`}
            onClick={() => setState((s) => ({ ...s, activeLocale: loc }))}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #555',
              cursor: 'pointer',
              background:
                state.activeLocale === loc
                  ? 'rgba(255,255,255,0.1)'
                  : 'transparent',
              color: 'inherit',
              fontWeight: state.activeLocale === loc ? 600 : 400,
            }}
          >
            {labels.tabs[loc]}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-stretch gap-2">
        <span className="text-[12px] opacity-[0.7]">
          {labels.title}
          {state.activeLocale === 'en' ? ' *' : ''}
        </span>
        <input
          data-testid={`form-title-${state.activeLocale}`}
          value={active.title}
          onChange={(e) =>
            updateLocale(state.activeLocale, 'title', e.target.value)
          }
          style={INPUT_STYLE}
          maxLength={120}
        />
        <span className="text-[12px] opacity-[0.7]">{labels.body}</span>
        <textarea
          data-testid={`form-body-${state.activeLocale}`}
          value={active.body ?? ''}
          onChange={(e) =>
            updateLocale(state.activeLocale, 'body', e.target.value)
          }
          rows={3}
          maxLength={500}
          style={{ ...INPUT_STYLE, fontFamily: 'inherit' }}
        />
        <div className="flex flex-row items-stretch gap-3">
          <div className="flex flex-col items-stretch flex-1">
            <span className="text-[12px] opacity-[0.7]">{labels.ctaLabel}</span>
            <input
              data-testid={`form-ctaLabel-${state.activeLocale}`}
              value={active.ctaLabel ?? ''}
              onChange={(e) =>
                updateLocale(state.activeLocale, 'ctaLabel', e.target.value)
              }
              style={INPUT_STYLE}
              maxLength={60}
            />
          </div>
          <div className="flex flex-col items-stretch flex-[2]">
            <span className="text-[12px] opacity-[0.7]">{labels.ctaHref}</span>
            <input
              data-testid={`form-ctaHref-${state.activeLocale}`}
              value={active.ctaHref ?? ''}
              onChange={(e) =>
                updateLocale(state.activeLocale, 'ctaHref', e.target.value)
              }
              style={INPUT_STYLE}
            />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="flex flex-col items-stretch p-2 rounded-lg bg-[var(--errorBgSoft)]"
          data-testid="form-errors"
        >
          {errors.map((err) => (
            <span className="text-[12px] text-[var(--errorText)]" key={err}>
              • {err}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-row items-stretch gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} data-testid="form-cancel">
          {labels.cancel}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          data-testid="form-submit"
        >
          {labels.save}
        </Button>
      </div>
    </div>
  );
}
