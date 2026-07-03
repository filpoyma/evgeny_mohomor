import type { IProduct } from './product.types';

export interface IOrderItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface IOrder {
  id: string;
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  currency: string;
  status: string; // Pending, Paid, Shipped, Cancelled
  paymentMethod: string; // Cash, Crypto, Bank
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}
