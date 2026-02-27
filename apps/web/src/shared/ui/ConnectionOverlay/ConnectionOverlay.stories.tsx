import { ConnectionOverlay } from './ConnectionOverlay';

const meta = {
  title: 'Shared/ConnectionOverlay',
  component: ConnectionOverlay,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Disconnected = {
  args: {
    visible: true,
    reconnecting: false,
    title: 'Connection Lost',
    message: 'Tap anywhere or move your mouse to reconnect',
  },
};

export const Reconnecting = {
  args: {
    visible: true,
    reconnecting: true,
    reconnectingText: 'Reconnecting...',
  },
};

export const Connected = {
  args: {
    visible: false,
  },
};
