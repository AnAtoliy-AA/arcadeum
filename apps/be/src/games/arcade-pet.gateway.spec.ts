import type { Socket } from 'socket.io';
import type { ArcadePetCollectionService } from '../arcade-pet/arcade-pet-collection.service';
import type { ArcadePetFeatureService } from '../arcade-pet/arcade-pet-feature.service';
import { ArcadePetGateway } from './arcade-pet.gateway';

describe('ArcadePetGateway', () => {
  const getCollection = jest.fn();
  const isEnabledFor = jest.fn();
  const gateway = new ArcadePetGateway(
    { getCollection } as unknown as ArcadePetCollectionService,
    { isEnabledFor } as unknown as ArcadePetFeatureService,
  );
  const start = gateway.handlers['arcadePet.session.start'];

  const makeSocket = (data: Record<string, unknown>) => {
    const emit = jest.fn();
    return { socket: { data, emit } as unknown as Socket, emit };
  };

  beforeEach(() => {
    jest.resetAllMocks();
    isEnabledFor.mockResolvedValue(true);
  });

  it('sends the collection of the authenticated connection user', async () => {
    getCollection.mockResolvedValue({ revision: 3 });
    const { socket, emit } = makeSocket({ userId: 'u1', authenticated: true });
    await start(socket, {});
    expect(isEnabledFor).toHaveBeenCalledWith('u1');
    expect(getCollection).toHaveBeenCalledWith('u1');
    expect(emit).toHaveBeenCalledWith('arcadePet.session.started', {
      revision: 3,
    });
  });

  it('answers 404 and loads nothing while the feature flag is off', async () => {
    isEnabledFor.mockResolvedValue(false);
    const { socket, emit } = makeSocket({ userId: 'u1', authenticated: true });
    await start(socket, {});
    expect(getCollection).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith('arcadePet.session.error', {
      statusCode: 404,
      message: 'Not Found',
    });
  });

  it('ignores unauthenticated sockets without touching the flag', async () => {
    const { socket, emit } = makeSocket({ userId: 'u1', authenticated: false });
    await start(socket, {});
    expect(isEnabledFor).not.toHaveBeenCalled();
    expect(getCollection).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('ignores sockets without a user id and never trusts payload ids', async () => {
    const { socket, emit } = makeSocket({ authenticated: true });
    await start(socket, { userId: 'victim' });
    expect(getCollection).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
