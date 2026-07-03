export interface IProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  priceIdr: number;
  priceVnd: number;
  priceUsdt: number;
  priceRub: number;
  imageUrl: string;
  size: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}
