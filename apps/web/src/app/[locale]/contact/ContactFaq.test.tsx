import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TamaguiProvider } from 'tamagui';
import config from '../../../shared/config/tamagui.config';
import { ContactFaq, getFaqItems, type FaqItem } from './ContactFaq';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const items: FaqItem[] = [
  { key: 'refund', question: 'Refunds?', answerTemplate: 'Email {{email}}.' },
  { key: 'pwd', question: 'Forgot password?', answerTemplate: 'Reset link.' },
];

describe('ContactFaq', () => {
  it('opens the first item by default', () => {
    render(
      <Wrapper>
        <ContactFaq items={items} supportEmail="hi@arc.games" />
      </Wrapper>,
    );
    expect(screen.getByText(/Email/)).toBeInTheDocument();
  });

  it('renders the email as a real mailto: anchor inside an answer', () => {
    render(
      <Wrapper>
        <ContactFaq items={items} supportEmail="hi@arc.games" />
      </Wrapper>,
    );
    const link = screen.getByRole('link', { name: 'hi@arc.games' });
    expect(link).toHaveAttribute('href', 'mailto:hi@arc.games');
  });

  it('is single-open (clicking another closes the first)', () => {
    render(
      <Wrapper>
        <ContactFaq items={items} supportEmail="x@y.z" />
      </Wrapper>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Forgot password/ }));
    expect(screen.queryByText(/Email/)).not.toBeInTheDocument();
    expect(screen.getByText('Reset link.')).toBeInTheDocument();
  });

  it('toggles closed when clicking the open item', () => {
    render(
      <Wrapper>
        <ContactFaq items={items} supportEmail="x@y.z" />
      </Wrapper>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Refunds/ }));
    expect(screen.queryByText(/Email/)).not.toBeInTheDocument();
  });

  it('uses a custom questions label when provided', () => {
    render(
      <Wrapper>
        <ContactFaq
          items={items}
          supportEmail="x@y.z"
          questionsLabel="Help topics"
        />
      </Wrapper>,
    );
    expect(screen.getByText('Help topics')).toBeInTheDocument();
  });
});

describe('getFaqItems', () => {
  it('returns [] when no faq messages', () => {
    expect(getFaqItems(undefined)).toEqual([]);
    expect(getFaqItems({ sections: {} })).toEqual([]);
  });

  it('skips entries missing question or answer', () => {
    const t = {
      sections: {
        faq: {
          refund: { question: 'Q', answer: 'A' },
          password: { question: 'Q only' },
        },
      },
    };
    const result = getFaqItems(t);
    expect(result.map((i) => i.key)).toEqual(['refund']);
  });
});
