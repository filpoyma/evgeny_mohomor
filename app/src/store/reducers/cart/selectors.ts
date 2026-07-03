import type { RootState } from '../../index.ts';

export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((acc, item) => acc + item.quantity, 0);

export const selectCartTotal = (state: RootState, region: string, currency: string) => {
  return state.cart.items.reduce((acc, item) => {
    let price = item.product.priceUsdt; // Default fallback

    if (currency === 'IDR' || (region === 'Bali' && currency === 'IDR')) {
      price = item.product.priceIdr;
    } else if (currency === 'VND' || (region === 'Vietnam' && currency === 'VND')) {
      price = item.product.priceVnd;
    } else if (currency === 'RUB') {
      price = item.product.priceRub;
    }

    return acc + price * item.quantity;
  }, 0);
};
