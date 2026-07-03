import { isDev } from './app.constants';

export const API_URL = isDev ? import.meta.env.VITE_API_URL_DEV : import.meta.env.VITE_API_URL_PROD;
