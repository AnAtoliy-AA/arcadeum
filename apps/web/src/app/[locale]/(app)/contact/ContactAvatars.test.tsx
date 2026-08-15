import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ContactAvatars } from './ContactAvatars';

const Wrapper = ({ children }: { children: React.ReactNode }) => children;

describe('ContactAvatars', () => {
  it('renders the requested number of avatars', () => {
    render(
      <Wrapper>
        <ContactAvatars count={4} />
      </Wrapper>,
    );
    const stack = screen.getByTestId('contact-avatars');
    expect(stack.querySelectorAll('[data-avatar]').length).toBe(4);
  });

  it('marks the stack aria-hidden so the row is decorative', () => {
    render(
      <Wrapper>
        <ContactAvatars count={2} />
      </Wrapper>,
    );
    expect(screen.getByTestId('contact-avatars')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('uses the explicit borderColor prop when provided', () => {
    render(
      <Wrapper>
        <ContactAvatars count={1} borderColor="rgb(10, 20, 30)" />
      </Wrapper>,
    );
    const stack = screen.getByTestId('contact-avatars');
    const inner = stack.querySelector('[data-avatar]') as HTMLElement;
    expect(inner.style.borderColor).toBe('rgb(10, 20, 30)');
  });
});
