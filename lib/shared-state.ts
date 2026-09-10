import Cookies from 'js-cookie';
import { SharedSessionState, SupportedLocale } from './types';

export const SESSION_COOKIE_NAME = 'x-micro-frontier-session';

export const DEFAULT_SESSION: SharedSessionState = {
  userId: 'usr_init_anon',
  tier: 'growth',
  preferredLocale: 'en',
};

export function parseSessionCookie(raw?: string | null): SharedSessionState {
  if (!raw) return DEFAULT_SESSION;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return DEFAULT_SESSION;
  }
}

export function setClientSession(state: Partial<SharedSessionState>): SharedSessionState {
  const current = parseSessionCookie(Cookies.get(SESSION_COOKIE_NAME));
  const updated = { ...current, ...state };
  Cookies.set(SESSION_COOKIE_NAME, JSON.stringify(updated), {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return updated;
}