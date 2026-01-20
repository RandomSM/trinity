import { store } from '../../src/store/store';

describe('Store', () => {
  it('should have cart reducer', () => {
    expect(store.getState().cart).toBeDefined();
  });

  it('should have user reducer', () => {
    expect(store.getState().user).toBeDefined();
  });

  it('should have products reducer', () => {
    expect(store.getState().products).toBeDefined();
  });

  it('should initialize with empty cart', () => {
    const state = store.getState();
    expect(state.cart.items).toEqual([]);
  });

  it('should initialize with null user', () => {
    const state = store.getState();
    expect(state.user.user).toBeNull();
  });
});
