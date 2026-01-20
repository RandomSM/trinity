import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import CartScreen from '../../src/screens/CartScreen';
import cartReducer from '../../src/store/cartSlice';
import userReducer from '../../src/store/userSlice';

jest.spyOn(Alert, 'alert');

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      user: userReducer,
    },
    preloadedState: initialState,
  });
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('CartScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show empty cart message when cart is empty', () => {
    const store = createMockStore({
      cart: { items: [] },
      user: { user: null },
    });

    const { getByText } = render(
      <Provider store={store}>
        <CartScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('Votre panier est vide')).toBeTruthy();
  });

  it('should display cart items correctly', () => {
    const store = createMockStore({
      cart: {
        items: [
          {
            id: '123',
            name: 'Product 1',
            price: 10.99,
            quantity: 2,
            image_front_url: 'https://example.com/img.jpg',
          },
        ],
      },
      user: { user: null },
    });

    const { getByText } = render(
      <Provider store={store}>
        <CartScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('Product 1')).toBeTruthy();
  });

  it('should display product prices', () => {
    const store = createMockStore({
      cart: {
        items: [
          {
            id: '123',
            name: 'Product 1',
            price: 10.99,
            quantity: 2,
            image_front_url: 'https://example.com/img.jpg',
          },
        ],
      },
      user: { user: null },
    });

    const { getByText } = render(
      <Provider store={store}>
        <CartScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText(/10.99/)).toBeTruthy();
  });

  it('should display quantity for each item', () => {
    const store = createMockStore({
      cart: {
        items: [
          {
            id: '123',
            name: 'Product 1',
            price: 10.99,
            quantity: 2,
            image_front_url: 'https://example.com/img.jpg',
          },
        ],
      },
      user: { user: null },
    });

    const { getByText } = render(
      <Provider store={store}>
        <CartScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('2')).toBeTruthy();
  });

  it('should calculate and display total', () => {
    const store = createMockStore({
      cart: {
        items: [
          {
            id: '123',
            name: 'Product 1',
            price: 10.99,
            quantity: 2,
            image_front_url: 'https://example.com/img.jpg',
          },
        ],
      },
      user: { user: null },
    });

    const { getByText } = render(
      <Provider store={store}>
        <CartScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText(/Total/)).toBeTruthy();
  });
});
