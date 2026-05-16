import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import {
  AdminAnnouncementForm,
  type AdminAnnouncementFormLabels,
} from './AdminAnnouncementForm';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: AdminAnnouncementFormLabels = {
  sections: { settings: 'Settings', content: 'Content' },
  severity: 'Severity',
  severityLabels: { info: 'Info', warning: 'Warning', critical: 'Critical' },
  audience: 'Audience',
  audienceLabels: { all: 'All', authenticated: 'Auth', anonymous: 'Anon' },
  startsAt: 'Starts at',
  endsAt: 'Ends at',
  immediately: 'Now',
  forever: 'Forever',
  tabs: { en: 'EN', ru: 'RU', es: 'ES', fr: 'FR', by: 'BY' },
  title: 'Title',
  body: 'Body',
  ctaLabel: 'CTA label',
  ctaHref: 'CTA URL',
  errors: {
    titleRequired: 'EN title required',
    endsBeforeStarts: 'End must be after start',
    invalidUrl: 'Invalid URL',
  },
  cancel: 'Cancel',
  save: 'Save',
};

type FormProps = Parameters<typeof AdminAnnouncementForm>[0];

const renderForm = (
  props: {
    initial?: FormProps['initial'];
    onSubmit?: FormProps['onSubmit'];
    onCancel?: FormProps['onCancel'];
  } = {},
) =>
  render(
    <Wrapper>
      <AdminAnnouncementForm
        initial={props.initial}
        onSubmit={props.onSubmit ?? (() => undefined)}
        onCancel={props.onCancel ?? (() => undefined)}
        labels={labels}
      />
    </Wrapper>,
  );

describe('AdminAnnouncementForm', () => {
  it('shows EN-title-required error when EN title empty', () => {
    renderForm();
    expect(screen.getByTestId('form-errors')).toHaveTextContent(
      'EN title required',
    );
    expect(screen.getByTestId('form-submit')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('enables submit when EN title is filled', () => {
    renderForm();
    fireEvent.change(screen.getByTestId('form-title-en'), {
      target: { value: 'Hello' },
    });
    expect(screen.queryByTestId('form-errors')).not.toBeInTheDocument();
    expect(screen.getByTestId('form-submit')).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('rejects endsAt < startsAt', () => {
    renderForm();
    fireEvent.change(screen.getByTestId('form-title-en'), {
      target: { value: 'X' },
    });
    fireEvent.change(screen.getByTestId('form-startsAt'), {
      target: { value: '2026-05-10T00:00' },
    });
    fireEvent.change(screen.getByTestId('form-endsAt'), {
      target: { value: '2026-05-09T00:00' },
    });
    expect(screen.getByTestId('form-errors')).toHaveTextContent(
      'End must be after start',
    );
  });

  it('rejects unsafe ctaHref', () => {
    renderForm();
    fireEvent.change(screen.getByTestId('form-title-en'), {
      target: { value: 'X' },
    });
    fireEvent.change(screen.getByTestId('form-ctaHref-en'), {
      target: { value: 'javascript:alert(1)' },
    });
    expect(screen.getByTestId('form-errors')).toHaveTextContent('Invalid URL');
  });

  it('locale tab switch preserves other tab state', () => {
    renderForm();
    fireEvent.change(screen.getByTestId('form-title-en'), {
      target: { value: 'EN-title' },
    });
    fireEvent.click(screen.getByTestId('form-tab-ru'));
    fireEvent.change(screen.getByTestId('form-title-ru'), {
      target: { value: 'RU-title' },
    });
    fireEvent.click(screen.getByTestId('form-tab-en'));
    expect(screen.getByTestId('form-title-en')).toHaveValue('EN-title');
  });

  it('submit calls onSubmit with body containing only filled locales', () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit });
    fireEvent.change(screen.getByTestId('form-title-en'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByTestId('form-submit'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'info',
        audience: 'all',
        startsAt: null,
        endsAt: null,
        content: { en: { title: 'Hello' } },
      }),
    );
  });

  it('prefills from initial in edit mode', () => {
    renderForm({
      initial: {
        id: 'a1',
        severity: 'critical',
        audience: 'authenticated',
        startsAt: '2026-05-09T12:00:00Z',
        endsAt: null,
        content: {
          en: { title: 'Existing', body: 'Old body' },
          ru: { title: 'Существует' },
        },
        createdBy: null,
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '2026-04-02T00:00:00Z',
        status: 'active',
      },
    });
    expect(screen.getByTestId('form-title-en')).toHaveValue('Existing');
    expect(screen.getByTestId('form-body-en')).toHaveValue('Old body');
    expect(screen.getByTestId('form-severity')).toHaveValue('critical');
    expect(screen.getByTestId('form-audience')).toHaveValue('authenticated');
  });

  it('cancel button fires onCancel', () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });
    fireEvent.click(screen.getByTestId('form-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
