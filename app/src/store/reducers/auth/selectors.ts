import type { RootState } from '../../index.ts';

export const selectIsLoggedIn = (state: RootState) => {
  if (typeof window !== 'undefined' && window.location.search.includes('preview=true')) {
    return false;
  }
  return state.auth.isLoggedIn;
};

export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAdminName = (state: RootState) => state.auth.user?.name;
export const selectAdminEmail = (state: RootState) => state.auth.user?.email;
export const selectAdminRole = (state: RootState) => state.auth.user?.role;
