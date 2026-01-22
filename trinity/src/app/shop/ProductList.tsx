import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { productsAPI } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  brand?: string;
  quantity?: string;
  nutriscore?: string;
  price: number;
  image?: string;
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  limit: number;
}

const PRODUCTS_PER_PAGE = 20;

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  page: 1,
  total: 0,
  limit: PRODUCTS_PER_PAGE,
};

export const fetchProductsPage = createAsyncThunk(
  "products/fetchPage",
  async ({ page, category }: { page: number; category?: string }) => {
    const data = await productsAPI.getAll(page, PRODUCTS_PER_PAGE, category);

    const productsArray = Array.isArray(data.products) ? data.products : [];

    const products: Product[] = productsArray.map((p: any) => ({
      id: p._id?.toString() || p.code || p.id || "",
      name: p.product_name || "Sans nom",
      brand: p.brands,
      quantity: p.quantity,
      nutriscore: p.nutriscore_grade,
      price: p.price || 0,
      image: p.image_front_url || p.image_url || "/placeholder.png",
    }));
  
    return {
      products,
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || PRODUCTS_PER_PAGE,
    };
  }
);

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProductsPage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProductsPage.fulfilled, (state, action: PayloadAction<{ products: Product[]; total: number; page: number; limit: number }>) => {
      state.loading = false;
      state.items = action.payload.products;
      state.page = action.payload.page;
      if (action.payload.total > 0) {
        state.total = action.payload.total;
      }
      state.limit = action.payload.limit;
    });
    builder.addCase(fetchProductsPage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Erreur serveur";
    });
  },
});

export default productsSlice.reducer;
