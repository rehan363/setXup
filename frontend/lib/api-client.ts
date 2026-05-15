/**
 * frontend/lib/api-client.ts  —  T021 (US1)
 *
 * Typed fetch wrapper for the FastAPI backend.
 * All requests that need auth automatically include the Bearer token.
 *
 * Usage:
 *   import { api } from "@/lib/api-client";
 *   const { token, user } = await api.auth.login({ email, password });
 */

import { getAuthHeaders, AuthUser } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Generic fetch helper ─────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    // FastAPI always returns { detail: string } on errors
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Unknown error");
  }

  // 204 No Content — return null
  if (res.status === 204) return null as unknown as T;

  return res.json() as Promise<T>;
}

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface TasksResponse {
  tasks: Task[];
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

const auth = {
  register(body: { email: string; password: string }): Promise<AuthUser> {
    return request<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: { email: string; password: string }): Promise<LoginResponse> {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

// ─── Task endpoints (used in US2/US3) ─────────────────────────────────────────

const tasks = {
  list(): Promise<TasksResponse> {
    return request<TasksResponse>("/api/tasks");
  },

  create(body: { title: string; description?: string }): Promise<Task> {
    return request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: number, body: { title?: string; description?: string; completed?: boolean }): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(id: number): Promise<null> {
    return request<null>(`/api/tasks/${id}`, { method: "DELETE" });
  },
};

// ─── Named export ─────────────────────────────────────────────────────────────

export const api = { auth, tasks };
