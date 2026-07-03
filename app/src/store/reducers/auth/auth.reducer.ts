import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from '../../actions';
import type { IUser } from '../../../api/auth.api.ts';

interface IAuthState {
  token: string | null;
  user: IUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const initialState: IAuthState = {
  token: null,
  user: null,
  isLoggedIn: false,
  isLoading: false,
};

const { reducer: authReducer, actions: authActions } = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsLoading(state: IAuthState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setToken(state: IAuthState, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    setUser(state: IAuthState, action: PayloadAction<IUser | null>) {
      state.user = action.payload;
    },
    setIsLoggedIn(state: IAuthState, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    clearAuthState(state: IAuthState) {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
    },
    updateUser(state: IAuthState, action: PayloadAction<Partial<IUser>>) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export { authReducer, authActions };
