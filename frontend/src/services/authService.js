import { request, TOKEN_KEY } from './api';

export const authService = {
  login: (data) => request('/api/auth/login', { method: 'POST', body: data }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: data }),
  getMe: () => request('/api/auth/me'),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  }
};
