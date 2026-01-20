import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '@/app/shop/cartSlice';

describe('Cart Slice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cart: cartReducer
      }
    });
  });

  const mockCartItem = {
    id: '1',
    name: 'Nutella',
    price: 4.99,
    quantity: 1
  };

  it('should have initial empty cart', () => {
    const state = store.getState().cart;
    expect(state.items).toEqual([]);
  });

  it('should add item to cart', () => {
    store.dispatch(addToCart(mockCartItem));
    const state = store.getState().cart;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('1');
    expect(state.items[0].name).toBe('Nutella');
    expect(state.items[0].quantity).toBe(1);
  });

  it('should increase quantity when adding same item', () => {
    store.dispatch(addToCart(mockCartItem));
    store.dispatch(addToCart({ ...mockCartItem, quantity: 1 }));
    const state = store.getState().cart;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('should remove item from cart', () => {
    store.dispatch(addToCart(mockCartItem));
    store.dispatch(removeFromCart('1'));
    const state = store.getState().cart;
    expect(state.items).toHaveLength(0);
  });

  it('should update item quantity', () => {
    store.dispatch(addToCart(mockCartItem));
    store.dispatch(updateQuantity({ id: '1', quantity: 5 }));
    const state = store.getState().cart;
    expect(state.items[0].quantity).toBe(5);
  });

  it('should clear entire cart', () => {
    store.dispatch(addToCart(mockCartItem));
    store.dispatch(addToCart({ ...mockCartItem, id: '2', name: 'Coca Cola' }));
    store.dispatch(clearCart());
    const state = store.getState().cart;
    expect(state.items).toHaveLength(0);
  });

  it('should handle multiple different products', () => {
    const item2 = { id: '2', name: 'Coca Cola', price: 2.49, quantity: 1 };
    store.dispatch(addToCart(mockCartItem));
    store.dispatch(addToCart(item2));
    const state = store.getState().cart;
    expect(state.items).toHaveLength(2);
  });

  it('should calculate correct total price', () => {
    store.dispatch(addToCart({ ...mockCartItem, quantity: 3 }));
    const state = store.getState().cart;
    const total = state.items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    expect(total).toBeCloseTo(14.97, 2);
  });

  it('should handle adding items with different quantities', () => {
    store.dispatch(addToCart({ ...mockCartItem, quantity: 2 }));
    const state = store.getState().cart;
    expect(state.items[0].quantity).toBe(2);
  });

  it('should maintain separate items with different ids', () => {
    const item2 = { id: '2', name: 'Coca Cola', price: 2.49, quantity: 1 };
    store.dispatch(addToCart(mockCartItem));
    store.dispatch(addToCart(item2));
    const state = store.getState().cart;
    expect(state.items.find(i => i.id === '1')).toBeDefined();
    expect(state.items.find(i => i.id === '2')).toBeDefined();
  });
});
