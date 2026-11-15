import { render as rtlRender, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChatMessage } from './ChatMessage';

const render = (ui: React.ReactElement) => rtlRender(ui);

describe('ChatMessage', () => {
  it('renders chat message text with sender name', () => {
    render(<ChatMessage content="Hello world" senderName="Alice" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders chat message text even when sender name is missing', () => {
    render(<ChatMessage content="Anonymous text message" />);
    expect(screen.getByText('Anonymous text message')).toBeInTheDocument();
  });

  it('renders system message text', () => {
    render(<ChatMessage content="Player moved to cell 3" type="system" />);
    expect(screen.getByText('Player moved to cell 3')).toBeInTheDocument();
  });
});
