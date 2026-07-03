import ky, { isHTTPError, type BeforeErrorHook, type BeforeRequestHook } from 'ky';
import { isDev } from '../shared/constants/app.constants.ts';
import { API_URL } from '../shared/constants/api.constants.ts';

const baseApi = ky.create({
  prefix: API_URL,
  timeout: 15000,
  credentials: isDev ? 'include' : 'same-origin',
});

const tokenInterceptor: BeforeRequestHook = ({ request }) => {
  const token = import.meta.env.VITE_SERVER_SECRET;
  if (token) request.headers.set('Authorization', `Bearer ${token}`);
};

const telegramInterceptor: BeforeRequestHook = ({ request }) => {
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  const startParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;

  if (tgUser) {
    request.headers.set('x-tg-user-id', tgUser.id.toString());
    if (tgUser.username) request.headers.set('x-tg-username', tgUser.username);
    if (tgUser.first_name) request.headers.set('x-tg-first-name', tgUser.first_name);
    if (tgUser.last_name) request.headers.set('x-tg-last-name', tgUser.last_name);
  }
  
  if (startParam) {
    request.headers.set('x-tg-ref-source', startParam);
  }
};

type ApiErrorBody = { message?: unknown };

const errorInterceptor: BeforeErrorHook = ({ error }) => {
  if (!isHTTPError(error)) return error;

  console.error('Error:', error.response.status, error.response.url);

  if (typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
    const message = (error.data as ApiErrorBody).message;
    if (typeof message === 'string') error.message = message;
  } else if (typeof error.data === 'string' && error.data) {
    error.message = error.data;
  }

  return error;
};

const api = baseApi.extend({
  retry: {
    limit: 1,
    methods: ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'],
    statusCodes: [401],
    shouldRetry: ({ error }) => isHTTPError(error) && error.response.status === 401,
  },
  hooks: {
    beforeRequest: [tokenInterceptor, telegramInterceptor],
    beforeError: [errorInterceptor],
  },
});

export default api;
