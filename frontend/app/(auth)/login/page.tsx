"use client";

/**
 * frontend/app/(auth)/login/page.tsx  —  T019 (US1)
 *
 * Login page. On success: stores session, redirects to app root.
 * Acceptance scenarios covered:
 *   ✓ Correct credentials → authenticated + redirect
 *   ✓ Wrong credentials → inline error, allow retry
 *   ✓ Loading state while request is in-flight
 *   ✓ Keyboard accessible (all inputs + submit via Tab/Enter)
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { api, ApiError } from "@/lib/api-client";
import { setSession, getToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (getToken()) router.replace("/");
  }, [router]);

  // Focus email on mount
  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError("Email is required."); return; }
    if (!password)     { setError("Password is required."); return; }

    setLoading(true);
    try {
      const { token, user } = await api.auth.login({ email: email.trim(), password });
      setSession(token, user);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? "Incorrect email or password." : err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        {/* Brand */}
        <p className="auth-logo">todo<span>.</span></p>
        <p className="auth-tagline">Sign in to your account</p>

        {/* Error banner */}
        {error && (
          <div className="alert-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              ref={emailRef}
              id="login-email"
              className="form-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? <><span className="spinner" aria-hidden="true" /> Signing in…</> : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="btn btn-link">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
