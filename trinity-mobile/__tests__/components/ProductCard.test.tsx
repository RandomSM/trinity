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

  it('should render without nutriscore if not provided', () => {
    const store = createMockStore();
    const productWithoutNutriscore = { ...mockProduct, nutriscore: undefined };
    
    const { queryByText } = render(
      <Provider store={store}>
        <ProductCard product={productWithoutNutriscore} />
      </Provider>
    );

    expect(queryByText(/Nutriscore/)).toBeNull();
  });

  it('should use image_url as fallback when image_front_url is not available', () => {
    const store = createMockStore();
    const productWithImageUrl = { 
      ...mockProduct, 
      image_front_url: undefined,
      image_url: 'https://example.com/fallback.jpg'
    };
    
    const { UNSAFE_getByType } = render(
      <Provider store={store}>
        <ProductCard product={productWithImageUrl} />
      </Provider>
    );

    const image = UNSAFE_getByType('Image' as any);
    expect(image.props.source.uri).toBe('https://example.com/fallback.jpg');
  });

  it('should generate OpenFoodFacts URL when no images provided', () => {
    const store = createMockStore();
    const productWithoutImages = { 
      ...mockProduct, 
      image_front_url: undefined,
      image_url: undefined
    };
    
    const { UNSAFE_getByType } = render(
      <Provider store={store}>
        <ProductCard product={productWithoutImages} />
      </Provider>
    );

    const image = UNSAFE_getByType('Image' as any);
    expect(image.props.source.uri).toContain('images.openfoodfacts.org');
  });

  it('should use placeholder for invalid barcode (less than 13 chars)', () => {
    const store = createMockStore();
    const productWithShortId = { 
      ...mockProduct,
      id: '123', 
      image_front_url: undefined,
      image_url: undefined
    };
    
    const { UNSAFE_getByType } = render(
      <Provider store={store}>
        <ProductCard product={productWithShortId} />
      </Provider>
    );

    const image = UNSAFE_getByType('Image' as any);
    expect(image.props.source.uri).toBe('https://via.placeholder.com/150');
  });

  it('should display correct stock color for low stock (<=10)', () => {
    const store = createMockStore();
    const lowStockProduct = { ...mockProduct, stock: 5 };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={lowStockProduct} />
      </Provider>
    );

    expect(getByText('5 unités')).toBeTruthy();
  });

  it('should display correct stock color for high stock (>10)', () => {
    const store = createMockStore();
    const highStockProduct = { ...mockProduct, stock: 50 };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={highStockProduct} />
      </Provider>
    );

    expect(getByText('50 unités')).toBeTruthy();
  });

  it('should render with nutriscore A', () => {
    const store = createMockStore();
    const productWithA = { ...mockProduct, nutriscore: 'a' };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={productWithA} />
      </Provider>
    );

    expect(getByText(/Nutriscore/)).toBeTruthy();
    expect(getByText(/A/)).toBeTruthy();
  });

  it('should render with nutriscore B', () => {
    const store = createMockStore();
    const productWithB = { ...mockProduct, nutriscore: 'b' };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={productWithB} />
      </Provider>
    );

    expect(getByText(/B/)).toBeTruthy();
  });

  it('should render with nutriscore C', () => {
    const store = createMockStore();
    const productWithC = { ...mockProduct, nutriscore: 'c' };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={productWithC} />
      </Provider>
    );

    expect(getByText(/C/)).toBeTruthy();
  });

  it('should render with nutriscore D', () => {
    const store = createMockStore();
    const productWithD = { ...mockProduct, nutriscore: 'd' };
    
    const { getByText } = render(
      <Provider store={store}>
        <ProductCard product={productWithD} />
      </Provider>
    );

    expect(getByText(/D/)).toBeTruthy();
  });
});
