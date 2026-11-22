import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from './Modal';

import { describe, it, expect, vi } from 'vitest';

const render = (ui: React.ReactElement) => rtlRender(ui);

describe('Modal', () => {
  it('does not render when open is false', () => {
    render(
      <Modal open={false}>
        <ModalContent data-testid="modal-content">Modal Content</ModalContent>
      </Modal>,
    );
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(
      <Modal open={true}>
        <ModalContent data-testid="modal-content">Modal Content</ModalContent>
      </Modal>,
    );
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('calls onClose when clicking the backdrop', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <ModalContent data-testid="modal-content">
          <div>Content</div>
        </ModalContent>
      </Modal>,
    );

    const backdrop = document.querySelector('[class*="fixed inset-0"]');
    fireEvent.click(backdrop as HTMLElement);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking the content', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <ModalContent data-testid="modal-content">Content</ModalContent>
      </Modal>,
    );

    fireEvent.click(screen.getByTestId('modal-content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <ModalContent>Content</ModalContent>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders close button in Header and calls onClose', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true}>
        <ModalHeader onClose={handleClose}>Title</ModalHeader>
      </Modal>,
    );

    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders with all Modal sub-components', () => {
    render(
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

describe('Modal accessibility', () => {
  it('labels the dialog and the close button', () => {
    render(
      <Modal open={true} onClose={vi.fn()} ariaLabel="Settings">
        <ModalContent>
          <ModalHeader onClose={vi.fn()} closeLabel="Fermer">
            <ModalTitle>Settings</ModalTitle>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Settings' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
  });

  it('prefers aria-labelledby when a title id is provided', () => {
    render(
      <Modal open={true} ariaLabelledBy="t1">
        <ModalContent>
          <ModalTitle id="t1">Visible title</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Visible title' }),
    ).toBeInTheDocument();
  });

  it('traps Tab focus inside the dialog', () => {
    render(
      <Modal open={true} onClose={vi.fn()} ariaLabel="Trap">
        <ModalContent>
          <button>first</button>
          <button>last</button>
        </ModalContent>
      </Modal>,
    );
    const first = screen.getByText('first');
    const last = screen.getByText('last');
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} ariaLabel="Esc">
        <ModalContent>x</ModalContent>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
