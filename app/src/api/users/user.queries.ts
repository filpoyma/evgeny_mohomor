import { useQuery } from '@tanstack/react-query';
import { userApi } from './user.api';

export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
};

export const useProfileQuery = () =>
  useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getProfile();
      return response.data;
    },
    staleTime: 10_000,
    gcTime: 5 * 60 * 1000,
  });

export const useAdminUsersQuery = (enabled = false) =>
  useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const response = await userApi.getAllUsers();
      return response.data ?? [];
    },
    enabled,
    staleTime: 30_000,
  });
