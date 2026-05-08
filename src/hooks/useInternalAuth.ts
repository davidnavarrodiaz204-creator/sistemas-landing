'use client';

import { useState, useCallback } from 'react';

const AUTH_KEY = 'factusys_internal_auth';
const TS_KEY = 'factusys_internal_ts';
const VALID_PASSWORD = 'FACTUSYS2026';

function isSessionValid(timeoutMs?: number): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored !== 'true') return false;
  if (!timeoutMs) return true;
  const ts = localStorage.getItem(TS_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < timeoutMs;
}

export default function useInternalAuth(timeoutMs?: number) {
  const [authed, setAuthed] = useState(() => isSessionValid(timeoutMs));

  const login = useCallback((password: string): boolean => {
    if (password !== VALID_PASSWORD) return false;
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(TS_KEY, String(Date.now()));
    setAuthed(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TS_KEY);
    setAuthed(false);
  }, []);

  return { authed, login, logout };
}
