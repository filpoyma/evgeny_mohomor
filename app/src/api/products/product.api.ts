import api from '../baseApi';
import type { IProduct } from '../../types';

const basePath = 'products';

export const productApi = {
  getAll(): Promise<{ data: IProduct[] }> {
    return api.get(basePath).json();
  },

  create(data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: IProduct }> {
    return api.post(basePath, { json: data }).json();
  },

  update(id: string, data: Partial<Omit<IProduct, 'id'>>): Promise<{ data: IProduct }> {
    return api.put(`${basePath}/${id}`, { json: data }).json();
  },

  delete(id: string): Promise<{ success: boolean }> {
    return api.delete(`${basePath}/${id}`).json();
  },
};
export default productApi;
