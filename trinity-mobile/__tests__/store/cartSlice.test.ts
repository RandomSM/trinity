import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../../src/store/cartSlice';

describe('cartSlice', () => {
  const initialState = {
    items: [],
  };

  const sampleProduct = {
    id: '123',
    name: 'Test Product',
    price: 9.99,
    quantity: 1,
  };

  it('should return initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should add item to cart', () => {
    const state = cartReducer(initialState, addToCart(sampleProduct));
    
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(sampleProduct);
  });

  it('should increment quantity when adding existing item', () => {
    const stateWithItem = {
      items: [sampleProduct],
    };

    const state = cartReducer(stateWithItem, addToCart(sampleProduct));
    
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('should remove item from cart', () => {
    const stateWithItem = {
      items: [sampleProduct],
    };

    const state = cartReducer(stateWithItem, removeFromCart(sampleProduct.id));
    
    expect(state.items).toHaveLength(0);
  });

  it('should update item quantity', () => {
    const stateWithItem = {
      items: [sampleProduct],
    };

    const state = cartReducer(stateWithItem, updateQuantity({ id: sampleProduct.id, quantity: 5 }));
    
    expect(state.items[0].quantity).toBe(5);
  });

  it('should clear all items from cart', () => {
    const stateWithItems = {
      items: [
        sampleProduct,
        { ...sampleProduct, id: '456' },
      ],
    };

    const state = cartReducer(stateWithItems, clearCart());
    
    expect(state.items).toHaveLength(0);
  });

  it('should calculate total correctly', () => {
    const state = {
      items: [
        { id: '1', name: 'Product 1', price: 10.00, quantity: 2 },
        { id: '2', name: 'Product 2', price: 5.50, quantity: 3 },
      ],
    };

    const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    expect(total).toBe(36.50);
  });

  it('should handle adding multiple different items', () => {
    let state = initialState;
    
    state = cartReducer(state, addToCart({ id: '1', name: 'Product 1', price: 10, quantity: 1 }));
    state = cartReducer(state, addToCart({ id: '2', name: 'Product 2', price: 20, quantity: 1 }));
    
    expect(state.items).toHaveLength(2);
    expect(state.items[0].id).toBe('1');
    expect(state.items[1].id).toBe('2');
  });

  it('should not update quantity for non-existent item', () => {
    const stateWithItem = {
      items: [sampleProduct],
    };

    const state = cartReducer(stateWithItem, updateQuantity({ id: 'non-existent', quantity: 5 }));
    
    expect(state.items[0].quantity).toBe(1);
  });

  it('should handle removing non-existent item gracefully', () => {
    const stateWithItem = {
      items: [sampleProduct],
    };

    const state = cartReducer(stateWithItem, removeFromCart('non-existent'));
    
    expect(state.items).toHaveLength(1);
  });
});
