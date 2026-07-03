import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from '../../actions';
import type { ICartItem, IProduct } from '../../../types';

// Let's import types from types folder
interface ICartState {
  items: ICartItem[];
}

const initialState: ICartState = {
  items: [],
};

const { reducer: cartReducer, actions: cartActions } = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state: ICartState, action: PayloadAction<IProduct>) {
      const existing = state.items.find(item => item.product.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
    },
    removeFromCart(state: ICartState, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.product.id !== action.payload);
    },
    updateQuantity(state: ICartState, action: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find(item => item.product.id === action.payload.productId);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    clearCart(state: ICartState) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export { cartReducer, cartActions };
