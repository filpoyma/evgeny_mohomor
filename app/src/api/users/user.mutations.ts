import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './user.api';
import { userKeys } from './user.queries';

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { region?: string; currency?: string; address?: string }) =>
      userApi.updateProfile(data).then((res) => res.data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(userKeys.profile(), updatedProfile);
    },
  });
};

export const useAdjustBalanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      userApi.adjustBalance(id, amount).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};
