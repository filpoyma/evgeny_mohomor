import { useQuery } from '@tanstack/react-query';
import { orderApi } from './order.api';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  adminLists: () => [...orderKeys.all, 'adminList'] as const,
};

export const useMyOrdersQuery = () =>
  useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const response = await orderApi.getMyOrders();
      return response.data ?? [];
    },
    staleTime: 15_000,
  });

export const useAdminOrdersQuery = (enabled = false) =>
  useQuery({
    queryKey: orderKeys.adminLists(),
    queryFn: async () => {
      const response = await orderApi.getAllOrders();
      return response.data ?? [];
    },
    enabled,
    staleTime: 15_000,
  });
