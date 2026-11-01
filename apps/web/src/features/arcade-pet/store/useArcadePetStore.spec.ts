import { beforeEach, describe, expect, it } from 'vitest';
import { useArcadePetStore } from './useArcadePetStore';

describe('useArcadePetStore', () => {
  beforeEach(() => {
    useArcadePetStore.setState({
      pet: null,
      isWidgetOpen: false,
      activeTreat: null,
    });
  });

  it('initializes default pet state', () => {
    useArcadePetStore.getState().initialize('test-user', 'retro');
    const pet = useArcadePetStore.getState().pet;
    expect(pet).toBeDefined();
    expect(pet?.stage).toBe('egg');
  });

  it('hatches pet into baby dragon', () => {
    useArcadePetStore.getState().initialize('test-user', 'retro');
    useArcadePetStore.getState().hatch('Draco', 'dragon', 'cyberpunk');
    const pet = useArcadePetStore.getState().pet;
    expect(pet?.stage).toBe('baby');
    expect(pet?.name).toBe('Draco');
    expect(pet?.species).toBe('dragon');
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
