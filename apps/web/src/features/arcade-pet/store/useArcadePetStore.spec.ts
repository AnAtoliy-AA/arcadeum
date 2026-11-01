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

  it('initializes by default with no pet until player adopts', () => {
    useArcadePetStore.getState().initialize('test-user', 'cyberpunk');
    const state = useArcadePetStore.getState();
    expect(state.pet).toBeNull();
    expect(state.pets.length).toBe(0);
    expect(state.adoptionCount).toBe(0);
  });

  it('adopts first mount as free and sets it active', () => {
    useArcadePetStore.getState().initialize('test-user', 'cyberpunk');
    const result = useArcadePetStore.getState().adoptRandomPet();
    expect(result.success).toBe(true);
    expect(useArcadePetStore.getState().pet).toBeDefined();
    expect(useArcadePetStore.getState().pets.length).toBe(1);
    expect(useArcadePetStore.getState().adoptionCount).toBe(1);
    expect(useArcadePetStore.getState().gemBalance).toBe(300);
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

  it('toggles pet home state', () => {
    expect(useArcadePetStore.getState().isAtHome).toBe(false);
    useArcadePetStore.getState().toggleHome();
    expect(useArcadePetStore.getState().isAtHome).toBe(true);
    useArcadePetStore.getState().toggleHome();
    expect(useArcadePetStore.getState().isAtHome).toBe(false);
  });

  it('sets pet home state directly', () => {
    useArcadePetStore.getState().setAtHome(true);
    expect(useArcadePetStore.getState().isAtHome).toBe(true);
    useArcadePetStore.getState().setAtHome(false);
    expect(useArcadePetStore.getState().isAtHome).toBe(false);
  });

  it('allows admin to gift pet for 0 gems with official admin attribution', () => {
    useArcadePetStore.setState({ gemBalance: 0, presents: [] });
    const result = useArcadePetStore.getState().sendGiftPet(
      'lucky-player',
      'Lucky',
      {
        species: 'cyber_cat',
        theme: 'cyberpunk',
        petName: 'Admin Cyber Cat',
      },
      true,
    );

    expect(result.success).toBe(true);
    expect(useArcadePetStore.getState().gemBalance).toBe(0);
    const presents = useArcadePetStore.getState().presents;
    expect(presents.length).toBe(1);
    expect(presents[0]?.senderId).toBe('admin');
    expect(presents[0]?.senderName).toBe('👑 Arcadeum Admin');
    expect(presents[0]?.species).toBe('cyber_cat');
    expect(presents[0]?.message).toBe('Official Administrator Gift');
  });

  it('does not load unconfirmed collection or legacy unconfirmed pet without care confirmation', () => {
    window.localStorage.setItem(
      'arcadeum_pet_collection_v2',
      JSON.stringify({
        pets: [
          {
            id: 'legacy-pet-1',
            name: 'ArcadePet',
            species: 'slime',
            stage: 'egg',
            theme: 'retro',
            stats: { hunger: 80, happiness: 80 },
            timestamps: { bornAt: Date.now() },
            inventory: {},
          },
        ],
        activePetId: 'legacy-pet-1',
        gemBalance: 300,
        adoptionCount: 0,
        queuedThemeForNextPet: null,
        presents: [],
        hasConfirmedCare: false,
      }),
    );

    useArcadePetStore.getState().initialize('test-user', 'cyberpunk');
    expect(useArcadePetStore.getState().pet).toBeNull();
    expect(useArcadePetStore.getState().pets.length).toBe(0);
    expect(useArcadePetStore.getState().hasConfirmedCare).toBe(false);
  });

  it('charges 1 coin when feeding a snack', () => {
    useArcadePetStore.setState({
      adoptionCount: 0,
      gemBalance: 300,
      coinBalance: 5,
    });
    useArcadePetStore.getState().adoptRandomPet();

    const initialCoins = useArcadePetStore.getState().coinBalance;
    const initialHunger = useArcadePetStore.getState().pet?.stats.hunger ?? 0;

    const result = useArcadePetStore.getState().performAction('feed_snack');
    expect(result.success).toBe(true);
    expect(useArcadePetStore.getState().coinBalance).toBe(initialCoins - 1);
    expect(
      useArcadePetStore.getState().pet?.stats.hunger,
    ).toBeGreaterThanOrEqual(initialHunger);
  });

  it('prevents feeding snack when coins are zero and sets actionError', () => {
    useArcadePetStore.setState({
      adoptionCount: 0,
      gemBalance: 300,
      coinBalance: 0,
    });
    useArcadePetStore.getState().adoptRandomPet();

    const result = useArcadePetStore.getState().performAction('feed_snack');
    expect(result.success).toBe(false);
    expect(result.error).toBe('INSUFFICIENT_COINS');
    expect(useArcadePetStore.getState().actionError).toContain('1 Coin');
  });

  it('charges escalating food cost based on pet collection index (1, 5, 20)', () => {
    useArcadePetStore.setState({
      adoptionCount: 0,
      gemBalance: 1000,
      coinBalance: 50,
      pets: [],
    });

    useArcadePetStore.getState().adoptRandomPet();
    useArcadePetStore.getState().adoptRandomPet();
    useArcadePetStore.getState().adoptRandomPet();

    const { pets } = useArcadePetStore.getState();
    expect(pets.length).toBe(3);

    const pet1 = pets[0]!;
    const pet2 = pets[1]!;
    const pet3 = pets[2]!;

    useArcadePetStore.getState().selectActivePet(pet1.id);
    const res1 = useArcadePetStore.getState().performAction('feed_snack');
    expect(res1.success).toBe(true);
    expect(useArcadePetStore.getState().coinBalance).toBe(49);

    useArcadePetStore.getState().selectActivePet(pet2.id);
    const res2 = useArcadePetStore.getState().performAction('feed_snack');
    expect(res2.success).toBe(true);
    expect(useArcadePetStore.getState().coinBalance).toBe(44);

    useArcadePetStore.getState().selectActivePet(pet3.id);
    const res3 = useArcadePetStore.getState().performAction('feed_snack');
    expect(res3.success).toBe(true);
    expect(useArcadePetStore.getState().coinBalance).toBe(24);
  });

  it('rejects snack feeding with correct error message when 2nd or 3rd pet food is unaffordable', () => {
    useArcadePetStore.setState({
      adoptionCount: 0,
      gemBalance: 1000,
      coinBalance: 3,
      pets: [],
    });

    useArcadePetStore.getState().adoptRandomPet();
    useArcadePetStore.getState().adoptRandomPet();

    const pet2 = useArcadePetStore.getState().pets[1]!;
    useArcadePetStore.getState().selectActivePet(pet2.id);

    const res = useArcadePetStore.getState().performAction('feed_snack');
    expect(res.success).toBe(false);
    expect(res.error).toBe('INSUFFICIENT_COINS');
    expect(useArcadePetStore.getState().actionError).toContain('5 Coins');
  });

  it('freezes hunger timestamps when toggling home or setting home', () => {
    useArcadePetStore.setState({
      adoptionCount: 0,
      gemBalance: 300,
      coinBalance: 50,
      isAtHome: false,
    });
    useArcadePetStore.getState().adoptRandomPet();

    const before = Date.now();
    useArcadePetStore.getState().toggleHome();
    expect(useArcadePetStore.getState().isAtHome).toBe(true);
    const pet = useArcadePetStore.getState().pet;
    expect(pet?.timestamps.lastInteractedAt).toBeGreaterThanOrEqual(before);
  });
});
