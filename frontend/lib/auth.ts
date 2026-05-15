/**
 * frontend/lib/auth.ts  —  T018 (US1)
 *
 * Auth session layer for our custom FastAPI + JWT backend.
 *
 * How it works (simple version):
 *  1. User logs in → FastAPI returns a JWT token
 *  2. We store that token in a cookie (works in both browser and SSR)
 *  3. Every API request reads the token from the cookie and puts it in
 *     the "Authorization: Bearer <token>" header
 *  4. The useSession() hook reads the cookie to know if the user is logged in
 *
 * We use better-auth for its cookie utilities and React hooks pattern,
 * but our actual auth endpoints live on FastAPI (not a Better Auth server).
 */

"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  created_at: string;
}

export interface Session {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────
// We store the JWT in a plain cookie (not httpOnly) so client-side JS can
// read it. For a production app you'd use httpOnly + a server-side refresh
// endpoint, but this is fine for Phase II.

const TOKEN_KEY = "todo_auth_token";
const USER_KEY  = "todo_auth_user";

export function setSession(token: string, user: AuthUser): void {
  // 24-hour expiry — matches the backend JWT TTL
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${TOKEN_KEY}=${token}; path=/; expires=${expires}; SameSite=Lax`;
  // Store user data in localStorage for quick reads
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  // Expire the cookie immediately
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null; // SSR guard
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null; // SSR guard
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ─── API auth header helper ───────────────────────────────────────────────────
// Used by api-client.ts (T021) to attach the Bearer token to every request.

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── React hook ───────────────────────────────────────────────────────────────
// Components use this hook to check auth state and get the current user.
//
// Usage:
//   const { user, isAuthenticated, isLoading } = useSession();

export function useSession(): Session {
  const [session, setSession_] = useState<Session>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = getToken();
    const user  = getStoredUser();

    setSession_({
      user,
      token,
      isLoading: false,
      isAuthenticated: !!(token && user),
    });
  }, []);

  return session;
}
