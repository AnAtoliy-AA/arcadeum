import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from './Modal';


import { describe, it, expect, vi, beforeEach } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

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

  it('calls onClose when clicking overlay', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        <ModalContent data-testid="modal-content">
          <div>Content</div>
        </ModalContent>
      </Modal>,
    );

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.mouseDown(overlay);
    fireEvent.mouseUp(overlay);
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
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
