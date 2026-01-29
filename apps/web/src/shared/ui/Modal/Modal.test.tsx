import { render, screen, fireEvent } from '@testing-library/react';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from './Modal';
import { ThemeProvider } from 'styled-components';
import { themeTokens } from '@/shared/config/theme';
import { describe, it, expect, vi } from 'vitest';

const theme = themeTokens.dark;

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Modal', () => {
  it('does not render when open is false', () => {
    renderWithTheme(
      <Modal open={false}>
        <div>Modal Content</div>
      </Modal>,
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    renderWithTheme(
      <Modal open={true}>
        <div>Modal Content</div>
      </Modal>,
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('calls onClose when clicking overlay', () => {
    const handleClose = vi.fn();
    renderWithTheme(
      <Modal open={true} onClose={handleClose}>
        <ModalContent>
          <div>Content</div>
        </ModalContent>
      </Modal>,
    );

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape', () => {
    const handleClose = vi.fn();
    renderWithTheme(
      <Modal open={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders close button in Header and calls onClose', () => {
    const handleClose = vi.fn();
    renderWithTheme(
      <Modal open={true}>
        <ModalHeader onClose={handleClose}>Title</ModalHeader>
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders with all Modal sub-components', () => {
    renderWithTheme(
      <Modal open={true}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>My Title</ModalTitle>
          </ModalHeader>
          <ModalBody>My Body</ModalBody>
          <ModalFooter>My Footer</ModalFooter>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Body')).toBeInTheDocument();
    expect(screen.getByText('My Footer')).toBeInTheDocument();
  });
});
