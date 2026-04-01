import React from 'react';
import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { ServerLoadingNotice } from './ServerLoadingNotice';
import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>
  );
};

describe('ServerLoadingNotice', () => {

  it('renders progress and elapsed time', () => {
    render(
      <ServerLoadingNotice
        title="Loading"
        message="Please wait"
        progress={45}
        elapsedSeconds={10}
        supportLabel="Support"
        onSupportClick={() => { }}
      />,
    );

    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('10s')).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders correctly with labels', () => {
    render(
      <ServerLoadingNotice
        title="Loading Title"
        message="Loading Message"
        progress={0}
        elapsedSeconds={0}
        supportLabel="Support Label"
        onSupportClick={() => { }}
      />,
    );

    expect(screen.getByText('Loading Title')).toBeInTheDocument();
    expect(screen.getByText('Support Label')).toBeInTheDocument();
  });
});
