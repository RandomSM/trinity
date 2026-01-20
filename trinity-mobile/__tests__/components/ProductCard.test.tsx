import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import ProductCard from '../../src/components/ProductCard';
import cartReducer from '../../src/store/cartSlice';

jest.spyOn(Alert, 'alert');

const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
  });
};

const mockProduct = {
  id: '3017620422003',
  name: 'Nutella',
  brand: 'Ferrero',
  quantity: '400g',
  nutriscore: 'e',
  price: 3.99,
  image_front_url: 'https://example.com/image.jpg',
  stock: 50,
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product information correctly', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    expect(getByText('Nutella')).toBeTruthy();
    expect(getByText('Ferrero')).toBeTruthy();
    expect(getByText('400g')).toBeTruthy();
    expect(getByText('3.99€')).toBeTruthy();
  });

  it('should display nutriscore badge', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    // Badge affiche "Nutriscore E" dans un seul Text
    expect(getByText(/Nutriscore/)).toBeTruthy();
    expect(getByText(/E/)).toBeTruthy();
  });

  it('should display stock information', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    expect(getByText('50 unités')).toBeTruthy();
  });

  it('should show "Ajouter" button when stock is available', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    expect(getByText('Ajouter')).toBeTruthy();
  });

  it('should show "Épuisé" button when stock is 0', () => {
    const store = createMockStore();
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={outOfStockProduct} />
      </Provider>
    );

    expect(getByText('Épuisé')).toBeTruthy();
  });

  it('should add product to cart when button is pressed', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    const addButton = getByText('Ajouter');
    fireEvent.press(addButton);

    const state = store.getState();
    expect(state.cart.items).toHaveLength(1);
    expect(state.cart.items[0].id).toBe(mockProduct.id);
    expect(state.cart.items[0].quantity).toBe(1);
  });

  it('should show alert after adding to cart', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );

    const addButton = getByText('Ajouter');
    fireEvent.press(addButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Ajouté au panier',
      'Nutella a été ajouté à votre panier.'
    );
  });

  it('should not add product when stock is 0', () => {
    const store = createMockStore();
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={outOfStockProduct} />
      </Provider>
    );

    const addButton = getByText('Épuisé');
    fireEvent.press(addButton);

    const state = store.getState();
    expect(state.cart.items).toHaveLength(0);
  });

  it('should render without brand if not provided', () => {
    const store = createMockStore();
    const productWithoutBrand = { ...mockProduct, brand: undefined };
    
    const { queryByText } = render(
      <Provider store={store}>
        <ProductCard product={productWithoutBrand} />
      </Provider>
    );

    expect(queryByText('Ferrero')).toBeNull();
  });

  it('should render without quantity if not provided', () => {
    const store = createMockStore();
    const productWithoutQuantity = { ...mockProduct, quantity: undefined };
    
    const { queryByText } = render(
      <Provider store={store}>
        <ProductCard product={productWithoutQuantity} />
      </Provider>
    );

    expect(queryByText('400g')).toBeNull();
  });
});
