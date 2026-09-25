import type { User } from '../types';

export const authStorage = () =>
  sessionStorage.getItem('greenlife_token') ? sessionStorage : localStorage;

export function clearAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem('greenlife_token');
    storage.removeItem('greenlife_user');
  }
}

export function saveAuth(token: string, user: User, remember = true) {
  clearAuth();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('greenlife_token', token);
  storage.setItem('greenlife_user', JSON.stringify(user));
}
