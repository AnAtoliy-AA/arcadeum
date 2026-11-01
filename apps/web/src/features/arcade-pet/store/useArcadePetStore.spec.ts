import { beforeEach, describe, expect, it } from 'vitest';
import { useArcadePetStore } from './useArcadePetStore';

describe('useArcadePetStore', () => {
  beforeEach(() => {
    useArcadePetStore.setState({
      pet: null,
      pets: [],
      activePetId: null,
      gemBalance: 300,
      adoptionCount: 0,
      queuedThemeForNextPet: null,
      presents: [
        {
          id: 'test-present-1',
          senderId: 'friend-1',
          senderName: 'Alice',
          species: 'dragon',
          theme: 'fantasy',
          petName: 'Fae Drake',
          message: 'Enjoy this buddy!',
          createdAt: Date.now(),
          isOpened: false,
        },
      ],
      isWidgetOpen: false,
      activeTreat: null,
    });
  });

  it('initializes first mount as free and active', () => {
    useArcadePetStore.getState().initialize('test-user', 'cyberpunk');
    const state = useArcadePetStore.getState();
    expect(state.pet).toBeDefined();
    expect(state.pets.length).toBe(1);
    expect(state.adoptionCount).toBe(1);
  });

  it('adopts second pet with progressive gem cost', () => {
    useArcadePetStore.setState({
      adoptionCount: 1,
      gemBalance: 200,
      pets: [],
    });

    const result = useArcadePetStore.getState().adoptRandomPet();
    expect(result.success).toBe(true);
    expect(useArcadePetStore.getState().gemBalance).toBe(150);
    expect(useArcadePetStore.getState().adoptionCount).toBe(2);
  });

  it('prevents random adoption when gemBalance are insufficient', () => {
    useArcadePetStore.setState({
      adoptionCount: 2,
      gemBalance: 50,
      pets: [],
    });

    const result = useArcadePetStore.getState().adoptRandomPet();
    expect(result.success).toBe(false);
    expect(result.error).toBe('INSUFFICIENT_GEMS');
  });

  it('guarantees bought game theme for next pet roll', () => {
    useArcadePetStore.getState().buyGameTheme('underwater');
    expect(useArcadePetStore.getState().queuedThemeForNextPet).toBe(
      'underwater',
    );

    useArcadePetStore.setState({
      adoptionCount: 0,
      gemBalance: 100,
    });

    const result = useArcadePetStore.getState().adoptRandomPet();
    expect(result.success).toBe(true);
    expect(result.pet?.theme).toBe('underwater');
    expect(useArcadePetStore.getState().queuedThemeForNextPet).toBeNull();
  });

  it('adopts VIP selected pet with expensive 750 gem price', () => {
    useArcadePetStore.setState({
      gemBalance: 800,
      pets: [],
      adoptionCount: 1,
    });

    const result = useArcadePetStore
      .getState()
      .adoptSelectedPet('cyber_cat', 'steampunk', 'Brass Whiskers');

    expect(result.success).toBe(true);
    expect(result.pet?.species).toBe('cyber_cat');
    expect(result.pet?.theme).toBe('steampunk');
    expect(result.pet?.name).toBe('Brass Whiskers');
    expect(useArcadePetStore.getState().gemBalance).toBe(50);
  });

  it('sends pet gift to friend and deducts 50 gemBalance', () => {
    useArcadePetStore.setState({ gemBalance: 100 });
    const result = useArcadePetStore.getState().sendGiftPet('friend-2', 'Bob', {
      species: 'dino',
      theme: 'western',
      petName: 'Sheriff Rex',
      message: 'Happy gaming!',
    });

    expect(result.success).toBe(true);
    expect(useArcadePetStore.getState().gemBalance).toBe(50);
  });

  it('claims present and adds gifted pet with bonus gemBalance', () => {
    useArcadePetStore.setState({
      gemBalance: 100,
      pets: [],
    });

    const result = useArcadePetStore.getState().claimPresent('test-present-1');

    expect(result.success).toBe(true);
    expect(result.present?.petName).toBe('Fae Drake');
    expect(useArcadePetStore.getState().pets.length).toBe(1);
    expect(useArcadePetStore.getState().pets[0]?.name).toBe('Fae Drake');
    expect(useArcadePetStore.getState().gemBalance).toBe(150);
  });

  it('awards treat to inventory', () => {
    useArcadePetStore.getState().initialize('test-user', 'retro');
    useArcadePetStore.getState().awardTreat('chess_cookie');
    const pet = useArcadePetStore.getState().pet;
    expect(pet?.inventory.chess_cookie).toBeGreaterThanOrEqual(1);
  });

  it('toggles widget modal open and closed', () => {
    expect(useArcadePetStore.getState().isWidgetOpen).toBe(false);
    useArcadePetStore.getState().toggleWidget();
    expect(useArcadePetStore.getState().isWidgetOpen).toBe(true);
    useArcadePetStore.getState().toggleWidget();
    expect(useArcadePetStore.getState().isWidgetOpen).toBe(false);
  });
});
