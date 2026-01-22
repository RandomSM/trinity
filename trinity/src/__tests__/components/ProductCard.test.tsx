import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProductCard from '@/components/ProductCard';
import cartReducer from '@/app/shop/cartSlice';

const createTestStore = () => configureStore({
  reducer: {
    cart: cartReducer
  }
});

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '3017620422003',
    name: 'Nutella',
    brand: 'Ferrero',
    quantity: '750g',
    nutriscore: 'e',
    price: 4.99
  };

  const renderWithProvider = (component: React.ReactElement) => {
    const store = createTestStore();
    return render(<Provider store={store}>{component}</Provider>);
  };

  it('renders product name', () => {
    renderWithProvider(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Nutella')).toBeInTheDocument();
  });

  it('renders product brand', () => {
    renderWithProvider(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/Ferrero/)).toBeInTheDocument();
  });

  it('displays price in euros with 2 decimals', () => {
    renderWithProvider(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/4\.99€/)).toBeInTheDocument();
  });

  it('shows nutriscore when available', () => {
    renderWithProvider(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/Nutriscore:/i)).toBeInTheDocument();
  });

  it('handles product without brand', () => {
    const productWithoutBrand = { ...mockProduct, brand: undefined };
    renderWithProvider(<ProductCard product={productWithoutBrand} />);
    expect(screen.queryByText(/Marque:/)).not.toBeInTheDocument();
  });

  it('displays quantity when available', () => {
    renderWithProvider(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/750g/)).toBeInTheDocument();
  });
});
