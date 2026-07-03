import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from './order.api';
import type { ICreateOrderInput } from './order.api';
import { orderKeys } from './order.queries';
import { userKeys } from '../users/user.queries';

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ICreateOrderInput) =>
      orderApi.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateStatus(id, status).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};
