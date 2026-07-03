import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './reducers/auth';
import { cartReducer } from './reducers/cart';
import {isDev} from '../shared/constants/app.constants.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  devTools: isDev,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
