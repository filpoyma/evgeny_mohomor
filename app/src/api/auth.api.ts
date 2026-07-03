import api from '../api/baseApi';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TUpdateUserResponse {
  success: boolean;
  data: { _id: string; name: string; email: string; role: number; updatedAt: string };
}

interface LoginResponse {
  accessToken: string;
  user: IUser;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: number;
}

interface RefreshResponse {
  accessToken: string;
}

interface ValidateSessionResponse {
  user: IUser;
}

interface IGetAllUsersResponse {
  data: IUser[];
  success: boolean;
}

const AuthApi = {
  basePath: 'auth',

  getUrl(path: string) {
    return `${this.basePath}/${path}/`;
  },

  login(credentials: LoginCredentials): Promise<LoginResponse> {
    const url = this.getUrl('login');

    return api
      .post(url, {
        json: credentials,
        credentials: 'include',
        timeout: 10000,
      })
      .json();
  },

  register(credentials: RegisterCredentials): Promise<void> {
    const url = this.getUrl('register');
    return api
      .post(url, {
        json: credentials,
        timeout: 10000,
      })
      .json();
  },

  refreshToken(): Promise<RefreshResponse> {
    const url = this.getUrl('refresh-token');
    return api
      .post(url, {
        credentials: 'include',
        timeout: 5000,
      })
      .json();
  },

  logout(): Promise<void> {
    const url = this.getUrl('logout');
    return api
      .post(url, {
        credentials: 'include',
        timeout: 5000,
        retry: 0,
      })
      .json();
  },

  validateSession(): Promise<ValidateSessionResponse> {
    const url = this.getUrl('profile');
    return api
      .get(url, {
        credentials: 'include',
      })
      .json();
  },

  getAllUsers(): Promise<IGetAllUsersResponse> {
    const url = this.getUrl('allusers');
    return api.get(url).json();
  },

  delete(id: string) {
    const url = this.getUrl('profile');
    return api.delete(url, { json: { id } }).json();
  },

  update(user: IUser): Promise<TUpdateUserResponse> {
    const url = this.getUrl('profile');
    return api.put(url, { json: { user } }).json();
  },
};

export default AuthApi;
