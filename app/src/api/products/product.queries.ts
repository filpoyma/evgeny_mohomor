import { useQuery } from '@tanstack/react-query';
import { productApi } from './product.api';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
};

export const useProductsQuery = () =>
  useQuery({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      const response = await productApi.getAll();
      return response.data ?? [];
    },
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  });
