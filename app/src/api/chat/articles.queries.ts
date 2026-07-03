import { useQuery } from '@tanstack/react-query';
import { articlesApi } from './articles.api';

export const articleKeys = {
  all: ['articles'] as const,
};

export const useArticlesQuery = () =>
  useQuery({
    queryKey: articleKeys.all,
    queryFn: async () => {
      const response = await articlesApi.getAll();
      return response.data ?? [];
    },
    staleTime: 60_000,
    gcTime: 30 * 60 * 1000,
  });
