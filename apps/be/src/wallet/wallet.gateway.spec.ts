import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { WalletGateway } from './wallet.gateway';

interface SocketMock {
  id: string;
  data: Record<string, unknown>;
  handshake: { auth: Record<string, unknown> };
  join: jest.Mock;
  disconnect: jest.Mock;
}

const SECRET = 'test-secret';

function makeGateway(verify: jest.Mock): WalletGateway {
  const jwt = {
    verifyAsync: verify,
  } as unknown as JwtService;
  const config = {
    get: (key: string) => (key === 'AUTH_JWT_SECRET' ? SECRET : undefined),
  } as unknown as ConfigService;
  return new WalletGateway(jwt, config);
}

function makeClient(auth: Record<string, unknown>): SocketMock {
  return {
    id: 'socket-1',
    data: {},
    handshake: { auth },
    join: jest.fn(),
    // Spy so tests can assert the `close` argument — a hard engine close
    // (`true`) would tear down every namespace multiplexed on the same
    // connection, which is exactly the staging incident this guards against.
    disconnect: jest.fn(),
  };
}

describe('WalletGateway.handleConnection', () => {
  it('joins the user room on a valid token without disconnecting', async () => {
    const verify = jest.fn().mockResolvedValue({ sub: 'user-1' });
    const gateway = makeGateway(verify);
    const client = makeClient({ token: 'valid.jwt.token' });

    await gateway.handleConnection(client as unknown as Socket);

    expect(verify).toHaveBeenCalledWith('valid.jwt.token', { secret: SECRET });
    expect(client.join).toHaveBeenCalledWith('user-1');
    expect(client.data['userId']).toBe('user-1');
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('disconnects namespace-only (not the shared engine) on an invalid token', async () => {
    const verify = jest.fn().mockRejectedValue(new Error('jwt malformed'));
    const gateway = makeGateway(verify);
    const client = makeClient({ token: 'not-a-jwt' });

    await gateway.handleConnection(client as unknown as Socket);

    expect(client.join).not.toHaveBeenCalled();
    expect(client.disconnect).toHaveBeenCalledTimes(1);
    expect(client.disconnect).toHaveBeenCalledWith(false);
    expect(client.disconnect).not.toHaveBeenCalledWith(true);
  });

  it('disconnects namespace-only when the token is missing', async () => {
    const verify = jest.fn();
    const gateway = makeGateway(verify);
    const client = makeClient({});

    await gateway.handleConnection(client as unknown as Socket);

    expect(verify).not.toHaveBeenCalled();
    expect(client.disconnect).toHaveBeenCalledWith(false);
  });
});
