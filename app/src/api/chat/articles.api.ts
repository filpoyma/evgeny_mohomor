import api from '../baseApi';
import type { IArticle } from '../../types';

export const articlesApi = {
  getAll(): Promise<{ data: IArticle[] }> {
    return api.get('chat/articles').json();
  },
};
export default articlesApi;
