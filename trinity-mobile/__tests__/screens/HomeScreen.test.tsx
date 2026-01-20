import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import HomeScreen from '../../src/screens/HomeScreen';
import cartReducer from '../../src/store/cartSlice';
import userReducer from '../../src/store/userSlice';

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
  replace: jest.fn(),
};

describe('HomeScreen', () => {
  it('should render welcome message with user name', () => {
    const store = createMockStore({
      user: { user: { firstName: 'John', id: '123', email: 'john@test.com' } },
      cart: { items: [] },
    });

    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('Bienvenue John!')).toBeTruthy();
  });

  it('should show default name when user is not logged in', () => {
    const store = createMockStore({
      user: { user: null },
      cart: { items: [] },
    });

    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('Bienvenue Client!')).toBeTruthy();
  });

  it('should display cart item count', () => {
    const store = createMockStore({
      user: { user: null },
      cart: { items: [{ id: '1', name: 'Product 1', quantity: 1, price: 10 }] },
    });

    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>
    );

    expect(getByText('1 article(s)')).toBeTruthy();
  });

  it('should navigate to Scanner when scanner card is pressed', () => {
    const store = createMockStore({
      user: { user: null },
      cart: { items: [] },
    });

    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>
    );

    const scannerButton = getByText('Scanner');
    fireEvent.press(scannerButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Scanner');
  });

  it('should navigate to Cart when cart card is pressed', () => {
    const store = createMockStore({
      user: { user: null },
      cart: { items: [] },
    });

    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>
    );

    const cartButton = getByText('Panier');
    fireEvent.press(cartButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Cart');
  });

  it('should navigate to Profile when profile card is pressed', () => {
    const store = createMockStore({
      user: { user: null },
      cart: { items: [] },
    });

    const { getByText } = render(
      <Provider store={store}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>
    );

    const profileButton = getByText('Historique');
    fireEvent.press(profileButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Profile');
  });
});
