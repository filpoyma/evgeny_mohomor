import api from '../baseApi';
import type { IUser } from '../../types';

const basePath = 'users';

export const userApi = {
  getProfile(): Promise<{ data: IUser }> {
    return api.get(`${basePath}/profile`).json();
  },

  updateProfile(data: { region?: string; currency?: string; address?: string }): Promise<{ data: IUser }> {
    return api.put(`${basePath}/profile`, { json: data }).json();
  },

  getAllUsers(): Promise<{ data: IUser[] }> {
    return api.get(`${basePath}/admin/users`).json();
  },

  adjustBalance(id: string, amount: number): Promise<{ data: IUser }> {
    return api.put(`${basePath}/admin/users/${id}/balance`, { json: { amount } }).json();
  },
};
export default userApi;
