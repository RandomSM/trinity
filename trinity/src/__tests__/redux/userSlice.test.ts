import { configureStore } from '@reduxjs/toolkit';
import userReducer, { setUser, logout } from '@/app/shop/userSlice';

describe('User Slice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer
      }
    });
  });

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: null,
    billing: {
      address: null,
      zipCode: null,
      city: null,
      country: null
    },
    isAdmin: false
  };

  it('should have initial null user', () => {
    const state = store.getState().user;
    expect(state.user).toBeNull();
  });

  it('should set user', () => {
    store.dispatch(setUser(mockUser));
    const state = store.getState().user;
    expect(state.user).toEqual(mockUser);
  });

  it('should clear user', () => {
    store.dispatch(setUser(mockUser));
    store.dispatch(logout());
    const state = store.getState().user;
    expect(state.user).toBeNull();
  });

  it('should handle admin user', () => {
    const adminUser = { ...mockUser, isAdmin: true };
    store.dispatch(setUser(adminUser));
    const state = store.getState().user;
    expect(state.user?.isAdmin).toBe(true);
  });

  it('should update user data', () => {
    store.dispatch(setUser(mockUser));
    const updatedUser = { ...mockUser, firstName: 'Jane' };
    store.dispatch(setUser(updatedUser));
    const state = store.getState().user;
    expect(state.user?.firstName).toBe('Jane');
  });
});

describe('User Authentication Helpers', () => {
  const isAuthenticated = (user: any) => user !== null && user !== undefined;
  const isAdmin = (user: any) => user?.isAdmin === true;

  it('should check if user is authenticated', () => {
    const user = { _id: '123', email: 'test@example.com' };
    expect(isAuthenticated(user)).toBe(true);
    expect(isAuthenticated(null)).toBe(false);
    expect(isAuthenticated(undefined)).toBe(false);
  });

  it('should check if user is admin', () => {
    const adminUser = { _id: '123', isAdmin: true };
    const regularUser = { _id: '123', isAdmin: false };
    expect(isAdmin(adminUser)).toBe(true);
    expect(isAdmin(regularUser)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe('Price Calculations', () => {
  const calculateTotal = (items: any[]) => {
    return Number.parseFloat(
      items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
    );
  };

  it('should calculate cart total correctly', () => {
    const items = [
      { price: 4.99, quantity: 2 },
      { price: 10.5, quantity: 1 },
      { price: 3.25, quantity: 3 }
    ];
    const total = calculateTotal(items);
    expect(total).toBe(30.23);
  });

  it('should handle empty cart', () => {
    const total = calculateTotal([]);
    expect(total).toBe(0);
  });

  it('should round to 2 decimal places', () => {
    const items = [{ price: 0.33, quantity: 3 }];
    const total = calculateTotal(items);
    expect(total).toBe(0.99);
  });

  it('should handle single item', () => {
    const items = [{ price: 15.99, quantity: 1 }];
    const total = calculateTotal(items);
    expect(total).toBe(15.99);
  });
});

describe('Email Validation', () => {
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  it('should validate correct email formats', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    expect(validateEmail('admin@localhost.com')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});
