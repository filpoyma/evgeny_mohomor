import api from '../baseApi';
import type { IOrder, IOrderItem } from '../../types';

const basePath = 'orders';

export interface ICreateOrderInput {
  items: IOrderItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  address: string;
  phone: string;
  useReferralBonus: boolean;
}

export const orderApi = {
  create(data: ICreateOrderInput): Promise<{ data: IOrder }> {
    return api.post(basePath, { json: data }).json();
  },

  getMyOrders(): Promise<{ data: IOrder[] }> {
    return api.get(basePath).json();
  },

  getAllOrders(): Promise<{ data: IOrder[] }> {
    return api.get(`${basePath}/admin/all`).json();
  },

  updateStatus(id: string, status: string): Promise<{ data: IOrder }> {
    return api.put(`${basePath}/admin/${id}/status`, { json: { status } }).json();
  },
};
export default orderApi;
