import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from './Modal';
import { Button } from '../Button';

const meta: Meta<typeof Modal> = {
  title: 'Shared/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalContent>
          <ModalHeader onClose={() => setOpen(false)}>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p style={{ margin: 0 }}>
              This is the modal body content. You can put any content here
              including forms, lists, or other components.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const Default: Story = {
  render: () => <ModalDemo />,
};

const ConfirmationModalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete Item
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalContent maxWidth="450px">
          <ModalHeader onClose={() => setOpen(false)}>
            <ModalTitle>⚠️ Confirm Delete</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p style={{ margin: 0 }}>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const ConfirmationDialog: Story = {
  render: () => <ConfirmationModalDemo />,
};

const LargeModalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Large Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalContent maxWidth="800px">
          <ModalHeader onClose={() => setOpen(false)}>
            <ModalTitle>Game Settings</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <p style={{ margin: 0 }}>
                Configure your game settings here. This is a larger modal that
                can contain more complex content.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                    }}
                  >
                    Setting {i}
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save Settings</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const LargeModal: Story = {
  render: () => <LargeModalDemo />,
};

const NoFooterModalDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Info Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalContent maxWidth="500px">
          <ModalHeader onClose={() => setOpen(false)}>
            <ModalTitle>ℹ️ Information</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p style={{ margin: 0 }}>
              This modal only has a header and body - no footer actions. Click
              the X button or press Escape to close.
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export const NoFooter: Story = {
  render: () => <NoFooterModalDemo />,
};
